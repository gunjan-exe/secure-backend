const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  isLoggedIn: {
  type: Boolean,
  default: false,
},
  verificationToken: { 
	type: String, 
	required: function () {
    	return this.isNew;
  	} 
  },
  activeToken: String,
  resetToken: String,
  resetTokenExpiry: Date
});

module.exports = mongoose.model('User', userSchema);
