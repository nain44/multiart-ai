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
    // Admin-curated selection for the app's initial/featured section.
    // featuredAt orders manual picks (most recently pinned first); featured slots
    // are filled first, remaining slots fall back to downloadCount ranking.
    isFeatured: { type: Boolean, default: false },
    featuredAt: { type: Date },
    // De-dup safety net: normalized "source|baseImageUrl" key, computed on save.
    // Unique+sparse index rejects duplicate inserts at the DB level regardless of
    // which code path creates the wallpaper (manual upload, AI generation, or any
    // external automation writing to this collection) - see normalizeImageUrl below.
    dedupeKey: { type: String, unique: true, sparse: true },
    // Ownership + moderation for user-generated (AI) content.
    // Defaults keep existing/admin-uploaded wallpapers publicly visible without a migration.
    deviceId: { type: String, index: true },
    visibility: { type: String, enum: ['private', 'public'], default: 'public' },
    approvalStatus: { type: String, enum: ['approved', 'pending', 'rejected'], default: 'approved' },
    // Source attribution (for Pexels/Unsplash imported images)
    source: {
      type: String,
      enum: ['own', 'pexels', 'unsplash', 'ai'],
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
wallpaperSchema.index({ visibility: 1, approvalStatus: 1, isActive: 1 });
wallpaperSchema.index({ downloadCount: -1 });
wallpaperSchema.index({ isFeatured: 1, featuredAt: -1 });
wallpaperSchema.index({ createdAt: -1 });
wallpaperSchema.index({ title: 'text', tags: 'text' }); // full-text search

// Strips dynamic query params (width/height/seed/fit/crop/nologo) so the same
// underlying image requested at different sizes still maps to one dedup key.
function normalizeImageUrl(url) {
  if (!url) return '';
  return url.trim().toLowerCase().replace(/[?&](width|height|seed|fit|crop|nologo)=[^&]*/gi, '');
}

wallpaperSchema.pre('save', function (next) {
  if (this.isModified('imageUrl') || this.isModified('source') || !this.dedupeKey) {
    const base = normalizeImageUrl(this.imageUrl);
    this.dedupeKey = base ? `${this.source}|${base}` : undefined;
  }
  next();
});

wallpaperSchema.statics.normalizeImageUrl = normalizeImageUrl;

module.exports = mongoose.model('Wallpaper', wallpaperSchema);
