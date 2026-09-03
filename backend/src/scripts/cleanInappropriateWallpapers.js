/**
 * Database Cleanup Script
 * Scans all wallpapers in MongoDB and deactivates any that fail the content safety filter.
 * Usage: node src/scripts/cleanInappropriateWallpapers.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Wallpaper = require('../models/Wallpaper');
const { isSafeContent } = require('../utils/contentFilter');

async function cleanDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/wallverse';
    console.log('Connecting to MongoDB at:', mongoUri);
    await mongoose.connect(mongoUri);

    console.log('Scanning wallpapers for inappropriate content...');
    const wallpapers = await Wallpaper.find({ isActive: true });
    console.log(`Found ${wallpapers.length} active wallpapers to inspect.`);

    let deactivatedCount = 0;

    for (const wp of wallpapers) {
      if (!isSafeContent(wp)) {
        await Wallpaper.updateOne({ _id: wp._id }, { $set: { isActive: false } });
        deactivatedCount++;
        console.log(`[DEACTIVATED] ID: ${wp._id} | Title: "${wp.title}" | Tags: ${wp.tags?.join(', ')}`);
      }
    }

    console.log(`\nCleanup complete! Deactivated ${deactivatedCount} inappropriate wallpapers.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}

cleanDatabase();
