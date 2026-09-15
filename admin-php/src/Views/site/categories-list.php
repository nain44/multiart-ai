<?php
/** @var array $categories */
use App\Support\View;
?>
<div class="container" style="padding-top:24px;">
  <h1>Categories</h1>
  <?php if (empty($categories)): ?>
    <div class="empty-state">No categories yet.</div>
  <?php else: ?>
    <div class="cat-grid">
      <?php foreach ($categories as $cat): ?>
        <a class="cat-card" href="/categories/<?= View::e($cat['slug']) ?>">
          <div class="icon"><?= $cat['icon'] ?></div>
          <div class="name"><?= View::e($cat['name']) ?></div>
          <div class="count"><?= (int) $cat['wallpaperCount'] ?> wallpapers</div>
        </a>
      <?php endforeach; ?>
    </div>
  <?php endif; ?>
</div>
