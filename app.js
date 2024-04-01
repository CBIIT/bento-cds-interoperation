const express = require("express");
const graphql = require("./data-management/init-graphql");
const healthCheckRouter = require("./routes/healthCheckRouter");


const domainWhitelist = [
    "localhost",
    "https://caninecommons-dev.cancer.gov",
    "https://caninecommons-qa.cancer.gov",
    "https://caninecommons.cancer.gov"
];

const app = express();
app.use(express.json());

// Check if request is from a whitelisted domain
app.use((req, res, next) => {
    const domainName = req.hostname;
    if (!domainWhitelist.includes(domainName)){
        console.warn(`Request from ${domainName} has been blocked`)
        res.status(403).send(`Requests to this service are not allowed from your domain (${domainName}). Please contact the systems admins to request that your domain be authorized to access this API.`);
    }
    next();
});

app.use("/api/interoperation", healthCheckRouter);
app.use("/api/interoperation/graphql", graphql);

app.use((req, res) => {
   res.status(404).send("Invalid endpoint");
});

app.use((err, req, res, next)=> {
    const message = 'An error occurred, please see logs for more information';
    console.error(message);
    console.error(err.stack);
    res.status(500).send(message);
})

module.exports = app;
