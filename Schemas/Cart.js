const mongoose = require('mongoose');
const Product = require('./Product');

const cart_schema = new mongoose.Schema({
  username: String,
  product: [
    {
      id: { type: mongoose.Schema.Types.ObjectId, ref: Product },
      quantity: Number,
    },
  ],
});

const Cart = new mongoose.model('Cart', cart_schema);

module.exports = Cart;
