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

module.exports = (req, res) => {
  createHandler({
    schema: schema,
    rootValue: root,
    context: { req },
  })(req, res);
};
