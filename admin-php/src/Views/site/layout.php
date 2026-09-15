<?php
/** @var string $content
 *  @var string|null $pageTitle
 *  @var string|null $pageDescription
 *  @var string|null $ogImage */
use App\Support\View;
$title = ($pageTitle ?? null) ? $pageTitle . ' | MultiArt AI' : 'MultiArt AI — Free HD & AI Wallpapers';
$description = $pageDescription ?? 'Download free high-quality wallpapers and AI-generated art for your phone.';
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= View::e($title) ?></title>
  <meta name="description" content="<?= View::e($description) ?>">
  <meta property="og:title" content="<?= View::e($title) ?>">
  <meta property="og:description" content="<?= View::e($description) ?>">
  <?php if (!empty($ogImage)): ?>
    <meta property="og:image" content="<?= View::e($ogImage) ?>">
  <?php endif; ?>
  <link rel="stylesheet" href="/assets/site.css">
</head>
<body>
  <header class="site-navbar">
    <div class="container bar">
      <a class="logo" href="/">
        <span class="box">🖼️</span> MultiArt AI
      </a>
      <nav>
        <a class="link" href="/wallpapers">Wallpapers</a>
        <a class="link" href="/categories">Categories</a>
        <a class="btn btn-primary" href="https://play.google.com/store" style="padding:9px 18px; font-size:13px;">📱 Get the App</a>
      </nav>
    </div>
  </header>

  <main><?= $content ?></main>

  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <div class="logo" style="margin-bottom:10px;"><span class="box">🖼️</span> MultiArt AI</div>
          <p class="muted" style="max-width:320px;">Free high-quality wallpapers and AI-generated art, hand-picked and updated regularly.</p>
        </div>
        <div>
          <h4>Browse</h4>
          <a href="/wallpapers">Wallpapers</a>
          <a href="/categories">Categories</a>
        </div>
        <div>
          <h4>Legal</h4>
          <a href="/privacy-policy">Privacy Policy</a>
          <a href="/terms">Terms</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© <?= date('Y') ?> MultiArt AI. All rights reserved.</span>
        <span>Photos courtesy of <a href="https://pexels.com" target="_blank" rel="noopener">Pexels</a> &amp; <a href="https://unsplash.com" target="_blank" rel="noopener">Unsplash</a></span>
      </div>
    </div>
  </footer>
</body>
</html>
