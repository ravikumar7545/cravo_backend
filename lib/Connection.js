const mongoose = require('mongoose');

const Connection = async () => {
  try {
    const isConnected = await mongoose.connect(process.env.MONGO_URL);
    if (isConnected.connection.readyState === 1) {
      console.log('Connected to Database');
    } else {
      console.log('Waiting for connection to Database');
    }
  } catch (err) {
    console.log(err.message);
  }
};
module.exports = Connection;
