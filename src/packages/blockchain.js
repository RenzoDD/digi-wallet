const { Address, Script } = require('digibyte-js');
const Util = require('./util');

class BlockChain {
    static async utxos(xpub, network) {
        var server = network.startsWith('livenet') ? 'digibyteblockexplorer.com' : 'testnetexplorer.digibyteservers.io';
        var data = await Util.FetchData('https://' + server + '/api/v2/utxo/' + xpub + '?details=tokenBalances&confirmed=true');

        data = data.reverse();

        var utxos = [];
        for (var i = 0; i < data.length; i++) {
            var utxo = {
                txid: data[i].txid,
                vout: data[i].vout,
                satoshis: parseInt(data[i].value),
                height: data[i].height || 0,
                path: data[i].path,
                script: data[i].scriptPubKey,
                address: data[i].address
            };

            if (!utxo.script) {
                var address = Address.fromString(utxo.address);
                var script = Script.fromAddress(address);
                    
                utxo.script = script.toHex();
            }

            utxos.push(utxo);
        }
        return utxos;
    }
    static async xpub(xpub, network)
    {
        var server = network.startsWith('livenet') ? 'digibyteblockexplorer.com' : 'testnetexplorer.digibyteservers.io';
        var data = await Util.FetchData('https://' + server + '/api/xpub/' + xpub);

        if (data.transactions)
            data.transactions = data.transactions.reverse();
            
        return {
            confirmed: data.balance,
            unconfirmed: data.unconfirmedBalance,
            apperances: data.txApperances,
            transactions: data.transactions
        };
    }
    static async tx(network, txid) {
        var server = network.startsWith('livenet') ? 'digibyteblockexplorer.com' : 'testnetexplorer.digibyteservers.io';
        var data = await Util.FetchData('https://' + server + '/api/tx/' + txid);
        
        return data;
    }
    static async address(network, address) {
        var server = network.startsWith('livenet') ? 'digibyteblockexplorer.com' : 'testnetexplorer.digibyteservers.io';
        var data = await Util.FetchData('https://' + server + '/api/address/' + address);
        
        return data;
    }
    static async api(network) {
        var server = network.startsWith('livenet') ? 'digibyteblockexplorer.com' : 'testnetexplorer.digibyteservers.io';
        var data = await Util.FetchData('https://' + server + '/api');
        data.server = server;
        return data;
    }
}
module.exports = BlockChain;