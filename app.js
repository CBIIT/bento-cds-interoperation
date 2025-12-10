const express = require("express");
const cors = require("cors");
const graphqlRouter = require("./routes/graphqlRouter");
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
    "ccdi-sandbox.cancer.gov",
    "ccdi-dev.cancer.gov",
    "ccdi-qa.cancer.gov",
    "ccdi-stage.cancer.gov",
    "ccdi.cancer.gov",
    "clinicalcommons-dev.ccdi.cancer.gov",
    "clinicalcommons-qa.ccdi.cancer.gov",
    "clinicalcommons-stage.ccdi.cancer.gov",
    "clinicalcommons.ccdi.cancer.gov",
    "general-dev.datacommons.cancer.gov",
    "general-dev2.datacommons.cancer.gov",
    "general-qa.datacommons.cancer.gov",
    "general-qa2.datacommons.cancer.gov",
    "general-stage.datacommons.cancer.gov",
    "general.datacommons.cancer.gov",
];
const domainWhitelist = config.DEV_MODE ? devDomainWhitelist+deployedDomainWhitelist : devDomainWhitelist+deployedDomainWhitelist;

const app = express();

// CORS configuration for GraphQL endpoint
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const domainName = origin.replace(/^https?:\/\//, '').replace(/:\d+$/, '');
    logger.debug(`CORS check for origin=${origin}, domain=${domainName}`);
    if (domainWhitelist.includes(domainName)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from ${origin}`);
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

// Apply CORS middleware before other middleware
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({limit: "1gb"}));

// Health check route
app.use("/api/interoperation", healthCheckRouter);

// Domain whitelist check middleware (for non-GraphQL routes)
app.use((req, res, next) => {
    // Skip domain check for GraphQL endpoint as it's handled by CORS
    if (req.path === '/api/interoperation/graphql') {
        return next();
    }
    
    const domainName = req.hostname;
    logger.debug(`Request domain=${domainName}`);
    logger.debug(`Domain Whitelist=${domainWhitelist}`);
    if (!domainWhitelist.includes(domainName)){
        logger.warn(`Request from ${domainName} has been blocked`)
        res.status(403).send(`Requests to this service are not allowed from your domain (${domainName}). Please contact the systems admins to request that your domain be authorized to access this API.`);
        return;
    }
    logger.debug("Request allowed");
    
    next();
});

// GraphQL endpoint with proper CORS handling
app.use("/api/interoperation/graphql", graphqlRouter);

// 404 handler
app.use((req, res) => {
    logger.warn(`Request sent to an invalid endpoint (${req.baseUrl}) from ${req.hostname}`)
    res.status(404).send("Invalid endpoint");
});

// Error handler
app.use((err, req, res, next)=> {
    const message = 'An error occurred, please see the logs for more information';
    logger.error(message);
    logger.error(err.stack);
    res.status(500).send(message);
})

module.exports = app;
