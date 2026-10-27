require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const products = [
  { name: 'Warli Story Wall Art', description: 'Hand-painted tribal storytelling art inspired by Maharashtra.', price: 1899, category: 'Maharashtra', image: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=900&q=85', stock: 8, featured: true, artisan: 'Meera Chitrakar', region: 'Palghar, Maharashtra' },
  { name: 'Blue Pottery Keepsake Vase', description: 'A Jaipur-inspired blue pottery accent, shaped and finished by hand.', price: 1499, category: 'Rajasthan', image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=85', stock: 6, featured: true, artisan: 'The Kumbhar Studio', region: 'Jaipur, Rajasthan' },
  { name: 'Handwoven Kantha Cushion', description: 'A colourful, hand-stitched textile accent made from layered cotton.', price: 1199, category: 'Bengal', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85', stock: 10, featured: true, artisan: 'Sabitri Das', region: 'Shantiniketan, West Bengal' },
  { name: 'Terracotta Tea Light Set', description: 'Earthy clay diyas and candle holders for a warm, handmade glow.', price: 649, category: 'Home Decor', image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=85', stock: 14, featured: false, artisan: 'Mati Collective', region: 'Khurja, Uttar Pradesh' },
  { name: 'Kashmiri Papier-Mâché Box', description: 'A decorative keepsake box with delicate floral-inspired detailing.', price: 999, category: 'Kashmir', image: 'https://images.unsplash.com/photo-1577083288073-40892c0860a4?auto=format&fit=crop&w=900&q=85', stock: 5, featured: false, artisan: 'Aadil Handicrafts', region: 'Srinagar, Kashmir' },
  { name: 'Jute Everyday Tote', description: 'A reusable, hand-finished jute carryall for everyday errands.', price: 549, category: 'Accessories', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=85', stock: 20, featured: false, artisan: 'Sundarban Weaves', region: 'Kolkata, West Bengal' },
  { name: 'Hand-Carved Wooden Bird', description: 'A small decorative bird carved from wood by a traditional craftsperson.', price: 799, category: 'Woodcraft', image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=85', stock: 9, featured: false, artisan: 'Raghav Woodworks', region: 'Channapatna, Karnataka' },
  { name: 'Festive Brass Diya Pair', description: 'Classic brass diyas for puja corners, festive tables and gifting.', price: 1299, category: 'Festival Finds', image: 'https://images.unsplash.com/photo-1606293926075-69a00db2c6bb?auto=format&fit=crop&w=900&q=85', stock: 12, featured: true, artisan: 'Deepam Crafts', region: 'Moradabad, Uttar Pradesh' }
];
(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log(`Seeded ${products.length} KalaKart artisan products.`);
  } catch (e) { console.error(e.message); process.exitCode = 1; }
  finally { await mongoose.disconnect(); }
})();
