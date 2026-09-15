<?php
/** @var array $category
 *  @var array $wallpapers
 *  @var array $pagination */
use App\Support\View;
?>
<div class="container" style="padding-top:24px;">
  <div class="breadcrumb">
    <a href="/">Home</a> › <a href="/categories">Categories</a> › <?= View::e($category['name']) ?>
  </div>

  <h1><?= $category['icon'] ?> <?= View::e($category['name']) ?></h1>
  <p class="muted"><?= (int) $category['wallpaperCount'] ?> wallpapers</p>
  <?php if (!empty($category['description'])): ?>
    <p class="muted"><?= View::e($category['description']) ?></p>
  <?php endif; ?>

  <?php if (empty($wallpapers)): ?>
    <div class="empty-state">No wallpapers in this category yet.</div>
  <?php else: ?>
    <div class="wg-grid" style="margin-top:24px;">
      <?php foreach ($wallpapers as $wp): ?>
        <a class="wg-card" href="/wallpapers/<?= View::e($wp['_id']) ?>">
          <img src="<?= View::e($wp['thumbnailUrl']) ?>" alt="<?= View::e($wp['title']) ?>" loading="lazy">
          <?php if (!empty($wp['isPremium'])): ?><span class="premium-badge">PREMIUM</span><?php endif; ?>
          <div class="overlay"><span class="title"><?= View::e($wp['title']) ?></span></div>
        </a>
      <?php endforeach; ?>
    </div>

    <?php if ($pagination['pages'] > 1): ?>
      <div class="pagination">
        <?php $qs = fn($p) => '?page=' . $p; ?>
        <?php if ($pagination['page'] > 1): ?>
          <a class="btn btn-outline" href="<?= View::e($qs($pagination['page'] - 1)) ?>">← Prev</a>
        <?php endif; ?>
        <span class="muted">Page <?= $pagination['page'] ?> of <?= $pagination['pages'] ?></span>
        <?php if ($pagination['page'] < $pagination['pages']): ?>
          <a class="btn btn-outline" href="<?= View::e($qs($pagination['page'] + 1)) ?>">Next →</a>
        <?php endif; ?>
      </div>
    <?php endif; ?>
  <?php endif; ?>
</div>
