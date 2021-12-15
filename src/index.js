global.wallet = {}
global.wallet.path = __dirname;
global.wallet.name = null;
global.wallet.database = null;
global.wallet.xpub = null;

const Console = require('./packages/console');
const Wallet = require('./packages/wallet');

while(true) {
    var cmd = Console.ReadCommand(global.wallet.name);
    
    switch (cmd.command) {
        case 'createwallet':
            Wallet.CreateWallet(cmd.arguments.name, cmd.arguments.type, cmd.flags.testnet);
            break;
        case 'generateaddress':
            Wallet.GenerateAddress();
            break;
        default:
            console.log("Unknown command!");
    }
}