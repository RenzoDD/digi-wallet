const DigiByte = require('digibyte-js');
const BIP39 = DigiByte.BIP39;
const HDPrivateKey = DigiByte.HDPrivateKey;
const HDPublicKey = DigiByte.HDPublicKey;
const Address = DigiByte.Address;
const PrivateKey = DigiByte.PrivateKey;
const PublicKey = DigiByte.PublicKey;
const Unit = DigiByte.Unit;
const Transaction = DigiByte.Transaction;
const Script = DigiByte.Script;

const SQLite = require('better-sqlite3');
const Console = require('./console');
const Util = require('./util');
const BlockChain = require('./blockchain');

class Wallet {
    static Logo() {
        console.log("\x1b[40m\x1b[34m"," _____   _       _ ______                  ");
        console.log("\x1b[40m\x1b[34m","(____ \\ (_)     (_|____  \\       _         ");
        console.log("\x1b[40m\x1b[34m"," _   \\ \\ _  ____ _ ____)  )_   _| |_  ____ ");
        console.log("\x1b[40m\x1b[34m","| |   | | |/ _  | |  __  (| | | |  _)/ _  )");
        console.log("\x1b[40m\x1b[34m","| |__/ /| ( ( | | | |__)  ) |_| | |_( (/ / ");
        console.log("\x1b[40m\x1b[34m","|_____/ |_|\\_|| |_|______/ \\__  |\\___)____)");
        console.log("\x1b[40m\x1b[34m","          (_____|         (____/           ");
        console.log("\x1b[40m\x1b[36m","             By Renzo Diaz & DigiFaucet.org");
        console.log("\x1b[40m\x1b[37m");
    }
    static CreateWallet(name, password, entropy, type, testnet, nobackup, noentropy) {
        if (!name) {
            name = Console.ReadLine("Name (default)");
            if (name == "") name = "default";
        }
        
        type = !type ? "segwit" : type;
        if (type != 'legacy' && type != 'native' && type != 'segwit') type = 'segwit';

        var network = !testnet ? "livenet" : "testnet";
        if (type != 'legacy') network += "-" + type;

        if (!password) {
            var password = Console.ReadPassword("Create password");
            //password = (password == "") ? "password" : password;
        }

        var salt = Util.RandomBuffer();
        if (!entropy && !noentropy)
            var entropy = Console.ReadLine("Enter random text");
        else
            var entropy = Util.RandomBuffer();
        entropy = Util.SHA256(Buffer.concat([Util.SHA256(entropy), Util.RandomBuffer()]));

        var mnemonic = BIP39.CreateMnemonic(entropy.slice(16));
        
        if (!nobackup) {
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
        var xpub = xprv.derive("m/" + (type == "legacy" ? 44 : (type == "segwit" ? 84 : 49)) + "'/" + (testnet ? 1 : 20) + "'/0'").hdPublicKey.toString();

        xprv = xprv.toString();

        global.wallet.network = network;
        global.wallet.type = type;
        global.wallet.xpub = xpub;

        xprv = Util.EncryptAES256(xprv, password);
        xpub = Util.EncryptAES256(xpub, password);

        password = Util.SHA256(password);
        password = Util.SHA256(Buffer.concat([password, salt]));

        var path = global.wallet.path + "\\\\" + name + "." + (network.startsWith("livenet") ? "dgb" : "dgbt");

        global.wallet.database = SQLite(path);

        global.wallet.database.prepare("CREATE TABLE Addresses( address TEXT NOT NULL UNIQUE, label TEXT NOT NULL, change INTEGER NOT NULL, n INTEGER NOT NULL, PRIMARY KEY (address))").run();
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

        return path;
    }
    static OpenWallet(path, password) {
        if (!path) path = Console.ReadLine("Enter file path");
        if (!password) password = Console.ReadPassword("Password");

        if(!Util.FileExist(path)) {
            Console.Log("The file doesn't exist!");
            return;
        }

        global.wallet.database = SQLite(path);
        if (!Wallet.CheckPassword(password)){
            Console.Log('Invalid password');
            global.wallet.database.close();
            password = undefined;
            return;
        }

        var query = global.wallet.database.prepare("SELECT value FROM Data WHERE key = ?");
        global.wallet.network = query.get('network').value;
        global.wallet.type = query.get('type').value;
        global.wallet.name = query.get('name').value;
        global.wallet.xpub = Util.DecryptAES256(query.get('xpub').value, password);
        global.wallet.symbol = global.wallet.network.startsWith('livenet') ? 'DGB' : 'DGBT';
        
        password = undefined;
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
    }
    static GenerateAddress(label, WIF, password, type, reveal, nolabel, random, testnet, change = 'normal') { 
        
        var network = testnet ? 'testnet' : 'livenet'

        if (random) {
            var type = type || global.wallet.type;
            var privateKey = new PrivateKey();
            var WIF = privateKey.toWIF();
            var address = privateKey.toAddress(type, network).toString();
            return { WIF, address };
        }
        
        if (!WIF) {
            if (!global.wallet.database) {
                Console.Log("No wallet open!");
                return {};
            }

            if (!label && !nolabel) label = Console.ReadLine("Label");
            if (nolabel) label = "";

            change = change == 'change' ? 1 : 0;
            var quantity = global.wallet.database.prepare("SELECT COUNT(*) AS quantity FROM Addresses WHERE change == ?").get([change]).quantity;

            if (!reveal) {
                var hdPublicKey = HDPublicKey.fromString(global.wallet.xpub).derive(change).derive(quantity);
                var address = new Address(hdPublicKey.publicKey, global.wallet.network, global.wallet.type).toString();
                WIF = undefined;
            } else {
                if (!password) password = Console.ReadPassword("Password");
                if (!Wallet.CheckPassword(password)) {
                    Console.Log("Incorrect password");
                    password = undefined;
                    return;
                }
                var xprv = global.wallet.database.prepare("SELECT value FROM Data WHERE key = ?").get(['xprv']).value;
                xprv = Util.DecryptAES256(xprv, password);
                password = undefined;

                var hdPrivateKey = HDPrivateKey.fromString(xprv).derive("m/" + (global.wallet.type == "legacy" ? 44 : (global.wallet.type == "segwit" ? 84 : 49)) + "'/" + (global.wallet.network.startsWith('testnet') ? 1 : 20) + "'/0'").derive(change).derive(quantity);
                WIF = hdPrivateKey.privateKey.toWIF();
                var address = new Address(hdPrivateKey.hdPublicKey.publicKey, global.wallet.network, global.wallet.type).toString();
                
                xprv = undefined;
            }

            global.wallet.database.prepare("INSERT INTO Addresses (address, label, change, n) VALUES (?,?,?,?)").run([address,label,change, quantity]);
        } else {
            var type = type || global.wallet.type;
            var privateKey = new PrivateKey(WIF);
            var publicKey = new PublicKey(privateKey);
            if (!publicKey.compressed && (type == 'native' || type == 'segwit')) {
                Console.Log("For native and segwit addreses you must use compressed keys");
                return {};
            }
            var address = privateKey.toAddress(type, network).toString();
            if (!reveal) WIF = undefined;
        }

        return { address, WIF };
    }
    static async Balance() {
        if (!global.wallet.database) {
            Console.Log("No wallet open!");
            return {};
        }
        var data = await BlockChain.xpub(global.wallet.xpub, global.wallet.network);
        return data;
    }
    static xpub() {
        if (!global.wallet.database) {
            Console.Log("No wallet open!");
            return;
        }
        return global.wallet.xpub;
    }
    static async Send(address, amount, data, payload) {
        if (!global.wallet.database) {
            Console.Log("No wallet open!");
            return { };
        }

        var utxos = await BlockChain.utxos(global.wallet.xpub, global.wallet.network);

        var balance = 0;
        utxos.forEach(utxo => {balance += utxo.satoshis})
        Console.Log("Available balance: " + Unit.fromSatoshis(balance).toDGB() + ' ' + global.wallet.symbol);

        if (!address) address = Console.ReadLine("Recipient address");
        if (!amount) amount = Console.ReadLine("Amount");
        if (!data && payload)
            data = Console.ReadLine("Extra data");
        else
            data = "";

        if (amount != 'all') {
            var satoshis = amount = Unit.fromDGB(amount).toSatoshis();
            
            var inputs = [];
            for (var i = 0; i < utxos.length; i++) {
                inputs.push(utxos[i]);
                satoshis -= utxos[i].satoshis;

                var one = -(satoshis + Wallet.TxSize(inputs.length, 1, data.length));
                var two = -(satoshis + Wallet.TxSize(inputs.length, 2, data.length));

                if (one == 0) {
                    var fee = Wallet.TxSize(inputs.length, 1, data.length);
                    break;
                }
                else if (two >= 546) {
                    var fee = Wallet.TxSize(inputs.length, 2, data.length);
                    var change = Wallet.GenerateAddress("","","",undefined,false,true,false,global.wallet.network.startsWith('testnet'),'change').address;
                    break;
                }
            }
        } else {
            var inputs = utxos;
            amount = 0;
            
            for (var i = 0; i < inputs.length; i++) { 
                amount += inputs[i].satoshis;
            }
            var fee = Wallet.TxSize(inputs.length, 1, data.length);

            amount -= fee
            if (amount <= 546)
                fee = undefined;
        }


        if (!fee) {
            Console.Log("Unsuficient funds!");
            return { };
        }
        
        var password = Console.ReadPassword("Password");
        if(!Wallet.CheckPassword(password)) {
            Console.Log("Wrong password");
            return { };
        }
        var xprv = global.wallet.database.prepare("SELECT value FROM Data WHERE key = ?").get(['xprv']).value;
        var xprv = Util.DecryptAES256(xprv, password);
        var xprv = HDPrivateKey.fromString(xprv);

        var privateKeys = [];
        for (var i = 0; i < inputs.length; i++) {
            var wif = xprv.derive(inputs[i].path).privateKey.toWIF();
            if (privateKeys.indexOf(wif) == -1)
                privateKeys.push(wif);
        }

        var tx = new Transaction();
        tx.from(inputs);
        tx.to(address.trim(), amount);
        tx.fee(fee);
        if (change) tx.change(change);
        tx.sign(privateKeys);
        
        var hex = tx.serialize(true);
        
        var server = 'digibyteblockexplorer.com';
        if (global.wallet.network.startsWith('testnet'))
            server = 'testnetexplorer.digibyteservers.io';

        var data = await Util.FetchData('https://' + server + '/api/sendtx/' + hex);

        return data;
    }

    static CheckPassword(password) {
        var query = global.wallet.database.prepare("SELECT value FROM Data WHERE key = ?");
        var passwordDB = query.get(['password']).value;
        var saltDB = query.get(['salt']).value;

        var passwordUser = Util.SHA256(Buffer.concat([Util.SHA256(password), saltDB]));

        return (Buffer.compare(passwordUser, passwordDB) == 0);
    }
    static TxSize(inputs, outputs, data) {
        if (data != 0) outputs++;
        return inputs*180 + outputs*34 + 10 +inputs + data;
    }
}

module.exports = Wallet;