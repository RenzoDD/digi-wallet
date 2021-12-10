const reader = require('readline-sync');

function ReadLine() {
    var obj = {
        command: "",
        arguments: {},
        flags: []
    };

    var data = reader.question();
    var words = data.split(' ').filter(x => x != "");

    obj.command = words[0];

    for (var i = 1; i < words.length; i++) {
        var word = words[i];
        if (word[0] == '-') {
            if (word[1] != '-') // Argument
                obj.arguments[word.substring(1)] = words[i + 1];
            else // Flag
                obj.flags.push(word.substring(2));
            
        }
    }


    return obj;
}

module.exports = ReadLine;