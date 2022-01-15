const DigiByte = require('digibyte-js');
const BIP39 = require('digibyte-js/lib/bip39');
const HDPrivateKey = require('digibyte-js/lib/hdprivatekey');
const HDPublicKey = require('digibyte-js/lib/hdpublickey');
const Address = require('digibyte-js/lib/address');
const PrivateKey = require('digibyte-js/lib/privatekey');
const PublicKey = require('digibyte-js/lib/publickey');
const Unit = require('digibyte-js/lib/unit');
const Transaction = require('digibyte-js/lib/transaction');
const Script = require('digibyte-js/lib/script');

const Storage = require('./storage');
const Console = require('./console');
const Util = require('./util');
const BlockChain = require('./blockchain');
const path = require('path');
const DigiID = require('digibyte-js/lib/digiid');

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
            var password = 1, password1 = 0;
            while (password != password1) {
                if (password !== 1) {
                    Console.Log("The passwords doesn't match!");
                }
                password = Console.ReadPassword("Create password");
                password1 = Console.ReadPassword("Repeat password");
            }

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
            index: 0,
            version: Util.info.version
        }

        Storage.Save(global.wallet.path, global.wallet.storage);

        salt = xprv = xpub = type = network = null;

        return { 
            success: 'Wallet created!',
            path: global.wallet.path 
        };
    }
    static RestoreWallet(name, password, type, testnet) {
        var mnemonic = Console.ReadLine("Seed phrase");

        if (!BIP39.CheckMnemonic(mnemonic))
            return { error: 'Invalid mnemonic phrase!' }

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

                var password = 1, password1 = 0;
                while (password != password1) {
                    if (password !== 1) {
                        Console.Log("The passwords doesn't match!");
                    }
                    password = Console.ReadPassword("Create password");
                    password1 = Console.ReadPassword("Repeat password");
                }

            }
            
            var salt = Util.RandomBuffer();

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
                index: 0,
                version: Util.info.version
            }
    
            Storage.Save(global.wallet.path, global.wallet.storage);
    
            salt = xprv = xpub = type = network = null;
    
            return { 
                success: 'Wallet restored!',
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

        if(!Util.FileExist(path))
            return { error: "The file doesn't exist!" };

        global.wallet.storage = Storage.Open(path);

        if (!password) password = Console.ReadPassword("Password");
        
        var attempts = 3;
        while (attempts--) {
            if (Wallet.CheckPassword(password))
                break;
            else if (attempts)
                password = Console.ReadPassword("Password");
            
            if (!attempts) {
                global.wallet.storage = undefined;
                password = undefined;
                return { error: "Invalid password!" };
            }
        }

        if (global.wallet.storage.version != Util.info.version) {
            Console.Log("Version mismatch, this could corrupt your wallet")
            Console.Log("Terminal v" + Util.info.version)
            Console.Log("Wallet v" + global.wallet.storage.version)
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
                
                var attempts = 3;
                while (attempts--) {
                    if (Wallet.CheckPassword(password))
                        break;
                    else if (attempts)
                        password = Console.ReadPassword("Password");
                    
                    if (!attempts) {
                        password = undefined;
                        return { error: "Invalid password!" };
                    }
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

        while (true) {
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

        if (!data.error)
            data.success = "Balance fetched!";

        return data;
    }
    static async Sweep(wif, data, payload) {
        if (!global.wallet.storage)
            return { error: "No wallet open!"};

        var network = global.wallet.storage.network;
        var symbol = network.startsWith('testnet') ? "DGBT" : "DGB";
            
        if (!wif) wif = Console.ReadLine("WIF");

        if (!PrivateKey.isValid(wif))
            return { error: 'Invalid WIF!' };

        data = (!data && payload) ? Console.ReadLine("Extra data") : "";

        var privateKey = new PrivateKey(wif);

        var legacy = privateKey.toAddress('legacy', network).toString();
        
        if (privateKey.compressed) {
            var native = privateKey.toAddress('native', network).toString();
            var segwit = privateKey.toAddress('segwit', network).toString();
        }

        Console.Log("Scanning the blockchain...");

        var utxos = [];
        var valueIn = 0;
        legacy = { address: legacy, utxos: await BlockChain.utxos(legacy), satoshis: 0 };
        for (var i = 0; i < legacy.utxos.length; i++) {
            legacy.satoshis += legacy.utxos[i].satoshis;
            utxos.push(legacy.utxos[i]);
        }
        valueIn += legacy.satoshis;
        if (legacy.satoshis != 0)
            Console.Log("  " + legacy.address + ": " + Unit.fromSatoshis(legacy.satoshis).toDGB() + " " + symbol);

        if (native) {
            native = { address: native, utxos: await BlockChain.utxos(native), satoshis: 0 };
            for (var i = 0; i < native.utxos.length; i++) {
                native.satoshis += native.utxos[i].satoshis;
                utxos.push(native.utxos[i]);
            }
            valueIn += native.satoshis;
            if (native.satoshis != 0)
                Console.Log("  " + native.address + ": " + Unit.fromSatoshis(native.satoshis).toDGB() + " " + symbol);
        }
        if (segwit) {
            segwit = { address: segwit, utxos: await BlockChain.utxos(segwit), satoshis: 0 };
            for (var i = 0; i < segwit.utxos.length; i++) {
                segwit.satoshis += segwit.utxos[i].satoshis;
                utxos.push(segwit.utxos[i]);
            }
            valueIn += segwit.satoshis;
            if (segwit.satoshis != 0)
                Console.Log("  " + segwit.address + ": " + Unit.fromSatoshis(segwit.satoshis).toDGB() + " " + symbol);
        }

        var fee = Wallet.TxSize(utxos.length, 1, data.length);

        var valueOut = valueIn - fee;

        if (valueIn == 0)
            return { error: 'Empty Private Key!'}

        if (valueOut <= 546)
            return { error: 'Dust output detected!' };

        Console.Log("Total: " + Unit.fromSatoshis(valueIn).toDGB() + " " + symbol);
        var ans = Console.ReadLine("Reedem wallet? (y/n)");

        if (ans.toUpperCase() != "Y")
            return { error: "Operation canceled!" };

        var change = Wallet.GenerateAddress(true).address;

        var tx = new Transaction();
        tx.from(utxos);
        tx.to(change, valueOut);
        tx.fee(fee);
        if (data != "") tx.addData(data);
        tx.sign(privateKey);
        
        var hex = tx.serialize(true);
        
        var data = await BlockChain.broadcast(hex);
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
                Console.Log(data.error);
                return;
            } else {
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
        } else if (address) {
            var data = await BlockChain.address(address, network);

            if (data.error) {
                Console.Log(data.error);
            } else { 
                Console.Log("Total Received: " + data.totalReceived);
                Console.Log("Total Sent:     " + data.totalSent);
                Console.Log("Total Balance:  " + data.balance);
                Console.Log("Tx Apperances:  " + data.txApperances);
            }
        } else {
            var data = await BlockChain.api(network);
            
            if (data.error) {
                Console.Log(data.error);
            } else {
                Console.Log("Server:  " + data.server);
                Console.Log("In sync: " + data.blockbook.inSync);
                Console.Log("Height:  " + data.backend.blocks);
                Console.Log("Mempool: " + data.blockbook.mempoolSize);
            }
        }
    }
    static xpub() {
        if (!global.wallet.storage)
            return { error: "No wallet open!" };
        return { success: "xpub found!", xpub: global.wallet.xpub };
    }
    static Help() {
        Console.Log("Welcome to your DigiByte Wallet!");
        Console.Log("List of commands:");
        Console.Log(" version:      Check the version of your terminal");
        Console.Log(" wallets:      List all the wallets in current directory");
        Console.Log(" create:       Create a wallet");
        Console.Log(" open:         Open an existing wallet");
        Console.Log(" close:        Close the current wallet");
        Console.Log(" balance:      Check the balance of your wallet");
        Console.Log(" transactions: List all transactions of the wallet");
        Console.Log(" address:      Generate and show the next HD wallet");
        Console.Log(" xpub:         Show the master public key of your wallet");
        Console.Log(" explorer:     Explore the DigiByte network");
        Console.Log(" sweep:        Redeem a paper wallet");
        Console.Log(" send:         Create and broadcast a DigiByte transaction");
        Console.Log(" vanity:       Generate a custom DigiByte address");
        Console.Log(" faucet:       Get free DigiByte");
        Console.Log(" clear:        Clear your terminal");
        Console.Log(" exit:         Exit the terminal");
    }
    static async Send(address, amount, data, payload) {
        if (!global.wallet.storage)
            return { error: "No wallet open!" };

        var utxos = await BlockChain.utxos(global.wallet.xpub);

        if (utxos.error)
            return utxos;

        var balance = 0;
        utxos.forEach(utxo => { balance += utxo.satoshis })

        if (balance == 0)
            return { error: 'Your wallet is empty!' };

        Console.Log("Available balance: " + Unit.fromSatoshis(balance).toDGB() + ' ' + global.wallet.storage.symbol);

        if (!address) address = Console.ReadLine("Pay to");

        
        if (!Address.isValid(address))
            return { error: "Invalid address!" };

        if (!amount) amount = Console.ReadLine("Amount");
        
        data = (!data && payload) ? Console.ReadLine("Extra data") : "";

        if (amount != 'all') {
            var satoshis = amount = Unit.fromDGB(amount).toSatoshis();
            
            if (isNaN(amount))
                return { error: 'Invalid amount!' };

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
        var attempts = 3;
        while (attempts--) {
            if (Wallet.CheckPassword(password))
                break;
            else if (attempts)
                password = Console.ReadPassword("Password");
            
            if (!attempts) {
                password = undefined;
                return { error: "Invalid password!" };
            }
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
        
        var data = await BlockChain.broadcast(hex);
        return data;
    }
    static async DigiID(uri, index) {
        if (!global.wallet.storage)
            return { error: "No wallet open!" };

        var password = Console.ReadPassword("Password");
        var attempts = 3;
        while (attempts--) {
            if (Wallet.CheckPassword(password))
                break;
            else if (attempts)
                password = Console.ReadPassword("Password");
            
            if (!attempts) {
                password = undefined;
                return { error: "Invalid password!" };
            }
        }

        var xprv = global.wallet.storage.xprv;
        var xprv = Util.DecryptAES256(xprv, password);
        var xprv = HDPrivateKey.fromString(xprv);

        var digiid = new DigiID(uri);
        var credentials = digiid.sign(xprv, index || 0);

        xprv = null;

        Console.Log('Negociating: ' + digiid.callback);

        var response = await Util.FetchData(digiid.callback, credentials);

        if (response.error)
            return response;
        else
            response.success = 'Login successful!';

        return response;
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