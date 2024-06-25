const {S3Client} = require("@aws-sdk/client-s3");
const config = require("../config");

class S3Service{
    constructor() {
        let s3Config = {
            region: config.AWS_REGION,
        };
        if (config.S3_ACCESS_KEY_ID && config.S3_SECRET_ACCESS_KEY){
            config["credentials"] = {
                accessKeyId: config.S3_ACCESS_KEY_ID,
                secretAccessKey: config.S3_SECRET_ACCESS_KEY,
            }
        }
        this.s3Client = new S3Client(s3Config);
    }
}

module.exports = {
    S3Service
};