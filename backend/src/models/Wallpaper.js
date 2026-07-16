const mongoose = require('mongoose');

const wallpaperSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    imageUrl: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    width: { type: Number },
    height: { type: Number },
    resolution: {
      type: String,
      enum: ['SD', 'HD', 'FHD', '4K', '8K'],
      default: 'FHD',
    },
    cloudinaryId: { type: String }, // public_id from Cloudinary
    isPremium: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    // Source attribution (for Pexels/Unsplash imported images)
    source: {
      type: String,
      enum: ['own', 'pexels', 'unsplash'],
      default: 'own',
    },
    photographer: { type: String },
    photographerUrl: { type: String },
    downloadLocation: { type: String },
    // Stats
    downloadCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
    reportCount: { type: Number, default: 0 },
    // Dominant color extracted from image
    dominantColor: { type: String, default: '#1a1a2e' },
  },
  { timestamps: true }
);

// Indexes for frequent queries
wallpaperSchema.index({ category: 1, isActive: 1 });
wallpaperSchema.index({ tags: 1 });
wallpaperSchema.index({ isPremium: 1, isActive: 1 });
wallpaperSchema.index({ downloadCount: -1 });
wallpaperSchema.index({ createdAt: -1 });
wallpaperSchema.index({ title: 'text', tags: 'text' }); // full-text search

module.exports = mongoose.model('Wallpaper', wallpaperSchema);
