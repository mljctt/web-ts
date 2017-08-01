module.exports = `import * as crypto from 'crypto';

let security = {
    generateSha256String: function (str: string): string {
        let sha256 = crypto.createHash('sha256');
        return sha256.update(str, 'utf8').digest('hex');
    },
    generateMd5String: function (str: string): string {
        let md5 = crypto.createHash('md5');
        return md5.update(str).digest('hex');
    }
};
  
export = security;
`