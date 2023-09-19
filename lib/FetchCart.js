const Cart = require('../Schemas/Cart');

async function fetchCartByUsername(username) {

    const cartProduct = await Cart.findOne({ username }).populate('product.id');
    return cartProduct.product;
}


module.exports = fetchCartByUsername;