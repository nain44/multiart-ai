/**
 * One-time migration: sets visibility/approvalStatus explicitly on wallpapers
 * created before those fields existed, so query filters (which don't see
 * schema defaults for missing fields) work correctly.
 * Usage: node src/scripts/backfillVisibility.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Wallpaper = require('../models/Wallpaper');

async function backfill() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/wallverse';
    console.log('Connecting to MongoDB at:', mongoUri);
    await mongoose.connect(mongoUri);

    const res = await Wallpaper.updateMany(
      { visibility: { $exists: false } },
      { $set: { visibility: 'public', approvalStatus: 'approved' } }
    );

    console.log(`Backfilled ${res.modifiedCount} wallpaper(s) as public/approved.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error during backfill:', error);
    process.exit(1);
  }
}

backfill();
