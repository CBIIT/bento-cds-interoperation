const dotenv = require("dotenv");
dotenv.config();

const config = {
    VERSION: process.env.VERSION || "x.x.x",
    DATE: process.env.DATE || "xxxx-xx-xx",
    AWS_REGION: process.env.AWS_REGION,
    S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
    FILE_MANIFEST_BUCKET_NAME: process.env.FILE_MANIFEST_BUCKET_NAME,
    CLOUDFRONT_KEY_PAIR_ID: process.env.CLOUDFRONT_KEY_PAIR_ID,
    CLOUDFRONT_PRIVATE_KEY: process.env.CLOUDFRONT_PRIVATE_KEY,
    CLOUDFRONT_DOMAIN: process.env.CLOUDFRONT_DOMAIN,
    SIGNED_URL_EXPIRY_SECONDS: process.env.SIGNED_URL_EXPIRY_SECONDS,
};

function checkRequiredVariablesAreSet(config) {
    let unsetVariables = []
    for (const [key, val] of Object.entries(config)) {
        if (val == null || val.trim() === "") {
            unsetVariables.push(key);
        }
    }
    if (unsetVariables.length > 0) {
        console.error(`The following required environment variables are not set: ${unsetVariables.join(", ")}`);
        process.exit();
    }
}

checkRequiredVariablesAreSet(config);
module.exports = config;
