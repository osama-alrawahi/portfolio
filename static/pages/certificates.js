// Certificates page: search, tag + year filter, grid/timeline, viewer, statistics
(function () {
  const { $, esc, norm, asset, yearOf, dateValue, prettyDate, imgFrame, byNewest } = Site;
  const items = typeof CERTIFICATES !== 'undefined' ? CERTIFICATES : [];
  const activeTags = new Set(['All']);
  let view = 'grid';
  let filtered = [];

  const chips = Site.tagChips($('tagButtons'), Site.tagList(items, typeof CERTIFICATE_TAGS !== 'undefined' ? CERTIFICATE_TAGS : null), activeTags, apply);

  // Year options from the data
  [...new Set(items.map((c) => yearOf(c.date)).filter(Boolean))]
    .sort((a, b) => b - a)
    .forEach((y) => $('yearSelect').insertAdjacentHTML('beforeend', `<option value="${y}">${y}</option>`));

  const tagBadges = (c) => (c.tags || []).map((t) => `<span class="chip chip-muted">${esc(t)}</span>`).join('');
  const awardBadge = (c) => (c.award ? `<span class="cert-badge ${esc(c.awardLevel || 'silver')}">${esc(c.award)}</span>` : '');
  const viewHint = `<span class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
      <span class="px-4 py-2 rounded-full border border-space-accent text-space-accent bg-black/50 font-bold"><i class="fa-solid fa-magnifying-glass-plus"></i> View</span>
    </span>`;

  function apply() {
    const q = norm($('searchInput').value);
    const year = $('yearSelect').value;
    const sort = $('sortSelect').value;
    const tags = [...activeTags].filter((t) => t !== 'All');

    filtered = items.filter((c) =>
      (!q || norm(c.title).includes(q) || norm(c.organization).includes(q)) &&
      (!tags.length || tags.some((t) => (c.tags || []).includes(t))) &&
      (year === 'all' || yearOf(c.date) === year)
    );

    if (sort === 'oldest') filtered.sort((a, b) => dateValue(a.date) - dateValue(b.date));
    else if (sort === 'title') filtered.sort((a, b) => norm(a.title).localeCompare(norm(b.title)));
    else filtered.sort(byNewest);

    const active = [];
    if (tags.length) active.push(`Tags: ${tags.join(', ')}`);
    if (year !== 'all') active.push(`Year: ${year}`);
    $('activeFilters').textContent = active.join(' · ');
    $('resultCount').textContent = `${filtered.length} result${filtered.length === 1 ? '' : 's'}`;

    render();
    if ($('statsModal').classList.contains('is-open')) drawChart();
  }

  function render() {
    const empty = !filtered.length;
    $('emptyState').classList.toggle('hidden', !empty);
    $('grid').classList.toggle('hidden', view !== 'grid' || empty);
    $('timeline').classList.toggle('hidden', view !== 'timeline' || empty);
    if (view === 'grid') renderGrid(); else renderTimeline();
  }

  function renderGrid() {
    $('grid').innerHTML = filtered.map((c) => `
      <a href="#cert-${c.id}" class="glass tech-border rounded-2xl overflow-hidden flex flex-col group card-link">
        <div class="relative">${imgFrame(c.image, c.title, 'h-48', 'fa-solid fa-award')}${viewHint}</div>
        <div class="p-5 flex-1 flex flex-col gap-3">
          <div class="flex items-start justify-between gap-3">
            <h2 class="text-lg font-bold text-white leading-snug">${esc(c.title)}</h2>
            <span class="text-xs font-mono text-space-accent bg-space-accent/10 px-2 py-1 rounded">${esc(yearOf(c.date) || '—')}</span>
          </div>
          ${c.award ? `<div>${awardBadge(c)}</div>` : ''}
          <p class="text-sm text-gray-400"><i class="fa-regular fa-calendar mr-2"></i>${esc(prettyDate(c.date))}</p>
          ${c.organization ? `<p class="text-sm text-gray-500"><i class="fa-regular fa-building mr-2"></i>${esc(c.organization)}</p>` : ''}
          <div class="flex flex-wrap gap-2 mt-auto">${tagBadges(c)}</div>
        </div>
      </a>`).join('');
  }

  function renderTimeline() {
    const groups = new Map();
    filtered.forEach((c) => {
      const y = yearOf(c.date) || '—';
      if (!groups.has(y)) groups.set(y, []);
      groups.get(y).push(c);
    });
    const sortDir = $('sortSelect').value === 'oldest' ? 1 : -1;
    const years = [...groups.keys()].sort((a, b) => (a === '—') - (b === '—') || sortDir * (a - b));

    $('timeline').innerHTML = years.map((year, i) => {
      const list = groups.get(year);
      return `
        <div class="tl-item ${i % 2 ? 'tl-right' : 'tl-left'}">
          <div class="glass tech-border rounded-2xl p-5 md:p-6">
            <div class="flex items-center justify-between gap-3">
              <h2 class="text-2xl font-extrabold text-white">${esc(year)}</h2>
              <span class="text-xs font-mono text-space-accent bg-space-accent/10 px-2 py-1 rounded">${list.length} item${list.length === 1 ? '' : 's'}</span>
            </div>
            ${list.map((c) => `
              <div class="mt-5">
                <p class="text-sm text-gray-400"><i class="fa-regular fa-calendar mr-2"></i>${esc(prettyDate(c.date))}</p>
                <h3 class="mt-1 font-bold text-white">${esc(c.title)} ${awardBadge(c)}</h3>
                <a href="#cert-${c.id}" class="mt-3 block relative rounded-xl overflow-hidden group" aria-label="View ${esc(c.title)}">
                  ${imgFrame(c.image, c.title, 'h-56', 'fa-solid fa-award')}${viewHint}
                </a>
                <div class="mt-3 flex flex-wrap gap-2">${tagBadges(c)}</div>
              </div>`).join('')}
          </div>
        </div>`;
    }).join('');
  }

  function openCert(id) {
    const c = items.find((x) => x.id === id);
    if (!c) return;
    $('cmTitle').innerHTML = `${esc(c.title)} ${awardBadge(c)}`;
    $('cmMeta').textContent = [prettyDate(c.date), c.organization].filter(Boolean).join(' · ');
    $('cmTags').innerHTML = tagBadges(c);
    $('cmOpen').href = asset(c.image);
    $('cmImage').innerHTML = imgFrame(c.image, c.title, 'contain rounded-xl', 'fa-solid fa-award');
    Site.openModal($('certModal'));
  }

  function setView(next) {
    view = next;
    $('gridViewBtn').setAttribute('aria-pressed', view === 'grid');
    $('timelineViewBtn').setAttribute('aria-pressed', view === 'timeline');
    render();
  }

  function drawChart() {
    Site.renderStatsChart($('statsChart'), filtered, $('chartType').value, 'Certificates', activeTags);
  }

  function clearFilters() {
    $('searchInput').value = '';
    $('yearSelect').value = 'all';
    $('sortSelect').value = 'newest';
    chips.reset();
    apply();
  }

  $('searchInput').addEventListener('input', apply);
  $('yearSelect').addEventListener('change', apply);
  $('sortSelect').addEventListener('change', apply);
  $('gridViewBtn').addEventListener('click', () => setView('grid'));
  $('timelineViewBtn').addEventListener('click', () => setView('timeline'));
  $('clearBtn').addEventListener('click', clearFilters);
  document.querySelector('[data-clear-filters]').addEventListener('click', clearFilters);
  $('statsBtn').addEventListener('click', () => { Site.openModal($('statsModal')); drawChart(); });
  $('chartType').addEventListener('change', drawChart);

  apply();
  Site.hashRoute('cert', openCert);
})();
