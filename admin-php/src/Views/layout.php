<?php
/** @var string $content
 *  @var array|null $admin
 *  @var array|null $flash
 *  @var string|null $module   'wallpapers' when inside the wallpapers app section
 *  @var string|null $active   current nav item key
 */
use App\Support\View;
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= View::e($_ENV['APP_NAME'] ?? 'Admin') ?></title>
  <link rel="stylesheet" href="/assets/style.css">
</head>
<body>
<div class="app-shell">
  <aside class="sidebar">
    <div class="brand"><span class="badge">🛠️</span> Super Admin</div>
    <nav>
      <a class="nav-link <?= $module === null ? 'active' : '' ?>" href="/admin/">🗂️ All Apps</a>

      <?php if ($module === 'wallpapers'): ?>
        <div class="section-label">🖼️ Wallpapers</div>
        <a class="nav-link <?= $active === 'dashboard' ? 'active' : '' ?>" href="/admin/wallpapers/dashboard">📊 Dashboard</a>
        <a class="nav-link <?= $active === 'upload' ? 'active' : '' ?>" href="/admin/wallpapers/upload">⬆️ Upload</a>
        <a class="nav-link <?= $active === 'wallpapers' ? 'active' : '' ?>" href="/admin/wallpapers">🖼️ Wallpapers</a>
        <a class="nav-link <?= $active === 'ai-queue' ? 'active' : '' ?>" href="/admin/wallpapers/ai-queue">🤖 AI Review Queue</a>
        <a class="nav-link <?= $active === 'categories' ? 'active' : '' ?>" href="/admin/wallpapers/categories">🗃️ Categories</a>
      <?php endif; ?>
    </nav>
    <?php if ($admin): ?>
      <div class="muted" style="padding:8px 12px; font-size:12px;">
        <?= View::e($admin['name']) ?> · <?= View::e($admin['role']) ?>
      </div>
    <?php endif; ?>
    <form method="post" action="/admin/logout">
      <button class="logout-btn" type="submit">⏻ Log out</button>
    </form>
  </aside>

  <main class="main">
    <div class="topbar">
      <div class="brand"><span class="badge">🛠️</span> Super Admin</div>
    </div>
    <div class="content">
      <?php if ($flash): ?>
        <div class="alert alert-<?= View::e($flash['type']) ?>"><?= View::e($flash['message']) ?></div>
      <?php endif; ?>
      <?= $content ?>
    </div>
  </main>
</div>
<script src="/assets/app.js"></script>
</body>
</html>
