const AWS = require('aws-sdk');
const csv = require('csv-parser')
const s3 = new AWS.S3();
const sqs = new AWS.SQS();

module.exports.importFileParser = async (event) => {
  const s3Params = {
    Bucket: event.Records[0].s3.bucket.name,
    Key: event.Records[0].s3.object.key
  }

  const s3Object = s3.getObject(s3Params);
  const s3Stream = s3Object.createReadStream();
  const fileData = await readCvs(s3Stream);

  const sqsParams = {
    Entries: fileData.map((product, index) => ({
      Id: index.toString(),
      MessageBody: JSON.stringify(product),
    })),
    QueueUrl: process.env.SQS_URL,
  }

  try {
    await sqs.sendMessageBatch(sqsParams).promise();
  }catch(err){
    console.log('>>> SQS ERROR', err)
  }
}

async function readCvs(stream){
  const resultPromise = new Promise((resolve, reject) => {
    const streamData = [];
    stream
      .pipe(csv())
      .on('data', (data) => streamData.push(data))
      .on('end', () => {
        resolve(streamData)
      })
  });
  return resultPromise;
}
