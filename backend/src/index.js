require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const wallpaperRoutes = require('./routes/wallpapers');
const categoryRoutes = require('./routes/categories');
const exploreRoutes = require('./routes/explore');
const aiRoutes = require('./routes/ai');

const app = express();

// ── Middleware ──────────────────────────────────────────────────────────────
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
  : ['*'];

// If wildcard, allow all origins (mobile apps don't have an 'origin' header)
const corsOptions = allowedOrigins.includes('*')
  ? { origin: true, credentials: true }
  : { origin: allowedOrigins, credentials: true };

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/wallpapers', wallpaperRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/explore', exploreRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'MultiArt AI API', timestamp: new Date().toISOString() });
});

// ── Error Handler ──────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── Database + Server ──────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 MultiArt AI API running on http://0.0.0.0:${PORT} (accessible on LAN)`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
