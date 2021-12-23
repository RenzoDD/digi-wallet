const fs = require('fs');

class Storage {
    static Open(name) {
        var data = fs.readFileSync(name).toString();
        data = JSON.parse(data);
        for (const property in data)
            if (data[property].type == 'Buffer')
                data[property] = Buffer.from(data[property].data);
        return data;
    }
    static Save(name, data = {}) {
        data = JSON.stringify(data);
        fs.writeFileSync(name, data);
    }
}

module.exports = Storage;