const crypto = require('crypto');
const request = require('sync-request');
const fs = require('fs');

class Util {
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
    static FetchData(url) {
        return JSON.parse(request('GET', url).getBody('utf-8'));
    }
}
module.exports = Util;