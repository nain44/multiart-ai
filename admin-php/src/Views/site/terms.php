<?php
$sections = [
    ['title' => '1. Acceptance of Terms', 'html' => '<p>By accessing or using MultiArt AI (the "Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>'],
    ['title' => '2. Service Description', 'html' => '<p>MultiArt AI provides a collection of free and premium digital wallpaper images for personal, non-commercial use on mobile and desktop devices. The Service is accessible via our website and mobile applications.</p>'],
    ['title' => '3. License to Use Wallpapers', 'html' => '
      <p><strong style="color:var(--text);">Free wallpapers</strong> may be downloaded and used as device wallpapers for personal use at no cost.</p>
      <p style="margin-top:12px;"><strong style="color:var(--text);">Attribution:</strong> For wallpapers sourced from Pexels or Unsplash, attribution is displayed within the app. You may not remove attribution metadata when redistributing images.</p>
      <p style="margin-top:12px;">You may <strong style="color:var(--text);">not</strong>:</p>
      <ul style="padding-left:20px; margin-top:8px;">
        <li>Redistribute or resell MultiArt AI wallpapers as your own</li>
        <li>Use wallpapers for commercial purposes without explicit permission</li>
        <li>Claim ownership of any MultiArt AI-hosted wallpaper</li>
        <li>Scrape or bulk-download wallpapers via automated means</li>
      </ul>'],
    ['title' => '4. User Conduct', 'html' => '
      <p>You agree to use the Service only for lawful purposes and in a way that does not infringe the rights of others. You agree not to:</p>
      <ul style="padding-left:20px; margin-top:8px;">
        <li>Attempt to gain unauthorized access to the Service\'s systems</li>
        <li>Interfere with or disrupt the integrity or performance of the Service</li>
        <li>Upload or transmit malicious code or harmful content</li>
        <li>Use any robot, spider, or automated tool to access the Service</li>
      </ul>'],
    ['title' => '5. Intellectual Property', 'html' => '
      <p>All original content created by MultiArt AI, including but not limited to artwork, user interface design, logos, and related materials, is owned by MultiArt AI and protected by intellectual property laws.</p>
      <p style="margin-top:12px;">Third-party images sourced from Pexels and Unsplash remain the property of their respective creators and are used under their respective API licenses.</p>'],
    ['title' => '6. Disclaimer of Warranties', 'html' => '
      <p>The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. MultiArt AI does not warrant that:</p>
      <ul style="padding-left:20px; margin-top:8px;">
        <li>The Service will be uninterrupted or error-free</li>
        <li>Any defects will be corrected</li>
        <li>The Service is free of viruses or other harmful components</li>
      </ul>'],
    ['title' => '7. Limitation of Liability', 'html' => '<p>To the maximum extent permitted by applicable law, MultiArt AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of data, arising from your use of the Service.</p>'],
    ['title' => '8. Termination', 'html' => '<p>We reserve the right to terminate or suspend access to the Service immediately, without prior notice, for any breach of these Terms of Service.</p>'],
    ['title' => '9. Changes to Terms', 'html' => '<p>We may modify these Terms at any time. We will indicate the date of the last update at the top of this page. Your continued use of the Service after any changes constitutes your acceptance of the new Terms.</p>'],
    ['title' => '10. Governing Law', 'html' => '<p>These Terms shall be governed by and construed in accordance with applicable laws. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts in the applicable territory.</p>'],
    ['title' => '11. Contact', 'html' => '<p>For any questions about these Terms of Service, please contact us at: <a href="mailto:legal@multiartai.app" style="color:#a78bfa;">legal@multiartai.app</a></p>'],
];
?>
<div class="legal">
  <a href="/" class="muted" style="font-size:14px;">← Back to Home</a>
  <h1 class="gradient-text" style="margin-top:16px;">Terms of Service</h1>
  <p class="muted" style="margin-bottom:40px;">Last updated: April 18, 2025</p>

  <?php foreach ($sections as $s): ?>
    <section style="margin-bottom:36px;">
      <h2 style="color:#d4d0ff; padding-bottom:10px; border-bottom:1px solid var(--border);"><?= htmlspecialchars($s['title']) ?></h2>
      <div><?= $s['html'] ?></div>
    </section>
  <?php endforeach; ?>

  <div style="display:flex; gap:16px; margin-top:60px; padding-top:32px; border-top:1px solid var(--border); flex-wrap:wrap;">
    <a href="/privacy-policy" class="muted" style="font-size:14px;">Privacy Policy</a>
    <a href="/wallpapers" class="muted" style="font-size:14px;">Browse Wallpapers</a>
    <a href="/" class="muted" style="font-size:14px;">Home</a>
  </div>
</div>
