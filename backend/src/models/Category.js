const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    icon: { type: String, default: '🖼️' },
    coverImageUrl: { type: String },
    description: { type: String },
    // Optional event date for seasonal/holiday categories (Christmas, Eid, Valentine's...).
    // "MM-DD" recurs every year (e.g. "12-25"); a full "YYYY-MM-DD" is a one-off (for
    // lunar-calendar events like Eid, whose date shifts and needs updating each year).
    eventDate: { type: String, default: null },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    wallpaperCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

categorySchema.index({ slug: 1 });
categorySchema.index({ order: 1, isActive: 1 });

module.exports = mongoose.model('Category', categorySchema);
