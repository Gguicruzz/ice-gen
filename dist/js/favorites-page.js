import { products } from '../data/catalog.js';
import { createSiteUI, node, icon, money } from './site-ui.js';
import { productUrl } from './cart-store.js';

const ui = createSiteUI({ page: 'favorites' });
const grid = document.querySelector('#favorites-grid');
const empty = document.querySelector('#favorites-empty');
const count = document.querySelector('#favorites-result-count');
const heading = document.querySelector('#favorites-results-title');
let removalFocus = null;

function link(text, href, className) {
  const element = node('a', text, className);
  element.href = href;
  return element;
}

function card(product) {
  const article = node('article', '', 'favorites-card');
  article.dataset.productId = product.id;
  const titleId = `favorite-title-${product.id}`;
  article.setAttribute('aria-labelledby', titleId);
  const media = link('', productUrl(product.id), 'favorites-card-media');
  media.setAttribute('aria-label', `Ver detalhes de ${product.name}`);
  const image = node('img');
  Object.assign(image, { src: product.image, alt: `Ilustração provisória de ${product.name}`, width: 1000, height: 1000, loading: 'lazy' });
  media.append(image, node('span', 'Ilustração', 'favorites-image-label'));
  const body = node('div', '', 'favorites-card-body');
  const meta = [product.categoryLabel, product.material, product.measurement].filter(Boolean).join(' · ');
  const title = node('h3'); title.id = titleId;
  title.append(link(product.name, productUrl(product.id)));
  const price = node('p', money.format(product.price), 'favorites-card-price');
  price.append(node('span', 'Valor demonstrativo'));
  const details = link('Ver detalhes', productUrl(product.id), 'favorites-detail-link');
  details.setAttribute('aria-label', `Ver detalhes de ${product.name}`);
  details.append(icon('arrow'));
  const actions = node('div', '', 'favorites-card-actions');
  const feedback = node('p', '', 'favorites-card-feedback');
  feedback.id = `favorite-feedback-${product.id}`;
  feedback.setAttribute('role', 'status');
  feedback.setAttribute('aria-live', 'polite');
  if (product.variants?.length) {
    const choose = link('Escolher opção', productUrl(product.id), 'button button-dark favorites-add');
    choose.setAttribute('aria-label', `Escolher opção de ${product.name}`);
    choose.append(icon('arrow')); actions.append(choose);
  } else {
    const add = node('button', '', 'button button-dark favorites-add');
    add.type = 'button';
    add.setAttribute('aria-label', `Adicionar ${product.name} à sacola`);
    add.setAttribute('aria-describedby', feedback.id);
    add.dataset.focusKey = `favorite-add-${product.id}`;
    add.append(icon('bag'), node('span', 'Adicionar à sacola'));
    let adding = false;
    add.addEventListener('click', () => {
      if (adding) return;
      feedback.textContent = '';
      const result = ui.cart.addProduct(product.id, { quantity: 1 });
      if (!result.ok) {
        feedback.textContent = ['quantity', 'limit'].includes(result.reason)
          ? 'Esta peça já atingiu o limite de 99 unidades na sacola.'
          : 'Não foi possível salvar na sacola. Permita o armazenamento do navegador e tente novamente.';
        return;
      }
      adding = true;
      add.setAttribute('aria-disabled', 'true');
      feedback.textContent = '1 unidade adicionada. A peça continua nos seus favoritos.';
      setTimeout(() => { adding = false; add.removeAttribute('aria-disabled'); }, 700);
    });
    actions.append(add);
  }
  const remove = node('button', '', 'favorites-remove');
  remove.type = 'button';
  remove.setAttribute('aria-label', `Remover ${product.name} dos favoritos`);
  remove.setAttribute('aria-pressed', 'true');
  remove.dataset.focusKey = `favorite-remove-${product.id}`;
  remove.append(icon('heart'), node('span', 'Remover dos favoritos'));
  remove.addEventListener('click', () => {
    const ids = [...grid.querySelectorAll('[data-product-id]')].map(element => element.dataset.productId);
    const index = ids.indexOf(product.id);
    removalFocus = ids[index + 1] || ids[index - 1] || 'heading';
    const result = ui.favorites.remove(product.id);
    ui.notify(result.saved ? `${product.name} removida dos favoritos.` : 'A peça foi removida desta página, mas o navegador não permitiu salvar a alteração.');
  });
  body.append(node('p', meta, 'favorites-card-meta'), title, price, details, actions, feedback, remove);
  article.append(media, body);
  return article;
}

function render() {
  const active = document.activeElement;
  const key = active?.dataset.focusKey;
  const focusedCard = grid.contains(active) ? active.closest('[data-product-id]')?.dataset.productId : null;
  const favorites = ui.favorites.getIds().map(id => products.find(product => product.id === id)).filter(Boolean);
  grid.replaceChildren(...favorites.map(card));
  grid.hidden = !favorites.length;
  empty.hidden = favorites.length > 0;
  count.textContent = `${favorites.length} ${favorites.length === 1 ? 'peça salva' : 'peças salvas'}`;
  if (removalFocus) {
    const next = removalFocus === 'heading' ? heading : [...grid.querySelectorAll('[data-focus-key]')].find(button => button.dataset.focusKey === `favorite-remove-${removalFocus}`);
    (next || heading).focus({ preventScroll: true });
    removalFocus = null;
  } else if (focusedCard) {
    const replacement = key && [...grid.querySelectorAll('[data-focus-key]')].find(button => button.dataset.focusKey === key);
    (replacement || heading).focus({ preventScroll: true });
  }
}

ui.favorites.subscribe(render);
render();
