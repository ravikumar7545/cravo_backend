const mongoose = require('mongoose');

const product_schema = new mongoose.Schema({
  name: String,
  price: Number,
  review: Number,
  category: String,
});

const Product = mongoose.model('Product', product_schema);

module.exports = Product;
