<?php
/** @var array $apps */
use App\Support\View;
use App\Support\Session;
?>
<div class="page-header">
  <h1>Your Apps</h1>
  <p class="muted">Everything you manage from one place.</p>
</div>

<div class="grid grid-3">
  <?php foreach ($apps as $app): ?>
    <?php $href = $app['adminModule'] === 'wallpapers' ? '/admin/wallpapers/dashboard' : '/admin/apps/' . rawurlencode($app['key']); ?>
    <a class="card app-card" href="<?= View::e($href) ?>">
      <div class="icon"><?= $app['icon'] ?></div>
      <div class="name"><?= View::e($app['name']) ?></div>
      <div class="desc"><?= View::e($app['description']) ?></div>
      <span class="status-pill status-<?= View::e($app['status']) ?>"><?= View::e(str_replace('_', ' ', $app['status'])) ?></span>
    </a>
  <?php endforeach; ?>
</div>

<?php if (Session::isSuper()): ?>
  <div class="card" style="margin-top:28px; max-width:480px;">
    <h2>Register a new app</h2>
    <p class="muted" style="margin-top:-6px;">Add a placeholder now; wire up its admin module later.</p>
    <form method="post" action="/admin/apps">
      <div class="form-row">
        <div class="field">
          <label for="icon">Icon</label>
          <input id="icon" name="icon" value="📱" maxlength="4">
        </div>
        <div class="field" style="flex:3">
          <label for="name">Name</label>
          <input id="name-app" name="name" required>
        </div>
      </div>
      <div class="field">
        <label for="key">Key (slug, unique)</label>
        <input id="key" name="key" placeholder="phone-activity-app" required>
      </div>
      <div class="field">
        <label for="description">Description</label>
        <textarea id="description" name="description"></textarea>
      </div>
      <div class="field">
        <label for="status">Status</label>
        <select id="status" name="status">
          <option value="coming_soon">Coming soon</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <button class="btn" type="submit">Add app</button>
    </form>
  </div>
<?php endif; ?>
