import { products, combinations } from '../data/catalog.js';
import { createSiteUI, node, icon, money, catalogUrl } from './site-ui.js';

const ui = createSiteUI({ page: 'home' });
document.querySelectorAll('[data-combination]').forEach(button => button.addEventListener('click', () => {
  const combination = combinations.find(item => item.id === button.dataset.combination);
  if (!combination) return;
  ui.show(() => {
    ui.title(combination.title);
    ui.content.append(node('p', combination.description, 'dialog-lead'));
    const list = node('div', '', 'preview-products');
    for (const id of combination.productIds) {
      const product = products.find(item => item.id === id);
      if (!product) continue;
      const row = node('a', '', 'preview-product');
      row.href = catalogUrl({ query: product.name });
      const image = node('img');
      Object.assign(image, { src: product.image, alt: `Ilustração provisória de ${product.name}`, width: 68, height: 68 });
      const details = node('div');
      details.append(node('h3', product.name), node('p', product.material), node('p', `${money.format(product.price)} · valor demonstrativo`, 'demo-price'));
      row.append(image, details);
      list.append(row);
    }
    ui.content.append(list);
    ui.note('Sugestão editorial com peças vendidas separadamente. Preços e ilustrações demonstrativos, sujeitos à confirmação.');
    ui.catalogLink('Explorar o catálogo');
  });
}));

const sectionLinks = [...document.querySelectorAll('.desktop-nav a, .mobile-menu a')].filter(link => link.hash && new URL(link.href).pathname === location.pathname);
const sections = [...document.querySelectorAll('#inicio, main section[id], #contato')];
let navigationFrame = 0;
function syncNavigation() {
  navigationFrame = 0;
  const readingLine = Math.min(innerHeight * .25, 180);
  const section = sections.filter(element => element.getBoundingClientRect().top <= readingLine).at(-1);
  const id = innerHeight + scrollY >= document.documentElement.scrollHeight - 2 ? 'contato' : section?.id || 'inicio';
  for (const link of sectionLinks) {
    const desktop = link.closest('.desktop-nav');
    const current = desktop && !['essencia', 'contato'].includes(id) ? 'inicio' : id;
    const active = link.hash === `#${current}`;
    link.classList.toggle('nav-active', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
}
function scheduleNavigation() { if (!navigationFrame) navigationFrame = requestAnimationFrame(syncNavigation); }
addEventListener('scroll', scheduleNavigation, { passive: true });
addEventListener('resize', scheduleNavigation, { passive: true });
addEventListener('hashchange', scheduleNavigation);
syncNavigation();
