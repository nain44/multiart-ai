<?php
/** @var array $app */
use App\Support\View;
use App\Support\Session;
?>
<div class="page-header">
  <h1><?= $app['icon'] ?> <?= View::e($app['name']) ?></h1>
  <span class="status-pill status-<?= View::e($app['status']) ?>"><?= View::e(str_replace('_', ' ', $app['status'])) ?></span>
</div>

<div class="card empty-state">
  <p><?= View::e($app['description']) ?: 'This app is registered but has no admin module wired up yet.' ?></p>
  <?php if ($app['apiBaseUrl']): ?>
    <p class="muted">Backend: <?= View::e($app['apiBaseUrl']) ?></p>
  <?php endif; ?>
</div>

<?php if (Session::isSuper()): ?>
  <div class="card" style="margin-top:22px; max-width:480px;">
    <h2>Edit app</h2>
    <form method="post" action="/apps/<?= View::e($app['_id']) ?>/update">
      <div class="form-row">
        <div class="field">
          <label for="icon">Icon</label>
          <input id="icon" name="icon" value="<?= View::e($app['icon']) ?>" maxlength="4">
        </div>
        <div class="field" style="flex:3">
          <label for="name-edit">Name</label>
          <input id="name-edit" name="name" value="<?= View::e($app['name']) ?>" required>
        </div>
      </div>
      <div class="field">
        <label for="description-edit">Description</label>
        <textarea id="description-edit" name="description"><?= View::e($app['description']) ?></textarea>
      </div>
      <div class="field">
        <label for="status-edit">Status</label>
        <select id="status-edit" name="status">
          <?php foreach (['coming_soon' => 'Coming soon', 'active' => 'Active', 'inactive' => 'Inactive'] as $val => $label): ?>
            <option value="<?= $val ?>" <?= $app['status'] === $val ? 'selected' : '' ?>><?= $label ?></option>
          <?php endforeach; ?>
        </select>
      </div>
      <div class="field">
        <label for="apiBaseUrl">API base URL (once this app has its own backend)</label>
        <input id="apiBaseUrl" name="apiBaseUrl" value="<?= View::e($app['apiBaseUrl']) ?>" placeholder="https://api.example.com">
      </div>
      <button class="btn" type="submit">Save changes</button>
    </form>
  </div>

  <form method="post" action="/apps/<?= View::e($app['_id']) ?>/delete" data-confirm="Remove &quot;<?= View::e($app['name']) ?>&quot; from the app registry?" style="margin-top:14px;">
    <button class="btn btn-danger btn-sm" type="submit">Remove app</button>
  </form>
<?php endif; ?>
