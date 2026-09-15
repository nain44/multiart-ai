<?php
/** @var array $settings
 *  @var array $logs */
use App\Support\View;
?>
<div class="page-header">
  <h1>Keys &amp; System Logs</h1>
</div>

<div class="grid grid-2" style="align-items:start;">
  <div style="display:flex; flex-direction:column; gap:20px;">
    <div class="card">
      <h2>AI Provider Keys</h2>
      <p class="muted" style="margin-top:-6px;">
        Gemini: <?= !empty($settings['has_gemini']) ? '✅ Active' : '⚠️ Missing' ?> ·
        OpenAI: <?= !empty($settings['has_openai']) ? '✅ Active' : '⚠️ Missing' ?>
      </p>
      <form method="post" action="/admin/multistocks/settings/keys">
        <div class="field">
          <label for="gemini_key">Gemini API key</label>
          <input id="gemini_key" name="gemini_key" type="password" placeholder="Leave blank to keep unchanged">
        </div>
        <div class="field">
          <label for="openai_key">OpenAI API key</label>
          <input id="openai_key" name="openai_key" type="password" placeholder="Leave blank to keep unchanged">
        </div>
        <button class="btn" type="submit">Save keys</button>
      </form>
    </div>

    <div class="card">
      <h2>Mobile API Endpoint</h2>
      <form method="post" action="/admin/multistocks/settings/mobile-url">
        <div class="field">
          <label for="mobile_api_url">Endpoint URL</label>
          <input id="mobile_api_url" name="mobile_api_url" value="<?= View::e($settings['mobile_api_url'] ?? '') ?>" placeholder="https://...">
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-secondary" type="button" id="test-connection-btn">Test connection</button>
          <button class="btn" type="submit">Save</button>
        </div>
        <span id="test-connection-result" class="muted" style="display:block; margin-top:8px; font-size:13px;"></span>
      </form>
    </div>

    <div class="card">
      <h2>Ad Mode</h2>
      <form method="post" action="/admin/multistocks/settings/ads">
        <div class="field">
          <label for="use_test_ads">AdMob mode</label>
          <select id="use_test_ads" name="use_test_ads">
            <option value="true" <?= !empty($settings['use_test_ads']) ? 'selected' : '' ?>>Test ads</option>
            <option value="false" <?= empty($settings['use_test_ads']) ? 'selected' : '' ?>>Production ads</option>
          </select>
        </div>
        <button class="btn" type="submit">Save</button>
      </form>
    </div>
  </div>

  <div class="card">
    <h2>System Logs</h2>
    <div id="log-terminal" style="background:#000; border-radius:8px; padding:12px; font-family:monospace; font-size:12px; height:420px; overflow-y:auto;">
      <?php foreach ($logs as $entry): ?>
        <div>[<?= View::e($entry['timestamp'] ?? '') ?>] <?= View::e($entry['message'] ?? '') ?></div>
      <?php endforeach; ?>
    </div>
  </div>
</div>

<script>
  (function () {
    var terminal = document.getElementById('log-terminal');
    function render(logs) {
      terminal.innerHTML = logs.map(function (e) {
        return '<div>[' + e.timestamp + '] ' + e.message.replace(/</g, '&lt;') + '</div>';
      }).join('');
      terminal.scrollTop = terminal.scrollHeight;
    }
    terminal.scrollTop = terminal.scrollHeight;
    setInterval(function () {
      fetch('/admin/multistocks/settings/logs')
        .then(function (r) { return r.json(); })
        .then(render)
        .catch(function () {});
    }, 4000);
  })();

  document.getElementById('test-connection-btn').addEventListener('click', function () {
    var url = document.getElementById('mobile_api_url').value.replace(/\/$/, '');
    var result = document.getElementById('test-connection-result');
    result.textContent = 'Testing…';
    fetch(url + '/api/settings')
      .then(function (r) { result.textContent = r.ok ? '✅ Reachable (' + r.status + ')' : '⚠️ Responded with ' + r.status; })
      .catch(function () { result.textContent = '❌ Could not reach that URL.'; });
  });
</script>
