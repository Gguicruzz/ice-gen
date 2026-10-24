import { products, combinations } from '../data/catalog.js';
import { createSiteUI, node, icon, money } from './site-ui.js';
import { productUrl } from './cart-store.js';

const ui = createSiteUI({ page: 'home' });
const combinationGrid = document.querySelector('#combination-grid');
for (const combination of combinations) {
  const pieces = combination.productIds.map(id => products.find(product => product.id === id)).filter(Boolean);
  const card = node('button', '', 'combination-card'); card.type = 'button';
  card.dataset.combination = combination.id;
  card.setAttribute('aria-haspopup', 'dialog');
  const visual = node('span', '', 'combination-card-visual');
  for (const product of pieces) {
    const image = node('img'); Object.assign(image, { src: product.image, alt: '', width: 200, height: 200, loading: 'lazy' }); visual.append(image);
  }
  const action = node('span', 'Ver as duas peças', 'combination-card-action'); action.append(icon('arrow'));
  card.append(visual, node('span', combination.label, 'eyebrow'), node('strong', combination.title, 'combination-card-title'), node('span', combination.description, 'combination-card-description'), action);
  combinationGrid.append(card);
  card.addEventListener('click', () => {
    ui.show(() => {
      ui.content.append(node('p', 'Sua combinação', 'eyebrow'));
      ui.title(combination.title);
      ui.content.append(node('p', combination.description, 'dialog-lead'));
      const list = node('div', '', 'combination-preview-grid');
      for (const product of pieces) {
        const article = node('article', '', 'combination-product');
        const imageLink = node('a', '', 'combination-product-photo'); imageLink.href = productUrl(product.id); imageLink.setAttribute('aria-label', `Ver ${product.name}`);
        const image = node('img'); Object.assign(image, { src: product.image, alt: '', width: 300, height: 240 }); imageLink.append(image, node('span', 'Ilustração', 'combination-image-label'));
        const body = node('div', '', 'combination-product-body');
        const title = node('h3'); const link = node('a', product.name); link.href = productUrl(product.id); title.append(link);
        const details = node('a', 'Conhecer a peça', 'button button-secondary'); details.href = productUrl(product.id); details.append(icon('arrow'));
        body.append(node('p', product.material, 'eyebrow'), title, node('p', money.format(product.price), 'combination-product-price'), details);
        article.append(imageLink, body); list.append(article);
      }
      ui.content.append(list);
      const total = node('div', '', 'combination-preview-total');
      total.append(node('span', 'Soma das duas peças'), node('strong', money.format(pieces.reduce((sum, product) => sum + Math.round(product.price * 100), 0) / 100)));
      ui.content.append(total);
      ui.note('Peças vendidas separadamente. Imagens e valores demonstrativos.');
      ui.catalogLink('Continuar explorando');
    }, { wide: true });
  });
}

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
