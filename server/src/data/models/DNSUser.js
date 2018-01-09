const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const DNSUserSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    index: { unique: true },
  },
  password: {
    type: String,
    required: true,
  },
});

DNSUserSchema.pre('save', function (next) {
  // only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  return bcrypt.hash(this.password, 10)
    .then((hash) => {
      this.password = hash;
      return next();
    })
    .catch(e => next(e));
});

DNSUserSchema.methods.checkPassword = function (input) {
  return bcrypt.compare(input, this.password);
};

module.exports = mongoose.model('DNSUser', DNSUserSchema);
