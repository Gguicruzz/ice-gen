import { mountSiteShell } from './site-shell.js';
import { createFavoritesStore } from './favorites-store.js';
import { products } from '../data/catalog.js';
import { categories, normalizeSearch } from './catalog-model.js';

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

export function createSiteUI({ page = 'home', onAction } = {}) {
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
    show(() => {
      if (type === 'care') {
        title('Cuide dos seus detalhes.');
        const list = node('ul', '', 'care-list');
        ['Guarde suas peças em local seco, de preferência separadas. A prata pode oxidar naturalmente.', 'Limpe delicadamente com uma flanela macia.', 'Evite contato direto com perfumes e produtos químicos.'].forEach(text => list.append(node('li', text)));
        content.append(list);
        return;
      }
      if (type === 'gift') {
        title('Um presente com a sua escolha.');
        content.append(node('p', 'Uma corrente, um pingente e uma embalagem. Escolha cada detalhe para criar um presente com significado.', 'dialog-lead'));
        note('Montagem indisponível nesta prévia. Peças, embalagens e valores aguardam confirmação.');
      } else if (type === 'contact') {
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
  });
  favorites.subscribe(updateFavoritesCount);
  addEventListener('storage', event => { if (event.key === 'icegen-favorites' || event.key === null) favorites.refresh(); });
  updateFavoritesCount();
  document.querySelector('#year').textContent = new Date().getFullYear();
  return { dialog, content, show, title, note, catalogLink, favorites, notify, setMenu };
}
