const express = require("express");
const graphql = require("./data-management/init-graphql");
const healthCheckRouter = require("./routes/healthCheckRouter");
const {logger} = require("./logger");
const config = require("./config");

let devDomainWhitelist = [
    "localhost"
];
let deployedDomainWhitelist = [
    "caninecommons-dev.cancer.gov",
    "caninecommons-qa.cancer.gov",
    "caninecommons.cancer.gov",
    "dataservice-dev.datacommons.cancer.gov",
    "dataservice-dev2.datacommons.cancer.gov",
    "dataservice-qa.datacommons.cancer.gov",
    "dataservice-qa2.datacommons.cancer.gov",
    "dataservice-stage.datacommons.cancer.gov",
    "dataservice.datacommons.cancer.gov",
];
const domainWhitelist = config.DEV_MODE ? devDomainWhitelist+deployedDomainWhitelist : deployedDomainWhitelist;


const app = express();
app.use(express.json());

app.use("/api/interoperation", healthCheckRouter);

// Check if request is from a whitelisted domain
app.use((req, res, next) => {
    const domainName = req.hostname;
    logger.debug(`Request domain=${domainName}`);
    logger.debug(`Domain Whitelist=${domainWhitelist}`);
    if (!domainWhitelist.includes(domainName)){
        logger.warn(`Request from ${domainName} has been blocked`)
        res.status(403).send(`Requests to this service are not allowed from your domain (${domainName}). Please contact the systems admins to request that your domain be authorized to access this API.`);
    }
    logger.debug("Request allowed");
    next();
});
app.use("/api/interoperation/graphql", graphql);

app.use((req, res) => {
    logger.warn(`Request sent to an invalid endpoint (${req.baseUrl}) from ${req.hostname}`)
    res.status(404).send("Invalid endpoint");
});

app.use((err, req, res, next)=> {
    const message = 'An error occurred, please see the logs for more information';
    logger.error(message);
    logger.error(err.stack);
    res.status(500).send(message);
})

module.exports = app;
