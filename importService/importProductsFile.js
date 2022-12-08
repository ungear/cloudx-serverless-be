const AWS = require('aws-sdk');
const s3 = new AWS.S3();

module.exports.importProductsFile = async (event) => {
  const fileName = event.queryStringParameters.name || 'defaultFileName';
  const key = `uploaded/${fileName}`;
  const params = {
    Bucket: process.env.IMPORT_BUCKET_NAME,
    Key: key,
    ContentType: 'text/csv',
  };
  const link = await s3.getSignedUrlPromise('putObject', params);
  return {
    statusCode: 200,
    body: link
  };
}
