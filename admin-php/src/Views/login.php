<?php
/** @var array|null $flash */
use App\Support\View;
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= View::e($_ENV['APP_NAME'] ?? 'Admin') ?> — Login</title>
  <link rel="stylesheet" href="/assets/style.css">
</head>
<body class="login-page">
  <div class="card login-card">
    <div class="login-logo">🛠️</div>
    <h1>Super Admin</h1>
    <p class="muted">Sign in to manage your apps</p>

    <?php if ($flash): ?>
      <div class="alert alert-<?= View::e($flash['type']) ?>"><?= View::e($flash['message']) ?></div>
    <?php endif; ?>

    <form method="post" action="/admin/login">
      <div class="field">
        <label for="email">Email</label>
        <input id="email" name="email" type="email" required autofocus>
      </div>
      <div class="field">
        <label for="password">Password</label>
        <input id="password" name="password" type="password" required>
      </div>
      <button class="btn" type="submit" style="width:100%;">Log in</button>
    </form>
  </div>
</body>
</html>
