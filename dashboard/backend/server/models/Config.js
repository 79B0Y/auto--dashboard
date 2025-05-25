const mongoose = require('mongoose');
module.exports = mongoose.model('DashboardConfig', new mongoose.Schema({
  userId: String,
  config: mongoose.Schema.Types.Mixed,
  versions: [{
    savedAt: { type: Date, default: Date.now },
    config: mongoose.Schema.Types.Mixed
  }]
}, { timestamps: true }));
