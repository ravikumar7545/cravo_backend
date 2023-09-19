const mongoose = require('mongoose');

const order_schema = new mongoose.Schema({
    username: String,
    address: [],
    orders_list:[]
});

const Order = new mongoose.model('Order', order_schema);

module.exports = Order;