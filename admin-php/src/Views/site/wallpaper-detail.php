<?php
/** @var array $wp */
use App\Support\View;
$category = is_array($wp['category']) ? $wp['category'] : null;
?>
<div class="container" style="padding-top:24px;">
  <div class="breadcrumb">
    <a href="/">Home</a> › <a href="/wallpapers">Wallpapers</a> › <?= View::e($wp['title']) ?>
  </div>

  <div class="detail-layout">
    <img src="<?= View::e($wp['imageUrl']) ?>" alt="<?= View::e($wp['title']) ?>">

    <div class="detail-panel">
      <h1><?= View::e($wp['title']) ?></h1>
      <?php if (!empty($wp['description'])): ?>
        <p class="muted"><?= View::e($wp['description']) ?></p>
      <?php endif; ?>

      <div class="meta-row"><span class="muted">Resolution</span><span><?= View::e($wp['resolution']) ?></span></div>
      <?php if ($category): ?>
        <div class="meta-row">
          <span class="muted">Category</span>
          <a href="/categories/<?= View::e($category['slug']) ?>"><?= $category['icon'] ?? '' ?> <?= View::e($category['name']) ?></a>
        </div>
      <?php endif; ?>
      <div class="meta-row"><span class="muted">Downloads</span><span><?= (int) $wp['downloadCount'] ?></span></div>

      <?php if (!empty($wp['tags'])): ?>
        <div class="tag-row">
          <?php foreach ($wp['tags'] as $tag): ?>
            <span class="tag">#<?= View::e($tag) ?></span>
          <?php endforeach; ?>
        </div>
      <?php endif; ?>

      <a class="btn btn-primary" style="width:100%; justify-content:center; margin-top:14px;"
         href="<?= View::e($wp['imageUrl']) ?>" download id="download-btn"
         data-track-id="<?= View::e($wp['_id']) ?>">⬇️ Download</a>

      <?php if (!empty($wp['photographer'])): ?>
        <p class="muted" style="font-size:12px; margin-top:14px;">
          Photo by
          <?php if (!empty($wp['photographerUrl'])): ?>
            <a href="<?= View::e($wp['photographerUrl']) ?><?= $wp['source'] === 'unsplash' ? '?utm_source=multiart_ai&utm_medium=referral' : '' ?>" target="_blank" rel="noopener"><?= View::e($wp['photographer']) ?></a>
          <?php else: ?>
            <?= View::e($wp['photographer']) ?>
          <?php endif; ?>
          on <?= View::e(ucfirst($wp['source'])) ?>
        </p>
      <?php endif; ?>
    </div>
  </div>
</div>

<script>
  document.getElementById('download-btn').addEventListener('click', function () {
    var id = this.dataset.trackId;
    fetch('/api/track-download?id=' + encodeURIComponent(id), { method: 'POST' }).catch(function () {});
  });
</script>
