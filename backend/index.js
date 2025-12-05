const express = require('express');
const cors = require('cors');
const db = require('./database');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const messageRoutes = require('./routes/messageRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running!' });
});

// Routes
app.use('/api', authRoutes);         
app.use('/api/products', productRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/purchases', purchaseRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});