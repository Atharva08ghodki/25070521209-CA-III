const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your full name.'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long.']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email address.'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address.']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password.'],
    minlength: [6, 'Password must be at least 6 characters long.']
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  role: {
    type: String,
    enum: ['customer', 'artisan', 'admin'],
    default: 'customer'
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

userSchema.methods.toSafeObject = function() {
  return {
    id: this._id,
    _id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    address: this.address,
    role: this.role,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model('User', userSchema);

