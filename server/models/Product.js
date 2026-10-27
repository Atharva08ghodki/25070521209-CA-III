const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, trim: true },
  image: { type: String, default: '' },
  stock: { type: Number, default: 10, min: 0 },
  featured: { type: Boolean, default: false },
  artisan: { type: String, default: 'KalaKart Artisan' },
  region: { type: String, default: 'India' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
