import { products, complements } from '../data/catalog.js';
import { categories } from './catalog-model.js';
import { createSiteUI, node, icon, money, catalogUrl } from './site-ui.js';
import { productUrl, validateProductSelection } from './cart-store.js';

const ui = createSiteUI({ page: 'product' });
const host = document.querySelector('#product-content');
const id = new URLSearchParams(location.search).get('id');
const product = products.find(item => item.id === id);

function link(text, href, className) {
  const element = node('a', text, className);
  element.href = href;
  return element;
}
function relatedCard(item) {
  const card = node('article', '', 'product-card');
  const media = link('', productUrl(item.id), 'product-image-button product-media');
  media.setAttribute('aria-label', `Conhecer ${item.name}`);
  const image = node('img');
  Object.assign(image, { src: item.image, alt: `Ilustração provisória de ${item.name}`, width: 1000, height: 1000, loading: 'lazy' });
  media.append(image, node('span', 'Ilustração', 'illustration-label'));
  const title = node('h3', '', 'product-name');
  title.append(link(item.name, productUrl(item.id)));
  const price = node('p', money.format(item.price), 'product-price');
  price.append(node('small', 'Valor demonstrativo'));
  card.append(media, node('p', `${item.categoryLabel} · ${item.material}`, 'product-category'), title, price, link('Conhecer a peça →', productUrl(item.id), 'product-details'));
  return card;
}
function details() {
  const section = node('section', '', 'product-details-section');
  section.setAttribute('aria-label', 'Detalhes da peça');
  const list = node('div', '', 'product-tab-list');
  list.setAttribute('role', 'tablist');
  list.setAttribute('aria-label', 'Informações da peça');
  const measurements = product.measurement ? `Medida cadastrada: ${product.measurement}.` : 'As medidas desta peça ainda não foram informadas.';
  const ringNote = ['anel', 'alianca'].includes(product.category) ? ' A numeração do aro e as opções de tamanho aguardam confirmação.' : ' Não há outras opções de medida cadastradas para esta peça.';
  const texts = [
    ['Descrição', product.description],
    ['Material', `Material informado no catálogo: ${product.material}. Acabamento e demais especificações aguardam confirmação.`],
    ['Medidas', measurements + ringNote],
    ['Cuidados', 'Guarde a peça em local seco e separada de outras joias. Limpe delicadamente com uma flanela macia. Evite contato direto com perfumes e produtos químicos. A prata pode oxidar naturalmente.']
  ];
  const tabs = [], panels = [];
  function activate(index, focus = false) {
    tabs.forEach((tab, i) => { tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1; panels[i].hidden = i !== index; });
    if (focus) tabs[index].focus();
  }
  texts.forEach(([label, text], index) => {
    const tab = node('button', label);
    Object.assign(tab, { type: 'button', id: `product-tab-${index}` });
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', `product-panel-${index}`);
    const panel = node('div', text, 'product-tab-panel');
    Object.assign(panel, { id: `product-panel-${index}`, tabIndex: 0 });
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    tab.addEventListener('click', () => activate(index));
    tab.addEventListener('keydown', event => {
      const next = { ArrowRight: (index + 1) % texts.length, ArrowLeft: (index + texts.length - 1) % texts.length, Home: 0, End: texts.length - 1 }[event.key];
      if (next !== undefined) { event.preventDefault(); activate(next, true); }
    });
    tabs.push(tab); panels.push(panel); list.append(tab);
  });
  activate(0);
  section.append(list, ...panels);
  return section;
}

if (!product) {
  document.title = 'Peça não encontrada — ICE GEN';
  const empty = node('section', '', 'product-not-found');
  empty.append(node('p', 'ICE GEN', 'eyebrow'), node('h1', 'Essa peça não foi encontrada.'), node('p', 'Explore o catálogo para encontrar as peças disponíveis nesta prévia.'), link('Voltar ao catálogo', '/catalogo.html', 'button button-dark'));
  host.append(empty);
} else {
  document.title = `${product.name} — ICE GEN`;
  document.querySelector('meta[name="description"]').content = product.description;
  const category = categories.find(item => item.id === product.category);
  const breadcrumb = node('nav', '', 'breadcrumb');
  breadcrumb.setAttribute('aria-label', 'Você está aqui');
  const current = node('span', product.name);
  current.setAttribute('aria-current', 'page');
  breadcrumb.append(link('Início', '/'), node('span', '/'), link('Joias', '/catalogo.html'), node('span', '/'), link(category?.label || product.categoryLabel, catalogUrl({ category: product.category })), node('span', '/'), current);
  const layout = node('div', '', 'product-layout');
  const gallery = node('div', '', 'product-gallery');
  const image = node('img');
  Object.assign(image, { src: product.image, alt: `Ilustração provisória de ${product.name}`, width: 1000, height: 1000, fetchPriority: 'high' });
  const zoom = node('button', '', 'gallery-zoom');
  zoom.type = 'button'; zoom.setAttribute('aria-label', 'Ampliar ilustração da peça'); zoom.append(icon('search'));
  zoom.addEventListener('click', () => ui.show(() => {
    ui.title(product.name);
    const enlarged = image.cloneNode();
    enlarged.className = 'product-zoom-image';
    ui.content.append(enlarged);
    ui.note('Ilustração provisória. A fotografia oficial ainda não está disponível.');
  }));
  const caption = node('div', '', 'product-gallery-caption');
  caption.append(node('span', 'Ilustração provisória do catálogo'), node('span', '01 / 01'));
  gallery.append(image, zoom, caption);
  const info = node('div', '', 'product-info');
  const price = node('p', money.format(product.price), 'product-detail-price');
  price.append(node('small', 'Valor demonstrativo'));
  info.append(node('p', 'ICE GEN · PRATA 925', 'eyebrow'), node('h1', product.name), price, node('p', product.description, 'product-intro'));
  const specs = node('dl', '', 'product-specs');
  for (const [label, value] of [['Material', product.material], ['Medida', product.measurement || 'A confirmar']]) {
    const pair = node('div'); pair.append(node('dt', label), node('dd', value)); specs.append(pair);
  }
  info.append(specs);
  const form = node('form', '', 'product-form');
  form.noValidate = true;
  let variantSelect;
  if (product.variants?.length) {
    const variantLabel = node('label', 'Escolha a opção', 'product-option-label'); variantLabel.htmlFor = 'product-variant';
    variantSelect = node('select'); variantSelect.id = 'product-variant'; variantSelect.required = true;
    const placeholder = node('option', 'Selecione'); placeholder.value = ''; variantSelect.append(placeholder);
    product.variants.forEach(variant => { const option = node('option', variant.label); option.value = variant.id; variantSelect.append(option); });
    variantSelect.addEventListener('change', () => {
      variantSelect.removeAttribute('aria-invalid');
      const variant = product.variants.find(item => item.id === variantSelect.value);
      price.firstChild.textContent = money.format(variant?.price ?? product.price);
    });
    form.append(variantLabel, variantSelect);
  }
  const quantityLabel = node('label', 'Quantidade', 'product-option-label'); quantityLabel.htmlFor = 'product-quantity';
  const controls = node('div', '', 'quantity-control');
  const less = node('button', '−'); less.type = 'button'; less.setAttribute('aria-label', 'Diminuir quantidade');
  const input = node('input'); Object.assign(input, { id: 'product-quantity', name: 'quantity', type: 'number', min: '1', max: '99', step: '1', value: '1', required: true, inputMode: 'numeric' });
  input.setAttribute('aria-describedby', 'quantity-hint product-selection-feedback');
  const more = node('button', '+'); more.type = 'button'; more.setAttribute('aria-label', 'Aumentar quantidade');
  function syncQuantity() { less.disabled = Number(input.value) <= 1; more.disabled = Number(input.value) >= 99; input.removeAttribute('aria-invalid'); }
  less.addEventListener('click', () => { input.value = String(Math.max(1, (Number(input.value) || 1) - 1)); syncQuantity(); });
  more.addEventListener('click', () => { input.value = String(Math.min(99, (Number(input.value) || 0) + 1)); syncQuantity(); });
  input.addEventListener('input', syncQuantity); syncQuantity();
  controls.append(less, input, more);
  const hint = node('p', 'De 1 a 99 unidades por peça.', 'quantity-hint'); hint.id = 'quantity-hint';
  const actions = node('div', '', 'product-purchase-actions');
  const add = node('button', '', 'button button-dark'); add.type = 'submit'; add.append(icon('bag'), node('span', 'Adicionar à sacola'));
  const favorite = node('button', '', 'button button-secondary product-favorite'); favorite.type = 'button'; favorite.append(icon('heart'));
  function syncFavorite() {
    const saved = ui.favorites.getIds().includes(product.id);
    favorite.setAttribute('aria-pressed', String(saved)); favorite.setAttribute('aria-label', `${saved ? 'Remover dos' : 'Salvar nos'} favoritos`);
  }
  favorite.addEventListener('click', () => {
    const result = ui.favorites.toggle(product.id);
    ui.notify(result.saved ? `${product.name} ${result.ids.includes(product.id) ? 'salva nos' : 'removida dos'} favoritos.` : 'A seleção mudou nesta página, mas o navegador não permitiu salvá-la.');
  });
  ui.favorites.subscribe(syncFavorite); syncFavorite();
  actions.append(add, favorite);
  const feedback = node('p', '', 'product-selection-feedback'); feedback.id = 'product-selection-feedback'; feedback.setAttribute('role', 'alert');
  const success = node('div', '', 'product-success'); success.hidden = true;
  const successText = node('p'); successText.setAttribute('role', 'status');
  const seeBag = node('button', 'Ver sacola →'); seeBag.type = 'button'; seeBag.addEventListener('click', () => ui.openBag());
  success.append(successText, seeBag);
  let adding = false;
  form.addEventListener('submit', event => {
    event.preventDefault(); if (adding) return;
    feedback.textContent = ''; success.hidden = true;
    const selection = { quantity: Number(input.value), variantId: variantSelect?.value };
    const validation = validateProductSelection(product, selection);
    if (!validation.ok) {
      feedback.textContent = validation.reason === 'variant' ? 'Escolha uma opção antes de adicionar a peça.' : 'Informe uma quantidade inteira entre 1 e 99.';
      const field = validation.reason === 'variant' ? variantSelect : input;
      field?.setAttribute('aria-invalid', 'true'); field?.focus(); return;
    }
    const result = ui.cart.addProduct(product.id, selection);
    if (!result.ok) { feedback.textContent = ['limit', 'quantity'].includes(result.reason) ? 'A quantidade desta peça na sacola não pode ultrapassar 99.' : 'Não foi possível salvar a peça. Verifique se o navegador permite armazenamento e tente novamente.'; return; }
    adding = true; add.disabled = true;
    successText.textContent = `${selection.quantity} ${selection.quantity === 1 ? 'unidade adicionada' : 'unidades adicionadas'} à sacola.`;
    success.hidden = false;
    setTimeout(() => { adding = false; add.disabled = false; }, 700);
  });
  form.append(quantityLabel, controls, hint, actions, feedback, success);
  info.append(form, node('p', 'Prévia demonstrativa. Ilustração, preço, medidas e disponibilidade aguardam confirmação. A sacola serve para simular suas escolhas; não há finalização de pedido.', 'product-demo-note'));
  const share = node('button', 'Compartilhar esta peça ↗', 'product-share'); share.type = 'button';
  share.addEventListener('click', () => ui.show(() => {
    ui.title('Compartilhe um detalhe.');
    const label = node('label', 'Link desta peça', 'search-label'); label.htmlFor = 'product-share-url';
    const field = node('input', '', 'search-field');
    Object.assign(field, { id: 'product-share-url', type: 'text', readOnly: true, value: `${location.origin}${productUrl(product.id)}` });
    field.addEventListener('focus', () => field.select());
    const copy = node('button', 'Copiar link', 'button button-dark dialog-action'); copy.type = 'button';
    copy.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(field.value); ui.notify('Link da peça copiado.'); }
      catch { field.focus(); field.select(); ui.notify('Selecione e copie o link acima. O navegador não permitiu copiar automaticamente.'); }
    });
    ui.content.append(label, field, copy);
    ui.note('Envie o link pelo canal que preferir.');
  }));
  info.append(share);
  layout.append(gallery, info);
  host.append(breadcrumb, layout, details());
  const related = products.filter(item => item.id !== product.id && (complements[product.category] || []).includes(item.category)).slice(0, 4);
  if (related.length) {
    const section = node('section', '', 'product-related');
    const heading = node('div', '', 'section-heading');
    const title = node('div'); const h2 = node('h2', 'Complete o seu estilo.'); h2.id = 'related-title'; title.append(node('p', 'Peças que se complementam', 'eyebrow'), h2);
    heading.append(title, link('Ver todas as joias →', '/catalogo.html', 'text-link'));
    const grid = node('div', '', 'product-grid'); related.forEach(item => grid.append(relatedCard(item)));
    section.setAttribute('aria-labelledby', h2.id); section.append(heading, grid); host.append(section);
  }
}
