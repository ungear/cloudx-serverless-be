'use strict';
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const {catalogBatchProcess} = require('./catalogBatchProcess');

module.exports.getProductsList = async (event) => {
  const productsData = await docClient.scan({
    TableName : process.env.PRODUCTS_DB_NAME
  })
    .promise();

  const stocksData = await docClient.scan({
    TableName : process.env.STOCKS_DB_NAME
  })
    .promise();

  const respData = productsData.Items.map(p => ({
    ...p,
    count: stocksData.Items.find(s => s.product_id === p.id).count
  }))
  return {
    statusCode: 200,
    headers: {
      "content-type":"application/json",
    },
    body: JSON.stringify(respData)
  };
};

module.exports.getProductsById = async (event) => {
  const productId = event.pathParameters.id;

  const productData = await docClient.get({
    TableName : process.env.PRODUCTS_DB_NAME,
    Key: {
      id: productId,
    },
  })
    .promise();

  const stockData = await docClient.get({
    TableName : process.env.STOCKS_DB_NAME,
    Key: {
      product_id: productId,
    },
  })
    .promise();

  const responseData = {
    ...productData.Item,
    count: stockData.Item.count
  }
  return {
    statusCode: 200,
    headers: {
      "content-type":"application/json",
    },
    body: JSON.stringify(responseData)
  };
};

module.exports.createProduct = async (event) => {
  const productBodyParams = JSON.parse(event.body);
  const productUuid = AWS.util.uuid.v4();

  const newProductParams = {
    TableName: process.env.PRODUCTS_DB_NAME,
    Item: {
      id: productUuid,
      price: productBodyParams.price.toString(),
      title: productBodyParams.title,
      description: productBodyParams.description,
    },
  };
  await docClient.put(newProductParams).promise();

  const newCountParams = {
    TableName: process.env.STOCKS_DB_NAME,
    Item: {
      product_id: productUuid,
      count: productBodyParams.count
    },
  };
  await docClient.put(newCountParams).promise();
  return {
    statusCode: 200
  };
};

module.exports.catalogBatchProcess = async (event) => {
  await catalogBatchProcess(event)
}
