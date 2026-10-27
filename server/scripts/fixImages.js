
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

async function fixImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const updates = [
      {
        name: 'Hand-Carved Wooden Bird',
        image: '/images/wooden-bird.jpg'
      },
      {
        name: 'Festive Brass Diya Pair',
        image: '/images/festive-diya.jpg'
      }
    ];

    for (const item of updates) {
      const result = await Product.updateOne(
        { name: item.name },
        { $set: { image: item.image } }
      );

      console.log(`${item.name}: ${result.matchedCount} product matched`);
    }
  } catch (error) {
    console.error('Image update failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

fixImages();
