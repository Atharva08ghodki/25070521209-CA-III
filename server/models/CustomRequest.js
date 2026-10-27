const mongoose = require('mongoose');

const customRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  craft: { type: String, required: true, trim: true },
  details: { type: String, required: true, trim: true },
  budget: { type: String, default: 'Flexible' },
  status: { type: String, enum: ['New', 'Contacted', 'In progress', 'Completed'], default: 'New' }
}, { timestamps: true });

module.exports = mongoose.model('CustomRequest', customRequestSchema);
