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
const path = require('path');

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

        global.wallet.path = path.join(process.cwd(), name + "." + (network.startsWith("livenet") ? "dgb" : "dgbt"));

        if (Util.FileExist(global.wallet.path)) {
            return { error: "The wallet already exist!" };
        }
        
        global.wallet.storage = {
            password,
            salt,
            xprv,
            xpub,
            type,
            network,
            server: BlockChain.Server(network),
            name,
            derivation,
            symbol,
            change: 0,
            index: 0
        }

        Storage.Save(global.wallet.path, global.wallet.storage);

        salt = xprv = xpub = type = network = null;

        return { 
            success: 'Wallet created!',
            path: global.wallet.path 
        };
    }
    static ShowWallets() {
        Console.Log('Wallet List:')
        var wallets = Util.GetFiles();
        for (var i = 0; i < wallets.length; i++)
            Console.Log("  " + wallets[i]);
        if (wallets.length == 0)
            Console.Log('  No wallets found!')
    }
    static OpenWallet(path, password) {
        if (!path) path = Console.ReadLine("Wallet path/name");

        if(!Util.FileExist(path)) {
            return { error: "The file doesn't exist!" };
        }

        if (!password) password = Console.ReadPassword("Password");
        
        global.wallet.storage = Storage.Open(path);
        if (!Wallet.CheckPassword(password)){
            global.wallet.storage = undefined;
            password = undefined;
            return { error: "Invalid password!" };
        }

        global.wallet.xpub = Util.DecryptAES256(global.wallet.storage.xpub, password);
        global.wallet.path = path;
        
        password = undefined;

        return { success: 'Wallet opened!' };
    }
    static CloseWallet() {
        if (!global.wallet.storage)
            return { error: 'No wallet open!' };
        
        global.wallet.storage = undefined;
        global.wallet.xpub = undefined;
        global.wallet.path = undefined;

        return { success: 'Wallet closed!' };
    }
    static GenerateAddress(change, password, WIF, type, reveal, random, testnet) { 
        
        var network = testnet ? 'testnet' : 'livenet'

        if (random) {
            var type = type || 'segwit';
            var privateKey = new PrivateKey(undefined, network);
            var WIF = privateKey.toWIF();
            var address = privateKey.toAddress(type, network).toString();
            return { success: "Address created", WIF, address };
        }
        
        if (!WIF) {
            if (!global.wallet.storage)
                return { error: "No wallet open!" };

            var quantity = change ? global.wallet.storage.change : global.wallet.storage.index;
            
            if (!reveal) {
                var hdPublicKey = HDPublicKey.fromString(global.wallet.xpub).derive(change ? 1 : 0).derive(quantity);
                var address = new Address(hdPublicKey.publicKey, global.wallet.storage.network, global.wallet.storage.type).toString();
                WIF = undefined;
            } else {
                if (!password) password = Console.ReadPassword("Password");
                if (!Wallet.CheckPassword(password)) {
                    password = undefined;
                    return { error: "Incorrect password!" };
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
            
            if (!publicKey.compressed && (type == 'native' || type == 'segwit'))
                return { error: "For native and segwit addreses you must use compressed keys" };

            var address = privateKey.toAddress(type, network).toString();
            if (!reveal) WIF = undefined;
        }

        return { success: "Address created", address, WIF };
    }
    static Vanity(pattern, type, testnet, hide) {
        type = type ? type : 'legacy';
        var network = testnet ? 'testnet' : 'livenet';
        network = type != 'legacy' ? network + '-' + type : network;
        
        if (!pattern) pattern = Console.ReadLine("Pattern");

        if (pattern.startsWith('%') && pattern.endsWith('%'))
            var predicate = function (addr = '') { return addr.indexOf(pattern) != -1; };
        else if (pattern.startsWith('%'))
            var predicate = function (addr = '') { return addr.endsWith(pattern); };
        else
            var predicate = function (addr = '') { return addr.startsWith(pattern); };

        pattern = pattern.replace('%', '');
        pattern = pattern.replace('%', '');
        
        if (type == 'legacy' || type == 'native') {
            var alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
            for (var i = 0; i < pattern.length; i++)
                if (alphabet.indexOf(pattern[i]) == -1)
                    return { error: "'" + pattern[i] + "' is not in the Base58 alphabet" };
        } else {
            var alphabet = '123456789abcdefghjklmnpqrstuvwxyz';
            for (var i = 0; i < pattern.length; i++)
                if (alphabet.indexOf(pattern[i]) == -1)
                    return { error: "'" + pattern[i] + "' is not in the Bech32 alphabet" };
        }
            
        var start = (new Date).getTime();
        var cant = 0;
        var secs = 0;

        while (true)
        {
            var privateKey = new PrivateKey(null, network);
            var address = privateKey.toAddress(type).toString();
            cant++;
            secs++;
            if (!hide) {
                var end = (new Date).getTime();
                if (end - start > 1000) {
                    Console.Clear();
                    Console.Logo();
                    Console.Log("Target: " + pattern);
                    Console.Log("Last address: " + address);
                    Console.Log(cant + ' addresses checked');
                    Console.Log(Math.floor(secs) + ' / sec');
                    start = end;
                    secs = 0;
                }
            }

            if (predicate(address))
                break;
        }
        return { success: "Address found!", WIF: privateKey.toWIF(), address};
    }
    static async Balance() {
        if (!global.wallet.storage)
            return { error: "No wallet open!"};
        
        var data = await BlockChain.xpub(global.wallet.xpub);
        data.success = "Balance fetched!";

        return data;
    }
    static async Transactions() {
        if (!global.wallet.storage)
            return { error: "No wallet open!"};

        var data = await BlockChain.xpub(global.wallet.xpub);
        if(!data.transactions) data.transactions = [];
        data.success = "Transactions fetched!";
        return data;
    }
    static async Explorer(testnet, txid, address) {
        var network = testnet ? 'testnet' : null;
        var symbol = testnet ? "DGBT" : "DGB";

        if (txid) {
            var data = await BlockChain.tx(txid, network);

            if (data.error) {
                Console.Log("Error: " + data.error);
                return;
            } 

            Console.Log("DateTime: " + new Date(data.blocktime * 1000));
            Console.Log("Confirmations: " + data.confirmations);
            Console.Log("Input: " + data.valueIn);
            for (var i = 0; i < data.vin.length; i++) {
                if (!data.vin[i].addresses[0]) {
                    Console.Log("  No input");
                    continue;
                }
                Console.Log("  " + data.vin[i].addresses[0].padEnd(43, " ") + " " + data.vin[i].value + " " + symbol);
            }
            Console.Log("Output: " + data.valueOut);
            for (var i = 0; i < data.vout.length; i++) {
                if (!data.vout[i].scriptPubKey.addresses[0]) {
                    Console.Log("  No output");
                    continue;
                }
                if (!data.vout[i].scriptPubKey.addresses[0].startsWith("OP_RETURN"))
                    Console.Log("  " + data.vout[i].scriptPubKey.addresses[0].padEnd(43, " ") + " " + data.vout[i].value + " " + symbol + (data.vout[i].spent ? " (spend)" : ""));
                else
                    var opReturn = data.vout[i].scriptPubKey.addresses[0].substring(11, data.vout[i].scriptPubKey.addresses[0].length - 1);
            }
            if (opReturn) Console.Log("Data: " + opReturn);
            Console.Log("Fees: " + data.fees);
            Console.Log("Size: " + (data.hex.length / 2) + " Bytes")
        }
        else if (address) {
            var data = await BlockChain.address(address, network);

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
        if (!global.wallet.storage)
            return { error: "No wallet open!" };
        return { success: "xpub found!", xpub: global.wallet.xpub };
    }
    static async Send(address, amount, data, payload) {
        if (!global.wallet.storage) {
            return { error: "No wallet open!" };
        }

        var utxos = await BlockChain.utxos(global.wallet.xpub);

        var balance = 0;
        utxos.forEach(utxo => {balance += utxo.satoshis})
        Console.Log("Available balance: " + Unit.fromSatoshis(balance).toDGB() + ' ' + global.wallet.storage.symbol);

        if (!address) address = Console.ReadLine("Pay to");

        
        if (!Address.isValid(address))
            return { error: "Invalid address!" };

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


        if (!fee)
            return { error: "Unsuficient funds!" };
        
        var password = Console.ReadPassword("Password");
        if(!Wallet.CheckPassword(password))
            return { error: "Wrong password" };

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
        
        var data = await BlockChain.broadcast(hex);
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