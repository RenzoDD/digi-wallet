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
                script: data[i].scriptPubKey
            };

            if (!utxo.script) {
                var address = Address.fromString(utxo.address);
                var script = Script.buildPublicKeyHashOut(address);
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

        return {
            confirmed: data.balance,
            unconfirmed: data.unconfirmedBalance,
            apperances: data.txApperances,
            transactions: data.transactions
        };
    }
}
module.exports = BlockChain;