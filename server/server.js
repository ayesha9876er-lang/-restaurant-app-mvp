const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 404 handler: runs for any URL that did not match a route above
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler: must be last, and must have 4 parameters
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Connect to MongoDB first, then start listening.
// '0.0.0.0' lets other devices on the same Wi-Fi (your phone) reach the server.
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
});