import { products } from '../data/catalog.js';
import { categories, readCatalogState, catalogSearchParams, selectProducts } from './catalog-model.js';
import { createSiteUI, node, icon, money } from './site-ui.js';

const ui = createSiteUI({ page: 'catalog', onAction(type) {
  if (type !== 'search') return false;
  ui.setMenu(false);
  queryInput.focus();
  queryInput.scrollIntoView({ block: 'center', behavior: 'auto' });
  return true;
} });
const results = document.querySelector('#catalog-results');
const count = document.querySelector('#result-count');
const heading = document.querySelector('#results-title');
const empty = document.querySelector('#catalog-empty');
const queryInput = document.querySelector('#catalog-query');
const searchForm = document.querySelector('#catalog-search');
const sortInput = document.querySelector('#catalog-sort');
const filterForm = document.querySelector('#catalog-filter-form');
const favoriteInput = document.querySelector('#favorites-only');
const chips = document.querySelector('#active-filters');
const filterDialog = document.querySelector('#filters-dialog');
const filterToggle = document.querySelector('#open-filters');
const mobileFilters = matchMedia('(max-width: 900px)');
let state = readCatalogState(location.search);

for (const category of categories) {
  const label = node('label', '', 'filter-option');
  const input = node('input');
  Object.assign(input, { type: 'checkbox', name: 'category', value: category.id });
  label.append(input, node('span', category.label), node('span', String(products.filter(product => product.category === category.id).length), 'filter-count'));
  document.querySelector('#category-options').append(label);
}

function updateUrl(mode = 'push') {
  const params = catalogSearchParams(state).toString();
  const next = `/catalogo.html${params ? `?${params}` : ''}`;
  if (location.pathname + location.search !== next) history[mode === 'replace' ? 'replaceState' : 'pushState'](null, '', next);
}
function setState(next, { mode = 'push' } = {}) {
  state = { ...state, ...next };
  if (Object.hasOwn(next, 'query')) queryInput.value = state.query;
  updateUrl(mode);
  render();
}
function clearAll() {
  setState({ query: '', categories: [], sort: 'featured', favorites: false });
  heading.focus({ preventScroll: true });
}
function updateSaveButton(button, product) {
  const saved = ui.favorites.getIds().includes(product.id);
  button.classList.toggle('is-saved', saved);
  button.setAttribute('aria-pressed', String(saved));
  button.setAttribute('aria-label', `${saved ? 'Remover' : 'Salvar'} ${product.name} ${saved ? 'dos' : 'nos'} favoritos`);
}
function toggleFavorite(product) {
  const result = ui.favorites.toggle(product.id);
  const saved = result.ids.includes(product.id);
  ui.notify(result.saved ? `${product.name} ${saved ? 'salva nos' : 'removida dos'} favoritos.` : 'A seleção mudou nesta página, mas o navegador não permitiu salvá-la.');
}
function openProduct(product) {
  ui.show(() => {
    ui.title(product.name);
    const image = node('img', '', 'quick-product-image');
    image.src = product.image;
    image.alt = `Ilustração provisória de ${product.name}`;
    image.width = 1000;
    image.height = 1000;
    const price = node('p', money.format(product.price), 'quick-product-price');
    const meta = node('p', `${product.material}${product.measurement ? ` · ${product.measurement}` : ''} · Valor demonstrativo`, 'quick-product-meta');
    const description = node('p', product.description, 'quick-product-description');
    ui.content.append(image, price, meta, description);
    ui.note('Dados e ilustração demonstrativos, sujeitos à confirmação. A página individual e a compra ainda não estão disponíveis nesta prévia.');
    const actions = node('div', '', 'quick-product-actions');
    const save = node('button', '', 'button button-dark');
    save.type = 'button';
    function sync() {
      const saved = ui.favorites.getIds().includes(product.id);
      save.replaceChildren(icon('heart'), node('span', saved ? 'Remover dos favoritos' : 'Salvar nos favoritos'));
      save.setAttribute('aria-pressed', String(saved));
    }
    save.addEventListener('click', () => { toggleFavorite(product); sync(); });
    sync();
    const close = node('button', 'Continuar explorando', 'button button-secondary');
    close.type = 'button';
    close.addEventListener('click', () => ui.dialog.close());
    actions.append(save, close);
    ui.content.append(actions);
  });
}
function productCard(product) {
  const card = node('article', '', 'product-card');
  card.dataset.productId = product.id;
  const media = node('div', '', 'product-media');
  const open = node('button', '', 'product-image-button');
  open.type = 'button';
  open.dataset.focusKey = `image-${product.id}`;
  open.setAttribute('aria-label', `Conhecer ${product.name}`);
  const image = node('img');
  Object.assign(image, { src: product.image, alt: `Ilustração provisória de ${product.name}`, width: 1000, height: 1000, loading: 'lazy', decoding: 'async' });
  open.append(image);
  open.addEventListener('click', () => openProduct(product));
  const save = node('button', '', 'product-save');
  save.type = 'button';
  save.dataset.focusKey = `save-${product.id}`;
  save.append(icon('heart'));
  updateSaveButton(save, product);
  save.addEventListener('click', () => toggleFavorite(product));
  media.append(open, save, node('span', 'Ilustração', 'illustration-label'));
  const category = node('p', `${product.categoryLabel} · ${product.material}`, 'product-category');
  const title = node('h3', '', 'product-name');
  const titleButton = node('button', product.name);
  titleButton.type = 'button';
  titleButton.dataset.focusKey = `title-${product.id}`;
  titleButton.addEventListener('click', () => openProduct(product));
  title.append(titleButton);
  const price = node('p', money.format(product.price), 'product-price');
  price.append(node('small', 'Valor demonstrativo'));
  const details = node('button', 'Conhecer a peça', 'product-details');
  details.type = 'button';
  details.dataset.focusKey = `details-${product.id}`;
  details.append(icon('arrow'));
  details.addEventListener('click', () => openProduct(product));
  card.append(media, category, title, price, details);
  return card;
}
function chip(label, remove, name) {
  const button = node('button', label, 'filter-chip');
  button.type = 'button';
  button.dataset.focusKey = `chip-${name || label}`;
  button.setAttribute('aria-label', `Remover filtro ${name || label}`);
  button.append(icon('close'));
  button.addEventListener('click', remove);
  chips.append(button);
}
function render() {
  const focusedKey = document.activeElement?.dataset.focusKey;
  const favoriteIds = ui.favorites.getIds();
  const selection = selectProducts(products, state, { favoriteIds });
  sortInput.value = state.sort;
  favoriteInput.checked = state.favorites;
  filterForm.querySelectorAll('[name="category"]').forEach(input => { input.checked = state.categories.includes(input.value); });
  document.querySelector('#favorites-filter-count').textContent = favoriteIds.length;
  heading.textContent = state.favorites ? 'Suas peças favoritas' : state.categories.length === 1 ? categories.find(category => category.id === state.categories[0]).label : 'Todas as peças';
  count.textContent = `${selection.length} ${selection.length === 1 ? 'peça encontrada' : 'peças encontradas'}`;
  document.querySelector('#apply-filters').textContent = `Ver ${selection.length} ${selection.length === 1 ? 'peça' : 'peças'}`;
  results.replaceChildren(...selection.map(productCard));
  results.hidden = !selection.length;
  empty.hidden = !!selection.length;
  if (!selection.length) {
    const emptyFavorites = state.favorites && !favoriteIds.length;
    document.querySelector('#empty-title').textContent = emptyFavorites ? 'Suas próximas favoritas estão por aqui.' : 'Ainda não encontramos essa peça.';
    document.querySelector('#empty-copy').textContent = emptyFavorites ? 'Toque no coração de uma peça para guardá-la neste navegador. Explore a coleção e encontre as suas escolhas.' : 'Experimente outro termo ou ajuste os filtros para descobrir outras possibilidades.';
  }
  chips.replaceChildren();
  if (state.query) chip(`Busca: ${state.query}`, () => setState({ query: '' }), `busca ${state.query}`);
  for (const id of state.categories) chip(categories.find(category => category.id === id).label, () => setState({ categories: state.categories.filter(category => category !== id) }));
  if (state.favorites) chip('Favoritos', () => setState({ favorites: false }));
  chips.hidden = !chips.children.length;
  const activeFilters = state.categories.length + Number(state.favorites);
  const activeCounter = document.querySelector('#active-filter-count');
  activeCounter.hidden = !activeFilters;
  activeCounter.textContent = activeFilters;
  if (focusedKey && !ui.dialog.open) {
    const next = [...document.querySelectorAll('[data-focus-key]')].find(button => button.dataset.focusKey === focusedKey);
    (next || heading).focus({ preventScroll: true });
  }
}
searchForm.addEventListener('submit', event => {
  event.preventDefault();
  setState({ query: queryInput.value.trim().slice(0, 100) });
});
sortInput.addEventListener('change', () => setState({ sort: sortInput.value }));
filterForm.addEventListener('submit', event => event.preventDefault());
filterForm.addEventListener('change', () => setState({ categories: [...filterForm.querySelectorAll('[name="category"]:checked')].map(input => input.value), favorites: favoriteInput.checked }));
document.querySelector('#clear-filters').addEventListener('click', () => setState({ categories: [], favorites: false }));
document.querySelector('#reset-catalog').addEventListener('click', clearAll);
ui.favorites.subscribe(render);
addEventListener('popstate', () => {
  if (ui.dialog.open) ui.dialog.close();
  state = readCatalogState(location.search);
  queryInput.value = state.query;
  render();
});

function positionFilters() {
  if (!mobileFilters.matches && filterDialog.open) filterDialog.close();
  document.querySelector(mobileFilters.matches ? '#filters-mobile-host' : '#filters-desktop-host').append(filterForm);
}
filterToggle.addEventListener('click', () => filterDialog.showModal());
document.querySelector('#close-filters').addEventListener('click', () => filterDialog.close());
document.querySelector('#apply-filters').addEventListener('click', () => filterDialog.close());
filterDialog.addEventListener('click', event => {
  if (event.target !== filterDialog) return;
  const rect = filterDialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) filterDialog.close();
});
filterDialog.addEventListener('close', () => { if (mobileFilters.matches) filterToggle.focus({ preventScroll: true }); });
mobileFilters.addEventListener('change', positionFilters);
positionFilters();
queryInput.value = state.query;
updateUrl('replace');
render();
