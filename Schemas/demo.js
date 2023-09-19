const mongoose = require('mongoose');

const demo_schema = new mongoose.Schema({
  usernames: String,
  details: [
    {
      id: String,
    },
  ],
});

const Demo = new mongoose.model('Demo', demo_schema);

module.exports = Demo;
