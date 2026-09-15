<?php
/** @var array $categories */
use App\Support\View;
?>
<div class="page-header">
  <h1>Upload a wallpaper</h1>
</div>

<form method="post" action="/admin/wallpapers/upload" enctype="multipart/form-data" class="card" style="max-width:560px;">
  <div class="field">
    <label>Image</label>
    <div class="dropzone" id="dropzone">
      <p>Click or drag an image here</p>
      <img id="preview" hidden alt="Preview">
    </div>
    <input id="image" name="image" type="file" accept="image/*" required hidden>
  </div>

  <div class="field">
    <label for="title">Title</label>
    <input id="title" name="title" required>
  </div>

  <div class="field">
    <label for="description">Description</label>
    <textarea id="description" name="description"></textarea>
  </div>

  <div class="form-row">
    <div class="field">
      <label for="category">Category</label>
      <select id="category" name="category" required>
        <option value="">Select…</option>
        <?php foreach ($categories as $cat): ?>
          <option value="<?= View::e($cat['_id']) ?>"><?= $cat['icon'] ?> <?= View::e($cat['name']) ?></option>
        <?php endforeach; ?>
      </select>
    </div>
    <div class="field">
      <label for="resolution">Resolution</label>
      <select id="resolution" name="resolution">
        <?php foreach (['SD', 'HD', 'FHD', '4K', '8K'] as $r): ?>
          <option value="<?= $r ?>" <?= $r === 'FHD' ? 'selected' : '' ?>><?= $r ?></option>
        <?php endforeach; ?>
      </select>
    </div>
  </div>

  <div class="field">
    <label for="tags">Tags (comma-separated)</label>
    <input id="tags" name="tags" placeholder="nature, mountain, hd">
  </div>

  <div class="form-row">
    <div class="field">
      <label for="source">Source</label>
      <select id="source" name="source">
        <option value="own">Own</option>
        <option value="pexels">Pexels</option>
        <option value="unsplash">Unsplash</option>
      </select>
    </div>
    <div class="field">
      <label for="isPremium">Access</label>
      <select id="isPremium" name="isPremium">
        <option value="false">Free</option>
        <option value="true">Premium</option>
      </select>
    </div>
  </div>

  <div id="attribution-fields" hidden>
    <div class="form-row">
      <div class="field">
        <label for="photographer">Photographer</label>
        <input id="photographer" name="photographer">
      </div>
      <div class="field">
        <label for="photographerUrl">Photographer URL</label>
        <input id="photographerUrl" name="photographerUrl">
      </div>
    </div>
  </div>

  <button class="btn" type="submit">Upload</button>
</form>
