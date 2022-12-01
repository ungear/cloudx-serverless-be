'use strict';

const products = require("./products.json");

module.exports.getProductsList = async (event) => {
  return {
    statusCode: 200,
    headers: {
      "content-type":"application/json",
    },
    body: JSON.stringify(products)
  };
};

module.exports.getProductsById = async (event) => {
  const productId = event.pathParameters.id;
  const product = products.find(x => x.id.toString() === productId.toString());
  return {
    statusCode: 200,
    headers: {
      "content-type":"application/json",
    },
    body: JSON.stringify(product)
  };
};
