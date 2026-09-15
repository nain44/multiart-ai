<?php
/** @var array $fields
 *  @var array $settings */
use App\Support\View;
?>
<div class="page-header">
  <h1>Settings</h1>
</div>

<form method="post" action="/admin/wallpapers/settings" class="card" style="max-width:560px;">
  <?php foreach ($fields as $key => $field): ?>
    <div class="field">
      <label for="<?= $key ?>"><?= View::e($field['label']) ?></label>
      <input id="<?= $key ?>" name="<?= $key ?>" type="number" min="1"
             value="<?= View::e($settings[$key] ?? (string) $field['default']) ?>">
      <p class="muted" style="font-size:12px; margin-top:4px;"><?= View::e($field['help']) ?></p>
    </div>
  <?php endforeach; ?>
  <button class="btn" type="submit">Save settings</button>
</form>
