document.querySelectorAll('.site-menu').forEach(menu => {
  const trigger = menu.querySelector('summary');
  menu.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      menu.open = false;
      trigger.focus();
    }
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { menu.open = false; }));
  document.addEventListener('click', event => {
    if (!menu.contains(event.target)) menu.open = false;
  });
});
