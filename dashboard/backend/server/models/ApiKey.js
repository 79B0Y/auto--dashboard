const mongoose = require('mongoose');
module.exports = mongoose.model('ApiKey', new mongoose.Schema({
  apiKey: String,
  userId: String,
  status: { type: String, default: 'active' }
}));
