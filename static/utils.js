/* ==========================================================
   Portfolio shared runtime — loaded by every page.
   Renders the navbar, footer and starfield background, and
   exposes helpers on window.Site for the page scripts.

   Each page only needs:
     <body data-root="" data-page="home">      (index.html)
     <body data-root="../" data-page="cv">     (template/*.html)
   ========================================================== */
(function () {
  'use strict';

  const body = document.body;
  const ROOT = body.dataset.root || '';
  const PAGE = body.dataset.page || '';

  const NAV_ITEMS = [
    { id: 'home', label: 'Home', href: 'index.html' },
    { id: 'cv', label: 'CV', href: 'template/cv.html' },
    { id: 'projects', label: 'Projects', href: 'template/projects.html' },
    { id: 'certificates', label: 'Certificates', href: 'template/certificates.html' },
    { id: 'gallery', label: 'Gallery', href: 'template/gallery.html' }
  ];

  const SOCIAL = [
    { label: 'Email', icon: 'fas fa-envelope', href: 'mailto:osama.mohd.alrawahi@gmail.com' },
    { label: 'GitHub', icon: 'fab fa-github', href: 'https://github.com/osama-alrawahi' },
    { label: 'LinkedIn', icon: 'fab fa-linkedin', href: 'https://linkedin.com/in/osama-al-rawahi-06651a287' }
  ];

  /* ---------------- Helpers ---------------- */
  const $ = (id) => document.getElementById(id);
  const norm = (s) => (s == null ? '' : String(s)).trim().toLowerCase();
  const asset = (path) => (!path || /^(https?:|data:|blob:)/.test(path) ? path || '' : ROOT + path);
  const isLink = (url) => !!url && url !== '#';

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // Accepts "2024-05-04", "2019", "2025 - Now", "2025 - 2026"
  function dateValue(str) {
    const s = String(str || '');
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(s)) {
      const [y, m, d] = s.split('-').map(Number);
      return new Date(y, m - 1, d).getTime();
    }
    const year = s.match(/\d{4}/);
    return year ? new Date(Number(year[0]), 0, 1).getTime() : 0;
  }

  function yearOf(str) {
    const m = String(str || '').match(/\d{4}/);
    return m ? m[0] : '';
  }

  function prettyDate(str, opts) {
    const s = String(str || '');
    if (!/^\d{4}-\d{1,2}-\d{1,2}$/.test(s)) return s;
    return new Date(dateValue(s)).toLocaleDateString('en-US', opts || { year: 'numeric', month: 'short', day: '2-digit' });
  }

  const byNewest = (a, b) => dateValue(b.date) - dateValue(a.date);

  // Image with a built-in icon fallback (no external placeholder service)
  function imgFrame(src, alt, frameClass, fallbackIcon, imgClass) {
    return `<div class="img-frame ${frameClass || ''}">
      <img src="${esc(asset(src))}" alt="${esc(alt)}" loading="lazy" class="${imgClass || ''}"
           onerror="this.parentElement.classList.add('img-missing')">
      <div class="img-fallback" aria-hidden="true"><i class="${esc(fallbackIcon || 'fa-solid fa-image')}"></i></div>
    </div>`;
  }

  // Tag list for filter chips: preferred order first, only tags that are actually used
  function tagList(items, preferred) {
    const counts = new Map();
    items.forEach((it) => (it.tags || []).forEach((t) => counts.set(t, (counts.get(t) || 0) + 1)));
    let tags;
    if (Array.isArray(preferred) && preferred.length) {
      tags = preferred.filter((t) => t !== 'All' && counts.has(t));
    } else {
      tags = [...counts.keys()].sort((a, b) => counts.get(b) - counts.get(a) || a.localeCompare(b));
    }
    return ['All', ...tags];
  }

  // Multi-select tag chips. `active` is a Set; "All" clears the others.
  function tagChips(container, tags, active, onChange) {
    container.innerHTML = tags
      .map((t) => `<button type="button" class="tag-chip" data-tag="${esc(t)}" aria-pressed="${active.has(t)}">${esc(t)}</button>`)
      .join('');
    const sync = () => container.querySelectorAll('[data-tag]').forEach((b) => b.setAttribute('aria-pressed', active.has(b.dataset.tag)));
    container.onclick = (e) => {
      const btn = e.target.closest('[data-tag]');
      if (!btn) return;
      const tag = btn.dataset.tag;
      if (tag === 'All') { active.clear(); active.add('All'); }
      else {
        active.delete('All');
        active.has(tag) ? active.delete(tag) : active.add(tag);
        if (!active.size) active.add('All');
      }
      sync();
      onChange();
    };
    return { reset() { active.clear(); active.add('All'); sync(); } };
  }

  /* ---------------- Modals ---------------- */
  function openModal(modal) {
    modal.classList.add('is-open');
    body.classList.add('modal-open');
    const focusTarget = modal.querySelector('[data-close-modal]') || modal;
    focusTarget.focus({ preventScroll: true });
  }

  function closeModal(modal) {
    if (!modal || !modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    if (!document.querySelector('.modal.is-open')) body.classList.remove('modal-open');
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    modal.dispatchEvent(new CustomEvent('modal:close'));
  }

  function wireModals() {
    document.querySelectorAll('.modal').forEach((modal) => {
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.tabIndex = -1;
      modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.closest('[data-close-modal]')) closeModal(modal);
      });
    });
  }

  // Opens detail modals from links like "#project-3" (shareable, back-button friendly)
  function hashRoute(prefix, open) {
    const run = () => {
      const m = location.hash.match(new RegExp('^#' + prefix + '-(\\d+)$'));
      if (m) open(Number(m[1]));
    };
    window.addEventListener('hashchange', run);
    run();
  }

  /* ---------------- Statistics chart (projects + certificates) ---------------- */
  let chart = null;
  function renderStatsChart(canvas, items, type, label, selectedTags) {
    if (typeof Chart === 'undefined') return;
    if (chart) chart.destroy();
    const tick = 'rgba(255,255,255,0.75)';
    const grid = 'rgba(255,255,255,0.08)';
    const legend = { labels: { color: tick } };

    if (type === 'pie') {
      const only = selectedTags && !selectedTags.has('All') ? selectedTags : null;
      const counts = new Map();
      items.forEach((it) => (it.tags || []).forEach((t) => {
        if (!only || only.has(t)) counts.set(t, (counts.get(t) || 0) + 1);
      }));
      const labels = [...counts.keys()].sort((a, b) => counts.get(b) - counts.get(a));
      chart = new Chart(canvas, {
        type: 'pie',
        data: { labels, datasets: [{ label: 'Tags', data: labels.map((l) => counts.get(l)) }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { ...legend, position: 'right' } } }
      });
      return;
    }

    const counts = new Map();
    items.forEach((it) => {
      const y = yearOf(it.date) || '—';
      counts.set(y, (counts.get(y) || 0) + 1);
    });
    const labels = [...counts.keys()].sort((a, b) => (a === '—') - (b === '—') || Number(a) - Number(b));
    chart = new Chart(canvas, {
      type: type === 'line' ? 'line' : 'bar',
      data: {
        labels,
        datasets: [{ label, data: labels.map((l) => counts.get(l)), backgroundColor: 'rgba(0,240,255,0.5)', borderColor: '#00F0FF', tension: 0.25 }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend },
        scales: {
          x: { ticks: { color: tick }, grid: { color: grid } },
          y: { ticks: { color: tick, precision: 0 }, grid: { color: grid }, beginAtZero: true }
        }
      }
    });
  }

  /* ---------------- Layout: background, navbar, footer ---------------- */
  function renderChrome() {
    const links = (cls) => NAV_ITEMS.map((item) =>
      `<a href="${ROOT}${item.href}" class="nav-link ${cls}"${item.id === PAGE ? ' aria-current="page"' : ''}>${item.label}</a>`
    ).join('');

    body.insertAdjacentHTML('afterbegin', `
      <div id="canvas-container" aria-hidden="true"><canvas id="starfield-canvas"></canvas></div>
      <nav class="site-nav fixed top-0 inset-x-0 z-50 glass" aria-label="Main">
        <div class="container mx-auto px-6 py-4">
          <div class="flex justify-between items-center">
            <a href="${ROOT}index.html" class="text-2xl font-bold tracking-tighter">
              <span class="text-white">Osama</span> <span class="text-space-accent">Al-Rawahi</span>
            </a>
            <div class="hidden md:flex gap-6">${links('')}</div>
            <button id="mobileMenuBtn" type="button" class="md:hidden text-white w-10 h-10 -mr-2"
                    aria-label="Open menu" aria-expanded="false" aria-controls="mobileMenu">
              <i class="fas fa-bars text-xl"></i>
            </button>
          </div>
          <div id="mobileMenu" class="hidden md:hidden mt-4 pb-2 space-y-1">${links('block py-2')}</div>
        </div>
      </nav>`);

    body.insertAdjacentHTML('beforeend', `
      <footer class="site-footer border-t border-gray-800 py-8 mt-10">
        <div class="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>&copy; ${new Date().getFullYear()} Osama Al-Rawahi</p>
          <div class="flex gap-5">
            ${SOCIAL.map((s) => `<a href="${s.href}" class="hover:text-space-accent transition" aria-label="${s.label}"${s.href.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}><i class="${s.icon} text-lg"></i></a>`).join('')}
          </div>
        </div>
      </footer>`);
  }

  function initMobileMenu() {
    const btn = $('mobileMenuBtn');
    const menu = $('mobileMenu');
    const setOpen = (open) => {
      menu.classList.toggle('hidden', !open);
      btn.setAttribute('aria-expanded', open);
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      btn.innerHTML = `<i class="fas ${open ? 'fa-xmark' : 'fa-bars'} text-xl"></i>`;
    };
    btn.addEventListener('click', (e) => { e.stopPropagation(); setOpen(menu.classList.contains('hidden')); });
    document.addEventListener('click', (e) => { if (!menu.contains(e.target)) setOpen(false); });
    window.addEventListener('resize', () => { if (window.innerWidth >= 768) setOpen(false); });
    return setOpen;
  }

  function initStarfield() {
    const canvas = $('starfield-canvas');
    const ctx = canvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const LINK_DIST = 120;
    const MAX_LINKS = 3;
    let width = 0, height = 0, stars = [];

    function setup() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      const count = width < 768 ? 50 : 100;
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2,
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < stars.length; i++) {
        let links = 0;
        for (let j = i + 1; j < stars.length && links < MAX_LINKS; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          if (dx * dx + dy * dy < LINK_DIST * LINK_DIST) {
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.stroke();
            links++;
          }
        }
      }
      ctx.fillStyle = '#ffffff';
      for (const s of stars) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        if (reduceMotion) continue;
        s.x = (s.x + s.dx + width) % width;
        s.y = (s.y + s.dy + height) % height;
      }
      if (!reduceMotion) requestAnimationFrame(draw);
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { setup(); if (reduceMotion) draw(); }, 250);
    });
    setup();
    draw();
  }

  /* ---------------- Scroll reveal ---------------- */
  let revealObserver = null;
  function observeReveals() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('show'));
      return;
    }
    revealObserver = revealObserver || new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal:not(.show)').forEach((el) => revealObserver.observe(el));
  }

  /* ---------------- Boot ---------------- */
  renderChrome();
  const setMenuOpen = initMobileMenu();
  initStarfield();
  wireModals();
  observeReveals();

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = [...document.querySelectorAll('.modal.is-open')].pop();
    if (open) closeModal(open);
    else setMenuOpen(false);
  });

  window.Site = {
    ROOT, PAGE, $, esc, norm, asset, isLink, dateValue, yearOf, prettyDate, byNewest,
    imgFrame, tagList, tagChips, openModal, closeModal, wireModals, hashRoute,
    renderStatsChart, observeReveals
  };
})();
