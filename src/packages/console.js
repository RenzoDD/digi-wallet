const reader = require('readline-sync');

class Console
{
    static ReadCommand() {
        var cmd = !global.wallet.name ? "digibyte-wallet" : global.wallet.name;
    
        var obj = {
            command: "",
            arguments: {},
            flags: {}
        };
    
        var data = reader.question(cmd + " > ");
        var words = data.split(' ').filter(x => x != "");
    
        obj.command = words[0];
    
        for (var i = 1; i < words.length; i++) {
            var word = words[i];
            if (word[0] == '-') {
                if (word[1] != '-') // Argument
                    obj.arguments[word.substring(1)] = words[i + 1];
                else // Flag
                    obj.flags[word.substring(2)] = true;
                
            }
        }
    
    
        return obj;
    }
    static ReadLine(text) {
        var cmd = !global.wallet.name ? "digibyte-wallet" : global.wallet.name;
        var data = reader.question(cmd + " > " + text + ": ");
        return data;
    }
    static ReadPassword(text) {
        var cmd = !global.wallet.name ? "digibyte-wallet" : global.wallet.name;
        var data = reader.question(cmd + " > " + text + ": ", { hideEchoBack: true });
        return data;
    }
}


module.exports = Console;