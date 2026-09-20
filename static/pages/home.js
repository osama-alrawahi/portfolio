// Home page: counts, featured projects, recent achievements, rotating avatar
(function () {
  const { $, esc, asset, byNewest, yearOf, prettyDate } = Site;
  const projects = typeof PROJECTS !== 'undefined' ? PROJECTS : [];
  const certs = typeof CERTIFICATES !== 'undefined' ? CERTIFICATES : [];

  /* ---------- Counts ---------- */
  const countTagged = (...tags) => certs.filter((c) => (c.tags || []).some((t) => tags.includes(t))).length;
  const setCount = (id, n) => { const el = $(id); if (el) el.textContent = n; };

  setCount('projectCount', projects.length);
  setCount('certCount', certs.length);
  setCount('competitionCount', countTagged('Competition', 'Hackathon'));
  setCount('competitionCount2', countTagged('Competition', 'Hackathon'));
  setCount('workshopCount', countTagged('Workshop'));
  setCount('eventCount', countTagged('Event'));
  setCount('academicCount', countTagged('Evaluation'));

  /* ---------- Featured projects ---------- */
  const featured = projects.filter((p) => p.featured).sort(byNewest);
  const shownProjects = (featured.length ? featured : [...projects].sort(byNewest)).slice(0, 2);

  $('featuredProjects').innerHTML = shownProjects.map((p) => `
    <a href="template/projects.html#project-${p.id}" class="glass tech-border rounded-xl p-6 card-link reveal">
      <div class="flex items-start justify-between mb-4">
        <div class="bg-space-accent/10 p-3 rounded-lg"><i class="${esc(p.icon || 'fa-solid fa-code')} text-space-accent text-2xl"></i></div>
        <span class="text-xs text-gray-500">${esc(yearOf(p.date))}</span>
      </div>
      <h3 class="text-xl font-bold text-white mb-2">${esc(p.title)}</h3>
      ${p.badge ? `<span class="badge badge-${esc(p.badgeColor || 'gray')} mb-3">${esc(p.badge)}</span>` : ''}
      <p class="text-gray-400 text-sm mb-4 line-clamp-3">${esc(p.description)}</p>
      <div class="flex flex-wrap gap-2">
        ${(p.stack || []).slice(0, 4).map((t) => `<span class="chip">${esc(t)}</span>`).join('')}
      </div>
    </a>`).join('');

  /* ---------- Recent achievements ---------- */
  const featuredCerts = certs.filter((c) => c.featured).sort(byNewest);
  const shownCerts = (featuredCerts.length
    ? featuredCerts
    : certs.filter((c) => (c.tags || []).some((t) => ['Competition', 'Hackathon'].includes(t))).sort(byNewest)
  ).slice(0, 3);

  const ICONS = { gold: 'fa-trophy', silver: 'fa-medal', bronze: 'fa-medal' };

  $('recentAchievements').innerHTML = shownCerts.map((c) => {
    const level = ICONS[c.awardLevel] ? c.awardLevel : '';
    return `
      <a href="template/certificates.html#cert-${c.id}" class="glass tech-border rounded-xl p-6 card-link reveal">
        <div class="flex items-center gap-3 mb-3">
          <div class="award-icon ${level}"><i class="fas ${ICONS[level] || 'fa-award'} text-xl"></i></div>
          ${c.award
            ? `<span class="cert-badge ${level || 'silver'}">${esc(c.award)}</span>`
            : `<span class="chip chip-muted">${esc((c.tags || [])[0] || 'Certificate')}</span>`}
        </div>
        <h3 class="font-bold text-white mb-2">${esc(c.title)}</h3>
        <p class="text-gray-400 text-sm mb-2">${esc(c.organization || '')}</p>
        <p class="text-xs text-gray-500">${esc(prettyDate(c.date, { month: 'long', year: 'numeric' }))}</p>
      </a>`;
  }).join('');

  Site.observeReveals();

  /* ---------- Avatar: rotates through data/profile.js images ---------- */
  (function initAvatar() {
    const inner = document.querySelector('.avatar-inner');
    const files = typeof PROFILE_IMAGES !== 'undefined' ? PROFILE_IMAGES : [];
    if (!inner) return;
    if (!files.length) { inner.classList.add('show-fallback'); return; }

    const loaded = [];
    let settled = 0;

    const done = () => {
      if (++settled < files.length) return;
      if (!loaded.length) { inner.classList.add('show-fallback'); return; }
      if (loaded.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      let i = 0;
      setInterval(() => {
        loaded[i].classList.remove('active');
        i = (i + 1) % loaded.length;
        loaded[i].classList.add('active');
      }, 3000);
    };

    files.forEach((file, index) => {
      const img = new Image();
      img.className = 'avatar-image';
      img.alt = 'Osama Al-Rawahi';
      img.onload = () => {
        loaded.push(img);
        inner.appendChild(img);
        if (loaded.length === 1) img.classList.add('active');
        done();
      };
      img.onerror = done;
      img.src = asset('images/profile/' + file);
      if (index > 0) img.alt = '';
    });
  })();
})();
