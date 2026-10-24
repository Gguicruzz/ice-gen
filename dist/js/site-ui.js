import { mountSiteShell } from './site-shell.js';
import { createFavoritesStore } from './favorites-store.js';
import { products } from '../data/catalog.js';
import { categories, normalizeSearch, selectProducts } from './catalog-model.js';
import { createCartStore, itemCount, productUrl } from './cart-store.js';
import { wraps as giftWraps } from '../data/gifts.js';
import { whatsapp } from '../data/config.js';
import { createWhatsAppDraft } from './whatsapp-model.js';

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
  function show(render, { wide = false } = {}) {
    const alreadyOpen = dialog.open;
    if (!alreadyOpen) {
      trigger = menu.contains(document.activeElement) ? menuToggle : document.activeElement;
      triggerKey = trigger?.dataset.focusKey || null;
    }
    setMenu(false);
    dialog.classList.toggle('dialog-wide', wide);
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
      form.setAttribute('role', 'search');
      const label = node('label', 'Nome, categoria, material ou medida', 'search-label');
      label.htmlFor = 'jewel-search';
      const input = node('input', '', 'search-field');
      Object.assign(input, { id: 'jewel-search', name: 'busca', type: 'search', placeholder: 'Ex.: argola, prata 925, corrente 45 cm', autocomplete: 'off', maxLength: 100 });
      const field = node('div', '', 'search-input-wrap');
      const clear = node('button', '', 'search-clear');
      clear.type = 'button'; clear.setAttribute('aria-label', 'Limpar busca'); clear.append(icon('close')); clear.hidden = true;
      field.append(icon('search'), input, clear);
      const suggestionsHost = node('div', '', 'search-categories');
      suggestionsHost.setAttribute('aria-label', 'Explorar por categoria');
      const results = node('div', '', 'search-results');
      results.id = 'search-results';
      input.setAttribute('aria-controls', results.id);
      const status = node('p', '', 'search-status');
      status.id = 'search-feedback';
      input.setAttribute('aria-describedby', status.id);
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite'); status.setAttribute('aria-atomic', 'true');
      const submit = node('button', 'Buscar no catálogo', 'button button-dark dialog-action');
      submit.type = 'submit';
      function suggestions() {
        results.replaceChildren();
        suggestionsHost.replaceChildren();
        const query = normalizeSearch(input.value);
        clear.hidden = !input.value;
        const found = selectProducts(products, { query });
        const matchingCategories = categories.filter(category => !query || normalizeSearch(`${category.label} ${category.aliases.join(' ')}`).includes(query));
        for (const category of matchingCategories) {
          const link = node('a', category.label, 'search-category');
          link.href = catalogUrl({ category: category.id });
          suggestionsHost.append(link);
        }
        for (const product of found.slice(0, 4)) {
          const link = node('a', '', 'search-product'); link.href = productUrl(product.id);
          const image = node('img'); Object.assign(image, { src: product.image, alt: '', width: 64, height: 64 });
          const details = node('span', '', 'search-product-details');
          details.append(node('strong', product.name), node('span', `${product.material} · ilustração`, 'search-product-meta'), node('span', money.format(product.price), 'search-product-price'));
          link.append(image, details, icon('arrow')); results.append(link);
        }
        if (query && !found.length) {
          const empty = node('div', '', 'search-empty');
          empty.append(node('strong', 'Nenhuma peça encontrada.'), node('p', 'Tente um termo mais curto, como “argola”, “corrente” ou “prata”.'));
          results.append(empty);
        }
        status.textContent = query ? `${found.length} ${found.length === 1 ? 'peça encontrada' : 'peças encontradas'}${found.length > 4 ? '. Mostrando as primeiras 4' : ''}.` : 'Algumas peças para começar a explorar.';
        submit.textContent = query ? (found.length ? `Ver ${found.length === 1 ? 'a peça no' : `as ${found.length} peças no`} catálogo` : 'Buscar no catálogo') : 'Explorar todo o catálogo';
      }
      input.addEventListener('input', suggestions);
      clear.addEventListener('click', () => { input.value = ''; suggestions(); input.focus(); });
      form.append(label, field, suggestionsHost, status, results, submit);
      form.append(node('p', 'Imagens e valores demonstrativos.', 'search-demo-note'));
      content.append(form);
      suggestions();
      requestAnimationFrame(() => input.focus());
    });
  }
  function commonAction(type) {
    if (type === 'search') { search(); return; }
    if (type === 'favorites') {
      if (page === 'favorites') document.querySelector('#favorites-results-title')?.focus();
      else location.assign('/favoritos.html');
      return;
    }
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
        content.append(node('p', 'Uma dúvida sobre uma peça ou uma combinação? Converse com a ICE GEN pelo WhatsApp.', 'dialog-lead'));
        if (whatsapp.validated) {
          const contact = node('a', `WhatsApp · ${whatsapp.display}`, 'button button-dark dialog-action');
          Object.assign(contact, { href: `https://wa.me/${whatsapp.number}`, target: '_blank', rel: 'noopener noreferrer' });
          contact.append(icon('arrow')); content.append(contact);
          if (cart.getItems().length) {
            const summary = node('button', 'Consultar minhas escolhas', 'button button-secondary dialog-action'); summary.type = 'button'; summary.addEventListener('click', showWhatsAppDraft); content.append(summary);
          }
          note('Disponibilidade, preços finais e entrega serão confirmados no atendimento.');
        } else note('O canal de atendimento ainda aguarda confirmação.');
      } else {
        title('Seu espaço na ICE GEN.');
        content.append(node('p', 'O acesso à conta ainda não está disponível.', 'dialog-lead'));
        note('Suas escolhas são salvas neste navegador, sem necessidade de criar uma conta.');
      }
      catalogLink();
    });
  }
  function openBag() {
    if (page !== 'bag') { location.assign('/sacola.html'); return; }
    if (dialog.open) dialog.close();
    const heading = document.querySelector('#bag-title');
    heading?.focus();
  }
  function showWhatsAppDraft() {
    cart.refresh();
    const draft = createWhatsAppDraft(cart.getItems(), whatsapp);
    show(() => {
      title(draft.ok ? 'Uma conversa sobre suas escolhas.' : 'Vamos conferir sua sacola.');
      if (!draft.ok) {
        const messages = {
          empty: 'Sua sacola está vazia. Escolha uma peça antes de consultar a composição.',
          contact: 'O canal de WhatsApp ainda aguarda confirmação.',
          length: 'Sua seleção é longa demais para um único link. Converse com a ICE GEN pelo contato direto e consulte as peças em sua sacola.',
          components: 'Um dos presentes tem informações incompletas. Confira seus componentes ou refaça a montagem antes de continuar.'
        };
        content.append(node('p', messages[draft.reason] || 'Algum item precisa ser conferido. Revise as quantidades e os valores antes de continuar.', 'dialog-lead'));
        catalogLink('Explorar o catálogo'); return;
      }
      const preview = node('div'); preview.dataset.whatsappPreview = '';
      const label = node('label', 'Resumo para o atendimento', 'search-label'); label.htmlFor = 'whatsapp-message';
      const message = node('textarea', '', 'whatsapp-message');
      Object.assign(message, { id: 'whatsapp-message', rows: 11, readOnly: true, value: draft.message });
      const external = node('a', 'Abrir no WhatsApp', 'button button-dark dialog-action');
      Object.assign(external, { href: draft.url, target: '_blank', rel: 'noopener noreferrer' });
      external.dataset.whatsappLink = ''; external.append(icon('arrow'));
      external.addEventListener('click', event => {
        cart.refresh();
        const current = createWhatsAppDraft(cart.getItems(), whatsapp);
        if (external.getAttribute('aria-disabled') === 'true' || !current.ok || current.url !== draft.url) {
          event.preventDefault(); showWhatsAppDraft(); notify('A sacola mudou. Confira o resumo atualizado antes de abrir o WhatsApp.');
        }
      });
      const refresh = node('button', 'Atualizar resumo', 'button button-secondary dialog-action'); refresh.type = 'button'; refresh.hidden = true; refresh.dataset.whatsappRefresh = '';
      refresh.addEventListener('click', showWhatsAppDraft);
      preview.append(label, message, external, refresh); content.append(preview);
      note('Você poderá revisar a mensagem no WhatsApp antes de enviar. Abrir a conversa mantém sua sacola e não confirma compra ou pagamento.');
    });
  }
  function updateCart() {
    const count = itemCount(cart.getItems());
    document.querySelectorAll('.bag-count').forEach(counter => { counter.textContent = count; counter.setAttribute('aria-label', `${count} ${count === 1 ? 'item' : 'itens'}`); });
    document.querySelectorAll('[data-dialog="bag"]').forEach(button => button.setAttribute('aria-label', `Abrir sacola, ${count} ${count === 1 ? 'item' : 'itens'}`));
    if (dialog.open && content.querySelector('[data-whatsapp-preview]')) {
      const link = content.querySelector('[data-whatsapp-link]');
      link.removeAttribute('href'); link.setAttribute('aria-disabled', 'true');
      content.querySelector('[data-whatsapp-refresh]').hidden = false;
      content.querySelector('#dialog-feedback').textContent = 'A sacola mudou. Atualize o resumo antes de continuar.';
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
  if (page === 'home') {
    const legacy = new URLSearchParams(location.search);
    if (legacy.get('sacola') === '1') location.replace('/sacola.html');
    else if (legacy.get('favoritos') === '1') location.replace('/favoritos.html');
  }
  return { dialog, content, show, title, note, catalogLink, favorites, cart, openBag, showWhatsAppDraft, notify, setMenu };
}
