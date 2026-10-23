import { products, complements } from '../data/catalog.js';
import { createSiteUI, node, icon, money } from './site-ui.js';
import { itemCount, itemTotalCents, totalCents, priceCents, productUrl, MAX_QUANTITY } from './cart-store.js';
import { selectBagSuggestions } from './bag-model.js';

const ui = createSiteUI({ page: 'bag' });
const list = document.querySelector('#bag-items');
const title = document.querySelector('#bag-title');
const suggestions = document.querySelector('#bag-suggestions');
const suggestionsGrid = document.querySelector('#bag-suggestions-grid');
const suggestionsTitle = document.querySelector('#bag-suggestions-title');
const toggleSuggestions = document.querySelector('#bag-suggestions-toggle');
const adding = new Set();
const favoriteButtons = new Map();
let suggestionsOpen = true;

function link(text, href, className) { const element = node('a', text, className); element.href = href; return element; }
function formatCents(value) { return value === null ? 'A conferir' : money.format(value / 100); }
function failure(result) {
  ui.notify(result.reason === 'quantity' || result.reason === 'limit' ? 'A quantidade deve ficar entre 1 e 99 por peça ou presente.' : ['missing', 'conflict'].includes(result.reason) ? 'Este item mudou em outra aba. Confira a versão atual da sacola.' : 'Não foi possível salvar a alteração. Permita o armazenamento do navegador e tente novamente.');
}
function imageFor(product, className, alt = '') {
  const image = node('img', '', className);
  Object.assign(image, { src: product.image, alt, width: 1000, height: 1000, loading: 'lazy' }); return image;
}
function renderMedia(item, product) {
  const media = node('div', '', 'bag-line-media');
  if (product) media.append(link('', productUrl(product.id)), node('small', 'Ilustração'));
  if (product) media.firstChild.append(imageFor(product, 'bag-line-image', `Ilustração provisória de ${product.name}`));
  else {
    const parts = Array.isArray(item.giftComponents) ? item.giftComponents : [];
    const choices = parts.map(part => products.find(product => product.id === part?.id)).filter(Boolean).slice(0, 2);
    const group = node('div', '', choices.length ? 'bag-gift-media' : 'bag-gift-placeholder');
    choices.forEach(choice => group.append(imageFor(choice, '', '')));
    if (choices.length) group.append(node('span', 'PRESENTE'));
    else group.append(icon('bag'));
    media.append(group, node('small', choices.length ? 'Ilustrações' : 'Foto pendente'));
  }
  return media;
}
function renderLine(item) {
  const product = item.category !== 'presente' && products.find(product => product.id === (item.productId || item.id));
  const row = node('article', '', 'bag-line'); row.dataset.lineId = item.id;
  const body = node('div', '', 'bag-line-body');
  const heading = node('h2', '', 'bag-line-name'); heading.tabIndex = -1;
  heading.append(product ? link(product.name, productUrl(product.id)) : node('span', item.name));
  body.append(node('p', item.category === 'presente' ? 'Presente personalizado' : `${product?.categoryLabel || 'Joia'} · ${product?.material || 'Prata 925'}`, 'bag-line-kind'), heading);
  if (item.variantLabel || item.measurement) body.append(node('p', [item.variantLabel, item.measurement].filter(Boolean).join(' · '), 'bag-line-meta'));
  const unit = node('p', `${money.format(item.price)} `, 'bag-line-price'); unit.append(node('small', `/ ${item.category === 'presente' ? 'presente' : 'unidade'} · valor demonstrativo`)); body.append(unit);
  if (item.category === 'presente' && Array.isArray(item.giftComponents)) {
    const parts = node('ul', '', 'bag-line-components');
    item.giftComponents.filter(part => part && typeof part.name === 'string').forEach((part, index) => {
      const li = node('li'); const detail = node('span', '', 'bag-component-details');
      const choice = products.find(product => product.id === part.id);
      detail.append(choice ? link(part.name, productUrl(choice.id)) : node('span', part.name));
      const variant = typeof part.variantLabel === 'string' ? `${part.variantLabel} · ` : '';
      const quantity = Number.isSafeInteger(part.quantity) && part.quantity >= 1 ? part.quantity : 1;
      detail.append(node('small', `${variant}${quantity} por presente · ${formatCents(priceCents(part.price))}`));
      li.append(node('span', String(index + 1).padStart(2, '0'), 'bag-component-number'), detail); parts.append(li);
    });
    body.append(parts);
  }
  const controls = node('div', '', 'bag-line-controls');
  const quantity = node('div', '', 'bag-quantity'); quantity.setAttribute('role', 'group'); quantity.setAttribute('aria-label', `Quantidade de ${item.name}`);
  for (const delta of [-1, 1]) {
    const button = node('button', delta < 0 ? '−' : '+'); button.type = 'button';
    button.setAttribute('aria-label', `${delta < 0 ? 'Diminuir' : 'Aumentar'} quantidade de ${item.name}`);
    button.disabled = delta < 0 ? item.quantity <= 1 : item.quantity >= MAX_QUANTITY;
    button.dataset.focusKey = `${delta < 0 ? 'less' : 'more'}-${item.id}`;
    button.addEventListener('click', () => {
      ui.cart.refresh();
      const current = ui.cart.getItems().filter(line => line.id === item.id);
      if (current.length !== 1) { ui.notify('Este item mudou em outra aba. Confira a sacola.'); return; }
      const result = ui.cart.setQuantity(item.id, current[0].quantity + delta);
      if (!result.ok) failure(result);
    });
    quantity.append(button);
    if (delta < 0) { const count = node('span', String(item.quantity)); count.setAttribute('aria-label', `${item.quantity} ${item.quantity === 1 ? 'unidade' : 'unidades'}`); quantity.append(count); }
  }
  const actions = node('div', '', 'bag-line-links');
  if (product) {
    const favorite = node('button'); favorite.type = 'button'; favorite.dataset.focusKey = `favorite-${item.id}`;
    favorite.append(icon('heart'), node('span'));
    // Mais de uma variante do mesmo produto compartilha o mesmo favorito.
    const buttons = favoriteButtons.get(product.id) || [];
    buttons.push(favorite); favoriteButtons.set(product.id, buttons);
    favorite.addEventListener('click', () => {
      const result = ui.favorites.toggle(product.id);
      ui.notify(result.saved ? `${product.name} ${result.ids.includes(product.id) ? 'salva nos' : 'removida dos'} favoritos. A peça continua na sacola.` : 'A seleção mudou nesta página, mas o navegador não permitiu salvar os favoritos.');
    }); actions.append(favorite);
  }
  if (item.category === 'presente' && ui.cart.editableGift(item)) actions.append(link('Editar presente', `/presentes.html?editar=${encodeURIComponent(item.id)}`, 'bag-edit-gift'));
  const remove = node('button', 'Remover'); remove.type = 'button'; remove.dataset.focusKey = `remove-${item.id}`;
  remove.setAttribute('aria-label', `Remover ${item.name} da sacola`);
  remove.addEventListener('click', () => { const result = ui.cart.remove(item.id); if (!result.ok) failure(result); else ui.notify(`${item.name} removido da sacola.`); });
  actions.append(remove); controls.append(quantity, actions);
  row.append(renderMedia(item, product), body, node('p', formatCents(itemTotalCents(item)), 'bag-line-total'), controls);
  if (item.category === 'presente') row.append(node('p', 'A quantidade acima repete o presente completo, com todos os componentes.', 'bag-line-gift-note'));
  return row;
}
function renderSuggestions(items) {
  const choices = items.length ? selectBagSuggestions(products, items, complements) : [];
  suggestions.hidden = !choices.length;
  suggestionsGrid.hidden = !suggestionsOpen;
  toggleSuggestions.setAttribute('aria-expanded', String(suggestionsOpen));
  toggleSuggestions.textContent = suggestionsOpen ? 'Ocultar sugestões' : 'Ver sugestões';
  suggestionsGrid.replaceChildren();
  choices.forEach(product => {
    const card = node('article', '', 'bag-suggestion'); card.dataset.suggestionId = product.id;
    const photo = link('', productUrl(product.id), 'bag-suggestion-image'); photo.setAttribute('aria-label', `Conhecer ${product.name}`);
    photo.append(imageFor(product, '', `Ilustração provisória de ${product.name}`), node('small', 'Ilustração'));
    const heading = node('h3'); heading.append(link(product.name, productUrl(product.id)));
    const price = node('p', `${money.format(product.price)} `); price.append(node('small', 'Valor demonstrativo'));
    let action;
    if (product.variants?.length) action = link('Escolher opção', productUrl(product.id), 'button button-dark');
    else {
      action = node('button', 'Adicionar à sacola', 'button button-dark'); action.type = 'button'; action.disabled = adding.has(product.id);
      action.addEventListener('click', () => {
        if (adding.has(product.id)) return;
        adding.add(product.id); action.disabled = true;
        const result = ui.cart.addProduct(product.id);
        if (!result.ok) { adding.delete(product.id); action.disabled = false; failure(result); return; }
        ui.notify(`${product.name} adicionada à sacola.`);
        setTimeout(() => { adding.delete(product.id); }, 700);
      });
    }
    action.dataset.focusKey = `suggestion-${product.id}`;
    card.append(photo, heading, price, action); suggestionsGrid.append(card);
  });
}
function render() {
  const focus = document.activeElement;
  const key = focus?.dataset.focusKey;
  const oldRows = [...list.children];
  const oldIndex = oldRows.indexOf(focus?.closest('[data-line-id]'));
  const fromSuggestion = focus?.closest('[data-suggestion-id]');
  const items = ui.cart.getItems();
  document.querySelector('#bag-workspace').hidden = !items.length;
  document.querySelector('#bag-empty').hidden = Boolean(items.length);
  document.querySelector('#bag-count-copy').textContent = items.length ? `${itemCount(items)} ${itemCount(items) === 1 ? 'unidade' : 'unidades'} em ${items.length} ${items.length === 1 ? 'seleção' : 'seleções'}.` : 'Nenhum item na sacola.';
  favoriteButtons.clear();
  list.replaceChildren(...items.map(renderLine));
  // A map contém todos os botões das variantes do mesmo produto.
  updateFavoriteButtons(); renderSuggestions(items);
  const total = totalCents(items);
  document.querySelector('#bag-subtotal').textContent = formatCents(total);
  document.querySelector('#bag-total').textContent = formatCents(total);
  document.querySelector('#bag-summary-error').hidden = total !== null;
  if (key) {
    const replacement = [...document.querySelectorAll('[data-focus-key]')].find(button => button.dataset.focusKey === key);
    if (replacement && !replacement.disabled && replacement.getClientRects().length) replacement.focus({ preventScroll: true });
    else if (fromSuggestion) (suggestions.hidden ? title : suggestionsTitle).focus({ preventScroll: true });
    else if (oldIndex >= 0) (list.children[Math.min(oldIndex, list.children.length - 1)]?.querySelector('h2') || title).focus({ preventScroll: true });
  }
}
// Um produto pode ocupar mais de uma linha por variante; manter todos os corações em sincronia.
function updateFavoriteButtons() {
  const ids = ui.favorites.getIds();
  favoriteButtons.forEach((buttons, id) => buttons.forEach(button => {
    const saved = ids.includes(id);
    const product = products.find(product => product.id === id);
    button.setAttribute('aria-pressed', String(saved));
    button.setAttribute('aria-label', `${saved ? 'Remover' : 'Salvar'} ${product.name} ${saved ? 'dos' : 'nos'} favoritos`);
    button.querySelector('span').textContent = saved ? 'Nos favoritos' : 'Salvar nos favoritos';
  }));
}
toggleSuggestions.addEventListener('click', () => {
  suggestionsOpen = !suggestionsOpen;
  suggestionsGrid.hidden = !suggestionsOpen;
  toggleSuggestions.setAttribute('aria-expanded', String(suggestionsOpen));
  toggleSuggestions.textContent = suggestionsOpen ? 'Ocultar sugestões' : 'Ver sugestões';
});
ui.cart.subscribe(render);
ui.favorites.subscribe(updateFavoriteButtons);
document.querySelector('#bag-whatsapp').addEventListener('click', () => ui.showWhatsAppDraft());
render();
const params = new URLSearchParams(location.search);
if (params.get('presente')) {
  const row = [...list.children].find(row => row.dataset.lineId === params.get('presente'));
  row?.querySelector('h2')?.focus({ preventScroll: true });
  if (params.get('atualizado') === '1') ui.notify('Presente atualizado. A quantidade e os outros itens foram preservados.');
  history.replaceState(null, '', '/sacola.html');
}
