const dotenv = require("dotenv");
dotenv.config();

let required_config = {
    VERSION: process.env.VERSION || "x.x.x",
    DATE: process.env.DATE || "xxxx-xx-xx",
    AWS_REGION: process.env.AWS_REGION,
    FILE_MANIFEST_BUCKET_NAME: process.env.FILE_MANIFEST_BUCKET_NAME,
    CLOUDFRONT_KEY_PAIR_ID: process.env.CLOUDFRONT_KEY_PAIR_ID,
    CLOUDFRONT_PRIVATE_KEY: process.env.CLOUDFRONT_PRIVATE_KEY,
    CLOUDFRONT_DOMAIN: process.env.CLOUDFRONT_DOMAIN,
    SIGNED_URL_EXPIRY_SECONDS: process.env.SIGNED_URL_EXPIRY_SECONDS || 600,
    LOG_LEVEL: process.env.LOG_LEVEL || "info",
    PORT: validatePort(process.env.PORT) || "4030",
    DEV_MODE: process.env.NODE_ENV === "development"
};
const dev_config = {
    S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
}
const config = required_config.DEV_MODE ? {...required_config, ...dev_config} : required_config;

function validatePort(port){
    return isNaN(port) || Number(port) < 0 ? null : port;
}

function checkRequiredVariablesAreSet(config) {
    let unsetVariables = []
    for (const [key, val] of Object.entries(config)) {
        if (val == null || (typeof val === "string" && val.trim().length === 0)) {
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
