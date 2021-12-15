const DigiByte = require('digibyte-js');
const BIP39 = DigiByte.BIP39;
const HDPrivateKey = DigiByte.HDPrivateKey;

const SQLite = require('better-sqlite3');
const Console = require('./console');
const Util = require('./util');

class Wallet {
    static CreateWallet(name, type, testnet) {
        if (!name) {
            name = Console.ReadLine("Name (default)");
            if (name == "") name = "default";
        }
        type = !type ? "segwit" : type;
        type = (type == "legacy" ? 44 : (type == "segwit" ? 84 : 49));
        var network = !testnet ? "livenet" : "testnet";

        var password = Console.ReadPassword("Create password");
        var salt = Util.RandomBuffer();

        var entropy = Console.ReadLine("Enter random text");
        entropy = Util.SHA256(Buffer.concat([Util.SHA256(entropy), Util.RandomBuffer()]));

        var mnemonic = BIP39.CreateMnemonic(entropy.slice(16));
        var seed = BIP39.MnemonicToSeed(mnemonic);
        var xprv = HDPrivateKey.fromSeed(seed).toString();
        var xpub = HDPrivateKey.fromSeed(seed).derive("m/" + type + "'/20'/0'").hdPublicKey.toString();

        global.wallet.network = network;
        global.wallet.type = type;
        global.wallet.xpub = xpub;

        xprv = Util.EncryptAES256(xprv, password);
        xpub = Util.EncryptAES256(xpub, password);

        password = Util.SHA256(password);
        password = Util.SHA256(Buffer.concat([password, salt]));

        var path = global.wallet.path + "\\" + name + "." + (network == "livenet" ? "dgb" : "dgbt");
        global.wallet.database = SQLite(path);

        global.wallet.database.prepare("CREATE TABLE Addresses( AddressID INTEGER, DerivationPath TEXT NOT NULL UNIQUE, WIF TEXT NOT NULL UNIQUE, Address TEXT NOT NULL UNIQUE, PRIMARY KEY (AddressID AUTOINCREMENT))").run();
        global.wallet.database.prepare("CREATE TABLE UTXOs( UtxoID INTEGER, AddressID INTEGER NOT NULL, TXID TEXT NOT NULL, Script TEXT NOT NULL, N INTEGER NOT NULL, Satoshis INTEGER NOT NULL, Height INTEGER NOT NULL, PRIMARY KEY (UtxoID AUTOINCREMENT), FOREIGN KEY (AddressID) REFERENCES Addresses (AddressID), UNIQUE(TXID, N))").run();
        global.wallet.database.prepare("CREATE TABLE Data( Key TEXT NOT NULL UNIQUE, Value TEXT NOT NULL);").run();
        
        var data = global.wallet.database.prepare("INSERT INTO Data (Key, Value) VALUES (?,?)")
        data.run(["password", password]);
        data.run(["salt", salt]);
        data.run(["xprv", xprv]);
        data.run(["xpub", xpub]);
        data.run(["type", type]);
        data.run(["network", network]);

        global.wallet.name = name;
    }
}

module.exports = Wallet;