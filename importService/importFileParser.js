const AWS = require('aws-sdk');
const csv = require('csv-parser')
const s3 = new AWS.S3();

module.exports.importFileParser = (event) => {
  const params = {
    Bucket: event.Records[0].s3.bucket.name,
    Key: event.Records[0].s3.object.key
  }
  const results = [];
  const s3Stream = s3.getObject(params).createReadStream();

  const resultPromise = new Promise((res, rej) => {
    try{
      s3Stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          console.log('Uploaded CSV content:');
          console.log(results);
          res();
        });
    } catch(err){
      console.log('Error while reading imported file');
      console.error(err);
      rej(err);
    }
  })
  return resultPromise;
}
