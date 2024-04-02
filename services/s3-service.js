const {S3Client} = require("@aws-sdk/client-s3");
const config = require("../config");

class S3Service{
    constructor() {
        this.s3Client = new S3Client({
            region: config.AWS_REGION,
            credentials: {
                accessKeyId: config.S3_ACCESS_KEY_ID,
                secretAccessKey: config.S3_SECRET_ACCESS_KEY,
            },
        });
    }
}