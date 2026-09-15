<?php
/** @var array $wallpapers
 *  @var string $status */
use App\Support\View;
?>
<div class="page-header">
  <h1>AI Review Queue</h1>
</div>

<div class="tabs">
  <?php foreach (['pending' => 'Pending', 'approved' => 'Approved', 'rejected' => 'Rejected'] as $val => $label): ?>
    <a class="<?= $status === $val ? 'active' : '' ?>" href="/admin/wallpapers/ai-queue?status=<?= $val ?>"><?= $label ?></a>
  <?php endforeach; ?>
</div>

<?php if ($status === 'rejected' && !empty($wallpapers)): ?>
  <form method="post" action="/admin/wallpapers/ai-queue/clear-rejected"
        data-confirm="Permanently delete all <?= count($wallpapers) ?> rejected wallpaper(s)?" style="margin-bottom:16px;">
    <button class="btn btn-danger btn-sm" type="submit">Clear all (<?= count($wallpapers) ?>)</button>
  </form>
<?php endif; ?>

<?php if (empty($wallpapers)): ?>
  <div class="card empty-state">No <?= $status ?> submissions.</div>
<?php else: ?>
  <div class="ai-grid">
    <?php foreach ($wallpapers as $wp): ?>
      <div class="card ai-card">
        <img src="<?= View::e($wp['thumbnailUrl']) ?>" alt="<?= View::e($wp['title']) ?>">
        <div style="font-size:12px; margin-top:6px;"><?= View::e($wp['title']) ?></div>
        <div class="actions">
          <?php if ($status === 'pending'): ?>
            <form method="post" action="/admin/wallpapers/ai-queue/<?= View::e($wp['_id']) ?>/approve">
              <input type="hidden" name="status" value="<?= $status ?>">
              <button class="btn btn-sm" type="submit">✅ Approve</button>
            </form>
            <form method="post" action="/admin/wallpapers/ai-queue/<?= View::e($wp['_id']) ?>/approve">
              <input type="hidden" name="status" value="<?= $status ?>">
              <input type="hidden" name="feature" value="1">
              <button class="btn btn-sm btn-secondary" type="submit">📌 Approve &amp; Feature</button>
            </form>
            <form method="post" action="/admin/wallpapers/ai-queue/<?= View::e($wp['_id']) ?>/reject">
              <input type="hidden" name="status" value="<?= $status ?>">
              <button class="btn btn-sm btn-danger" type="submit">✕ Reject</button>
            </form>
          <?php elseif ($status === 'approved'): ?>
            <form method="post" action="/admin/wallpapers/ai-queue/<?= View::e($wp['_id']) ?>/reject">
              <input type="hidden" name="status" value="<?= $status ?>">
              <button class="btn btn-sm btn-secondary" type="submit">Revoke approval</button>
            </form>
          <?php else: ?>
            <form method="post" action="/admin/wallpapers/ai-queue/<?= View::e($wp['_id']) ?>/approve">
              <input type="hidden" name="status" value="<?= $status ?>">
              <button class="btn btn-sm" type="submit">Approve anyway</button>
            </form>
            <form method="post" action="/admin/wallpapers/ai-queue/<?= View::e($wp['_id']) ?>/approve">
              <input type="hidden" name="status" value="<?= $status ?>">
              <input type="hidden" name="feature" value="1">
              <button class="btn btn-sm btn-secondary" type="submit">📌 Approve &amp; Feature</button>
            </form>
            <form method="post" action="/admin/wallpapers/ai-queue/<?= View::e($wp['_id']) ?>/delete"
                  data-confirm="Permanently delete &quot;<?= View::e($wp['title']) ?>&quot;?">
              <input type="hidden" name="status" value="<?= $status ?>">
              <button class="btn btn-sm btn-danger" type="submit">🗑️ Delete</button>
            </form>
          <?php endif; ?>
        </div>
      </div>
    <?php endforeach; ?>
  </div>
<?php endif; ?>
