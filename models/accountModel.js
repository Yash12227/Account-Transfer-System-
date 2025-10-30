const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  balance: { type: Number, required: true, min: 0 }
});

module.exports = mongoose.model('Account', accountSchema);
