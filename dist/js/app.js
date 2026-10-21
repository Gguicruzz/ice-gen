import { products, combinations } from '../data/catalog.js';

const categories = [
  { id: 'corrente', label: 'Correntes', aliases: 'colar colares' }, { id: 'pingente', label: 'Pingentes' },
  { id: 'pulseira', label: 'Pulseiras' }, { id: 'anel', label: 'Anéis' },
  { id: 'brinco', label: 'Brincos' }, { id: 'alianca', label: 'Alianças' },
];
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const dialog = document.querySelector('#site-dialog');
const content = document.querySelector('#dialog-content');
const menu = document.querySelector('#mobile-menu');
const menuToggle = document.querySelector('.menu-toggle');
let dialogTrigger = null;

function node(tag, text, className) {
  const element = document.createElement(tag);
  if (text) element.textContent = text;
  if (className) element.className = className;
  return element;
}
function icon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  svg.setAttribute('class', 'icon');
  svg.setAttribute('aria-hidden', 'true');
  use.setAttribute('href', `#i-${name}`);
  svg.append(use);
  return svg;
}
function title(text) {
  const heading = node('h2', text);
  heading.id = 'dialog-title';
  content.append(heading);
}
function note(text) { content.append(node('p', text, 'dialog-note')); }
function returnToJewels(text = 'Explorar joias') {
  const link = node('a', text, 'button button-dark dialog-action');
  link.href = '#joias';
  link.append(icon('arrow'));
  link.addEventListener('click', () => dialog.close());
  content.append(link);
}
function setMenu(open, restoreFocus = false) {
  menu.hidden = !open;
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  menuToggle.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
  if (restoreFocus) menuToggle.focus();
}
function show(render) {
  const alreadyOpen = dialog.open;
  if (!alreadyOpen) dialogTrigger = menu.contains(document.activeElement) ? menuToggle : document.activeElement;
  setMenu(false);
  content.replaceChildren();
  render();
  if (!alreadyOpen) dialog.showModal();
  else {
    const heading = content.querySelector('h2');
    heading?.setAttribute('tabindex', '-1');
    heading?.focus({ preventScroll: true });
  }
  dialog.scrollTop = 0;
}

function productList(selection) {
  const list = node('div', '', 'preview-products');
  for (const product of selection) {
    const item = node('article', '', 'preview-product');
    const image = node('img');
    image.src = product.image;
    image.alt = `Ilustração provisória: ${product.name}`;
    image.width = 68;
    image.height = 68;
    const details = node('div');
    details.append(node('h3', product.name), node('p', `${product.material}${product.measurement ? ` · ${product.measurement}` : ''}`), node('p', `${money.format(product.price)} · valor demonstrativo`, 'demo-price'));
    item.append(image, details);
    list.append(item);
  }
  content.append(list);
}
function catalogPreview(category = 'all') {
  const selection = category === 'all' ? products : products.filter(product => product.category === category);
  show(() => {
    title(category === 'all' ? 'Um primeiro olhar nas peças.' : categories.find(item => item.id === category)?.label || 'Nossas joias');
    content.append(node('p', 'Prévia dos dados preservados do projeto anterior.', 'dialog-lead'));
    productList(selection);
    note('Catálogo demonstrativo: preços e desenhos provisórios, sem estoque ou venda nesta prévia. A página completa do catálogo e os detalhes das peças serão reconstruídos após a revisão da Home. As fotografias de campanha são ilustrativas.');
    returnToJewels('Voltar à Home');
  });
}
function combinationPreview(id) {
  const combination = combinations.find(item => item.id === id);
  if (!combination) return;
  show(() => {
    title(combination.title);
    content.append(node('p', combination.description, 'dialog-lead'));
    productList(combination.productIds.map(productId => products.find(product => product.id === productId)).filter(Boolean));
    note('Sugestão editorial com as peças do catálogo demonstrativo. Os itens são separados e não representam um kit. Preços e ilustrações aguardam validação comercial.');
    returnToJewels('Explorar outras peças');
  });
}
function emptyPreview(name, heading, description) {
  const box = node('div', '', 'dialog-empty');
  box.append(icon(name));
  content.append(box);
  const h = node('h2', heading);
  h.id = 'dialog-title';
  box.append(h, node('p', description));
  returnToJewels();
  note('Primeira etapa: Home para revisão. Este recurso será disponibilizado nas próximas etapas do projeto.');
}

function searchPreview() {
  title('Qual é a sua próxima peça?');
  const label = node('label', 'Busque por peça ou categoria', 'search-label');
  label.htmlFor = 'jewel-search';
  const input = node('input', '', 'search-field');
  input.id = 'jewel-search';
  input.type = 'search';
  input.placeholder = 'Corrente, pingente, anel…';
  input.autocomplete = 'off';
  input.maxLength = 100;
  input.setAttribute('aria-controls', 'search-results');
  const results = node('div', '', 'search-results');
  results.id = 'search-results';
  const status = node('p', '', 'search-status');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  function updateResults() {
    results.replaceChildren();
    const query = normalize(input.value);
    const matchingCategories = categories.filter(category => !query || normalize(`${category.label} ${category.id} ${category.aliases || ''}`).includes(query));
    const matches = products.filter(product => {
      const category = categories.find(item => item.id === product.category);
      return query && normalize(`${product.name} ${product.categoryLabel} ${category?.label} ${category?.aliases || ''}`).includes(query);
    }).slice(0, 5);
    for (const category of matchingCategories) {
      const button = node('button', '', 'search-result');
      button.type = 'button';
      const text = node('span', category.label);
      text.append(node('small', 'Explorar categoria'));
      button.append(text, icon('arrow'));
      button.addEventListener('click', () => catalogPreview(category.id));
      results.append(button);
    }
    for (const product of matches) {
      const button = node('button', '', 'search-result');
      button.type = 'button';
      const text = node('span', product.name);
      text.append(node('small', 'Dados demonstrativos · visualizar categoria'));
      button.append(text, icon('arrow'));
      button.addEventListener('click', () => catalogPreview(product.category));
      results.append(button);
    }
    const count = matchingCategories.length + matches.length;
    status.textContent = query ? `${count} ${count === 1 ? 'sugestão encontrada' : 'sugestões encontradas'}.` : '';
    if (!count) results.append(node('p', 'Ainda não encontramos essa peça. Tente “corrente”, “colar” ou explore as categorias da Home.', 'empty-search'));
  }
  input.addEventListener('input', updateResults);
  content.append(label, input, results, status);
  note('Busca na prévia do catálogo demonstrativo. Nenhum pedido é realizado nesta etapa.');
  updateResults();
  requestAnimationFrame(() => input.focus());
}
function openDialog(type) {
  show(() => {
    if (type === 'search') { searchPreview(); return; }
    if (type === 'bag') { emptyPreview('bag', 'O começo de uma escolha.', 'A sacola ainda não está disponível nesta prévia. Explore as peças enquanto preparamos os próximos passos.'); return; }
    if (type === 'favorites') { emptyPreview('heart', 'Suas escolhas, por perto.', 'Em breve, você poderá salvar suas peças favoritas para voltar a elas quando quiser.'); return; }
    if (type === 'account') { emptyPreview('person', 'Seu espaço na ICE GEN.', 'O acesso à conta ainda não está disponível nesta prévia.'); return; }
    if (type === 'gift') {
      title('Um presente com a sua escolha.');
      content.append(node('p', 'O fluxo do projeto anterior será preservado: escolher uma corrente, um pingente e uma embalagem, revisar a combinação e acompanhar o total.', 'dialog-lead'));
      note('A montagem será reconstruída na etapa de presentes, após a revisão desta Home. As opções de embalagem e os valores ainda são demonstrativos.');
      returnToJewels('Conhecer as peças');
      return;
    }
    if (type === 'care') {
      title('Cuide dos seus detalhes.');
      const list = node('ul', '', 'care-list');
      for (const text of ['A prata pode oxidar naturalmente. Guarde suas peças em local seco, de preferência separadas.', 'Limpe delicadamente com uma flanela macia.', 'Evite contato direto com perfumes e produtos químicos.']) list.append(node('li', text));
      content.append(list);
      return;
    }
    title('Fale com a ICE GEN.');
    content.append(node('p', 'O canal oficial de atendimento será confirmado antes da abertura da loja. Esta prévia não recebe pedidos.', 'dialog-lead'));
    note('O contato encontrado no projeto anterior permanece registrado no inventário, aguardando validação. Nenhum número demonstrativo foi publicado como contato oficial.');
    returnToJewels('Continuar explorando');
  });
}

document.querySelectorAll('[data-dialog]').forEach(button => button.addEventListener('click', () => openDialog(button.dataset.dialog)));
document.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => catalogPreview(button.dataset.category)));
document.querySelectorAll('[data-combination]').forEach(button => button.addEventListener('click', () => combinationPreview(button.dataset.combination)));
menuToggle.addEventListener('click', () => setMenu(menu.hidden));
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('click', event => { if (!menu.hidden && !event.target.closest('.site-header')) setMenu(false); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !menu.hidden) setMenu(false, true);
});
matchMedia('(min-width: 901px)').addEventListener('change', event => { if (event.matches) setMenu(false); });
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
dialog.addEventListener('close', () => {
  if (dialogTrigger?.isConnected && dialogTrigger.getClientRects().length) dialogTrigger.focus({ preventScroll: true });
  else if (menuToggle.getClientRects().length) menuToggle.focus({ preventScroll: true });
});
document.querySelector('#year').textContent = String(new Date().getFullYear());
