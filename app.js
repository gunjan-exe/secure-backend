// app.js
// app.js
require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Mount your auth routes
app.use('/api/auth', authRoutes);

// Fallback route for unmatched endpoints
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app;

