import { mountSiteShell } from './site-shell.js';
import { createFavoritesStore } from './favorites-store.js';
import { products } from '../data/catalog.js';
import { categories, normalizeSearch } from './catalog-model.js';
import { createCartStore, itemCount, totalCents, itemTotalCents, productUrl } from './cart-store.js';
import { wraps as giftWraps } from '../data/gifts.js';

export const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export function node(tag, text, className) {
  const element = document.createElement(tag);
  if (text) element.textContent = text;
  if (className) element.className = className;
  return element;
}
export function icon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  svg.setAttribute('class', 'icon');
  svg.setAttribute('aria-hidden', 'true');
  use.setAttribute('href', `#i-${name}`);
  svg.append(use);
  return svg;
}
export function catalogUrl({ query = '', category = '', favorites = false } = {}) {
  const params = new URLSearchParams();
  if (query) params.set('busca', query);
  if (category) params.set('categoria', category);
  if (favorites) params.set('favoritos', '1');
  return `/catalogo.html${params.size ? `?${params}` : ''}`;
}

export function createSiteUI({ page = 'home', onAction, wraps = giftWraps } = {}) {
  mountSiteShell({ page });
  const dialog = document.querySelector('#site-dialog');
  const content = document.querySelector('#dialog-content');
  const menu = document.querySelector('#mobile-menu');
  const menuToggle = document.querySelector('.menu-toggle');
  const feedback = document.querySelector('#site-feedback');
  let trigger = null;
  let triggerKey = null;
  let feedbackTimer;
  let storage;
  try { storage = window.localStorage; } catch { storage = undefined; }
  const favorites = createFavoritesStore({ storage, validIds: products.map(product => product.id) });
  const cart = createCartStore({ storage, products, wraps });

  function notify(message) {
    clearTimeout(feedbackTimer);
    if (dialog.open) {
      content.querySelector('#dialog-feedback').textContent = message;
      feedback.textContent = '';
      feedback.classList.remove('is-visible');
      return;
    }
    feedback.textContent = message;
    feedback.classList.add('is-visible');
    feedbackTimer = setTimeout(() => feedback.classList.remove('is-visible'), 6000);
  }
  function title(text) {
    const heading = node('h2', text);
    heading.id = 'dialog-title';
    content.append(heading);
    return heading;
  }
  function note(text) { content.append(node('p', text, 'dialog-note')); }
  function setMenu(open, restoreFocus = false) {
    menu.hidden = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menuToggle.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
    if (restoreFocus) menuToggle.focus();
  }
  function show(render) {
    const alreadyOpen = dialog.open;
    if (!alreadyOpen) {
      trigger = menu.contains(document.activeElement) ? menuToggle : document.activeElement;
      triggerKey = trigger?.dataset.focusKey || null;
    }
    setMenu(false);
    content.replaceChildren();
    render();
    const modalFeedback = node('p', '', 'dialog-feedback');
    modalFeedback.id = 'dialog-feedback';
    modalFeedback.setAttribute('role', 'status');
    modalFeedback.setAttribute('aria-live', 'polite');
    content.insertBefore(modalFeedback, content.querySelector('.quick-product-actions'));
    if (!alreadyOpen) dialog.showModal();
    else {
      const heading = content.querySelector('h2');
      heading?.setAttribute('tabindex', '-1');
      heading?.focus({ preventScroll: true });
    }
    dialog.scrollTop = 0;
  }
  function catalogLink(text = 'Explorar joias', options = {}) {
    const link = node('a', text, 'button button-dark dialog-action');
    link.href = catalogUrl(options);
    link.append(icon('arrow'));
    content.append(link);
    return link;
  }
  function search() {
    show(() => {
      title('Qual é a sua próxima peça?');
      const form = node('form', '', 'dialog-search-form');
      form.action = '/catalogo.html';
      form.method = 'get';
      const label = node('label', 'Busque por peça ou categoria', 'search-label');
      label.htmlFor = 'jewel-search';
      const input = node('input', '', 'search-field');
      Object.assign(input, { id: 'jewel-search', name: 'busca', type: 'search', placeholder: 'Corrente, pingente, anel…', autocomplete: 'off', maxLength: 100 });
      const results = node('div', '', 'search-results');
      results.id = 'search-results';
      input.setAttribute('aria-controls', results.id);
      const status = node('p', '', 'search-status');
      status.setAttribute('role', 'status');
      const submit = node('button', 'Buscar no catálogo', 'button button-dark dialog-action');
      submit.type = 'submit';
      function suggestions() {
        results.replaceChildren();
        const query = normalizeSearch(input.value);
        const found = categories.filter(category => !query || normalizeSearch(`${category.label} ${category.aliases.join(' ')}`).includes(query));
        for (const category of found) {
          const link = node('a', category.label, 'search-result');
          link.href = catalogUrl({ category: category.id });
          link.append(icon('arrow'));
          results.append(link);
        }
        if (query && !found.length) results.append(node('p', 'Pressione Enter para buscar todas as peças no catálogo.', 'empty-search'));
        status.textContent = query ? `${found.length} ${found.length === 1 ? 'categoria sugerida' : 'categorias sugeridas'}.` : '';
      }
      input.addEventListener('input', suggestions);
      form.append(label, input, results, status, submit);
      content.append(form);
      suggestions();
      requestAnimationFrame(() => input.focus());
    });
  }
  function commonAction(type) {
    if (type === 'search') { search(); return; }
    if (type === 'favorites') { location.assign(catalogUrl({ favorites: true })); return; }
    if (type === 'bag') { openBag(); return; }
    if (type === 'gift') { location.assign('/presentes.html'); return; }
    show(() => {
      if (type === 'care') {
        title('Cuide dos seus detalhes.');
        const list = node('ul', '', 'care-list');
        ['Guarde suas peças em local seco, de preferência separadas. A prata pode oxidar naturalmente.', 'Limpe delicadamente com uma flanela macia.', 'Evite contato direto com perfumes e produtos químicos.'].forEach(text => list.append(node('li', text)));
        content.append(list);
        return;
      }
      if (type === 'contact') {
        title('Fale com a ICE GEN.');
        content.append(node('p', 'O canal oficial de atendimento será disponibilizado após confirmação.', 'dialog-lead'));
        note('Contato pendente de confirmação. Esta prévia não recebe pedidos.');
      } else {
        title(type === 'bag' ? 'O começo de uma escolha.' : 'Seu espaço na ICE GEN.');
        content.append(node('p', type === 'bag' ? 'Explore as peças e encontre a sua combinação.' : 'O acesso à conta ainda não está disponível.', 'dialog-lead'));
        note(`${type === 'bag' ? 'A sacola' : 'A conta'} ainda não está disponível nesta prévia.`);
      }
      catalogLink();
    });
  }
  function openBag({ focusKey } = {}) {
    cart.refresh();
    show(() => {
      title('Sua sacola. Suas escolhas.');
      const items = cart.getItems();
      const list = node('div', '', 'bag-preview-list');
      list.dataset.bagList = '';
      if (!items.length) list.append(node('p', 'Sua sacola está vazia. Encontre a peça que combina com você.', 'dialog-lead'));
      function mutate(action) {
        const result = action();
        if (!result.ok) notify(result.reason === 'quantity' || result.reason === 'limit' ? 'Escolha uma quantidade inteira entre 1 e 99.' : 'Não foi possível atualizar a sacola. Tente novamente com o armazenamento do navegador permitido.');
      }
      for (const item of items) {
        const row = node('article', '', 'bag-preview-item');
        row.dataset.lineId = item.id;
        const body = node('div', '', 'bag-preview-body');
        const name = node('h3', item.name);
        if (item.category !== 'presente') {
          const product = products.find(product => product.id === (item.productId || item.id));
          if (product) { const anchor = node('a', item.name); anchor.href = productUrl(product.id); name.replaceChildren(anchor); }
        }
        body.append(name);
        if (item.variantLabel) body.append(node('p', item.variantLabel, 'bag-preview-meta'));
        if (Array.isArray(item.giftComponents) && item.giftComponents.length) {
          const parts = node('ul', '', 'bag-preview-components');
          item.giftComponents.filter(part => part && typeof part.name === 'string').forEach(part => parts.append(node('li', `${part.name}${part.variantLabel ? ` · ${part.variantLabel}` : ''}${part.quantity > 1 ? ` × ${part.quantity}` : ''}`)));
          body.append(parts);
        }
        body.append(node('p', `${money.format(item.price)} / ${item.category === 'presente' ? 'presente' : 'unidade'}`, 'bag-preview-meta'));
        const actions = node('div', '', 'bag-preview-actions');
        const label = node('label', 'Qtd.');
        const quantity = node('input');
        Object.assign(quantity, { type: 'number', min: '1', max: '99', step: '1', value: String(item.quantity), inputMode: 'numeric' });
        quantity.setAttribute('aria-label', `Quantidade de ${item.name}`);
        quantity.dataset.focusKey = `bag-quantity-${item.id}`;
        const quantityForm = node('form', '', 'bag-quantity-form');
        quantityForm.noValidate = true;
        const update = node('button', 'Atualizar'); update.type = 'submit'; update.setAttribute('aria-label', `Atualizar quantidade de ${item.name}`);
        update.dataset.focusKey = `bag-update-${item.id}`;
        quantityForm.addEventListener('submit', event => {
          event.preventDefault();
          const result = cart.setQuantity(item.id, Number(quantity.value));
          if (!result.ok) { quantity.value = String(item.quantity); notify('Não foi possível alterar a quantidade. Use um inteiro de 1 a 99 e permita o armazenamento do navegador.'); }
        });
        label.append(quantity); quantityForm.append(label, update); actions.append(quantityForm);
        if (item.category === 'presente' && cart.editableGift(item)) {
          const edit = node('a', 'Editar presente'); edit.href = `/presentes.html?editar=${encodeURIComponent(item.id)}`; actions.append(edit);
        }
        const remove = node('button', 'Remover'); remove.type = 'button'; remove.setAttribute('aria-label', `Remover ${item.name} da sacola`);
        remove.addEventListener('click', () => mutate(() => cart.remove(item.id)));
        actions.append(remove);
        body.append(actions);
        row.append(body, node('strong', money.format(itemTotalCents(item) / 100), 'bag-preview-line-total'));
        list.append(row);
      }
      content.append(list);
      if (items.length) {
        const total = node('p', '', 'bag-preview-total');
        const cents = totalCents(items);
        total.append(node('span', 'Subtotal demonstrativo'), node('strong', cents === null ? 'A conferir' : money.format(cents / 100))); content.append(total);
        if (cents === null) note('O total não pôde ser calculado. Confira as quantidades e remova itens inválidos antes de continuar.');
      }
      note('Escolhas salvas neste navegador. Valores demonstrativos. Frete e finalização de pedido ainda não estão disponíveis.');
      catalogLink(items.length ? 'Continuar explorando' : 'Explorar joias');
    });
    if (focusKey) content.querySelector(`[data-focus-key="${CSS.escape(focusKey)}"]`)?.focus({ preventScroll: true });
  }
  function updateCart() {
    const count = itemCount(cart.getItems());
    document.querySelectorAll('.bag-count').forEach(counter => { counter.textContent = count; counter.setAttribute('aria-label', `${count} ${count === 1 ? 'item' : 'itens'}`); });
    document.querySelectorAll('[data-dialog="bag"]').forEach(button => button.setAttribute('aria-label', `Abrir sacola, ${count} ${count === 1 ? 'item' : 'itens'}`));
    if (dialog.open && content.querySelector('[data-bag-list]')) {
      const focusKey = document.activeElement?.dataset.focusKey;
      // Reuse the modal so the next change keeps its focus and scroll context.
      openBag({ focusKey });
    }
  }
  function updateFavoritesCount() {
    const count = favorites.getIds().length;
    document.querySelectorAll('[data-favorites-count]').forEach(counter => {
      counter.textContent = count;
      counter.hidden = !count;
    });
    document.querySelectorAll('[data-dialog="favorites"]').forEach(button => button.setAttribute('aria-label', `${button.closest('.mobile-menu') ? 'Meus favoritos' : 'Favoritos'}, ${count} ${count === 1 ? 'peça salva' : 'peças salvas'}`));
  }
  document.querySelectorAll('[data-dialog]').forEach(button => button.addEventListener('click', () => {
    if (onAction?.(button.dataset.dialog) !== true) commonAction(button.dataset.dialog);
  }));
  menuToggle.addEventListener('click', () => setMenu(menu.hidden));
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    setMenu(false);
    const destination = new URL(link.href);
    if (destination.pathname !== location.pathname && !(destination.pathname === '/' && location.pathname === '/index.html')) return;
    const target = document.getElementById(destination.hash.slice(1));
    target?.setAttribute('tabindex', '-1');
    target?.focus({ preventScroll: true });
  }));
  document.addEventListener('click', event => { if (!menu.hidden && !event.target.closest('.site-header')) setMenu(false); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !menu.hidden) setMenu(false, true); });
  matchMedia('(min-width: 901px)').addEventListener('change', event => { if (event.matches) setMenu(false); });
  document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    const replacement = triggerKey && [...document.querySelectorAll('[data-focus-key]')].find(button => button.dataset.focusKey === triggerKey);
    if (trigger?.isConnected && trigger.getClientRects().length) trigger.focus({ preventScroll: true });
    else if (replacement) replacement.focus({ preventScroll: true });
    else if (document.querySelector('#results-title')) document.querySelector('#results-title').focus({ preventScroll: true });
    else if (menuToggle.getClientRects().length) menuToggle.focus({ preventScroll: true });
    else document.querySelector('main')?.focus({ preventScroll: true });
  });
  favorites.subscribe(updateFavoritesCount);
  cart.subscribe(updateCart);
  addEventListener('storage', event => { if (event.key === 'icegen-favorites' || event.key === null) favorites.refresh(); });
  addEventListener('storage', event => { if (event.key === 'icegen-cart' || event.key === null) cart.refresh(); });
  addEventListener('pageshow', () => { favorites.refresh(); cart.refresh(); });
  updateFavoritesCount();
  updateCart();
  document.querySelector('#year').textContent = new Date().getFullYear();
  return { dialog, content, show, title, note, catalogLink, favorites, cart, openBag, notify, setMenu };
}
