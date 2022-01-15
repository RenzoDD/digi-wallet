const crypto = require('crypto');
const fs = require('fs');

const axios = require('axios');
axios.defaults.validateStatus = function () {
    return true;
};

class Util {
    static info = require('../../package.json');
    static SHA256(data) {
        return crypto.createHash('sha256').update(data).digest();
    }
    static RandomBuffer() {
        return crypto.randomBytes(32);
    }
    static EncryptAES256(data, password) {
        var data = Buffer.from(data);
        var password = this.SHA256(Buffer.from(password));
        var cipher = crypto.createCipheriv("aes-256-cbc", password, Buffer.alloc(16));
        var encryptedData = cipher.update(data, "utf-8", "hex") + cipher.final("hex");
        return Buffer.from(encryptedData, 'hex');
    }
    static DecryptAES256(data, password) {
        var data = Buffer.from(data);
        var password = this.SHA256(Buffer.from(password));
        var decipher = crypto.createDecipheriv("aes-256-cbc", password, Buffer.alloc(16));
        const decryptedData = decipher.update(data, "hex", "utf-8") + decipher.final("utf8");

        return decryptedData;
    }
    static FileExist(path) {
        return fs.existsSync(path);
    }
    static async FetchData(url, postData) {
        try {
            if (!postData)
                var data = await axios.get(url);
            else
                var data = await axios.post(url, postData);

            if (typeof data.data == 'object')
                return data.data;
            
            if (data.data == "")
                return {};
            
            return { error: 'Server unknown response' };
        } catch {
            return { error: 'Server unavailable!' };
        }
    }
    static GetFiles() {
        return fs.readdirSync(process.cwd()).filter(f => f.endsWith('.dgb') || f.endsWith('.dgbt'));
    }
}
module.exports = Util;