const express = require('express');
const https = require('https');
const Wallpaper = require('../models/Wallpaper');
const Category = require('../models/Category');

const router = express.Router();

// ── Helpers ───────────────────────────────────────────────────────────────────
function fetchJson(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Invalid JSON from API')); }
      });
    }).on('error', reject);
  });
}

function getResolution(w) {
  if (w >= 3840) return '4K';
  if (w >= 1920) return 'FHD';
  if (w >= 1280) return 'HD';
  return 'SD';
}

async function findOrCreateCategory(name) {
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 60);
  let cat = await Category.findOne({ slug });
  if (!cat) {
    const icons = { nature: '🌿', space: '🚀', abstract: '🎨', cars: '🚗', city: '🏙️',
      animals: '🦁', dark: '🌑', minimal: '⬜', ocean: '🌊', mountains: '🏔️',
      flowers: '🌸', architecture: '🏛️', food: '🍕', travel: '✈️' };
    const icon = icons[slug] || '🖼️';
    cat = await Category.create({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      slug,
      icon,
      isActive: true,
    });
  }
  return cat;
}

async function fetchPexels(query, page, perPage = 10) {
  if (!process.env.PEXELS_API_KEY) return [];
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}&orientation=portrait`;
  const data = await fetchJson(url, { Authorization: process.env.PEXELS_API_KEY });
  return (data.photos || []).map((p) => ({
    title: p.alt || query,
    imageUrl: p.src.original,
    thumbnailUrl: p.src.large,
    width: p.width,
    height: p.height,
    resolution: getResolution(p.width),
    source: 'pexels',
    photographer: p.photographer,
    photographerUrl: p.photographer_url,
    tags: [query.toLowerCase(), 'wallpaper', 'hd'],
  }));
}

async function fetchUnsplash(query, page, perPage = 10) {
  if (!process.env.UNSPLASH_ACCESS_KEY) return [];
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}&orientation=portrait`;
  const data = await fetchJson(url, { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` });
  return ((data.results) || []).map((p) => ({
    title: p.alt_description || p.description || query,
    imageUrl: p.urls.full,
    thumbnailUrl: p.urls.regular,
    width: p.width,
    height: p.height,
    resolution: getResolution(p.width),
    source: 'unsplash',
    photographer: p.user?.name,
    photographerUrl: p.user?.links?.html,
    downloadLocation: p.links?.download_location,
    tags: [query.toLowerCase(), 'wallpaper', ...(p.tags?.slice(0, 3).map((t) => t.title) || [])],
  }));
}

/**
 * GET /api/explore?query=nature&page=1
 *
 * Page 1: Returns local DB matches (own uploads first) + Pexels + Unsplash results.
 * Page 2+: Returns only Pexels + Unsplash (DB already shown on page 1).
 */
router.get('/', async (req, res) => {
  const { query = 'beautiful wallpaper', page = 1 } = req.query;
  const pageNum = Math.max(1, Number(page));
  const q = String(query).trim();

  const category = await findOrCreateCategory(q);

  // ── 1. Search local DB (always on page 1, own-uploaded images appear first) ──
  let dbWallpapers = [];
  if (pageNum === 1) {
    const searchRegex = new RegExp(q.split(/\s+/).join('|'), 'i');
    dbWallpapers = await Wallpaper.find({
      isActive: true,
      $or: [
        { title: { $regex: searchRegex } },
        { tags: { $regex: searchRegex } },
        { source: 'own' }, // always include own-uploaded wallpapers on page 1
      ],
    })
      .populate('category', 'name slug icon')
      .sort({ source: -1, createdAt: -1 }) // 'own' sorts before 'pexels'/'unsplash'
      .limit(30);
  }

  // ── 2. Fetch from Pexels + Unsplash ──────────────────────────────────────────
  const [pexels, unsplash] = await Promise.all([
    fetchPexels(q, pageNum, 10).catch(() => []),
    fetchUnsplash(q, pageNum, 10).catch(() => []),
  ]);

  const photos = [...pexels, ...unsplash];

  // Upsert new photos to DB
  const liveIds = [];
  for (const photo of photos) {
    let wp = await Wallpaper.findOne({ imageUrl: photo.imageUrl });
    if (!wp) {
      wp = await Wallpaper.create({
        ...photo,
        category: category._id,
        isActive: true,
        isPremium: false,
        dominantColor: '#1a1a2e',
        downloadCount: 0,
      });
      await Category.findByIdAndUpdate(category._id, { $inc: { wallpaperCount: 1 } });
    }
    liveIds.push(wp._id);
  }

  const liveWallpapers = await Wallpaper.find({ _id: { $in: liveIds } })
    .populate('category', 'name slug icon');

  // ── 3. Merge: DB results first (page 1 only), then live results ───────────────
  // Deduplicate by _id (DB results may overlap with newly upserted live results)
  const seen = new Set();
  const merged = [];
  for (const wp of [...dbWallpapers, ...liveWallpapers]) {
    const id = wp._id.toString();
    if (!seen.has(id)) {
      seen.add(id);
      merged.push(wp);
    }
  }

  res.json({
    wallpapers: merged,
    pagination: {
      page: pageNum,
      hasMore: photos.length >= 18,
    },
  });
});

module.exports = router;

