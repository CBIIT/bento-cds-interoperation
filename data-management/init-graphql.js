const { buildSchema } = require("graphql");
const { createHandler } = require("graphql-http/lib/use/express");
const {ManifestService} = require("../services/mainfest-service");
const {S3Service} = require("../services/s3-service");

const schema = buildSchema(
  require("fs").readFileSync("graphql/schema.graphql", "utf8")
);
const s3Service = new S3Service();
const manifestService = new ManifestService(s3Service.s3Client);

const root = {
  storeManifest: manifestService.uploadManifestToS3.bind(manifestService),
};

// Create the GraphQL handler
const graphqlHandler = createHandler({
  schema: schema,
  rootValue: root,
  context: { req },
});

module.exports = (req, res) => {
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle GraphQL requests
  try {
    graphqlHandler(req, res);
  } catch (error) {
    console.error('GraphQL handler error:', error);
    res.status(500).json({
      errors: [{
        message: 'Internal server error',
        extensions: {
          code: 'INTERNAL_SERVER_ERROR'
        }
      }]
    });
  }
};
