/**
 * Backfill Script: populates dedupeKey on existing wallpapers.
 * Required once, after adding the dedupeKey unique+sparse index, so the
 * duplicate-insert safety net covers documents that existed before it.
 * Usage: node src/scripts/backfillDedupeKey.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Wallpaper = require('../models/Wallpaper');

async function backfill() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/wallverse';
  console.log('Connecting to MongoDB at:', mongoUri);
  await mongoose.connect(mongoUri);

  const wallpapers = await Wallpaper.find({ dedupeKey: { $exists: false } }).select('imageUrl source');
  console.log(`Found ${wallpapers.length} wallpapers without a dedupeKey.`);

  let updated = 0;
  let skipped = 0;

  for (const wp of wallpapers) {
    const base = Wallpaper.normalizeImageUrl(wp.imageUrl);
    if (!base) {
      skipped++;
      continue;
    }
    const dedupeKey = `${wp.source}|${base}`;
    try {
      await Wallpaper.updateOne({ _id: wp._id }, { $set: { dedupeKey } });
      updated++;
    } catch (err) {
      // A leftover duplicate would collide here; leave it without a key rather
      // than crash the run - review manually afterward.
      console.log(`[SKIPPED - collision] ID: ${wp._id} | dedupeKey already taken`);
      skipped++;
    }
  }

  console.log(`\nBackfill complete! Updated ${updated}, skipped ${skipped}.`);
  await mongoose.disconnect();
  process.exit(0);
}

backfill().catch((err) => {
  console.error('Error during backfill:', err);
  process.exit(1);
});
