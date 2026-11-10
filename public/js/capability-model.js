document.querySelectorAll('[data-model]').forEach(model => {
  const links = [...model.querySelectorAll('[data-layer]')];
  const panels = [...model.querySelectorAll('.layer-detail')];
  const overview = model.querySelector('.model-overview');
  function select(id, updateHistory = true) {
    const selected = links.find(link => link.dataset.layer === id);
    links.forEach(link => {
      link.setAttribute('aria-expanded', String(link === selected));
      if (link === selected) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    overview.hidden = Boolean(selected);
    panels.forEach(panel => {
      panel.hidden = Boolean(selected) && panel.id !== `layer-${id}`;
      panel.open = Boolean(selected) && panel.id === `layer-${id}`;
    });
    if (updateHistory) {
      const url = new URL(location.href);
      if (selected) url.searchParams.set('layer', id);
      else url.searchParams.delete('layer');
      url.hash = 'capability-model';
      history.pushState({}, '', url);
    }
  }
  model.classList.add('model-enhanced');
  links.forEach(link => link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    select(link.dataset.layer);
    const panel = model.querySelector(`#layer-${link.dataset.layer}`);
    panel.querySelector('summary').focus({ preventScroll: true });
    if (matchMedia('(max-width: 760px)').matches) panel.scrollIntoView({ block: 'start' });
  }));
  model.querySelectorAll('[data-model-reset]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    select('');
    links[0].focus({ preventScroll: true });
  }));
  window.addEventListener('popstate', () => select(new URLSearchParams(location.search).get('layer'), false));
  select(new URLSearchParams(location.search).get('layer'), false);
});
