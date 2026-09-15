<?php
/** @var array $prompts */
use App\Support\View;
?>
<div class="page-header">
  <h1>AI Prompt Controls</h1>
</div>

<form method="post" action="/admin/multistocks/prompts" class="card" style="max-width:720px;">
  <div class="field">
    <label for="portfolio_prompt">Portfolio analysis prompt</label>
    <textarea id="portfolio_prompt" name="portfolio_prompt" rows="8" style="min-height:160px;"><?= View::e($prompts['portfolio_prompt']) ?></textarea>
  </div>
  <div class="field">
    <label for="chat_prompt">Chat advisor prompt</label>
    <textarea id="chat_prompt" name="chat_prompt" rows="8" style="min-height:160px;"><?= View::e($prompts['chat_prompt']) ?></textarea>
  </div>
  <button class="btn" type="submit">Save prompts</button>
</form>
