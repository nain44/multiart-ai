<?php
/** @var array $stats
 *  @var int $categoryCount */
?>
<div class="page-header">
  <h1>Dashboard</h1>
  <p class="muted">MultiArt AI / Wallverse — shared wallpaper catalog.</p>
</div>

<div class="grid grid-4">
  <div class="card stat-card">
    <div class="stat-label">Total wallpapers</div>
    <div class="stat-value"><?= (int) $stats['total'] ?></div>
  </div>
  <div class="card stat-card">
    <div class="stat-label">Free</div>
    <div class="stat-value"><?= (int) $stats['free'] ?></div>
  </div>
  <div class="card stat-card">
    <div class="stat-label">Premium</div>
    <div class="stat-value"><?= (int) $stats['premium'] ?></div>
  </div>
  <div class="card stat-card">
    <div class="stat-label">Total downloads</div>
    <div class="stat-value"><?= (int) $stats['totalDownloads'] ?></div>
  </div>
  <div class="card stat-card">
    <div class="stat-label">Categories</div>
    <div class="stat-value"><?= $categoryCount ?></div>
  </div>
</div>

<div class="grid grid-3" style="margin-top:24px;">
  <a class="card app-card" href="/wallpapers/upload">
    <div class="icon">⬆️</div>
    <div class="name">Upload a wallpaper</div>
  </a>
  <a class="card app-card" href="/wallpapers">
    <div class="icon">🖼️</div>
    <div class="name">Manage wallpapers</div>
  </a>
  <a class="card app-card" href="/wallpapers/categories">
    <div class="icon">🗃️</div>
    <div class="name">Manage categories</div>
  </a>
</div>
