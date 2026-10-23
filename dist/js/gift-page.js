import { products } from '../data/catalog.js';
import { wraps } from '../data/gifts.js';
import { createSiteUI, node, icon, money } from './site-ui.js';
import { giftSignature, priceCents } from './cart-store.js';
import { giftSteps, giftChoices, selectGiftChoice, readGiftDraft, canOpenGiftStep, giftComponents, giftDraftTotal } from './gift-model.js';

const ui = createSiteUI({ page: 'gift' });
const catalog = { products, wraps };
const draftKey = 'icegen-gift-draft-v2';
let draftStorage;
try { draftStorage = window.sessionStorage; } catch { /* A montagem pode continuar sem rascunho persistente. */ }
let previousDraft;
try { previousDraft = readGiftDraft(draftStorage?.getItem(draftKey), catalog); } catch { previousDraft = {}; }
let draft = { ...previousDraft };
let step = 0;
let editing = null;
let locked = false;
let saving = false;
let saved = false;
const feedback = document.querySelector('#gift-feedback');
const saveButton = document.querySelector('#save-gift');
const banner = document.querySelector('#gift-edit-banner');
const bannerCopy = document.querySelector('#gift-edit-copy');
const optionsHost = document.querySelector('#gift-options');
const stepTitle = document.querySelector('#gift-step-title');
const summaryItems = document.querySelector('#gift-summary-items');
const seeBag = document.querySelector('#gift-see-bag');
const summaryDetails = document.querySelector('#gift-summary-details');
const summaryMedia = matchMedia('(max-width: 850px)');
summaryDetails.open = !summaryMedia.matches;
summaryMedia.addEventListener('change', event => { summaryDetails.open = !event.matches; });

function message(text, error = false) {
  feedback.textContent = text;
  feedback.classList.toggle('is-error', error);
}
function persistDraft() {
  if (editing || saved || locked) return;
  try { draftStorage?.setItem(draftKey, JSON.stringify(draft)); } catch {
    message('Sua montagem continua nesta página. O navegador não permitiu guardar o rascunho para outra visita.');
  }
}
function firstIncomplete() { const index = giftSteps.findIndex(({ kind }) => !draft[kind]); return index < 0 ? 0 : index; }
function gotoStep(index) {
  if (locked || !canOpenGiftStep(index, draft)) return;
  step = index; render(); stepTitle.focus({ preventScroll: true });
  stepTitle.scrollIntoView({ block: 'start', behavior: 'auto' });
}
function enterEdit(id) {
  const matches = ui.cart.getItems().filter(item => item.id === id);
  const item = matches.length === 1 ? matches[0] : null;
  const components = item && ui.cart.editableGift(item);
  if (!components) {
    locked = true; banner.hidden = false;
    bannerCopy.textContent = 'Este presente não pode ser editado: ele foi removido, mudou ou tem uma composição antiga incompleta. Confira a sacola.';
    document.querySelector('#cancel-edit').textContent = 'Voltar à sacola';
    return;
  }
  editing = { id, signature: giftSignature(item) };
  draft = Object.fromEntries(components.map(({ kind, ...selection }) => [kind, selection]));
  banner.hidden = false;
  bannerCopy.textContent = `Editando um presente da sacola (${item.quantity} ${item.quantity === 1 ? 'unidade' : 'unidades'}). As alterações só serão aplicadas ao salvar.`;
  document.title = 'Editar presente — ICE GEN';
}
const editId = new URLSearchParams(location.search).get('editar');
if (editId !== null) enterEdit(editId);
else step = firstIncomplete();

function renderSteps() {
  const navigation = document.querySelector('#gift-steps');
  navigation.replaceChildren();
  giftSteps.forEach((item, index) => {
    const button = node('button'); button.type = 'button';
    button.append(node('span', String(index + 1).padStart(2, '0')), node('span', item.label));
    button.disabled = locked || !canOpenGiftStep(index, draft);
    if (step === index) button.setAttribute('aria-current', 'step');
    button.setAttribute('aria-label', `Etapa ${index + 1}: ${item.label}${draft[item.kind] ? ', selecionada' : ''}`);
    button.addEventListener('click', () => gotoStep(index)); navigation.append(button);
  });
}
function choose(kind, choice, variantId) {
  const next = selectGiftChoice(draft, kind, { id: choice.id, quantity: draft[kind]?.quantity || 1, variantId }, catalog);
  if (!next) { message('Escolha uma opção válida para esta peça antes de continuar.', true); return; }
  draft = next; saved = false; seeBag.hidden = true; newGift.hidden = true; message(''); persistDraft();
  if (step < giftSteps.length - 1) step += 1;
  render();
  const target = giftComponents(draft).length === 3 ? saveButton : stepTitle;
  target.focus({ preventScroll: target === stepTitle });
  if (target === stepTitle) stepTitle.scrollIntoView({ block: 'start', behavior: 'auto' });
}
function renderChoices() {
  optionsHost.replaceChildren();
  if (locked) { optionsHost.append(node('p', 'Abra a sacola para revisar seu presente.', 'gift-data-note')); return; }
  const { kind, label } = giftSteps[step];
  for (const choice of giftChoices(kind, catalog)) {
    const selected = draft[kind]?.id === choice.id;
    const card = node('article', '', `gift-choice${selected ? ' is-selected' : ''}`);
    if (kind === 'wrap') {
      const placeholder = node('div', '', 'gift-wrap-placeholder');
      placeholder.append(node('span', choice.id === 'wrap-paper' ? '01' : '02'), node('small', 'Fotografia em preparação'));
      card.append(placeholder);
    } else {
      const image = node('img', '', 'gift-choice-image');
      Object.assign(image, { src: choice.image, alt: `Ilustração provisória de ${choice.name}`, width: 1000, height: 1000 });
      card.append(image, node('span', 'Ilustração', 'gift-choice-image-label'));
    }
    const body = node('div', '', 'gift-choice-content');
    const price = node('p', money.format(choice.price), 'gift-choice-price');
    price.append(node('small', 'Valor demonstrativo'));
    body.append(node('p', label, 'eyebrow light'), node('h3', choice.name), price);
    let variantSelect;
    if (choice.variants?.length) {
      const optionLabel = node('label', 'Escolha a opção', 'gift-choice-variant-label'); optionLabel.htmlFor = `gift-variant-${choice.id}`;
      variantSelect = node('select'); variantSelect.id = optionLabel.htmlFor;
      const placeholder = node('option', 'Selecione'); placeholder.value = ''; variantSelect.append(placeholder);
      choice.variants.forEach(variant => { const option = node('option', variant.label); option.value = variant.id; variantSelect.append(option); });
      if (selected) variantSelect.value = draft[kind].variantId || '';
      variantSelect.addEventListener('change', () => {
        const variant = choice.variants.find(item => item.id === variantSelect.value);
        price.firstChild.textContent = money.format(variant?.price ?? choice.price);
      });
      body.append(optionLabel, variantSelect);
    }
    body.append(node('p', kind === 'wrap' ? 'Detalhes e fotografia aguardam confirmação.' : `${choice.material}${choice.measurement ? ` · ${choice.measurement}` : ''}`, 'gift-choice-meta'));
    const select = node('button', '', 'button button-light gift-choice-select'); select.type = 'button';
    select.append(node('span', selected ? 'Peça selecionada' : kind === 'wrap' ? 'Escolher embalagem' : 'Escolher peça'), icon('arrow'));
    select.setAttribute('aria-label', `Escolher ${choice.name}`); select.setAttribute('aria-pressed', String(selected));
    select.addEventListener('click', () => {
      if (choice.variants?.length && !variantSelect.value) { variantSelect.focus(); message('Escolha uma opção para continuar.', true); return; }
      choose(kind, choice, variantSelect?.value);
    });
    body.append(select); card.append(body); optionsHost.append(card);
  }
}
function renderSummary() {
  summaryItems.replaceChildren();
  giftSteps.forEach(({ kind, label }, index) => {
    const selection = draft[kind];
    const choice = selection && giftChoices(kind, catalog).find(item => item.id === selection.id);
    const button = node('button', '', 'gift-summary-row'); button.type = 'button';
    button.disabled = locked || !canOpenGiftStep(index, draft);
    button.setAttribute('aria-label', `${choice ? 'Alterar' : 'Escolher'} ${label.toLocaleLowerCase('pt-BR')}${choice ? `: ${choice.name}` : ''}`);
    button.append(node('span', String(index + 1).padStart(2, '0'), 'gift-summary-number'));
    if (choice?.image && kind !== 'wrap') {
      const image = node('img', '', 'gift-summary-image');
      Object.assign(image, { src: choice.image, alt: '', width: 54, height: 54 }); button.append(image);
    } else button.append(node('span', kind === 'wrap' ? 'Foto pendente' : 'A escolher', 'gift-summary-placeholder'));
    const text = node('span');
    text.append(node('span', label, 'gift-summary-label'), node('span', choice?.name || 'A selecionar', 'gift-summary-name'));
    if (choice) {
      const variant = choice.variants?.find(item => item.id === selection.variantId);
      if (variant) text.append(node('span', variant.label, 'gift-summary-label'));
      const cents = priceCents(variant?.price ?? choice.price) * selection.quantity;
      text.append(node('span', `${money.format(cents / 100)}${selection.quantity > 1 ? ` · ${selection.quantity} unidades` : ''}`, 'gift-summary-price'));
    }
    button.append(text, icon('chevron')); button.addEventListener('click', () => gotoStep(index)); summaryItems.append(button);
  });
  const components = giftComponents(draft);
  const complete = components.length === giftSteps.length;
  const total = giftDraftTotal(draft, catalog);
  document.querySelector('#gift-total-label').textContent = complete ? 'Total do presente' : 'Total parcial';
  document.querySelector('#gift-total').textContent = !components.length ? 'A selecionar' : total === null ? 'A conferir' : money.format(total / 100);
  document.querySelector('#gift-missing').textContent = complete ? 'Uma composição, com cada detalhe escolhido por você.' : `Falta escolher: ${giftSteps.filter(({ kind }) => !draft[kind]).map(({ label }) => label.toLocaleLowerCase('pt-BR')).join(', ')}.`;
  saveButton.disabled = locked || !complete || total === null || saving || saved;
  saveButton.querySelector('span').textContent = saved ? 'Presente salvo na sacola' : saving ? 'Salvando…' : editing ? 'Salvar alterações do presente' : 'Adicionar presente à sacola';
}
function render() {
  renderSteps();
  document.querySelector('#gift-step-number').textContent = `${String(step + 1).padStart(2, '0')} — ${giftSteps[step].label}`;
  stepTitle.textContent = giftSteps[step].title;
  document.querySelector('#gift-step-copy').textContent = giftSteps[step].description;
  document.querySelector('#gift-progress').textContent = `Etapa ${String(step + 1).padStart(2, '0')} / 03`;
  renderChoices(); renderSummary();
}
function leaveEdit() {
  editing = null; locked = false; saved = false; banner.hidden = true;
  draft = { ...previousDraft }; step = firstIncomplete();
  history.replaceState(null, '', '/presentes.html'); document.title = 'Monte um presente — ICE GEN';
  message(''); seeBag.hidden = true; newGift.hidden = true; render(); stepTitle.focus({ preventScroll: true }); ui.openBag();
}
document.querySelector('#cancel-edit').addEventListener('click', leaveEdit);
const newGift = node('button', 'Montar outro presente', 'gift-see-bag');
newGift.type = 'button'; newGift.hidden = true; seeBag.after(newGift);
newGift.addEventListener('click', () => {
  draft = {}; previousDraft = {}; saved = false; step = 0; message(''); seeBag.hidden = true; newGift.hidden = true;
  persistDraft(); render(); stepTitle.focus({ preventScroll: true }); stepTitle.scrollIntoView({ block: 'start', behavior: 'auto' });
});
seeBag.addEventListener('click', () => ui.openBag());
saveButton.addEventListener('click', () => {
  if (saving || saved || locked || giftComponents(draft).length !== 3) return;
  saving = true; renderSummary();
  const result = editing ? ui.cart.replaceGift(editing.id, giftComponents(draft), { signature: editing.signature }) : ui.cart.addGift(giftComponents(draft));
  if (!result.ok) {
    saving = false; renderSummary();
    message(['missing', 'conflict'].includes(result.reason) ? 'Este presente foi removido ou alterado em outra aba. A sacola foi preservada. Cancele a edição e abra a versão atual pela sacola.' : result.reason === 'storage' ? 'Não foi possível salvar no navegador. Sua montagem foi mantida. Permita o armazenamento e tente novamente.' : 'Confira as três escolhas e suas opções antes de salvar.', true);
    return;
  }
  const wasEditing = Boolean(editing);
  saved = true; editing = null; banner.hidden = true;
  history.replaceState(null, '', '/presentes.html'); document.title = 'Monte um presente — ICE GEN';
  if (!wasEditing) {
    previousDraft = {};
    try { draftStorage?.removeItem(draftKey); } catch { /* O presente já está salvo na sacola. */ }
  }
  if (wasEditing) {
    saving = false; renderSummary();
    location.assign(`/sacola.html?presente=${encodeURIComponent(result.itemId)}&atualizado=1`);
    return;
  }
  message(wasEditing ? 'Presente atualizado na sacola. A quantidade e os outros itens foram preservados.' : 'Presente adicionado à sacola com as três escolhas juntas.');
  seeBag.hidden = false; newGift.hidden = false; seeBag.focus({ preventScroll: true }); renderSummary();
  setTimeout(() => { saving = false; renderSummary(); }, 700);
});
render();
