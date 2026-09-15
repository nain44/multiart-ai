<?php
/** @var array $wallpapers
 *  @var array $pagination
 *  @var string $search */
use App\Support\View;
?>
<div class="container">
  <h1>Wallpapers</h1>
  <p class="muted"><?= (int) $pagination['total'] ?> wallpapers</p>

  <form method="get" action="/wallpapers" class="site-toolbar">
    <input type="search" name="search" placeholder="Search wallpapers…" value="<?= View::e($search) ?>">
    <button class="btn btn-primary" type="submit">Search</button>
    <?php if ($search !== ''): ?>
      <a class="btn btn-outline" href="/wallpapers">✕ Clear</a>
    <?php endif; ?>
  </form>

  <?php if (empty($wallpapers)): ?>
    <div class="empty-state">No wallpapers found.</div>
  <?php else: ?>
    <div class="wg-grid">
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
        <?php
          $qs = fn($p) => '?' . http_build_query(array_filter(['page' => $p, 'search' => $search ?: null]));
        ?>
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
