<?php
/** @var array $wallpapers
 *  @var array $pagination
 *  @var string $search
 *  @var bool $featuredOnly */
use App\Support\View;
?>
<div class="page-header">
  <h1>Wallpapers</h1>
  <p class="muted"><?= (int) $pagination['total'] ?> total</p>
</div>

<form method="get" action="/admin/wallpapers" class="toolbar">
  <input type="search" name="search" placeholder="Search title or tags…" value="<?= View::e($search) ?>">
  <button class="btn btn-secondary" type="submit">Search</button>
  <?php if ($search !== '' || $featuredOnly): ?>
    <a class="btn btn-secondary" href="/admin/wallpapers">Clear</a>
  <?php endif; ?>
  <label style="display:flex; align-items:center; gap:6px; font-weight:400; margin:0;">
    <input type="checkbox" name="featured" value="1" style="width:auto;" <?= $featuredOnly ? 'checked' : '' ?>
           onchange="this.form.submit()">
    ⭐ Show featured only
  </label>
</form>

<?php if ($featuredOnly && empty($wallpapers)): ?>
  <div class="alert alert-error">
    No wallpapers are marked as featured yet. Click "☆ Feature it" on any row below (uncheck this filter first) to add one —
    featured wallpapers appear first on the app's home screen.
  </div>
<?php endif; ?>

<form method="post" action="/admin/wallpapers/bulk-delete" data-confirm="Delete the selected wallpapers? This can't be undone.">
  <input type="hidden" name="ids" id="bulk-ids" value="[]">
  <div class="toolbar">
    <button class="btn btn-danger btn-sm" id="bulk-delete-btn" type="submit" disabled>
      Delete selected (<span id="bulk-count">0</span>)
    </button>
  </div>

  <div class="card" style="padding:0; overflow-x:auto;">
    <?php if (empty($wallpapers)): ?>
      <div class="empty-state">No wallpapers found.</div>
    <?php else: ?>
      <table>
        <thead>
          <tr>
            <th><input type="checkbox" id="select-all"></th>
            <th>Wallpaper</th>
            <th>Category</th>
            <th>Resolution</th>
            <th>Downloads</th>
            <th>Access</th>
            <th>Featured</th>
            <th>Created</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($wallpapers as $wp): ?>
            <tr>
              <td><input type="checkbox" class="row-check" name="check" value="<?= View::e($wp['_id']) ?>"></td>
              <td>
                <div style="display:flex; align-items:center; gap:10px;">
                  <img class="thumb" src="<?= View::e($wp['thumbnailUrl']) ?>" alt="">
                  <div>
                    <?= View::e($wp['title']) ?><br>
                    <span class="muted"><?= View::e($wp['source']) ?></span>
                  </div>
                </div>
              </td>
              <td><?= View::e(is_array($wp['category']) ? $wp['category']['name'] : '—') ?></td>
              <td><?= View::e($wp['resolution']) ?></td>
              <td><?= (int) $wp['downloadCount'] ?></td>
              <td>
                <form method="post" action="/admin/wallpapers/<?= View::e($wp['_id']) ?>/toggle-premium">
                  <input type="hidden" name="isPremium" value="<?= $wp['isPremium'] ? 'false' : 'true' ?>">
                  <button class="badge <?= $wp['isPremium'] ? 'badge-premium' : 'badge-free' ?>" type="submit">
                    <?= $wp['isPremium'] ? 'Premium' : 'Free' ?>
                  </button>
                </form>
              </td>
              <td>
                <form method="post" action="/admin/wallpapers/<?= View::e($wp['_id']) ?>/toggle-featured">
                  <input type="hidden" name="isFeatured" value="<?= $wp['isFeatured'] ? 'false' : 'true' ?>">
                  <button class="badge <?= $wp['isFeatured'] ? 'badge-featured' : 'badge-not-featured' ?>" type="submit">
                    <?= $wp['isFeatured'] ? '⭐ Featured' : '☆ Feature it' ?>
                  </button>
                </form>
              </td>
              <td class="muted"><?= View::e(substr($wp['createdAt'] ?? '', 0, 10)) ?></td>
              <td>
                <form method="post" action="/admin/wallpapers/<?= View::e($wp['_id']) ?>/delete"
                      data-confirm="Permanently delete &quot;<?= View::e($wp['title']) ?>&quot;?">
                  <button class="icon-btn" type="submit" title="Delete">🗑️</button>
                </form>
              </td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    <?php endif; ?>
  </div>
</form>

<?php if ($pagination['pages'] > 1): ?>
  <div class="pagination">
    <?php
      $qs = fn($p) => '?' . http_build_query(array_filter([
          'page' => $p, 'search' => $search ?: null, 'featured' => $featuredOnly ? 1 : null,
      ]));
    ?>
    <a class="btn btn-secondary btn-sm <?= $pagination['page'] <= 1 ? 'disabled' : '' ?>"
       href="<?= $pagination['page'] > 1 ? View::e($qs($pagination['page'] - 1)) : '#' ?>">← Prev</a>
    <span class="muted">Page <?= $pagination['page'] ?> of <?= $pagination['pages'] ?></span>
    <a class="btn btn-secondary btn-sm"
       href="<?= $pagination['page'] < $pagination['pages'] ? View::e($qs($pagination['page'] + 1)) : '#' ?>">Next →</a>
  </div>
<?php endif; ?>
