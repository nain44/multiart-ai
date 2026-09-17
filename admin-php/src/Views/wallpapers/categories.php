<?php
/** @var array $categories */
use App\Support\View;
$emojis = ['🌿','🚀','🎨','🚗','🏙️','🦁','🌑','⬜','🌊','🏔️','🌸','🏛️','🍕','✈️','🖼️','🤖'];
?>
<div class="page-header">
  <h1>Categories</h1>
</div>

<div class="grid grid-2" style="align-items:start;">
  <div class="card">
    <h2>Add category</h2>
    <form method="post" action="/admin/wallpapers/categories">
      <label for="icon">Icon</label>
      <div class="emoji-pick">
        <?php foreach ($emojis as $e): ?>
          <button type="button" data-target="icon"><?= $e ?></button>
        <?php endforeach; ?>
      </div>
      <div class="field">
        <input id="icon" name="icon" value="🖼️" maxlength="4">
      </div>
      <div class="field">
        <label for="name">Name</label>
        <input id="name" name="name" required>
      </div>
      <div class="field">
        <label for="slug">Slug</label>
        <input id="slug" name="slug" required>
      </div>
      <div class="field">
        <label for="description">Description</label>
        <textarea id="description" name="description"></textarea>
      </div>
      <div class="field">
        <label for="order">Order</label>
        <input id="order" name="order" type="number" value="0">
      </div>
      <div class="field">
        <label for="eventDate">Event date <span class="muted">(optional — for seasonal/holiday categories)</span></label>
        <input id="eventDate" name="eventDate" type="text" placeholder="MM-DD, e.g. 12-25 for Christmas">
        <span class="muted">Use <code>MM-DD</code> for a date that repeats every year (Christmas, Valentine's), or a full <code>YYYY-MM-DD</code> for a one-off date you'll update yearly (Eid). The app shows a reminder banner for this category around that date.</span>
      </div>
      <button class="btn" type="submit">Create category</button>
    </form>
  </div>

  <div class="card" style="padding:0; overflow:hidden;">
    <?php if (empty($categories)): ?>
      <div class="empty-state">No categories yet.</div>
    <?php else: ?>
      <table>
        <thead>
          <tr><th></th><th>Name</th><th>Wallpapers</th><th>Order</th><th>Event date</th><th></th></tr>
        </thead>
        <tbody>
          <?php foreach ($categories as $cat): ?>
            <tr>
              <td><?= $cat['icon'] ?></td>
              <td>
                <?= View::e($cat['name']) ?><br>
                <span class="muted"><?= View::e($cat['slug']) ?></span>
              </td>
              <td><?= (int) $cat['wallpaperCount'] ?></td>
              <td><?= (int) $cat['order'] ?></td>
              <td>
                <form method="post" action="/admin/wallpapers/categories/<?= View::e($cat['_id']) ?>/event-date" style="display:flex; gap:6px;">
                  <input name="eventDate" type="text" value="<?= View::e($cat['eventDate'] ?? '') ?>" placeholder="MM-DD" style="width:110px;">
                  <button class="btn btn-secondary btn-sm" type="submit">Save</button>
                </form>
              </td>
              <td>
                <form method="post" action="/admin/wallpapers/categories/<?= View::e($cat['_id']) ?>/delete"
                      data-confirm="Deactivate &quot;<?= View::e($cat['name']) ?>&quot;? It stays in the database but stops showing in the app.">
                  <button class="icon-btn" type="submit" title="Deactivate">🗑️</button>
                </form>
              </td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    <?php endif; ?>
  </div>
</div>
