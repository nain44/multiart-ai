const express = require('express');
const router = express.Router();
const Wallpaper = require('../models/Wallpaper');
const Category = require('../models/Category');
const DeviceQuota = require('../models/DeviceQuota');
const { uploadToCloudinary, generateThumbnail } = require('../services/cloudinary');
const { validateAiPrompt } = require('../utils/contentFilter');

// Anti-abuse safety net, not the product's free/premium quota (that's client-side).
const MAX_GENERATIONS_PER_DEVICE_PER_DAY = 50;

// POST /api/ai/generate
router.post('/generate', async (req, res) => {
  const { prompt, visibility } = req.body;
  const deviceId = req.header('x-device-id');

  if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
    return res.status(400).json({ message: 'Prompt is required and must be a non-empty string' });
  }

  if (visibility !== undefined && visibility !== 'private' && visibility !== 'public') {
    return res.status(400).json({ message: 'visibility must be "private" or "public"' });
  }
  // Private by default; a device-less (old app) client can only create private wallpapers,
  // since there'd be no way to attribute ownership for a later public request/review.
  const requestedVisibility = deviceId && visibility === 'public' ? 'public' : 'private';

  const promptCheck = validateAiPrompt(prompt);
  if (!promptCheck.isValid) {
    return res.status(400).json({ message: promptCheck.error });
  }

  try {
    // deviceId is absent on app versions older than this rollout (no OTA updates
    // configured for this app) - skip quota enforcement for those rather than
    // breaking generation for every existing install.
    let quota = null;
    if (deviceId && typeof deviceId === 'string') {
      const today = new Date().toISOString().slice(0, 10); // UTC YYYY-MM-DD
      quota = await DeviceQuota.findOneAndUpdate(
        { deviceId, date: today },
        { $setOnInsert: { deviceId, date: today, count: 0 } },
        { upsert: true, new: true }
      );

      if (quota.count >= MAX_GENERATIONS_PER_DEVICE_PER_DAY) {
        return res.status(429).json({
          message: 'Daily AI generation limit reached for this device. Please try again tomorrow.',
        });
      }
    }

    const cleanPrompt = prompt.trim();
    // Build Pollinations Flux image generation URL
    // Width 1080, height 1920 matches standard smartphone aspect ratio perfectly (9:16)
    const seed = Math.floor(Math.random() * 1000000);
    const generatorUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=1080&height=1920&nologo=true&seed=${seed}&model=flux`;

    // Download generated image from AI service
    const response = await fetch(generatorUrl);
    if (!response.ok) {
      throw new Error(`AI generation service responded with status ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload image to Cloudinary
    const uploadName = `ai-gen-${Date.now()}`;
    const cloudinaryResult = await uploadToCloudinary(buffer, `${uploadName}.png`);

    // Find or create "AI Art" category
    let category = await Category.findOne({ slug: 'ai-art' });
    if (!category) {
      category = await Category.create({
        name: 'AI Art',
        slug: 'ai-art',
        icon: '🤖',
        coverImageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=600',
        description: 'Wallpapers generated using Artificial Intelligence prompts',
        order: 99,
      });
    }

    // Extract tags from prompt (alphanumeric words)
    const promptTags = cleanPrompt
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s,]/g, '')
      .split(/[\s,]+/)
      .filter(tag => tag.length > 2 && tag.length < 15)
      .slice(0, 5);
    
    // Combine with standard tags and de-duplicate
    const allTags = Array.from(new Set(['ai', 'generated', 'flux', ...promptTags]));

    // Format title: Capitalize first letter, truncate if too long
    let title = cleanPrompt.charAt(0).toUpperCase() + cleanPrompt.slice(1);
    if (title.length > 40) {
      title = title.substring(0, 37) + '...';
    }

    // Save Wallpaper to Database
    const wallpaper = new Wallpaper({
      title,
      description: `AI Generated wallpaper for prompt: "${cleanPrompt}"`,
      category: category._id,
      tags: allTags,
      imageUrl: cloudinaryResult.secure_url,
      thumbnailUrl: generateThumbnail(cloudinaryResult.secure_url),
      width: 1080,
      height: 1920,
      resolution: 'FHD',
      cloudinaryId: cloudinaryResult.public_id,
      isPremium: false,
      source: 'own',
      photographer: 'AI Generator',
      photographerUrl: '',
      deviceId: deviceId || undefined,
      visibility: requestedVisibility,
      approvalStatus: requestedVisibility === 'public' ? 'pending' : 'approved',
    });

    const savedWallpaper = await wallpaper.save();

    // Count only after a successful generation, so failed attempts don't burn quota
    if (quota) {
      quota.count += 1;
      await quota.save();
    }

    // Category counts only reflect publicly-browsable wallpapers; incremented on admin approval instead.

    // Populate category details and return
    const populatedWallpaper = await Wallpaper.findById(savedWallpaper._id).populate('category');

    res.status(201).json(populatedWallpaper);
  } catch (error) {
    console.error('[AI Generation Error]', error);
    res.status(500).json({
      message: 'Failed to generate AI wallpaper. Please try again.',
      error: error.message,
    });
  }
});

/**
 * GET /api/ai/mine
 * Returns all AI creations owned by this device, regardless of status.
 */
router.get('/mine', async (req, res) => {
  const deviceId = req.header('x-device-id');
  if (!deviceId) {
    return res.status(400).json({ message: 'Missing device identifier' });
  }

  const wallpapers = await Wallpaper.find({ deviceId })
    .populate('category', 'name slug icon')
    .sort({ createdAt: -1 });

  res.json(wallpapers);
});

/**
 * POST /api/ai/:id/request-public
 * Owner asks for their private creation to be reviewed for public listing.
 */
router.post('/:id/request-public', async (req, res) => {
  const deviceId = req.header('x-device-id');
  if (!deviceId) {
    return res.status(400).json({ message: 'Missing device identifier' });
  }

  const wallpaper = await Wallpaper.findOne({ _id: req.params.id, deviceId });
  if (!wallpaper) {
    return res.status(404).json({ message: 'Wallpaper not found' });
  }

  wallpaper.visibility = 'public';
  wallpaper.approvalStatus = 'pending';
  await wallpaper.save();

  res.json(wallpaper);
});

/**
 * POST /api/ai/:id/make-private
 * Owner pulls a creation back to private (e.g. undo a public request, or hide an approved one).
 */
router.post('/:id/make-private', async (req, res) => {
  const deviceId = req.header('x-device-id');
  if (!deviceId) {
    return res.status(400).json({ message: 'Missing device identifier' });
  }

  const wallpaper = await Wallpaper.findOne({ _id: req.params.id, deviceId });
  if (!wallpaper) {
    return res.status(404).json({ message: 'Wallpaper not found' });
  }

  const wasPublicApproved = wallpaper.visibility === 'public' && wallpaper.approvalStatus === 'approved';
  wallpaper.visibility = 'private';
  await wallpaper.save();

  if (wasPublicApproved) {
    await Category.findByIdAndUpdate(wallpaper.category, { $inc: { wallpaperCount: -1 } });
  }

  res.json(wallpaper);
});

module.exports = router;
