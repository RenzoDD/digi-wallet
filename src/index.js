#!/usr/bin/env node

(async function() {
    global.wallet = {}
    global.wallet.name = null;
    global.wallet.database = null;
    global.wallet.xpub = null;

    const Console = require('./packages/console');
    const Wallet = require('./packages/wallet');

    Console.Logo();
    while(true) {
        var cmd = Console.ReadCommand(global.wallet.name);
        
        switch (cmd.command) {
            case 'create':
                var result = Wallet.CreateWallet(cmd.arguments.name, cmd.arguments.password, cmd.arguments.entropy, cmd.arguments.type, cmd.flags.testnet, cmd.flags.nobackup, cmd.flags.noentropy);
                if (result.success) {
                    Console.Log(result.success);
                    Console.Log("Path: " + result.path);
                }
                break;
            case 'open':
                var result = Wallet.OpenWallet(cmd.arguments.path, cmd.arguments.password);
                if (result.error) Console.Log(result.error);
                if (result.success) Console.Log(result.success);
                break;
            case 'balance':
                var result = await Wallet.Balance();
                if (result.error) Console.Log(result.error);
                if (result.success) {
                    Console.Log("Confirmed: " + result.confirmed + ' ' + global.wallet.storage.symbol);
                    Console.Log("Unconfirmed: " + result.unconfirmed + ' ' + global.wallet.storage.symbol);
                    Console.Log("Transactions: " + result.apperances);
                }
                break;
            case 'close':
                var result = Wallet.CloseWallet();
                if (result.error) Console.Log(result.error);
                if (result.success) Console.Log(result.success);
                break;
            case 'address':
                var result = Wallet.GenerateAddress(false, cmd.arguments.password, cmd.arguments.WIF, cmd.arguments.type, cmd.flags.reveal, cmd.flags.random, cmd.flags.testnet);
                if (result.error) Console.Log(result.error);
                if (result.success) {
                    if (result.address) Console.Log("Address: " + result.address);
                    if (result.WIF) Console.Log("WIF: " + result.WIF);
                }
                break;
            case 'transactions':
                var result = await Wallet.Transactions();
                if (result.error) Console.Log(result.error);
                if (result.success) {
                    result.transactions.forEach(tx => { Console.Log(tx); });
                }
                break;
            case 'xpub':
                var result = Wallet.xpub();
                if (result.error) Console.Log(result.error);
                if (result.success) Console.Log(result.xpub);
                break;
            case 'explorer':
                await Wallet.Explorer(cmd.flags.testnet, cmd.arguments.txid, cmd.arguments.address);
                break;
            case 'send':
                var data = await Wallet.Send(cmd.arguments.address, cmd.arguments.value, cmd.arguments.data, cmd.flags.payload);
                if(data.error) Console.Log("Error: " + data.error);
                if(data.result) Console.Log("TXID: " + data.result);
                break;
            case 'vanity':
                var result = Wallet.Vanity(cmd.arguments.pattern, cmd.arguments.type, cmd.flags.testnet, cmd.flags.hide);
                if(result.error) Console.Log("Error: " + result.error);
                if(result.success) {
                    Console.Log("Address: " + result.address);
                    Console.Log("WIF: " + result.WIF);
                }
                break;
            case 'clear': case 'cls':
                Console.Clear();
                Console.Logo();
                break;
            case 'exit':
                return;
            default:
                Console.Log("Unknown command!");
            case '':
        }
    }
})()