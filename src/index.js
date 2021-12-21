(async function() {
    global.wallet = {}
    global.wallet.path = process.cwd();
    global.wallet.name = null;
    global.wallet.database = null;
    global.wallet.xpub = null;

    const Console = require('./packages/console');
    const Wallet = require('./packages/wallet');

    Wallet.Logo();
    while(true) {
        var cmd = Console.ReadCommand(global.wallet.name);
        
        switch (cmd.command) {
            case 'createwallet':
                var path = Wallet.CreateWallet(cmd.arguments.name, cmd.arguments.password, cmd.arguments.entropy, cmd.arguments.type, cmd.flags.testnet, cmd.flags.nobackup, cmd.flags.noentropy);
                Console.Log("Wallet created! - " + path);
                break;
            case 'openwallet':
                Wallet.OpenWallet(cmd.arguments.path, cmd.arguments.password);
                Console.Log("Wallet opened!");
                break;
            case 'balance':
                var balance = await Wallet.Sync();
                if(balance) Console.Log("Confirmed balance: " + balance.confirmed);
                if(balance) Console.Log("Unconfirmed balance: " + balance.unconfirmed);
                break;
            case 'closewallet':
                Wallet.CloseWallet();
                Console.Log("Wallet closed!");
                break;
            case 'generateaddress':
                var pair = Wallet.GenerateAddress(cmd.arguments.label, cmd.arguments.WIF, cmd.arguments.password, cmd.arguments.type, cmd.flags.reveal, cmd.flags.nolabel, cmd.flags.random);
                if (pair.address) Console.Log("Address: " + pair.address);
                if (pair.WIF) Console.Log("WIF: " + pair.WIF);
                break;
            case 'xpub':
                var xpub = Wallet.xpub();
                if(xpub) Console.Log(xpub);
                break;
            case 'send':
                var data = await Wallet.Send(cmd.arguments.address, cmd.arguments.value, cmd.arguments.data, cmd.flags.payload);
                if(data.error) Console.Log("Error: " + data.error);
                else Console.Log("TXID: " + data.result);
                break;
            case 'clear': case 'cls':
                Console.Clear();
                Wallet.Logo();
                break;
            case 'exit':
                return;
            default:
                Console.Log("Unknown command!");
            case '':
        }
    }
})()