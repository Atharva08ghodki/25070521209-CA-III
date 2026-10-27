const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { customer, items } = req.body;
    if (!customer?.name?.trim() || !customer?.email?.trim() || !customer?.address?.trim()) {
      return res.status(400).json({ message: 'Name, email and delivery address are required.' });
    }
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'Your cart is empty.' });

    const cleanItems = [];
    let total = 0;
    for (const item of items) {
      if (!mongoose.isValidObjectId(item.productId)) return res.status(400).json({ message: 'Invalid product in cart.' });
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) return res.status(400).json({ message: 'Invalid item quantity.' });
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ message: 'A product in your cart no longer exists.' });
      if (product.stock < quantity) return res.status(409).json({ message: `Only ${product.stock} left for ${product.name}.` });
      cleanItems.push({ product: product._id, name: product.name, price: product.price, quantity });
      total += product.price * quantity;
    }
    for (const item of cleanItems) {
      await Product.updateOne({ _id: item.product, stock: { $gte: item.quantity } }, { $inc: { stock: -item.quantity } });
    }

    const orderData = {
      user: req.user._id,
      customer: {
        name: customer.name.trim(),
        email: customer.email.trim().toLowerCase(),
        address: customer.address.trim()
      },
      items: cleanItems,
      total: Number(total.toFixed(2))
    };

    if (!req.user.address && customer.address) {
      req.user.address = customer.address.trim();
      await req.user.save();
    }

    const order = await Order.create(orderData);
    res.status(201).json({ message: 'Order placed successfully!', order });
  } catch (err) { next(err); }
});

router.get('/my-orders', requireAuth, async (req, res, next) => {
  try {
    const orders = await Order.find({
      $or: [
        { user: req.user._id },
        { 'customer.email': req.user.email.toLowerCase() }
      ]
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try { res.json(await Order.find().sort({ createdAt: -1 }).limit(100)); }
  catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid order ID' });
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) { next(err); }
});

module.exports = router;
