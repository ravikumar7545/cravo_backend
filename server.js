const express = require('express');
const app = express();
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('./Schemas/User');
const Product = require('./Schemas/Product');
const Order = require('./Schemas/Order');
const Connection = require('./lib/Connection');
const { tokenGenerator, tokenVerifier } = require('./lib/TokenGenerator');
const Cart = require('./Schemas/Cart');
const Demo = require('./Schemas/demo');
const fetchCartByUsername = require('./lib/FetchCart');

app.use(cors());
app.use(express.json());
Connection();

// ? Register User
app.post('/api/register', async (req, res) => {
  try {
    const { fullName, username, password } = req.body;

    const isUser = await User.findOne({ username });
    if (isUser)
      return res.json({ success: false, message: 'User already exists' });

    const user = await User.create({ fullName, username, password });
    const isCreateCart = await Cart.create({ username, product: [] });
    const isCreateOrder = await Order.create({username,address:[], order_list:[]})
    const token = tokenGenerator({ username,fullName });

    res.json({
      success: true,
      message: 'User registered',
      token,
      cartProduct: isCreateCart,
    });
  } catch (err) {
    console.log(err);
  }
});

// ? Login user
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const isUser = await User.findOne({ username });
    if (!isUser) return res.json({ success: false, message: 'No user found' });

    const isMatch = await bcrypt.compare(password, isUser.password);
    if (!isMatch)
      return res.json({ success: false, message: 'Invalid username/password' });

    const token = tokenGenerator({ username, fullName: isUser.fullName });

    const cartProduct = await Cart.findOne({ username }).populate('product.id');

    res.json({
      success: true,
      message: 'Login successfull',
      token,
      cartProduct: cartProduct.product,
    });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: 'Error in logging' });
  }
});

// ? Return all products
app.get('/api/allProducts', async (req, res) => {
  try {
    const allProducts = await Product.find();
    return res.json({ success: true, allProducts });
  } catch (err) {
    console.log(err);
  }
});



// ? Add to cart by username
app.post('/api/addToCart', async (req, res, next) => {
  try {
    const { token, productId } = req.body;
    tokenVerifier(token, res, next);
    let id = new ObjectId(productId);

    const { username } = jwt.verify(token, process.env.SECRET_KEY);
    const isUser = await Cart.findOne({ username });

    const isProductExists = await Cart.findOne({
      'product.id': id,
    });
    if (isProductExists === null) {
      let isUpdated = await Cart.updateOne(
        { username },
        {
          $push: {
            product: { id: productId, quantity: 1 },
          },
        }
      );
      const cartProduct = await fetchCartByUsername(username);
      return res.json({ success: true, cartProduct });
    } else {
      let isUpdated = await Cart.updateOne(
        { username, 'product.id': id },
        {
          $inc: {
            'product.$.quantity': 1,
          },
        }
      );
      const cartProduct = await fetchCartByUsername(username);
      return res.json({ success: true, cartProduct });
    }
  } catch (err) {
    console.log(err);
    return res.json({ success: false, message: 'Error in adding to cart' });
  }
});

// ? Fetch cart by username
app.post('/api/fetchCartByUsername', async (req, res, next) => {
  try {
    const { token } = req.body;
    const { username } = await tokenVerifier(token, res, next);

    const cartProduct = await Cart.findOne({ username }).populate('product.id');

    res.json({ success: true, cartProduct: cartProduct.product });
  } catch (err) {
    res.json({ code: err.code, message: err.message });
  }
});


// ? Remove product from cart
app.post('/api/removeProduct', async (req, res, next) => {
  try {
    const { productId, token } = req.body;
    let id = new ObjectId(productId);

    const { username } = await tokenVerifier(token, res, next);

    const isUpdated = await Cart.updateOne(
      { username },
      {
        $pull: { product: { _id: id } },
      }
    );

    if (isUpdated.modifiedCount === 1) {
      const userCartproduct = await Cart.findOne({ username }).populate(
        'product.id'
      );
      res.json({
        success: true,
        message: 'Product removed from cart',
        userCartproduct,
      });
    } else {
      res.json({ success: false, message: 'Something went wrong' });
    }
  } catch (err) {
    console.log(err);
  }
});


// ? Increase or decrease quantity of product in cart
app.post('/api/quantityCounter',async(req,res)=>{
  try{
    const {token,productId,val} = req.body;
    const isVal = val==='inc'?1:-1;
    let id = new ObjectId(productId);
    const { username } = jwt.verify(token, process.env.SECRET_KEY);

    const quantityUpdate = await Cart.updateOne({ 
      username, 'product._id':id
    },{ 
      $inc :{ 'product.$.quantity':isVal}
    })
    const cartProduct = await Cart.findOne({ username }).populate('product.id');

    res.json({success:true,message:'Done',cartProduct})

  }catch(err){
    console.log(err.message)
    res.json({success:false,message:'Something went wrong'});
  }
})


// ? Saving details in database to place order
app.post('/api/place_order',async(req,res)=>{
  try{
    const {ordered_product_name,totalProductPrice,token,address} = req.body;
    const {username} = jwt.verify(token,process.env.SECRET_KEY);


    const createOrder =await Order.updateOne({username},{
        $push : {orders_list :{ordered_product_name,totalProductPrice}, address}
    })


    if(createOrder.acknowledged){
      res.json({success:true,message:'Ordered successful',});
    }else{
      res.json({success:false,message:'Something went wrong'});
    }
   
      
  }catch(err){
    res.json({message: 'Something went wrong'})
  }
})

app.listen(process.env.PORT, () => {
  console.log('Backend server started');
});
