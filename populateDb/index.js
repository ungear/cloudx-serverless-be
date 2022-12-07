const { DynamoDBClient, BatchWriteItemCommand } = require( "@aws-sdk/client-dynamodb");
const ProductsSource = require("../productService/products.json");

(async () => {
  const client = new DynamoDBClient({ region: "eu-west-1" });
  const batchCreateParams = {RequestItems: {}};
  batchCreateParams.RequestItems.cloudX_products = ProductsSource.map(x => ({
    PutRequest: {
      Item: {
        id: { S: x.id },
        description: { S: x.description },
        price: { N: x.price.toString() },
        title: { S: x.title },
      },
    },
  }));

  batchCreateParams.RequestItems.cloudX_stocks = ProductsSource.map(x => ({
    PutRequest: {
      Item: {
        product_id: { S: x.id },
        count: { N: x.count.toString() },
      },
    },
  }))

  const command = new BatchWriteItemCommand(batchCreateParams);

  try {
    const results = await client.send(command);
    console.log("Success, items inserted", results);
    return results;
  } catch (err) {
    console.error(err);
  }
})();
