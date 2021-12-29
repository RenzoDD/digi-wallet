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

const Storage = require('./storage');
const Console = require('./console');
const Util = require('./util');
const BlockChain = require('./blockchain');

class Wallet {
    static CreateWallet(name, password, entropy, type, testnet, nobackup, noentropy) {
        if (!name) {
            name = Console.ReadLine("Name (default)");
            if (name == "") name = "default";
        }
        
        type = !type ? "segwit" : type;
        if (type != 'legacy' && type != 'native' && type != 'segwit') type = 'segwit';

        var network = !testnet ? "livenet" : "testnet";
        if (type != 'legacy') network += "-" + type;

        var symbol = !testnet ? "DGB" : "DGBT";

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
                Console.Logo();
                Console.Log("Word " + i + ": " + words[i - 1]);
                Console.Pause();
            }
            Console.Clear();

            for (var i = 1; i <= 3; i++) {
                var n = Math.floor(Math.random() * 12);
                do {
                    Console.Clear();
                    Console.Logo();
                    var answer = Console.ReadLine("Enter word N " + (n + 1));
                } while (answer != words[n]);
            }

            Console.Clear();
            Console.Logo();
            Console.Log("All done, NEVER share this words or you will lose your coins");
            Console.Pause();
        }

        var derivation = "m/" + (type == "legacy" ? 44 : (type == "segwit" ? 84 : 49)) + "'/" + (network.startsWith('testnet') ? 1 : 20) + "'/0'";
        var seed = BIP39.MnemonicToSeed(mnemonic);
        var xprv = HDPrivateKey.fromSeed(seed, network);
        var xpub = xprv.derive("m/" + (type == "legacy" ? 44 : (type == "segwit" ? 84 : 49)) + "'/" + (testnet ? 1 : 20) + "'/0'").hdPublicKey.toString();

        xprv = xprv.toString();

        global.wallet.xpub = xpub;

        xprv = Util.EncryptAES256(xprv, password);
        xpub = Util.EncryptAES256(xpub, password);

        password = Util.SHA256(password);
        password = Util.SHA256(Buffer.concat([password, salt]));

        global.wallet.path = process.cwd() + "\\" + name + "." + (network.startsWith("livenet") ? "dgb" : "dgbt");

        global.wallet.storage = {
            password,
            salt,
            xprv,
            xpub,
            type,
            network,
            name,
            derivation,
            symbol,
            change: 0,
            index: 0
        }

        Storage.Save(global.wallet.path, global.wallet.storage);

        salt = xprv = xpub = type = network = null;

        return global.wallet.path;
    }
    static OpenWallet(path, password) {
        if (!path) path = Console.ReadLine("Enter file path");

        if(!Util.FileExist(path)) {
            Console.Log("The file doesn't exist!");
            return false;
        }

        if (!password) password = Console.ReadPassword("Password");
        
        global.wallet.storage = Storage.Open(path);
        if (!Wallet.CheckPassword(password)){
            global.wallet.storage = undefined;
            password = undefined;
            Console.Log('Invalid password');
            return false;
        }

        global.wallet.xpub = Util.DecryptAES256(global.wallet.storage.xpub, password);
        global.wallet.path = path;
        
        password = undefined;

        return true;
    }
    static CloseWallet() {
        if (!global.wallet.storage) {
            Console.Log("No wallet open!");
            return;
        }
        
        global.wallet.storage = undefined;
        global.wallet.xpub = undefined;
        global.wallet.path = undefined;
    }
    static GenerateAddress(change, password, WIF, type, reveal, random, testnet) { 
        
        var network = testnet ? 'testnet' : 'livenet'

        if (random) {
            var type = type || 'segwit';
            var privateKey = new PrivateKey(undefined, network);
            var WIF = privateKey.toWIF();
            var address = privateKey.toAddress(type, network).toString();
            return { WIF, address };
        }
        
        if (!WIF) {
            if (!global.wallet.storage) {
                Console.Log("No wallet open!");
                return {};
            }

            var quantity = change ? global.wallet.storage.change : global.wallet.storage.index;
            
            if (!reveal) {
                var hdPublicKey = HDPublicKey.fromString(global.wallet.xpub).derive(change ? 1 : 0).derive(quantity);
                var address = new Address(hdPublicKey.publicKey, global.wallet.storage.network, global.wallet.storage.type).toString();
                WIF = undefined;
            } else {
                if (!password) password = Console.ReadPassword("Password");
                if (!Wallet.CheckPassword(password)) {
                    Console.Log("Incorrect password");
                    password = undefined;
                    return { };
                }
                var xprv = global.wallet.storage.xprv;
                xprv = Util.DecryptAES256(xprv, password);
                password = undefined;

                var hdPrivateKey = HDPrivateKey.fromString(xprv).derive(global.wallet.storage.derivation).derive(change ? 1 : 0).derive(quantity);
                xprv = undefined;
                WIF = hdPrivateKey.privateKey.toWIF();
                var address = new Address(hdPrivateKey.hdPublicKey.publicKey, global.wallet.storage.network, global.wallet.storage.type).toString();
            }

            if (!change)
                global.wallet.storage.index++;
            else
                global.wallet.storage.change++;

            Storage.Save(global.wallet.path, global.wallet.storage);
        } else {
            var type = type || 'segwit';
            var privateKey = new PrivateKey(WIF);
            var publicKey = new PublicKey(privateKey);
            if (!publicKey.compressed && (type == 'native' || type == 'segwit')) {
                Console.Log("For native and segwit addreses you must use compressed keys");
                return { };
            }
            var address = privateKey.toAddress(type, network).toString();
            if (!reveal) WIF = undefined;
        }

        return { address, WIF };
    }
    static async Balance() {
        if (!global.wallet.storage) {
            Console.Log("No wallet open!");
            return {};
        }
        var data = await BlockChain.xpub(global.wallet.xpub, global.wallet.storage.network);
        return data;
    }
    static async Transactions() {
        if (!global.wallet.storage) {
            Console.Log("No wallet open!");
            return {};
        }
        var data = await BlockChain.xpub(global.wallet.xpub, global.wallet.storage.network);
        return data.transactions || [];
    }
    static async Explorer(testnet, txid, address) {
        var network = testnet ? 'testnet' : global.wallet.storage ? global.wallet.storage.network : 'livenet';
        var symbol = network.startsWith("testnet") ? "DGBT" : "DGB";

        if (txid) {
            var data = await BlockChain.tx(network, txid);

            if (data.error) {
                Console.Log("Error: " + data.error);
                return;
            } 

            Console.Log("DateTime: " + new Date(data.blocktime * 1000));
            Console.Log("Confirmations: " + data.confirmations);
            Console.Log("Input: " + data.valueIn);
            for (var i = 0; i < data.vin.length; i++) {
                Console.Log("  " + data.vin[i].addresses[0] + " " + data.vin[i].value + " " + symbol);
            }
            Console.Log("Output: " + data.valueOut);
            for (var i = 0; i < data.vout.length; i++) {
                Console.Log("  " + data.vout[i].scriptPubKey.addresses[0] + " " + data.vout[i].value + " " + symbol + (data.vout[i].spent ? " (spend)" : ""));
            }
            Console.Log("Fees: " + data.fees);
            Console.Log("Size: " + (data.hex.length / 2) + " Bytes")
        }
        else if (address) {
            var data = await BlockChain.address(network, address);

            if (data.error) {
                Console.Log("Error: " + data.error);
                return;
            } 

            Console.Log("Total Received: " + data.totalReceived);
            Console.Log("Total Sent:     " + data.totalSent);
            Console.Log("Total Balance:  " + data.balance);
            Console.Log("Tx Apperances:  " + data.txApperances);
        } else {
            var data = await BlockChain.api(network);
            Console.Log("Server:  " + data.server);
            Console.Log("In sync: " + data.blockbook.inSync);
            Console.Log("Height:  " + data.backend.blocks);
            Console.Log("Mempool: " + data.blockbook.mempoolSize);
        }
    }
    static xpub() {
        if (!global.wallet.storage) {
            Console.Log("No wallet open!");
            return;
        }
        return global.wallet.xpub;
    }
    static async Send(address, amount, data, payload) {
        if (!global.wallet.storage) {
            Console.Log("No wallet open!");
            return { };
        }

        var utxos = await BlockChain.utxos(global.wallet.xpub, global.wallet.storage.network);

        var balance = 0;
        utxos.forEach(utxo => {balance += utxo.satoshis})
        Console.Log("Available balance: " + Unit.fromSatoshis(balance).toDGB() + ' ' + global.wallet.storage.symbol);

        if (!address) address = Console.ReadLine("Pay to");

        
        if (!Address.isValid(address)) {
            Console.Log("Invalid address!");
            return { };
        }

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
                    var change = Wallet.GenerateAddress(true).address;
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
        var xprv = global.wallet.storage.xprv;
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
        if (data != "") tx.addData(data);
        tx.sign(privateKeys);
        
        var hex = tx.serialize(true);
        
        var server = 'digibyteblockexplorer.com';
        if (global.wallet.storage.network.startsWith('testnet'))
            server = 'testnetexplorer.digibyteservers.io';

        var data = await Util.FetchData('https://' + server + '/api/sendtx/' + hex);

        return data;
    }
    static CheckPassword(password) {
        var passwordDB = global.wallet.storage.password;
        var saltDB = global.wallet.storage.salt;

        var passwordUser = Util.SHA256(Buffer.concat([Util.SHA256(password), saltDB]));

        return (Buffer.compare(passwordUser, passwordDB) == 0);
    }
    static TxSize(inputs, outputs, data) {
        if (data != 0) outputs++;
        return inputs*180 + outputs*34 + 10 +inputs + data;
    }
}

module.exports = Wallet;