const {logger} = require("../logger");
const {ERROR} = require("../constants/error-constants");
const converter = require("json-2-csv");
const {randomUUID} = require("crypto");
const path = require("path");
const os = require("os");
const {promises: fs} = require("fs");
const config = require("../config");
const {PutObjectCommand} = require("@aws-sdk/client-s3");
const {getSignedUrl} = require("@aws-sdk/cloudfront-signer");


class ManifestService{

    constructor(s3Client) {
        this.s3Client = s3Client;
    }

    async uploadManifestToS3(parameters) {
        let tempCsvFileName;
        let tempCsvFilePath;
        try {
            // validate input JSON data
            const manifestJSON = JSON.parse(parameters?.manifest);
            if (!manifestJSON || !Array.isArray(manifestJSON)) {
                throw new Error(ERROR.MALFORMED_FILE_MANIFEST);
            }
            const manifestCSV = await converter.json2csv(manifestJSON);
            tempCsvFileName = `${randomUUID()}.csv`;
            tempCsvFilePath = path.join(os.tmpdir(), tempCsvFileName);
            await fs.writeFile(tempCsvFilePath, manifestCSV, {
                encoding: "utf-8",
            });
        }
        catch (error) {
            const message = "An error occurred while parsing the manifest data";
            logger.error(message);
            logger.debug(error);
            throw new Error(message);
        }
        try {
            const uploadParams = {
                Bucket: config.FILE_MANIFEST_BUCKET_NAME,
                Key: tempCsvFileName,
                Body: await fs.readFile(tempCsvFilePath, {encoding: "utf-8"}),
            };
            const uploadCommand = new PutObjectCommand(uploadParams);
            await this.s3Client.send(uploadCommand);
        }
        catch (error) {
            const message = "An error occurred while uploading the manifest to the S3 bucket";
            logger.error(message);
            logger.debug(error);
            throw new Error(message);
        }
        try {
            return getSignedUrl({
                keyPairId: config.CLOUDFRONT_KEY_PAIR_ID,
                privateKey: config.CLOUDFRONT_PRIVATE_KEY,
                url: `${config.CLOUDFRONT_DOMAIN}/${tempCsvFileName}`,
                dateLessThan: new Date(
                    Date.now() + (1000 * config.SIGNED_URL_EXPIRY_SECONDS)
                ),
            });
        }
        catch (error) {
            const message = "An error occurred while requesting the signed URL for the manifest";
            logger.error(message);
            logger.debug(error);
            throw new Error(message);
        }
    }

}

module.exports = {
    ManifestService
};