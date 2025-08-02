const express = require('express');
const { buildSchema } = require("graphql");
const { createHandler } = require("graphql-http/lib/use/express");
const {ManifestService} = require("../services/mainfest-service");
const {S3Service} = require("../services/s3-service");
const {logger} = require("../logger");

const router = express.Router();

// Build GraphQL schema
const schema = buildSchema(
  require("fs").readFileSync("graphql/schema.graphql", "utf8")
);

// Initialize services
const s3Service = new S3Service();
const manifestService = new ManifestService(s3Service.s3Client);

// GraphQL root resolvers
const root = {
  storeManifest: async (args) => {
    try {
      logger.debug(`GraphQL storeManifest called with manifest: ${args.manifest ? 'present' : 'missing'}, type: ${args.type || 'not provided'}`);
      return await manifestService.uploadManifestToS3(args.manifest, args.type);
    } catch (error) {
      logger.error('Error in storeManifest resolver:', error);
      throw new Error(`Failed to store manifest: ${error.message}`);
    }
  },
};

// Create GraphQL handler
const graphqlHandler = createHandler({
  schema: schema,
  rootValue: root,
  context: ({ req }) => ({ req }),
  formatError: (error) => {
    logger.error('GraphQL error:', error);
    return {
      message: error.message,
      locations: error.locations,
      path: error.path,
      extensions: error.extensions
    };
  }
});

// Handle preflight OPTIONS requests
router.options('/', (req, res) => {
  res.status(200).end();
});

// Handle GraphQL requests
router.all('/', (req, res) => {
  try {
    logger.debug(`GraphQL request received: ${req.method} ${req.url}`);
    graphqlHandler(req, res);
  } catch (error) {
    logger.error('GraphQL handler error:', error);
    res.status(500).json({
      errors: [{
        message: 'Internal server error',
        extensions: {
          code: 'INTERNAL_SERVER_ERROR'
        }
      }]
    });
  }
});

module.exports = router; 