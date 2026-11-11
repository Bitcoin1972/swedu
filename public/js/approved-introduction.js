(() => {
  const root = document.querySelector('#approved-introduction');
  if (!root) return;
  const versions = JSON.parse(root.querySelector('#introduction-versions').textContent);
  const content = root.querySelector('#introduction-content');
  const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  let stage = null;
  const readingLine = () => Math.max(120, (document.querySelector('#nav,.programme-header')?.getBoundingClientRect().bottom || 0) + 24);

  function showStage(id, focus = false) {
    const stages = [...content.querySelectorAll('[data-story-stage]')];
    stage = stages.some(s => s.dataset.storyStage === id) ? id : null;
    stages.forEach(s => { s.hidden = stage !== null && s.dataset.storyStage !== stage; });
    content.querySelectorAll('[data-story-select]').forEach(a => {
      if (a.dataset.storySelect === stage) a.setAttribute('aria-current', 'step');
      else a.removeAttribute('aria-current');
    });
    const index = stages.findIndex(s => s.dataset.storyStage === stage);
    content.querySelector('[data-story-prev]').disabled = index <= 0;
    content.querySelector('[data-story-next]').disabled = index === stages.length - 1;
    if (focus) {
      const target = stage ? content.querySelector(`#journey-${stage} h3`) : content.querySelector('#journey-heading');
      target.focus({ preventScroll: true });
      target.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'instant' : 'smooth' });
    }
  }

  function enhance() {
    const controls = content.querySelector('.story-controls');
    content.querySelector('.story-stages').after(controls);
    controls.hidden = false;
    showStage(stage);
  }

  function switchLanguage(lang, preservePosition) {
    if (!Object.hasOwn(versions, lang) || root.lang === lang) return;
    // Keep the same semantic paragraph and fractional position despite text reflow.
    const anchors = [...content.querySelectorAll('[data-reading-anchor]')].filter(el => !el.closest('[hidden]'));
    const line = readingLine();
    const anchor = anchors.find(el => el.getBoundingClientRect().bottom > line) || anchors.at(-1);
    const rect = anchor?.getBoundingClientRect();
    const fraction = rect ? (line - rect.top) / Math.max(rect.height, 1) : 0;
    const anchorId = anchor?.id;
    root.lang = lang;
    content.innerHTML = versions[lang].html;
    const note = root.querySelector('.intro-review');
    if (note) note.textContent = versions[lang].ui.review;
    enhance();
    requestAnimationFrame(() => {
      const replacement = anchorId && document.getElementById(anchorId);
      if (replacement && preservePosition) {
        const next = replacement.getBoundingClientRect();
        const newReadingLine = readingLine();
        window.scrollBy({ top: next.top + fraction * next.height - newReadingLine, behavior: 'instant' });
      }
    });
    root.querySelector('.intro-announcement').textContent = versions[lang].ui.language;
  }

  document.addEventListener('swe:language-change', event => switchLanguage(event.detail.language, event.detail.preservePosition));
  content.addEventListener('click', event => {
    const control = event.target.closest('a,button');
    if (!control || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const ids = versions[root.lang].ui.stages.map(s => s.id);
    if (control.hasAttribute('data-story-select')) {
      event.preventDefault(); showStage(control.dataset.storySelect, true);
    } else if (control.hasAttribute('data-story-all')) showStage(null, true);
    else if (control.hasAttribute('data-story-prev')) showStage(ids[Math.max(0, ids.indexOf(stage) - 1)], true);
    else if (control.hasAttribute('data-story-next')) showStage(ids[Math.min(ids.length - 1, ids.indexOf(stage) + 1)], true);
    else if (control.classList.contains('intro-start')) { event.preventDefault(); showStage('society', true); }
  });
  enhance();
})();
