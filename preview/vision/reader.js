(() => {
  const versions = JSON.parse(document.getElementById('vr-data').textContent);
  let lang = document.documentElement.lang;
  let active = 0;
  let frame = 0;
  let reader;
  let request = 0;
  let pending;
  const layout = document.querySelector('.vr-layout');
  const selector = document.getElementById('sp-language');
  function update(savePosition = true) {
    const top = reader.getBoundingClientRect().top;
    const sections = [...reader.querySelectorAll('[data-chapter]')];
    let index = 0;
    sections.forEach((s, i) => { if (s.getBoundingClientRect().top <= top + reader.clientHeight * .3) index = i; });
    const changed = active !== index;
    active = index;
    const ch = versions[lang].chapters[index];
    layout.querySelectorAll('[data-vr-chapter]').forEach(a => {
      if (Number(a.dataset.vrChapter) === index) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
    layout.querySelectorAll('[data-layer]').forEach(li => li.classList.toggle('is-active', ch.layers.includes(li.dataset.layer)));
    if (changed && matchMedia('(max-width:650px)').matches) {
      const link = layout.querySelector('.vr-chapters [aria-current]');
      const nav = link.parentElement;
      nav.scrollLeft += link.getBoundingClientRect().left - nav.getBoundingClientRect().left;
    }
    document.getElementById('vr-position').textContent = `${String(index + 1).padStart(2, '0')} / ${String(sections.length).padStart(2, '0')}`;
    document.getElementById('vr-current-title').textContent = ch.title;
    layout.querySelector('.vr-progress span').style.width = (100 * reader.scrollTop / Math.max(1, reader.scrollHeight - reader.clientHeight)) + '%';
    const url = new URL(location.href);
    url.searchParams.set('lang', lang);
    if (savePosition && document.readyState === 'complete') {
      url.hash = 'chapter-' + index;
      history.replaceState(null, '', url);
    }
  }
  function bind() {
    reader = document.getElementById('vision-reader');
    reader.addEventListener('scroll', () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => update()); }, { passive: true });
  }
  layout.addEventListener('click', e => {
    const link = e.target.closest('[data-vr-chapter]');
    if (!link) return;
    e.preventDefault();
    const section = document.getElementById('chapter-' + link.dataset.vrChapter);
    section.scrollIntoView({ block: 'start', behavior: 'instant' });
    const heading = section.querySelector('h2');
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
    update();
  });
  selector.addEventListener('change', async () => {
    const next = selector.value;
    const token = ++request;
    pending?.abort();
    const status = document.querySelector('.vr-status');
    try {
      if (!versions[next]) {
        pending = new AbortController();
        layout.setAttribute('aria-busy', 'true');
        status.textContent = versions[lang].headerCopy.loading;
        const response = await fetch('/vision-preview/locale/' + encodeURIComponent(next), {
          signal: pending.signal, cache: 'no-store', credentials: 'same-origin'
        });
        if (!response.ok) throw Error('Locale unavailable');
        const value = await response.json();
        if (value.lang !== next || typeof value.html !== 'string' || !value.chapters?.length) throw Error('Invalid locale');
        if (token !== request) return;
        versions[next] = value;
      }
      if (token !== request) return;
      // Capture at replacement time: readers may keep scrolling during a slow request.
      cancelAnimationFrame(frame);
      status.textContent = '';
      // Aligned source-block ids preserve the paragraph and its relative position across locales.
      const bounds = reader.getBoundingClientRect();
      const anchors = [...reader.querySelectorAll('[data-reading-anchor]')];
      const anchor = anchors.find(e => e.getBoundingClientRect().bottom >= bounds.top + 20) || anchors[0];
      const id = anchor?.id;
      const offset = anchor ? (bounds.top - anchor.getBoundingClientRect().top) / Math.max(1, anchor.offsetHeight) : 0;
      const beforeArticle = reader.scrollTop < reader.querySelector('.vr-chapter').offsetTop - reader.offsetTop;
      const initialScroll = reader.scrollTop;
      lang = next;
      layout.innerHTML = versions[lang].html;
      document.documentElement.lang = lang;
      document.documentElement.dir = versions[lang].dir;
      layout.dataset.vrDir = versions[lang].dir;
      document.title = versions[lang].copy.vision + ' | Smart World Education';
      const visionLink = document.querySelector('.sp-header [aria-current=page]');
      visionLink.textContent = versions[lang].copy.vision;
      const h = versions[lang].headerCopy;
      document.querySelector('.vr-skip').textContent = versions[lang].copy.vision;
      document.querySelector('.sp-brand small').textContent = h.brand;
      document.querySelectorAll('[data-vr-label]').forEach(e => { e.textContent = h[e.dataset.vrLabel]; });
      document.querySelector('.sp-language .sp-sr').textContent = h.language;
      document.querySelectorAll('.sp-header nav a,.sp-partner,.sp-language .sp-sr,.sp-brand small').forEach(e => e.dir = versions[lang].dir);
      document.querySelectorAll('.sp-header a').forEach(a => { const u = new URL(a.href); if (u.origin === location.origin) { u.searchParams.set('lang', lang); a.href = u; } });
      bind();
      const target = id && document.getElementById(id);
      if (target && !beforeArticle) reader.scrollTop = target.getBoundingClientRect().top - reader.getBoundingClientRect().top + offset * target.offsetHeight;
      else if (beforeArticle) reader.scrollTop = initialScroll;
      update();
      status.textContent = '';
    } catch (error) {
      if (token !== request) return;
      selector.value = lang;
      status.textContent = versions[lang].headerCopy.error;
    } finally {
      if (token === request) layout.removeAttribute('aria-busy');
    }
  });
  bind();
  if (/^#chapter-[0-8]$/.test(location.hash)) document.querySelector(location.hash)?.scrollIntoView({ block: 'start' });
  update(false);
  addEventListener('resize', () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => update(false)); });
})();
