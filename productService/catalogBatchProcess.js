const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();

module.exports.catalogBatchProcess = async function(event){
  const products = event.Records.map(x => JSON.parse(x.body));

  for(const product of products) {
    const productUuid = AWS.util.uuid.v4();
    const newProductParams = {
      TableName: process.env.PRODUCTS_DB_NAME,
      Item: {
        id: productUuid,
        price: product.price.toString(),
        title: product.title,
        description: product.description,
      },
    };
    await docClient.put(newProductParams).promise();

    const newCountParams = {
      TableName: process.env.STOCKS_DB_NAME,
      Item: {
        product_id: productUuid,
        count: product.count
      },
    };
    await docClient.put(newCountParams).promise();
  }

  try{
    await sns.publish({
      Subject: 'CloudX Products Created',
      Message: JSON.stringify(products),
      TopicArn: process.env.SNS_ARN
    }).promise()
  } catch(error){ console.log('SNS ERROR', error)}

}
