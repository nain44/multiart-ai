const express = require('express');
const Category = require('../models/Category');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// ── PUBLIC ───────────────────────────────────────────────────────────────────

/**
 * GET /api/categories
 * All active categories sorted by order
 */
router.get('/', async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });
  res.json(categories);
});

/**
 * GET /api/categories/:slug
 * Single category by slug
 */
router.get('/:slug', async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true });
  if (!category) return res.status(404).json({ message: 'Category not found' });
  res.json(category);
});

// ── ADMIN ────────────────────────────────────────────────────────────────────

/**
 * POST /api/categories
 * Create a new category
 */
router.post('/', authMiddleware, async (req, res) => {
  const { name, slug, icon, description, order, coverImageUrl } = req.body;

  if (!name || !slug) {
    return res.status(400).json({ message: 'Name and slug are required' });
  }

  const exists = await Category.findOne({ slug: slug.toLowerCase() });
  if (exists) {
    return res.status(409).json({ message: 'A category with this slug already exists' });
  }

  const category = new Category({ name, slug, icon, description, order, coverImageUrl });
  await category.save();
  res.status(201).json(category);
});

/**
 * PUT /api/categories/:id
 * Update category details
 */
router.put('/:id', authMiddleware, async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) return res.status(404).json({ message: 'Category not found' });
  res.json(category);
});

/**
 * DELETE /api/categories/:id
 * Soft-delete (deactivates category)
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  await Category.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ message: 'Category deactivated' });
});

module.exports = router;
