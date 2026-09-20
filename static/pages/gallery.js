// Gallery page: search, category filter, photo viewer
(function () {
  const { $, esc, norm, imgFrame } = Site;
  const loaded = typeof GALLERY_ITEMS !== 'undefined';
  const items = loaded ? GALLERY_ITEMS : [];

  const label = (value) => {
    const known = typeof GALLERY_CATEGORIES !== 'undefined' && GALLERY_CATEGORIES.find((c) => c.value === value);
    return known ? known.label : value.charAt(0).toUpperCase() + value.slice(1);
  };

  // Categories: configured ones that are in use, plus any new ones found in the data
  const used = [...new Set(items.map((i) => i.category).filter(Boolean))];
  const configured = typeof GALLERY_CATEGORIES !== 'undefined' ? GALLERY_CATEGORIES.map((c) => c.value).filter((v) => v !== 'all') : [];
  const categories = [...configured.filter((v) => used.includes(v)), ...used.filter((v) => !configured.includes(v))];
  $('categorySelect').innerHTML = `<option value="all">All categories</option>` +
    categories.map((c) => `<option value="${esc(c)}">${esc(label(c))}</option>`).join('');

  function apply() {
    const q = norm($('searchInput').value);
    const cat = $('categorySelect').value;
    const list = items.filter((i) =>
      (cat === 'all' || i.category === cat) &&
      (!q || norm(i.title).includes(q) || norm(i.description).includes(q))
    );

    $('resultCount').textContent = `${list.length} image${list.length === 1 ? '' : 's'}`;
    $('emptyState').classList.toggle('hidden', list.length > 0);
    $('gallery').innerHTML = list.map((i) => `
      <a href="#photo-${i.id}" class="gallery-item glass tech-border">
        ${imgFrame(i.image, i.title, 'w-full h-full', 'fa-solid fa-image')}
        <div class="gallery-overlay">
          <div>
            <p class="text-white font-bold text-sm">${esc(i.title)}</p>
            <p class="text-space-accent text-xs uppercase">${esc(label(i.category || ''))}</p>
            ${i.date ? `<p class="text-gray-400 text-xs mt-1">${esc(i.date)}</p>` : ''}
          </div>
        </div>
      </a>`).join('');
  }

  function openPhoto(id) {
    const i = items.find((x) => x.id === id);
    if (!i) return;
    $('phImage').innerHTML = imgFrame(i.image, i.title, 'contain rounded-lg', 'fa-solid fa-image');
    $('phTitle').textContent = i.title;
    $('phCategory').textContent = label(i.category || '');
    $('phDescription').textContent = i.description || '';
    $('phDate').textContent = i.date || '';
    Site.openModal($('photoModal'));
  }

  function clearFilters() {
    $('searchInput').value = '';
    $('categorySelect').value = 'all';
    apply();
  }

  if (!loaded) {
    $('emptyTitle').textContent = 'Gallery data could not be loaded';
    $('emptyText').innerHTML = 'Check that <code>data/gallery.js</code> exists next to the <code>template</code> folder.';
    document.querySelector('[data-clear-filters]').remove();
    $('emptyState').classList.remove('hidden');
    return;
  }

  $('searchInput').addEventListener('input', apply);
  $('categorySelect').addEventListener('change', apply);
  $('clearBtn').addEventListener('click', clearFilters);
  document.querySelector('[data-clear-filters]').addEventListener('click', clearFilters);

  apply();
  Site.hashRoute('photo', openPhoto);
})();
