// Confirm dialogs for destructive actions: any form with [data-confirm] asks before submitting.
document.addEventListener('submit', function (e) {
  var msg = e.target.getAttribute('data-confirm');
  if (msg && !confirm(msg)) {
    e.preventDefault();
  }
});

// Emoji quick-pick: clicking a button fills the sibling icon input.
document.querySelectorAll('.emoji-pick button').forEach(function (btn) {
  btn.addEventListener('click', function (e) {
    e.preventDefault();
    var target = document.getElementById(btn.dataset.target);
    if (target) target.value = btn.textContent;
  });
});

// Auto-slug: category "name" field fills "slug" until the user edits slug directly.
(function () {
  var name = document.getElementById('name');
  var slug = document.getElementById('slug');
  if (!name || !slug) return;
  var slugTouched = slug.value.length > 0;
  slug.addEventListener('input', function () { slugTouched = true; });
  name.addEventListener('input', function () {
    if (slugTouched) return;
    slug.value = name.value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  });
})();

// Upload dropzone: click-to-pick or drag-and-drop, with an image preview.
(function () {
  var zone = document.getElementById('dropzone');
  var input = document.getElementById('image');
  var preview = document.getElementById('preview');
  if (!zone || !input) return;

  zone.addEventListener('click', function () { input.click(); });
  input.addEventListener('change', function () { showPreview(input.files[0]); });

  ['dragover', 'dragleave', 'drop'].forEach(function (evt) {
    zone.addEventListener(evt, function (e) {
      e.preventDefault();
      zone.classList.toggle('dragover', evt === 'dragover');
    });
  });
  zone.addEventListener('drop', function (e) {
    if (e.dataTransfer.files.length) {
      input.files = e.dataTransfer.files;
      showPreview(e.dataTransfer.files[0]);
    }
  });

  function showPreview(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      preview.src = e.target.result;
      preview.hidden = false;
    };
    reader.readAsDataURL(file);
  }
})();

// Source select on the upload form: only show photographer fields for pexels/unsplash.
(function () {
  var source = document.getElementById('source');
  var attribution = document.getElementById('attribution-fields');
  if (!source || !attribution) return;
  function toggle() { attribution.hidden = source.value === 'own'; }
  source.addEventListener('change', toggle);
  toggle();
})();

// Bulk-select checkboxes on the wallpapers list: toggle the "Delete Selected" button.
(function () {
  var selectAll = document.getElementById('select-all');
  var boxes = document.querySelectorAll('.row-check');
  var bulkBtn = document.getElementById('bulk-delete-btn');
  var countEl = document.getElementById('bulk-count');
  if (!bulkBtn) return;

  function update() {
    var checked = document.querySelectorAll('.row-check:checked');
    bulkBtn.disabled = checked.length === 0;
    if (countEl) countEl.textContent = checked.length;
    var ids = Array.prototype.map.call(checked, function (b) { return b.value; });
    document.getElementById('bulk-ids').value = JSON.stringify(ids);
  }
  if (selectAll) {
    selectAll.addEventListener('change', function () {
      boxes.forEach(function (b) { b.checked = selectAll.checked; });
      update();
    });
  }
  boxes.forEach(function (b) { b.addEventListener('change', update); });
  update();
})();
