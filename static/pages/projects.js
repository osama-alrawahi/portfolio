// Projects page: search, tag filter, sort, details modal, statistics
(function () {
  const { $, esc, norm, isLink, dateValue, prettyDate, imgFrame, byNewest } = Site;
  const items = typeof PROJECTS !== 'undefined' ? PROJECTS : [];
  const activeTags = new Set(['All']);
  let filtered = [];

  const chips = Site.tagChips($('tagButtons'), Site.tagList(items, typeof PROJECT_TAGS !== 'undefined' ? PROJECT_TAGS : null), activeTags, apply);

  function apply() {
    const q = norm($('searchInput').value);
    const sort = $('sortSelect').value;
    const tags = [...activeTags].filter((t) => t !== 'All');

    filtered = items.filter((p) =>
      (!tags.length || tags.some((t) => (p.tags || []).includes(t))) &&
      (!q || norm(p.title).includes(q) || norm(p.description).includes(q))
    );

    if (sort === 'oldest') filtered.sort((a, b) => dateValue(a.date) - dateValue(b.date));
    else if (sort === 'title') filtered.sort((a, b) => norm(a.title).localeCompare(norm(b.title)));
    else filtered.sort(byNewest);

    $('resultCount').textContent = `${filtered.length} result${filtered.length === 1 ? '' : 's'}`;
    $('activeFilters').textContent = tags.length ? `Tags: ${tags.join(', ')}` : '';
    render();
    if ($('statsModal').classList.contains('is-open')) drawChart();
  }

  function render() {
    $('emptyState').classList.toggle('hidden', filtered.length > 0);
    $('grid').innerHTML = filtered.map((p) => {
      const icon = p.icon || 'fa-solid fa-code';
      const tags = p.tags || [];
      return `
        <a href="#project-${p.id}" class="glass tech-border rounded-2xl overflow-hidden card-link flex flex-col">
          ${imgFrame(p.image, p.title, 'h-48', icon)}
          <div class="p-5 flex-1 flex flex-col">
            <h2 class="text-lg font-bold text-white mb-2 flex items-start gap-2">
              <i class="${esc(icon)} text-space-accent mt-1"></i><span>${esc(p.title)}</span>
            </h2>
            ${p.badge ? `<div class="mb-3"><span class="badge badge-${esc(p.badgeColor || 'gray')}">${esc(p.badge)}</span></div>` : ''}
            <p class="text-sm text-gray-400 mb-3 line-clamp-2">${esc(p.description)}</p>
            <div class="flex flex-wrap gap-1.5 mb-3">
              ${tags.slice(0, 3).map((t) => `<span class="chip">${esc(t)}</span>`).join('')}
              ${tags.length > 3 ? `<span class="chip chip-muted">+${tags.length - 3}</span>` : ''}
            </div>
            <div class="mt-auto text-xs text-gray-500 font-mono">${esc(prettyDate(p.date))}</div>
          </div>
        </a>`;
    }).join('');
  }

  function openProject(id) {
    const p = items.find((x) => x.id === id);
    if (!p) return;
    $('pmTitle').textContent = p.title;
    $('pmMeta').innerHTML = `<span class="font-mono">${esc(prettyDate(p.date))}</span>` +
      (p.badge ? `<span class="badge badge-${esc(p.badgeColor || 'gray')}">${esc(p.badge)}</span>` : '');
    $('pmImage').innerHTML = imgFrame(p.image, p.title, 'rounded-lg aspect-video', p.icon);
    $('pmDescription').textContent = p.description || '';
    $('pmStack').innerHTML = (p.stack || []).map((t) => `<span class="chip text-sm px-3 py-1">${esc(t)}</span>`).join('');

    [['pmDemo', p.demoUrl], ['pmCode', p.codeUrl]].forEach(([id, url]) => {
      $(id).classList.toggle('hidden', !isLink(url));
      $(id).href = isLink(url) ? url : '#';
    });
    Site.openModal($('projectModal'));
  }

  function drawChart() {
    Site.renderStatsChart($('statsChart'), filtered, $('chartType').value, 'Projects', activeTags);
  }

  function clearFilters() {
    $('searchInput').value = '';
    $('sortSelect').value = 'newest';
    chips.reset();
    apply();
  }

  $('searchInput').addEventListener('input', apply);
  $('sortSelect').addEventListener('change', apply);
  $('clearBtn').addEventListener('click', clearFilters);
  document.querySelector('[data-clear-filters]').addEventListener('click', clearFilters);
  $('statsBtn').addEventListener('click', () => { Site.openModal($('statsModal')); drawChart(); });
  $('chartType').addEventListener('change', drawChart);

  apply();
  Site.hashRoute('project', openProject);
})();
