<?php
/** @var array $featured
 *  @var array $categories */
use App\Support\View;
?>
<div class="container">
  <section class="hero">
    <h1 class="gradient-text">Free HD &amp; AI Wallpapers</h1>
    <p>Thousands of hand-picked and AI-generated wallpapers for your phone, updated daily.</p>
    <div class="actions">
      <a class="btn btn-primary" href="/wallpapers">Browse Wallpapers</a>
      <a class="btn btn-outline" href="https://play.google.com/store" target="_blank" rel="noopener">📱 Get the App</a>
    </div>
  </section>

  <?php if (!empty($categories)): ?>
    <div class="chip-row">
      <?php foreach (array_slice($categories, 0, 10) as $cat): ?>
        <a class="chip" href="/categories/<?= View::e($cat['slug']) ?>">
          <?= $cat['icon'] ?> <?= View::e($cat['name']) ?>
        </a>
      <?php endforeach; ?>
    </div>
  <?php endif; ?>

  <h2>Featured</h2>
  <?php if (empty($featured)): ?>
    <div class="empty-state">No featured wallpapers yet.</div>
  <?php else: ?>
    <div class="wg-grid">
      <?php foreach ($featured as $wp): ?>
        <a class="wg-card" href="/wallpapers/<?= View::e($wp['_id']) ?>">
          <img src="<?= View::e($wp['thumbnailUrl']) ?>" alt="<?= View::e($wp['title']) ?>" loading="lazy">
          <?php if (!empty($wp['isPremium'])): ?><span class="premium-badge">PREMIUM</span><?php endif; ?>
          <div class="overlay"><span class="title"><?= View::e($wp['title']) ?></span></div>
        </a>
      <?php endforeach; ?>
    </div>
  <?php endif; ?>
</div>
