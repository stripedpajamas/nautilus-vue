const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  name: String,
  domain: String,
  defaultCreds: Boolean,
});

module.exports = mongoose.model('Client', ClientSchema);
