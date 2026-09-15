<?php
/** @var array $markets
 *  @var string|null $selected */
use App\Support\View;
$active = $selected && isset($markets[$selected]) ? $markets[$selected] : null;
?>
<div class="page-header">
  <h1>Market Fetchers</h1>
</div>

<div class="grid grid-2" style="align-items:start;">
  <div class="card">
    <h2>Exchanges Control Board</h2>

    <form method="get" action="/admin/multistocks/fetchers" class="field">
      <label for="market-select">Active Market Segment</label>
      <select id="market-select" name="market" onchange="this.form.submit()">
        <?php foreach ($markets as $code => $m): ?>
          <option value="<?= View::e($code) ?>" <?= $code === $selected ? 'selected' : '' ?>>
            <?= $m['flag'] ?? '' ?> <?= View::e($m['name'] ?? $code) ?> (<?= View::e($code) ?>)
          </option>
        <?php endforeach; ?>
      </select>
    </form>

    <div style="display:flex; flex-direction:column; gap:10px; margin-top:20px;">
      <form method="post" action="/admin/multistocks/fetchers/trigger">
        <input type="hidden" name="market" value="<?= View::e($selected) ?>">
        <button class="btn" type="submit" style="width:100%;">Force Refresh Market Quotes</button>
      </form>

      <?php if ($active): ?>
        <form method="post" action="/admin/multistocks/fetchers/delete"
              data-confirm="Are you sure you want to delete <?= View::e($active['name'] ?? $selected) ?> (<?= View::e($selected) ?>)? This will remove all tickers and screens from the mobile app.">
          <input type="hidden" name="market" value="<?= View::e($selected) ?>">
          <button class="btn btn-danger" type="submit" style="width:100%;" <?= count($markets) <= 1 ? 'disabled' : '' ?>>🗑️ Delete Active Country</button>
        </form>
      <?php endif; ?>
    </div>

    <details style="margin-top:24px;">
      <summary style="cursor:pointer; font-weight:600;">➕ Add New Country</summary>
      <form method="post" action="/admin/multistocks/fetchers/add" style="margin-top:14px;">
        <div class="field"><label for="add-code">Code</label><input id="add-code" name="code" placeholder="e.g. SG" required></div>
        <div class="field"><label for="add-name">Name</label><input id="add-name" name="name" placeholder="e.g. Singapore" required></div>
        <div class="field"><label for="add-flag">Flag emoji</label><input id="add-flag" name="flag" placeholder="🇸🇬"></div>
        <div class="field"><label for="add-currency">Currency</label><input id="add-currency" name="currency" placeholder="S$"></div>
        <div class="field"><label for="add-ticker">Default ticker</label><input id="add-ticker" name="defaultTicker" placeholder="e.g. D05.SI"></div>
        <button class="btn" type="submit">Add country</button>
      </form>
    </details>
  </div>

  <?php if ($active): ?>
    <div class="card">
      <h2><?= $active['flag'] ?? '' ?> <?= View::e($active['name'] ?? $selected) ?></h2>

      <form method="post" action="/admin/multistocks/fetchers/save">
        <input type="hidden" name="market" value="<?= View::e($selected) ?>">
        <div class="field">
          <label for="subtitle">Subtitle</label>
          <input id="subtitle" name="subtitle" value="<?= View::e($active['subtitle'] ?? '') ?>">
        </div>
        <div class="form-row">
          <div class="field">
            <label for="currency">Currency</label>
            <input id="currency" name="currency" value="<?= View::e($active['currency'] ?? '') ?>">
          </div>
          <div class="field">
            <label for="defaultTicker">Default ticker</label>
            <input id="defaultTicker" name="defaultTicker" value="<?= View::e($active['defaultTicker'] ?? '') ?>">
          </div>
        </div>
        <div class="field">
          <label for="welcome">Chat welcome message</label>
          <textarea id="welcome" name="welcome"><?= View::e($active['welcome'] ?? '') ?></textarea>
        </div>
        <button class="btn" type="submit">Save Market Configuration</button>
      </form>

      <h3 style="margin-top:22px;">Watchlist</h3>
      <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:14px;">
        <?php foreach (($active['watchlist'] ?? []) as $ticker): ?>
          <form method="post" action="/admin/multistocks/fetchers/ticker/remove" style="display:inline;">
            <input type="hidden" name="market" value="<?= View::e($selected) ?>">
            <input type="hidden" name="ticker" value="<?= View::e($ticker) ?>">
            <button class="badge badge-not-featured" type="submit" title="Remove"><?= View::e($ticker) ?> ×</button>
          </form>
        <?php endforeach; ?>
        <?php if (empty($active['watchlist'])): ?>
          <span class="muted">No tickers in this watchlist yet.</span>
        <?php endif; ?>
      </div>
      <form method="post" action="/admin/multistocks/fetchers/ticker/add" class="form-row">
        <input type="hidden" name="market" value="<?= View::e($selected) ?>">
        <input type="text" name="ticker" placeholder="Add ticker (e.g. MEBL)" style="flex:1;">
        <button class="btn btn-secondary btn-sm" type="submit">Add</button>
      </form>
    </div>
  <?php endif; ?>
</div>
