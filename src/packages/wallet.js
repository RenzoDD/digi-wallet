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

        global.wallet.database.prepare("CREATE TABLE Addresses( address TEXT NOT NULL UNIQUE, label TEXT NOT NULL, change INTEGER NOT NULL, n INTEGER NOT NULL, PRIMARY KEY (address))").run();
        global.wallet.database.prepare("CREATE TABLE UTXOs(txid TEXT NOT NULL, vout INTEGER NOT NULL, satoshis INTEGER NOT NULL, height INTEGER NOT NULL, script TEXT NOT NULL, address TEXT NOT NULL, path TEXT NOT NULL, PRIMARY KEY (txid, vout))").run();
        global.wallet.database.prepare("CREATE TABLE Data(key TEXT NOT NULL UNIQUE, value TEXT NOT NULL)").run();
        
        var data = global.wallet.database.prepare("INSERT INTO Data (key, value) VALUES (?,?)")
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
        var query = global.wallet.database.prepare("SELECT value FROM Data WHERE key = ?");
        var passwordDB = query.get(['password']).value;
        var saltDB = query.get(['salt']).value;

        var passwordUser = Util.SHA256(Buffer.concat([Util.SHA256(password), saltDB]));

        if (Buffer.compare(passwordUser, passwordDB) !== 0){
            Console.Log('Invalid password');
            global.wallet.database.close();
            password = undefined;
            return;
        }

        global.wallet.network = query.get('network').value;
        global.wallet.type = query.get('type').value;
        global.wallet.name = query.get('name').value;
        global.wallet.xpub = Util.DecryptAES256(query.get('xpub').value, password);
        
        password = undefined;
        Console.Log("Wallet opened!");
    }
    static CloseWallet() {
        if (!global.wallet.database) {
            Console.Log("No wallet open!");
            return;
        }
        
        global.wallet.database.close();
        global.wallet.network = undefined;
        global.wallet.type = undefined;
        global.wallet.name = undefined;
        global.wallet.xpub = undefined;
        Console.Log("Wallet closed!");
    }
    static GenerateAddress() {
        if (!global.wallet.database) {
            Console.Log("No wallet open!");
            return;
        }
        
        var quantity = global.wallet.database.prepare("SELECT COUNT(*) AS quantity FROM Addresses WHERE change == 0").get().quantity;

        var hdPublicKey = HDPublicKey.fromString(global.wallet.xpub).derive(0).derive(quantity);
        var address = new Address(hdPublicKey.publicKey, global.wallet.network, global.wallet.type).toString();

        global.wallet.database.prepare("INSERT INTO Addresses (address, label, change, n) VALUES (?,?,?,?)").run([address,"",0, quantity]);
        Console.Log("Address: " + address);
    }
    static Sync() {
        if (!global.wallet.database) {
            Console.Log("No wallet open!");
            return;
        }
        var data = Util.FetchData('https://digibyteblockexplorer.com/api/v2/utxo/' + global.wallet.xpub + '?details=tokenBalances');
        global.wallet.database.prepare("DELETE FROM UTXOs").run();
        var query = global.wallet.database.prepare("INSERT INTO UTXOs (txid,vout,satoshis,height,script,address,path) VALUES (?,?,?,?,?,?,?)");
        for (var i = 0; i < data.length; i++) {
            var utxo = data[i];
            query.run([utxo.txid,utxo.vout,utxo.value,utxo.height,utxo.scriptPubKey,utxo.address,utxo.path])
        }
    }
}

module.exports = Wallet;