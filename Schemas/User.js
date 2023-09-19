const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Cart = require('./Cart');

const user_schema = new mongoose.Schema({
  fullName: String,
  username: String,
  password: String,
  product_cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Cart,
  },
});

user_schema.pre('save', async function (password) {
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log(password);
  } catch (err) {
    console.log(err.message);
  }
});

const User = new mongoose.model('User', user_schema);

module.exports = User;
