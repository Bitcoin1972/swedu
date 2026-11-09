const links = [
  ['/', 'Home'], ['/approach', 'Our Approach'], ['/programmes', 'Programmes'],
  ['/who-we-serve', 'Who We Serve'], ['/capability-careers', 'Capability & Careers'],
  ['/national-capability', 'Local & National Capability'], ['/network', 'Global Initiatives & Network'],
  ['/about', 'About Smart World Education'], ['/#contact', 'Contact']
];

function navigation() {
  return `<a class="partner-access" href="/partners">Partner Login</a><details class="site-menu"><summary>Menu</summary><nav aria-label="Main navigation">${links.map(([url, label]) => `<a href="${url}">${label.replaceAll('&', '&amp;')}</a>`).join('')}</nav></details>`;
}

module.exports = { navigation, links };
