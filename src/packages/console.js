const reader = require('readline-sync');

class Console {
    static Logo() {
        console.log("\x1b[34m", " _____   _       _ ______                  ");
        console.log("\x1b[34m", "(____ \\ (_)     (_|____  \\       _         ");
        console.log("\x1b[34m", " _   \\ \\ _  ____ _ ____)  )_   _| |_  ____ ");
        console.log("\x1b[34m", "| |   | | |/ _  | |  __  (| | | |  _)/ _  )");
        console.log("\x1b[34m", "| |__/ /| ( ( | | | |__)  ) |_| | |_( (/ / ");
        console.log("\x1b[34m", "|_____/ |_|\\_|| |_|______/ \\__  |\\___)____)");
        console.log("\x1b[34m", "          (_____|         (____/           ");
        console.log("\x1b[36m", "             By Renzo Diaz & DigiFaucet.org");
        console.log("\x1b[37m");
    }
    static Prompt() {
        var cmd = !global.wallet.storage ? "digi-wallet" : global.wallet.storage.name + " (" + global.wallet.storage.network.split("-")[0] + ")";
        return cmd;
    }
    static ReadCommand() {
        var cmd = Console.Prompt();

        var obj = {
            command: "",
            arguments: {},
            flags: {}
        };
    
        var data = reader.question(cmd + " > ");
        var words = data.split(' ').filter(x => x != "");
    
        obj.command = (words[0] || "").toLowerCase() || "";
    
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
        var cmd = Console.Prompt();
        
        var data = reader.question(cmd + " > " + text + ": ");
        return data;
    }
    static ReadPassword(text) {
        var cmd = Console.Prompt();
        var data = reader.question(cmd + " > " + text + ": ", { hideEchoBack: true });
        return data;
    }
    static Log(text) {
        var cmd = Console.Prompt();
        console.log(cmd + " > " + text);
    }
    static Clear() {
        console.clear();
    }
    static Pause() {
        var cmd = !global.wallet.storage ? "digi-wallet" : global.wallet.storage.name + " (" + global.wallet.storage.network + ")";
        reader.keyIn(cmd + " > Press any key to continue...");
    }
}


module.exports = Console;