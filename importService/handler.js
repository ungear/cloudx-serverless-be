'use strict';
const {importProductsFile} = require('./importProductsFile');
const {importFileParser} = require("./importFileParser");

module.exports.importProductsFile = async (event) => {
  return importProductsFile(event);
};

module.exports.importFileParser = async (event) => {
  await importFileParser(event);
}
