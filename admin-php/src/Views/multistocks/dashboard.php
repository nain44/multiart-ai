<?php
/** @var array $markets
 *  @var array $settings
 *  @var int $marketCount
 *  @var int $tickerCount
 *  @var string|null $error */
use App\Support\View;
?>
<div class="page-header">
  <h1>Dashboard</h1>
  <p class="muted">MultiStocks AI — AI-powered stock advisor.</p>
</div>

<?php if ($error): ?>
  <div class="alert alert-error">Couldn't reach the MultiStocks AI backend: <?= View::e($error) ?></div>
<?php endif; ?>

<div class="grid grid-4">
  <div class="card stat-card">
    <div class="stat-label">Gemini</div>
    <div class="stat-value" style="font-size:16px;"><?= !empty($settings['has_gemini']) ? '✅ Active' : '⚠️ Missing' ?></div>
  </div>
  <div class="card stat-card">
    <div class="stat-label">OpenAI</div>
    <div class="stat-value" style="font-size:16px;"><?= !empty($settings['has_openai']) ? '✅ Active' : '⚠️ Missing' ?></div>
  </div>
  <div class="card stat-card">
    <div class="stat-label">Markets</div>
    <div class="stat-value"><?= $marketCount ?></div>
  </div>
  <div class="card stat-card">
    <div class="stat-label">Watchlist tickers</div>
    <div class="stat-value"><?= $tickerCount ?></div>
  </div>
</div>

<h2 style="margin-top:28px;">Markets</h2>
<?php if (empty($markets)): ?>
  <div class="card empty-state">No markets configured yet.</div>
<?php else: ?>
  <div class="grid grid-3">
    <?php foreach ($markets as $code => $m): ?>
      <div class="card">
        <div style="font-size:22px;"><?= $m['flag'] ?? '' ?></div>
        <div style="font-weight:700; margin-top:6px;"><?= View::e($m['name'] ?? $code) ?> (<?= View::e($code) ?>)</div>
        <div class="muted" style="font-size:13px;"><?= View::e($m['subtitle'] ?? '') ?></div>
        <div style="margin-top:8px; display:flex; flex-wrap:wrap; gap:4px;">
          <?php foreach (($m['watchlist'] ?? []) as $t): ?>
            <span class="tag" style="background:var(--surface2); border:1px solid var(--border); border-radius:99px; padding:2px 8px; font-size:11px;"><?= View::e($t) ?></span>
          <?php endforeach; ?>
        </div>
      </div>
    <?php endforeach; ?>
  </div>
<?php endif; ?>
