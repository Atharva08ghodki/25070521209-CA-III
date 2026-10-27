require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');
const customRequestsRouter = require('./routes/customRequests');
const authRouter = require('./routes/auth');

const app = express();
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => res.json({
  status: 'ok',
  service: 'KalaKart API',
  database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
}));

app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/custom-requests', customRequestsRouter);

app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` }));

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
  if (err.code === 11000) return res.status(409).json({ message: 'A duplicate record already exists.' });
  res.status(500).json({ message: 'Server error. Check the server terminal.' });
});

const PORT = process.env.PORT || 5000;

async function start() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing. Create server/.env from .env.example.');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');
  app.listen(PORT, () => console.log(`KalaKart API running at http://localhost:${PORT}`));
}

if (require.main === module) {
  start().catch(err => {
    console.error('Could not start server:', err.message);
    process.exit(1);
  });
}

module.exports = app;
