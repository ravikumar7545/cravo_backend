const jwt = require('jsonwebtoken');

const tokenGenerator = (data) => {
  try {
    const token = jwt.sign(data, process.env.SECRET_KEY);
    return token;
  } catch (err) {
    console.log(err);
  }
};

const tokenVerifier = async (data, res, next) => {
  try {
    const isValid = jwt.verify(data, process.env.SECRET_KEY);
    if(isValid==='invalid signature'){
      return res.json({success: false,message:'Invalid user'})
    }else{
      return isValid;
    }
  } catch (err) {
    console.log(err.message);
    return res.json({ success: false, message: 'Invalid user' });
  }
};

module.exports = { tokenGenerator, tokenVerifier };
