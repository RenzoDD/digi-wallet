const DigiByte = require('digibyte-js');
const BIP39 = DigiByte.BIP39;
const HDPrivateKey = DigiByte.HDPrivateKey;
const HDPublicKey = DigiByte.HDPublicKey;
const Address = DigiByte.Address;

const SQLite = require('better-sqlite3');
const fs = require('fs');

const Console = require('./console');
const Util = require('./util');

class Wallet {
    static CreateWallet(name, type, testnet) {
        if (!name) {
            name = Console.ReadLine("Name (default)");
            if (name == "") name = "default";
        }
        
        type = !type ? "segwit" : type;
        if (type != 'legacy' && type != 'native' && type != 'segwit') type = 'segwit';

        var network = !testnet ? "livenet" : "testnet";
        if (type != 'legacy') network += "-" + type;

        var password = Console.ReadPassword("Create password");
        var salt = Util.RandomBuffer();

        var entropy = Console.ReadLine("Enter random text");
        entropy = Util.SHA256(Buffer.concat([Util.SHA256(entropy), Util.RandomBuffer()]));

        var mnemonic = BIP39.CreateMnemonic(entropy.slice(16));

        if (Console.ReadLine("See Mnemonic (Y/N)") != "N") {
            var words = mnemonic.split(" ");
            for (var i = 1; i <= 12; i++) {
                Console.Clear();
                Console.Log("Word " + i + ": " + words[i - 1]);
                Console.Pause();
            }
            Console.Clear();

            for (var i = 1; i <= 3; i++) {
                var n = Math.floor(Math.random() * 12);
                do {
                    var answer = Console.ReadLine("Enter word N " + (n + 1));
                } while (answer != words[n]);
            }

            Console.Clear();
            Console.Log("All done, NEVER share this words or you will lose your coins");
            Console.Pause();
        }

        var seed = BIP39.MnemonicToSeed(mnemonic);
        var xprv = HDPrivateKey.fromSeed(seed, network);
        var xpub = xprv.derive("m/" + (type == "legacy" ? 44 : (type == "segwit" ? 84 : 49)) + "'/20'/0'").hdPublicKey.toString();

        xprv = xprv.toString();

        global.wallet.network = network;
        global.wallet.type = type;
        global.wallet.xpub = xpub;

        console.log(xpub);

        xprv = Util.EncryptAES256(xprv, password);
        xpub = Util.EncryptAES256(xpub, password);

        password = Util.SHA256(password);
        password = Util.SHA256(Buffer.concat([password, salt]));

        var path = global.wallet.path + "\\" + name + "." + (network.startsWith("livenet") ? "dgb" : "dgbt");
        global.wallet.database = SQLite(path);

        global.wallet.database.prepare("CREATE TABLE Addresses( AddressID INTEGER, Change INTEGER NOT NULL, `Index` INTEGER NOT NULL, WIF TEXT NOT NULL, Address TEXT NOT NULL UNIQUE, PRIMARY KEY (AddressID AUTOINCREMENT))").run();
        global.wallet.database.prepare("CREATE TABLE UTXOs( UtxoID INTEGER, AddressID INTEGER NOT NULL, TXID TEXT NOT NULL, Script TEXT NOT NULL, N INTEGER NOT NULL, Satoshis INTEGER NOT NULL, Height INTEGER NOT NULL, PRIMARY KEY (UtxoID AUTOINCREMENT), FOREIGN KEY (AddressID) REFERENCES Addresses (AddressID), UNIQUE(TXID, N))").run();
        global.wallet.database.prepare("CREATE TABLE Data( Key TEXT NOT NULL UNIQUE, Value TEXT NOT NULL);").run();
        
        var data = global.wallet.database.prepare("INSERT INTO Data (Key, Value) VALUES (?,?)")
        data.run(["password", password]);
        data.run(["salt", salt]);
        data.run(["xprv", xprv]);
        data.run(["xpub", xpub]);
        data.run(["type", type]);
        data.run(["network", network]);
        data.run(["name", name]);

        salt = xprv = xpub = type = network = null;

        global.wallet.name = name;

        Console.Log("Wallet created! - " + path);
    }
    static OpenWallet(path, password) {
        if (!path) path = Console.ReadLine("Enter file path");
        if (!password) password = Console.ReadPassword("Password");

        if(!fs.existsSync(path)) {
            Console.Log("The file doesn't exist!");
            return;
        }

        global.wallet.database = SQLite(path);
        var query = global.wallet.database.prepare("SELECT Value FROM Data WHERE Key = ?");
        var passwordDB = query.get(['password']).Value;
        var saltDB = query.get(['salt']).Value;

        var passwordUser = Util.SHA256(Buffer.concat([Util.SHA256(password), saltDB]));

        if (Buffer.compare(passwordUser, passwordDB) !== 0){
            Console.Log('Invalid password');
            global.wallet.database.close();
            password = null;
            return;
        }

        global.wallet.network = query.get('network').Value;
        global.wallet.type = query.get('type').Value;
        global.wallet.name = query.get('name').Value;
        global.wallet.xpub = Util.DecryptAES256(query.get('xpub').Value, password);
        
        Console.Log("Wallet opened!");
    }
    static GenerateAddress() {
        if (!global.wallet.database) {
            Console.Log("No wallet open!");
            return;
        }

        var query = global.wallet.database.prepare("SELECT Value FROM Data WHERE Key = ?");
        var type = query.get('type').Value;
        var network = query.get('network').Value;
        
        var quantity = global.wallet.database.prepare("SELECT COUNT(*) AS Quantity FROM Addresses WHERE Change == 0").get().Quantity;

        var hdPublicKey = HDPublicKey.fromString(global.wallet.xpub).derive(0).derive(quantity);
        var address = new Address(hdPublicKey.publicKey, network, type).toString();

        global.wallet.database.prepare("INSERT INTO Addresses (Change, `Index`, WIF, Address) VALUES (?,?,?,?)").run([0, quantity, "", address]);
        Console.Log("Address: " + address);

    }
}

module.exports = Wallet;