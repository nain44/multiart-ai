const express = require('express');
const https = require('https');
const Wallpaper = require('../models/Wallpaper');
const Category = require('../models/Category');
const authMiddleware = require('../middleware/authMiddleware');
const { upload, uploadToCloudinary, generateThumbnail, deleteFromCloudinary } = require('../services/cloudinary');

const router = express.Router();

// ── PUBLIC ROUTES ────────────────────────────────────────────────────────────

/**
 * GET /api/wallpapers
 * Paginated list with optional filters: category, isPremium, search, sort
 */
router.get('/', async (req, res) => {
  const { page = 1, limit = 20, category, isPremium, search, sort = 'createdAt' } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const { isFeatured } = req.query;
  const query = { isActive: true, visibility: 'public', approvalStatus: 'approved' };
  if (category) query.category = category;
  if (isPremium !== undefined) query.isPremium = isPremium === 'true';
  if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';
  if (search) {
    query.$text = { $search: search };
  }

  const sortMap = {
    popular: { downloadCount: -1 },
    newest: { createdAt: -1 },
    createdAt: { createdAt: -1 },
  };
  const sortObj = sortMap[sort] || { createdAt: -1 };

  const [wallpapers, total] = await Promise.all([
    Wallpaper.find(query)
      .populate('category', 'name slug icon')
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit))
      .select('-cloudinaryId'),
    Wallpaper.countDocuments(query),
  ]);

  res.json({
    wallpapers,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

/**
 * GET /api/wallpapers/featured
 * Admin-picked wallpapers (isFeatured, most recently pinned first) fill the
 * hero/featured section first; any remaining slots (up to 12) are filled by
 * download count, same as before curation existed.
 */
router.get('/featured', async (req, res) => {
  const baseQuery = { isActive: true, visibility: 'public', approvalStatus: 'approved' };

  const pinned = await Wallpaper.find({ ...baseQuery, isFeatured: true })
    .populate('category', 'name slug')
    .sort({ featuredAt: -1 })
    .limit(12)
    .select('-cloudinaryId');

  if (pinned.length >= 12) {
    return res.json(pinned);
  }

  const fillers = await Wallpaper.find({
    ...baseQuery,
    _id: { $nin: pinned.map((w) => w._id) },
  })
    .populate('category', 'name slug')
    .sort({ downloadCount: -1 })
    .limit(12 - pinned.length)
    .select('-cloudinaryId');

  res.json([...pinned, ...fillers]);
});

/**
 * GET /api/wallpapers/community-top?period=daily|weekly
 * Ranks user-submitted AI creations (not admin's own catalog) approved and
 * created within the given window, by download count. Gives community
 * creations a dedicated discovery surface instead of being buried in the
 * general catalog alongside thousands of stock photos.
 */
router.get('/community-top', async (req, res) => {
  const { period = 'daily' } = req.query;
  const windowMs = period === 'weekly' ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

  const wallpapers = await Wallpaper.find({
    isActive: true,
    visibility: 'public',
    approvalStatus: 'approved',
    deviceId: { $exists: true, $ne: null },
    createdAt: { $gte: new Date(Date.now() - windowMs) },
  })
    .populate('category', 'name slug')
    .sort({ downloadCount: -1 })
    .limit(30)
    .select('-cloudinaryId');

  res.json(wallpapers);
});

/**
 * GET /api/wallpapers/random
 * Returns 1 random wallpaper (for daily wallpaper feature)
 */
router.get('/random', async (req, res) => {
  const randomQuery = { isActive: true, isPremium: false, visibility: 'public', approvalStatus: 'approved' };
  const count = await Wallpaper.countDocuments(randomQuery);
  const random = Math.floor(Math.random() * count);
  const wallpaper = await Wallpaper.findOne(randomQuery)
    .skip(random)
    .populate('category', 'name slug');
  res.json(wallpaper);
});

/**
 * GET /api/wallpapers/admin/stats
 * Quick stats for dashboard — must be BEFORE /:id to avoid routing conflict
 */
router.get('/admin/stats', authMiddleware, async (req, res) => {
  const [total, premium, free, totalDownloads] = await Promise.all([
    Wallpaper.countDocuments({ isActive: true }),
    Wallpaper.countDocuments({ isActive: true, isPremium: true }),
    Wallpaper.countDocuments({ isActive: true, isPremium: false }),
    Wallpaper.aggregate([{ $group: { _id: null, total: { $sum: '$downloadCount' } } }]),
  ]);

  res.json({
    total,
    premium,
    free,
    totalDownloads: totalDownloads[0]?.total || 0,
  });
});

/**
 * GET /api/wallpapers/admin/ai-queue?status=pending
 * Lists user-submitted AI wallpapers awaiting (or already reviewed for) public listing.
 */
router.get('/admin/ai-queue', authMiddleware, async (req, res) => {
  const { status = 'pending' } = req.query;
  const wallpapers = await Wallpaper.find({ visibility: 'public', approvalStatus: status })
    .populate('category', 'name slug icon')
    .sort({ createdAt: -1 });
  res.json(wallpapers);
});

/**
 * POST /api/wallpapers/:id/approve
 * Approves a pending public AI wallpaper, making it visible in public listings.
 */
router.post('/:id/approve', authMiddleware, async (req, res) => {
  const wallpaper = await Wallpaper.findById(req.params.id);
  if (!wallpaper) return res.status(404).json({ message: 'Wallpaper not found' });

  const wasAlreadyApproved = wallpaper.visibility === 'public' && wallpaper.approvalStatus === 'approved';
  wallpaper.visibility = 'public';
  wallpaper.approvalStatus = 'approved';
  await wallpaper.save();

  if (!wasAlreadyApproved) {
    await Category.findByIdAndUpdate(wallpaper.category, { $inc: { wallpaperCount: 1 } });
  }

  res.json(wallpaper);
});

/**
 * POST /api/wallpapers/:id/reject
 * Rejects a pending public AI wallpaper; stays hidden from everyone but the owner.
 */
router.post('/:id/reject', authMiddleware, async (req, res) => {
  const wallpaper = await Wallpaper.findById(req.params.id);
  if (!wallpaper) return res.status(404).json({ message: 'Wallpaper not found' });

  wallpaper.approvalStatus = 'rejected';
  await wallpaper.save();

  res.json(wallpaper);
});

/**
 * GET /api/wallpapers/:id
 * Single wallpaper detail
 */
router.get('/:id', async (req, res) => {
  const wallpaper = await Wallpaper.findById(req.params.id)
    .populate('category', 'name slug icon')
    .select('-cloudinaryId');
  if (!wallpaper || !wallpaper.isActive) {
    return res.status(404).json({ message: 'Wallpaper not found' });
  }

  const isPublicApproved = wallpaper.visibility === 'public' && wallpaper.approvalStatus === 'approved';
  if (!isPublicApproved) {
    const deviceId = req.header('x-device-id');
    if (!deviceId || wallpaper.deviceId !== deviceId) {
      return res.status(404).json({ message: 'Wallpaper not found' });
    }
  }

  res.json(wallpaper);
});

/**
 * POST /api/wallpapers/:id/download
 * Increments download counter (fire-and-forget style)
 */
router.post('/:id/download', async (req, res) => {
  const wallpaper = await Wallpaper.findByIdAndUpdate(
    req.params.id,
    { $inc: { downloadCount: 1 } },
    { new: true }
  );

  if (wallpaper && wallpaper.source === 'unsplash' && wallpaper.downloadLocation) {
    const url = wallpaper.downloadLocation;
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (accessKey) {
      https.get(url, {
        headers: {
          Authorization: `Client-ID ${accessKey}`
        }
      }, (trackRes) => {
        trackRes.resume();
      }).on('error', (err) => {
        console.error('Failed to trigger Unsplash download tracking:', err.message);
      });
    }
  }

  res.json({ success: true });
});

// ── ADMIN ROUTES (protected) ─────────────────────────────────────────────────

/**
 * POST /api/wallpapers
 * Upload a new wallpaper: multer stores buffer in memory → we stream to Cloudinary v2
 */
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Image file is required' });
  }

  const {
    title, description, category, tags, isPremium,
    resolution, photographer, photographerUrl, source, dominantColor,
  } = req.body;

  // Upload buffer → Cloudinary
  const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);

  const imageUrl = result.secure_url;
  const thumbnailUrl = generateThumbnail(imageUrl, 400, 700);

  const wallpaper = new Wallpaper({
    title,
    description,
    category,
    tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    imageUrl,
    thumbnailUrl,
    cloudinaryId: result.public_id,
    isPremium: isPremium === 'true',
    resolution: resolution || 'FHD',
    source: source || 'own',
    photographer: photographer || null,
    photographerUrl: photographerUrl || null,
    dominantColor: dominantColor || '#1a1a2e',
  });

  await wallpaper.save();
  await Category.findByIdAndUpdate(category, { $inc: { wallpaperCount: 1 } });

  res.status(201).json(wallpaper);
});


/**
 * PUT /api/wallpapers/:id
 * Update wallpaper metadata (title, isPremium, category, etc.)
 */
router.put('/:id', authMiddleware, async (req, res) => {
  // Prevent overwriting sensitive computed fields
  const { cloudinaryId, imageUrl, thumbnailUrl, downloadCount, ...updates } = req.body;

  const wallpaper = await Wallpaper.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!wallpaper) return res.status(404).json({ message: 'Wallpaper not found' });
  res.json(wallpaper);
});

/**
 * DELETE /api/wallpapers/:id
 * Permanently deletes wallpaper and its Cloudinary image
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  const wallpaper = await Wallpaper.findById(req.params.id);
  if (!wallpaper) return res.status(404).json({ message: 'Wallpaper not found' });

  await deleteFromCloudinary(wallpaper.cloudinaryId);
  await wallpaper.deleteOne();
  await Category.findByIdAndUpdate(wallpaper.category, { $inc: { wallpaperCount: -1 } });

  res.json({ message: 'Wallpaper deleted successfully' });
});

/**
 * GET /api/wallpapers/admin/stats
 * Quick stats for dashboard
 */
router.get('/admin/stats', authMiddleware, async (req, res) => {
  const [total, premium, free, totalDownloads] = await Promise.all([
    Wallpaper.countDocuments({ isActive: true }),
    Wallpaper.countDocuments({ isActive: true, isPremium: true }),
    Wallpaper.countDocuments({ isActive: true, isPremium: false }),
    Wallpaper.aggregate([{ $group: { _id: null, total: { $sum: '$downloadCount' } } }]),
  ]);

  res.json({
    total,
    premium,
    free,
    totalDownloads: totalDownloads[0]?.total || 0,
  });
});

/**
 * POST /api/wallpapers/:id/report
 * Reports a wallpaper for containing inappropriate or offensive content
 */
router.post('/:id/report', async (req, res) => {
  try {
    const wallpaper = await Wallpaper.findByIdAndUpdate(
      req.params.id,
      { $inc: { reportCount: 1 } },
      { new: true }
    );
    if (!wallpaper) {
      return res.status(404).json({ message: 'Wallpaper not found' });
    }
    // If the wallpaper has been reported 5 or more times, flag it as inactive
    if (wallpaper.reportCount >= 5) {
      wallpaper.isActive = false;
      await wallpaper.save();
    }
    res.json({ success: true, message: 'Wallpaper reported successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to report wallpaper', error: error.message });
  }
});

module.exports = router;
