// Data editor: CRUD for projects, certificates and gallery, with a browser draft,
// import of existing data files and export of new ones.
(function () {
  const { $, esc, norm, imgFrame, prettyDate, byNewest } = Site;
  const DRAFT_KEY = 'portfolio-editor-draft-v1';

  /* ---------------- Data set definitions ---------------- */
  const BADGE_COLORS = ['green', 'yellow', 'purple', 'blue', 'gray', 'red'];

  const SETS = {
    projects: {
      label: 'Projects', singular: 'project', file: 'projects.js',
      varName: 'PROJECTS', tagsVar: 'PROJECT_TAGS', folder: 'projects',
      fallbackIcon: 'fa-solid fa-code', compact: false,
      header: '// Projects Data\n// Fields: id, title, date ("YYYY-MM-DD", "YYYY" or "2025 - Now"), tags, stack, description,\n// image (path from site root), demoUrl, codeUrl ("#" = none), icon (Font Awesome class),\n// badge, badgeColor (green | yellow | purple | blue | gray | red), featured (shown on the home page)',
      tagsComment: '// Tags shown as filter buttons on the projects page ("All" is added automatically)',
      fields: [
        { name: 'title', label: 'Title', type: 'text', required: true, full: true },
        { name: 'date', label: 'Date', type: 'text', required: true, placeholder: '2026-05-12', hint: 'YYYY-MM-DD, a year (2019) or a range (2025 - Now).' },
        { name: 'icon', label: 'Icon', type: 'icon', placeholder: 'fa-solid fa-code', hint: 'Font Awesome 6 class, shown when there is no image.' },
        { name: 'description', label: 'Description', type: 'textarea', required: true, full: true },
        { name: 'tags', label: 'Tags', type: 'list', suggest: true, full: true, placeholder: 'AI, Web, Robotics' },
        { name: 'stack', label: 'Tech stack', type: 'list', full: true, placeholder: 'Python, Flask, PyTorch' },
        { name: 'image', label: 'Image', type: 'image', full: true },
        { name: 'demoUrl', label: 'Demo link', type: 'url', placeholder: 'https://…' },
        { name: 'codeUrl', label: 'Code link', type: 'url', placeholder: 'https://github.com/…' },
        { name: 'badge', label: 'Badge text', type: 'text', placeholder: 'Final Year Project' },
        { name: 'badgeColor', label: 'Badge color', type: 'select', options: BADGE_COLORS.map((c) => [c, c[0].toUpperCase() + c.slice(1)]) },
        { name: 'featured', label: 'Feature on the home page', type: 'checkbox', full: true, keepFalse: true }
      ]
    },
    certificates: {
      label: 'Certificates', singular: 'certificate', file: 'certificates.js',
      varName: 'CERTIFICATES', tagsVar: 'CERTIFICATE_TAGS', folder: 'certificates',
      fallbackIcon: 'fa-solid fa-award', compact: true,
      header: '// Certificates Data\n// Fields: id, title, date (YYYY-MM-DD), tags (array), image (path from site root), organization\n// Optional: featured (shown on the home page), award (e.g. "3rd Place"), awardLevel ("gold" | "silver" | "bronze")',
      tagsComment: '// Tags shown as filter buttons on the certificates page ("All" is added automatically)',
      fields: [
        { name: 'title', label: 'Title', type: 'text', required: true, full: true },
        { name: 'date', label: 'Date', type: 'date', required: true },
        { name: 'organization', label: 'Organization', type: 'text', required: true, placeholder: 'SQU, Coursera' },
        { name: 'tags', label: 'Tags', type: 'list', suggest: true, full: true, placeholder: 'Workshop, AI' },
        { name: 'image', label: 'Image', type: 'image', full: true },
        { name: 'award', label: 'Award', type: 'text', placeholder: '3rd Place' },
        { name: 'awardLevel', label: 'Award medal', type: 'select', options: [['', 'None'], ['gold', 'Gold'], ['silver', 'Silver'], ['bronze', 'Bronze']] },
        { name: 'featured', label: 'Feature on the home page', type: 'checkbox', full: true }
      ]
    },
    gallery: {
      label: 'Gallery', singular: 'photo', file: 'gallery.js',
      varName: 'GALLERY_ITEMS', catVar: 'GALLERY_CATEGORIES', folder: 'gallery',
      fallbackIcon: 'fa-solid fa-image', compact: false, ordered: true,
      header: '// Gallery Data\n// Fields: id, title, category, image (path from site root), date (free text), description\n// Photos are shown in the order of this list.',
      tagsComment: '// Categories for the filter dropdown ("All" is added automatically)',
      fields: [
        { name: 'title', label: 'Title', type: 'text', required: true, full: true },
        { name: 'category', label: 'Category', type: 'category', required: true, placeholder: 'competitions' },
        { name: 'date', label: 'Date', type: 'text', placeholder: '2024 or 2025 - 2026' },
        { name: 'image', label: 'Image', type: 'image', required: true, full: true },
        { name: 'description', label: 'Description', type: 'textarea', full: true }
      ]
    }
  };

  const DEFAULT_CATEGORIES = [
    { value: 'projects', label: 'Projects' },
    { value: 'competitions', label: 'Competitions' },
    { value: 'workshops', label: 'Workshops' },
    { value: 'events', label: 'Events' },
    { value: 'certificates', label: 'Certificates' }
  ];

  /* ---------------- State ---------------- */
  const clone = (v) => JSON.parse(JSON.stringify(v));
  const fromFiles = () => ({
    projects: clone(typeof PROJECTS !== 'undefined' ? PROJECTS : []),
    certificates: clone(typeof CERTIFICATES !== 'undefined' ? CERTIFICATES : []),
    gallery: clone(typeof GALLERY_ITEMS !== 'undefined' ? GALLERY_ITEMS : []),
    tags: {
      projects: clone(typeof PROJECT_TAGS !== 'undefined' ? PROJECT_TAGS : []).filter((t) => t !== 'All'),
      certificates: clone(typeof CERTIFICATE_TAGS !== 'undefined' ? CERTIFICATE_TAGS : []).filter((t) => t !== 'All')
    },
    categories: clone(typeof GALLERY_CATEGORIES !== 'undefined' ? GALLERY_CATEGORIES : DEFAULT_CATEGORIES).filter((c) => c.value !== 'all'),
    dirty: {}
  });

  let state = fromFiles();
  try {
    const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
    if (draft && draft.dirty && Object.values(draft.dirty).some(Boolean)) state = draft;
  } catch (e) { /* no draft */ }

  let tab = 'projects';
  let editingId = null;

  function persist() {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(state)); }
    catch (e) { toast('Could not save the draft in this browser — export soon to keep your changes.'); }
    renderBanner();
    renderTabs();
  }

  function markDirty(key) { state.dirty[key] = true; persist(); }

  /* ---------------- UI helpers ---------------- */
  let toastTimer;
  function toast(message) {
    const el = $('toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
  }

  const nextId = (list) => list.reduce((max, it) => Math.max(max, Number(it.id) || 0), 0) + 1;
  const usedTags = (key) => {
    const counts = new Map();
    state[key].forEach((it) => (it.tags || []).forEach((t) => counts.set(t, (counts.get(t) || 0) + 1)));
    return counts;
  };
  const categoryLabel = (value) => {
    const c = state.categories.find((x) => x.value === value);
    return c ? c.label : value;
  };

  /* ---------------- Rendering ---------------- */
  function renderTabs() {
    document.querySelectorAll('[data-tab]').forEach((btn) => {
      const key = btn.dataset.tab;
      const selected = key === tab;
      btn.setAttribute('aria-selected', selected);
      btn.innerHTML = `${SETS[key].label} <span class="ml-1 text-xs font-mono px-2 py-0.5 rounded-full bg-white/5">${state[key].length}</span>${state.dirty[key] ? ' <span class="text-space-accent" title="Unexported changes">●</span>' : ''}`;
    });
    const set = SETS[tab];
    $('addBtn').querySelector('span').textContent = `Add ${set.singular}`;
    $('searchInput').placeholder = `Search ${set.label.toLowerCase()}`;
    $('filterTagsBtn').classList.toggle('hidden', !set.tagsVar);
  }

  function renderBanner() {
    const dirty = Object.keys(SETS).filter((k) => state.dirty[k]);
    $('draftBanner').classList.toggle('hidden', !dirty.length);
    $('draftList').textContent = dirty.map((k) => SETS[k].label).join(', ');
  }

  function renderList() {
    const set = SETS[tab];
    const q = norm($('searchInput').value);
    let items = state[tab].map((it, index) => ({ it, index }));
    if (!set.ordered) items.sort((a, b) => byNewest(a.it, b.it));
    if (q) {
      items = items.filter(({ it }) => [it.title, it.organization, it.category, it.description, ...(it.tags || [])].some((v) => norm(v).includes(q)));
    }

    $('listEmpty').classList.toggle('hidden', items.length > 0);
    $('listEmpty').textContent = state[tab].length ? 'Nothing matches your search.' : `No ${set.label.toLowerCase()} yet — add the first one.`;

    $('list').innerHTML = items.map(({ it, index }) => {
      const meta = tab === 'gallery'
        ? `<span class="chip">${esc(categoryLabel(it.category || ''))}</span>`
        : (it.tags || []).slice(0, 3).map((t) => `<span class="chip">${esc(t)}</span>`).join('');
      const sub = [prettyDate(it.date), it.organization].filter(Boolean).join(' · ');
      const reorder = set.ordered && !q ? `
          <button type="button" class="icon-btn" data-action="up" data-id="${it.id}" aria-label="Move up"${index === 0 ? ' disabled style="opacity:.3"' : ''}><i class="fas fa-arrow-up"></i></button>
          <button type="button" class="icon-btn" data-action="down" data-id="${it.id}" aria-label="Move down"${index === state[tab].length - 1 ? ' disabled style="opacity:.3"' : ''}><i class="fas fa-arrow-down"></i></button>` : '';
      return `
        <article class="glass rounded-xl overflow-hidden flex flex-col">
          <div class="relative">
            ${imgFrame(it.image, it.title, tab === 'gallery' ? 'aspect-square' : 'h-36', it.icon || set.fallbackIcon)}
            ${it.featured ? '<span class="absolute top-2 left-2 badge badge-yellow"><i class="fas fa-star mr-1"></i>Home page</span>' : ''}
          </div>
          <div class="p-4 flex-1 flex flex-col gap-2">
            <h3 class="font-bold text-white leading-snug">${esc(it.title)}</h3>
            ${sub ? `<p class="text-xs text-gray-500">${esc(sub)}</p>` : ''}
            <div class="flex flex-wrap gap-1.5">${meta}</div>
            <div class="flex items-center justify-end gap-1 mt-auto pt-2 border-t border-gray-800">
              ${reorder}
              <button type="button" class="icon-btn" data-action="edit" data-id="${it.id}" aria-label="Edit ${esc(it.title)}"><i class="fas fa-pen"></i></button>
              <button type="button" class="icon-btn danger" data-action="delete" data-id="${it.id}" aria-label="Delete ${esc(it.title)}"><i class="fas fa-trash"></i></button>
            </div>
          </div>
        </article>`;
    }).join('');
  }

  function switchTab(key) {
    tab = key;
    $('searchInput').value = '';
    renderTabs();
    renderList();
  }

  /* ---------------- Form ---------------- */
  function fieldHtml(f, value) {
    const id = `f-${f.name}`;
    const req = f.required ? ' required' : '';
    const ph = f.placeholder ? ` placeholder="${esc(f.placeholder)}"` : '';
    const label = `<label for="${id}" class="label">${esc(f.label)}${f.required ? ' <span class="text-space-accent">*</span>' : ''}</label>`;
    const hint = f.hint ? `<p class="text-xs text-gray-500 mt-1">${esc(f.hint)}</p>` : '';
    const wrap = (inner) => `<div class="${f.full ? 'md:col-span-2' : ''}">${inner}</div>`;
    const v = value == null ? '' : value;

    switch (f.type) {
      case 'textarea':
        return wrap(`${label}<textarea id="${id}" name="${f.name}" rows="4" class="field"${req}${ph}>${esc(v)}</textarea>${hint}`);
      case 'select':
        return wrap(`${label}<select id="${id}" name="${f.name}" class="field">${f.options.map(([val, text]) =>
          `<option value="${esc(val)}"${val === v ? ' selected' : ''}>${esc(text)}</option>`).join('')}</select>${hint}`);
      case 'checkbox':
        return wrap(`<label class="flex items-center gap-3 cursor-pointer"><input type="checkbox" id="${id}" name="${f.name}" class="w-5 h-5 accent-cyan-400"${v ? ' checked' : ''}> <span>${esc(f.label)}</span></label>`);
      case 'list': {
        const text = Array.isArray(v) ? v.join(', ') : v;
        const suggestions = f.suggest ? [...usedTags(tab).keys()].sort((a, b) => a.localeCompare(b)) : [];
        return wrap(`${label}<input id="${id}" name="${f.name}" type="text" class="field" value="${esc(text)}"${ph}>
          <p class="text-xs text-gray-500 mt-1">Separate with commas.${suggestions.length ? ' Click a tag to add or remove it:' : ''}</p>
          ${suggestions.length ? `<div class="flex flex-wrap gap-1.5 mt-2 max-h-28 overflow-y-auto" data-suggest-for="${id}">
            ${suggestions.map((t) => `<button type="button" class="tag-chip !py-0.5 !px-2.5 !text-xs" data-suggest="${esc(t)}">${esc(t)}</button>`).join('')}
          </div>` : ''}`);
      }
      case 'category':
        return wrap(`${label}<input id="${id}" name="${f.name}" type="text" list="categoryOptions" class="field" value="${esc(v)}"${req}${ph}>
          <datalist id="categoryOptions">${state.categories.map((c) => `<option value="${esc(c.value)}">${esc(c.label)}</option>`).join('')}</datalist>
          <p class="text-xs text-gray-500 mt-1">Pick one or type a new category (lowercase).</p>`);
      case 'icon':
        return wrap(`${label}<div class="flex gap-2 items-center"><input id="${id}" name="${f.name}" type="text" class="field" value="${esc(v)}"${ph}>
          <span class="w-12 h-12 flex-shrink-0 rounded-lg bg-space-accent/10 text-space-accent flex items-center justify-center text-xl"><i id="iconPreview" class="${esc(v || f.placeholder)}"></i></span></div>${hint}`);
      case 'image':
        return wrap(`${label}
          <div class="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
            <input id="${id}" name="${f.name}" type="text" class="field" value="${esc(v)}" placeholder="images/${SETS[tab].folder}/photo.jpg"${req}>
            <label class="btn btn-ghost cursor-pointer"><i class="fas fa-folder-open"></i> Choose file
              <input type="file" accept="image/*" class="sr-only" id="imagePicker"></label>
          </div>
          <p id="imageHint" class="text-xs text-gray-500 mt-1">Path from the site root. Choosing a file fills the path — then copy the file into <code>images/${SETS[tab].folder}/</code>.</p>
          <div id="imagePreview" class="mt-3 max-w-xs"></div>`);
      case 'date':
        return wrap(`${label}<input id="${id}" name="${f.name}" type="date" class="field" value="${esc(v)}"${req}>${hint}`);
      default:
        return wrap(`${label}<input id="${id}" name="${f.name}" type="text" inputmode="${f.type === 'url' ? 'url' : 'text'}" class="field" value="${esc(v === '#' ? '' : v)}"${req}${ph}>${hint}`);
    }
  }

  function updateImagePreview(src) {
    $('imagePreview').innerHTML = src ? imgFrame(src, 'Preview', 'rounded-lg h-40', SETS[tab].fallbackIcon) : '';
  }

  function syncSuggestions(input) {
    const box = document.querySelector(`[data-suggest-for="${input.id}"]`);
    if (!box) return;
    const current = input.value.split(',').map((s) => s.trim()).filter(Boolean);
    box.querySelectorAll('[data-suggest]').forEach((b) => b.setAttribute('aria-pressed', current.includes(b.dataset.suggest)));
  }

  function openForm(id) {
    const set = SETS[tab];
    const item = id == null ? null : state[tab].find((x) => x.id === id);
    editingId = item ? item.id : null;

    const defaults = { badgeColor: 'gray' };
    $('formTitle').textContent = item ? `Edit ${set.singular}` : `Add ${set.singular}`;
    $('saveBtn').textContent = item ? 'Save changes' : `Add ${set.singular}`;
    $('formFields').innerHTML = set.fields.map((f) => fieldHtml(f, item ? item[f.name] : defaults[f.name])).join('');

    const form = $('itemForm');
    const image = form.elements.image;
    if (image) {
      updateImagePreview(image.value.trim());
      image.addEventListener('input', () => updateImagePreview(image.value.trim()));
      $('imagePicker').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        image.value = `images/${set.folder}/${file.name}`;
        updateImagePreview(URL.createObjectURL(file));
        $('imageHint').innerHTML = `Remember to copy <code class="text-space-accent">${esc(file.name)}</code> into <code>images/${set.folder}/</code>.`;
      });
    }
    const icon = form.elements.icon;
    if (icon) icon.addEventListener('input', () => { $('iconPreview').className = icon.value.trim() || 'fa-solid fa-code'; });

    form.querySelectorAll('[data-suggest-for]').forEach((box) => {
      const input = $(box.dataset.suggestFor);
      syncSuggestions(input);
      input.addEventListener('input', () => syncSuggestions(input));
      box.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-suggest]');
        if (!btn) return;
        const list = input.value.split(',').map((s) => s.trim()).filter(Boolean);
        const tag = btn.dataset.suggest;
        input.value = (list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag]).join(', ');
        syncSuggestions(input);
      });
    });

    Site.openModal($('formModal'));
    setTimeout(() => form.elements.title.focus(), 50);
  }

  function readForm() {
    const form = $('itemForm');
    const out = {};
    SETS[tab].fields.forEach((f) => {
      const el = form.elements[f.name];
      if (f.type === 'checkbox') out[f.name] = el.checked;
      else if (f.type === 'list') out[f.name] = el.value.split(',').map((s) => s.trim()).filter(Boolean);
      else if (f.type === 'url') out[f.name] = el.value.trim() || '#';
      else if (f.type === 'category') out[f.name] = el.value.trim().toLowerCase();
      else out[f.name] = el.value.trim();
    });
    return out;
  }

  function saveForm(e) {
    e.preventDefault();
    const form = $('itemForm');
    const invalid = [...form.querySelectorAll('[required]')].find((el) => !el.value.trim());
    if (invalid) {
      invalid.focus();
      invalid.classList.add('!border-red-400');
      toast('Fill in the required fields marked *.');
      return;
    }

    const set = SETS[tab];
    const values = readForm();
    const list = state[tab];
    const existing = editingId != null ? list.find((x) => x.id === editingId) : null;
    const item = existing ? existing : { id: nextId(list) };

    set.fields.forEach((f) => {
      const v = values[f.name];
      const empty = v === '' || v === false || (Array.isArray(v) && !v.length && f.name !== 'tags');
      if (empty && !f.keepFalse) delete item[f.name];
      else item[f.name] = v;
    });
    if (!item.tags && set.tagsVar) item.tags = [];

    if (!existing) list.push(item);
    if (tab === 'gallery' && item.category && !state.categories.some((c) => c.value === item.category)) {
      state.categories.push({ value: item.category, label: item.category[0].toUpperCase() + item.category.slice(1) });
    }

    markDirty(tab);
    Site.closeModal($('formModal'));
    renderList();
    toast(existing ? `Saved “${item.title}”` : `Added “${item.title}”`);
  }

  /* ---------------- List actions ---------------- */
  function onListClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn || btn.disabled) return;
    const id = Number(btn.dataset.id);
    const list = state[tab];
    const index = list.findIndex((x) => x.id === id);
    if (index < 0) return;

    if (btn.dataset.action === 'edit') return openForm(id);

    if (btn.dataset.action === 'delete') {
      if (!confirm(`Delete “${list[index].title}”? You can still discard changes until you export.`)) return;
      const [removed] = list.splice(index, 1);
      markDirty(tab);
      renderList();
      toast(`Deleted “${removed.title}”`);
      return;
    }

    const target = btn.dataset.action === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    markDirty(tab);
    renderList();
  }

  /* ---------------- Filter-button tags ---------------- */
  let tagDraft = [];
  function openTags() {
    const counts = usedTags(tab);
    tagDraft = [...state.tags[tab]];
    const all = [...new Set([...tagDraft, ...[...counts.keys()].sort((a, b) => counts.get(b) - counts.get(a))])];
    $('tagsTitle').textContent = `${SETS[tab].label} filter buttons`;
    $('tagsChoices').innerHTML = all.map((t) => `
      <button type="button" class="tag-chip" data-tag="${esc(t)}" aria-pressed="${tagDraft.includes(t)}">
        ${esc(t)} <span class="text-xs opacity-60 ml-1">${counts.get(t) || 'unused'}</span>
      </button>`).join('');
    Site.openModal($('tagsModal'));
  }

  $('tagsChoices').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tag]');
    if (!btn) return;
    const t = btn.dataset.tag;
    tagDraft = tagDraft.includes(t) ? tagDraft.filter((x) => x !== t) : [...tagDraft, t];
    btn.setAttribute('aria-pressed', tagDraft.includes(t));
  });

  $('saveTagsBtn').addEventListener('click', () => {
    state.tags[tab] = tagDraft;
    markDirty(tab);
    Site.closeModal($('tagsModal'));
    toast('Filter buttons updated');
  });

  /* ---------------- Export ---------------- */
  function formatArray(items, compact) {
    if (!items.length) return '[]';
    if (compact) {
      const key = (k) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k));
      const val = (v) => (Array.isArray(v) ? `[${v.map((x) => JSON.stringify(x)).join(', ')}]` : JSON.stringify(v));
      return '[\n' + items.map((it) => `  { ${Object.entries(it).map(([k, v]) => `${key(k)}: ${val(v)}`).join(', ')} }`).join(',\n') + '\n]';
    }
    return JSON.stringify(items, null, 2);
  }

  function buildFile(key) {
    const set = SETS[key];
    let extra;
    if (key === 'gallery') {
      const used = [...new Set(state.gallery.map((g) => g.category).filter(Boolean))];
      const cats = [...state.categories];
      used.forEach((v) => { if (!cats.some((c) => c.value === v)) cats.push({ value: v, label: v[0].toUpperCase() + v.slice(1) }); });
      extra = `const ${set.catVar} = ${formatArray(cats, true)};`;
    } else {
      extra = `const ${set.tagsVar} = ${JSON.stringify(state.tags[key], null, 2)};`;
    }
    return `${set.header}\n\nconst ${set.varName} = ${formatArray(state[key], set.compact)};\n\n${set.tagsComment}\n${extra}\n`;
  }

  function download(key) {
    const blob = new Blob([buildFile(key)], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = SETS[key].file;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    state.dirty[key] = false;
    persist();
  }

  function renderExportList() {
    $('exportList').innerHTML = Object.keys(SETS).map((key) => `
      <div class="flex items-center gap-3 p-3 rounded-lg border border-gray-800">
        <div class="flex-1">
          <p class="text-white font-semibold">data/${SETS[key].file}</p>
          <p class="text-xs text-gray-500">${state[key].length} ${SETS[key].label.toLowerCase()}${state.dirty[key] ? ' · <span class="text-space-accent">changed</span>' : ''}</p>
        </div>
        <button type="button" class="btn btn-ghost btn-sm" data-copy="${key}"><i class="fas fa-copy"></i> Copy</button>
        <button type="button" class="btn btn-outline btn-sm" data-download="${key}"><i class="fas fa-download"></i> Download</button>
      </div>`).join('');
  }

  $('exportList').addEventListener('click', async (e) => {
    const dl = e.target.closest('[data-download]');
    const cp = e.target.closest('[data-copy]');
    if (dl) { download(dl.dataset.download); renderExportList(); toast(`Downloaded ${SETS[dl.dataset.download].file}`); }
    if (cp) {
      try {
        await navigator.clipboard.writeText(buildFile(cp.dataset.copy));
        state.dirty[cp.dataset.copy] = false;
        persist();
        renderExportList();
        toast(`Copied ${SETS[cp.dataset.copy].file} — paste it over the file in data/`);
      } catch (err) { toast('Copy failed — use Download instead.'); }
    }
  });

  $('exportAllBtn').addEventListener('click', () => {
    Object.keys(SETS).forEach((key, i) => setTimeout(() => { download(key); renderExportList(); }, i * 400));
    toast('Downloading projects.js, certificates.js and gallery.js');
  });

  /* ---------------- Import ---------------- */
  function readDataFile(source) {
    // The data files are plain scripts that declare constants; run them in an isolated function scope.
    const names = ['PROJECTS', 'PROJECT_TAGS', 'CERTIFICATES', 'CERTIFICATE_TAGS', 'GALLERY_ITEMS', 'GALLERY_CATEGORIES'];
    // Parameters shadow the page's own globals, so only what the file declares is returned.
    const body = `{\n${source}\n;return {${names.map((n) => `${n}: typeof ${n} !== 'undefined' ? ${n} : undefined`).join(', ')}};\n}`;
    return new Function(...names, body)();
  }

  $('importInput').addEventListener('change', async (e) => {
    const files = [...e.target.files];
    e.target.value = '';
    const loaded = [];
    for (const file of files) {
      try {
        const data = readDataFile(await file.text());
        const valid = (arr) => Array.isArray(arr) && arr.every((x) => x && typeof x === 'object' && 'id' in x && 'title' in x);
        if (valid(data.PROJECTS)) {
          state.projects = data.PROJECTS;
          if (Array.isArray(data.PROJECT_TAGS)) state.tags.projects = data.PROJECT_TAGS.filter((t) => t !== 'All');
          state.dirty.projects = true; loaded.push(`${data.PROJECTS.length} projects`);
        }
        if (valid(data.CERTIFICATES)) {
          state.certificates = data.CERTIFICATES;
          if (Array.isArray(data.CERTIFICATE_TAGS)) state.tags.certificates = data.CERTIFICATE_TAGS.filter((t) => t !== 'All');
          state.dirty.certificates = true; loaded.push(`${data.CERTIFICATES.length} certificates`);
        }
        if (valid(data.GALLERY_ITEMS)) {
          state.gallery = data.GALLERY_ITEMS;
          if (Array.isArray(data.GALLERY_CATEGORIES)) state.categories = data.GALLERY_CATEGORIES.filter((c) => c.value !== 'all');
          state.dirty.gallery = true; loaded.push(`${data.GALLERY_ITEMS.length} photos`);
        }
        if (!loaded.length) toast(`${file.name} doesn't contain portfolio data.`);
      } catch (err) {
        toast(`Could not read ${file.name}: ${err.message}`);
      }
    }
    if (loaded.length) {
      persist();
      renderList();
      toast(`Imported ${loaded.join(', ')}`);
    }
  });

  /* ---------------- Wiring ---------------- */
  document.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => switchTab(b.dataset.tab)));
  $('searchInput').addEventListener('input', renderList);
  $('addBtn').addEventListener('click', () => openForm(null));
  $('filterTagsBtn').addEventListener('click', openTags);
  $('list').addEventListener('click', onListClick);
  $('itemForm').addEventListener('submit', saveForm);
  $('itemForm').addEventListener('input', (e) => e.target.classList.remove('!border-red-400'));
  $('importBtn').addEventListener('click', () => $('importInput').click());
  $('exportBtn').addEventListener('click', () => { renderExportList(); Site.openModal($('exportModal')); });
  $('discardBtn').addEventListener('click', () => {
    if (!confirm('Discard all unexported changes and reload the data files?')) return;
    try { localStorage.removeItem(DRAFT_KEY); } catch (err) { /* ignore */ }
    state = fromFiles();
    renderBanner();
    switchTab(tab);
    toast('Changes discarded');
  });

  renderBanner();
  switchTab('projects');
})();
