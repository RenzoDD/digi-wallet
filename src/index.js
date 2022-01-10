#!/usr/bin/env node

process.argv.shift()
process.argv.shift()

global.wallet = {}
global.wallet.name = null;
global.wallet.xpub = null;

const Util = require('./packages/util');
const Console = require('./packages/console');
const Wallet = require('./packages/wallet');

Console.Clear();
Console.Logo();

if (process.argv.length > 0)
{
    if (process.argv[0].toLocaleLowerCase() == '-v')
    {
        Console.Log(Util.info.version);
        return;
    } else if (process.argv[0].toLocaleLowerCase() == 'help') {
        Wallet.Help();
    } else {
        Console.Log("open -path " + process.argv[0]);
        var result = Wallet.OpenWallet(process.argv[0], process.argv[1])
        if (result.error) Console.Log(result.error);
        if (result.success) Console.Log(result.success);
    }
}

(async function() {
    while(true) {
        var cmd = Console.ReadCommand(global.wallet.name);
        
        switch (cmd.command) {
            case 'version':
                Console.Log(Util.info.version);
                break;
            case 'create':
                var result = Wallet.CreateWallet(cmd.arguments.name, cmd.arguments.password, cmd.arguments.entropy, cmd.arguments.type, cmd.flags.testnet, cmd.flags.nobackup, cmd.flags.noentropy);
                if (result.error) Console.Log(result.error);
                if (result.success) {
                    Console.Log(result.success);
                    Console.Log("Path: " + result.path);
                }
                break;
            case 'restore':
                var result = Wallet.RestoreWallet(cmd.arguments.name, cmd.arguments.password, cmd.arguments.type, cmd.flags.testnet);
                if (result.error) Console.Log(result.error);
                if (result.success) {
                    Console.Log(result.success);
                    Console.Log("Path: " + result.path);
                }
                break;
            case 'wallets':
                Wallet.ShowWallets();
                break;
            case 'open':
                var result = Wallet.OpenWallet(cmd.arguments.path || cmd.arguments.name, cmd.arguments.password);
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
                var result = Wallet.GenerateAddress(false, cmd.arguments.password, cmd.arguments.wif, cmd.arguments.type, cmd.flags.reveal, cmd.flags.random, cmd.flags.testnet);
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
                if(data.error) Console.Log(data.error);
                if(data.success) Console.Log("TXID: " + data.txid);
                break;
            case 'sweep':
                var data = await Wallet.Sweep(cmd.arguments.wif, cmd.arguments.data, cmd.flags.payload);
                if(data.error) Console.Log(data.error);
                if(data.success) Console.Log("TXID: " + data.txid);
                break;
            case 'vanity':
                var result = Wallet.Vanity(cmd.arguments.pattern, cmd.arguments.type, cmd.flags.testnet, cmd.flags.hide);
                if(result.error) Console.Log(result.error);
                if(result.success) {
                    Console.Log("Address: " + result.address);
                    Console.Log("WIF: " + result.WIF);
                }
                break;
            case 'clear': case 'cls':
                Console.Clear();
                Console.Logo();
                break;
            case 'free':
                Console.Log("Visit www.digifaucet.org to get free DigiByte!");
                break;
            case 'help':
                Wallet.Help();
                break;
            case 'exit':
                return;
            default:
                Console.Log("Unknown command!");
            case '':
        }
    }
})()