import { products } from '../data/catalog.js';
import { wraps } from '../data/gifts.js';
import { createSiteUI, node, icon, money } from './site-ui.js';
import { giftSignature, priceCents } from './cart-store.js';
import { giftSteps, giftChoices, prepareGiftChoice, readGiftDraft, giftComponents, giftDraftTotal, giftProgress } from './gift-model.js';

const ui = createSiteUI({ page: 'gift' });
const catalog = { products, wraps };
const draftKey = 'icegen-gift-draft-v2';
let draftStorage;
try { draftStorage = window.sessionStorage; } catch { /* A montagem pode continuar sem armazenamento. */ }
let previousDraft;
try { previousDraft = readGiftDraft(draftStorage?.getItem(draftKey), catalog); } catch { previousDraft = {}; }
let draft = { ...previousDraft };
let pendingChoice = null;
let step = giftProgress(selectionDraft(), catalog).firstMissing;
let editing = null;
let locked = false;
let saving = false;
let saved = false;
let pendingVariant = false;
const feedback = document.querySelector('#gift-feedback');
const saveButton = document.querySelector('#save-gift');
const banner = document.querySelector('#gift-edit-banner');
const bannerCopy = document.querySelector('#gift-edit-copy');
const optionsHost = document.querySelector('#gift-options');
const stepTitle = document.querySelector('#gift-step-title');
const summaryItems = document.querySelector('#gift-summary-items');
const seeBag = document.querySelector('#gift-see-bag');
const nextButton = document.querySelector('#gift-next');
const backButton = document.querySelector('#gift-back');
const stepActions = document.querySelector('#gift-step-actions');
const summaryDetails = document.querySelector('#gift-summary-details');
const summaryMedia = matchMedia('(max-width: 1100px)');
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
function selectionDraft() {
  if (!pendingChoice) return draft;
  const current = { ...draft };
  delete current[pendingChoice.kind];
  return current;
}
function gotoStep(index) {
  if (locked || saved || saving || !giftProgress(selectionDraft(), catalog).openable[index]) return;
  if (pendingVariant && index > step) { message('Confirme a nova opção da peça antes de continuar.', true); return; }
  pendingVariant = false; pendingChoice = null;
  step = index;
  message(''); render();
  stepTitle.focus({ preventScroll: true });
  stepTitle.scrollIntoView({ block: 'start', behavior: 'auto' });
}
function enterEdit(id) {
  const matches = ui.cart.getItems().filter(item => item.id === id);
  const item = matches.length === 1 ? matches[0] : null;
  const components = item && ui.cart.editableGift(item);
  if (!components) {
    locked = true; draft = {}; banner.hidden = false;
    bannerCopy.textContent = 'Este presente foi removido, mudou ou tem uma composição antiga incompleta. Confira a versão atual na sacola.';
    document.querySelector('#cancel-edit').textContent = 'Voltar à sacola';
    return;
  }
  editing = { id, signature: giftSignature(item) };
  draft = Object.fromEntries(components.map(({ kind, ...selection }) => [kind, selection]));
  step = 0;
  banner.hidden = false;
  bannerCopy.textContent = `Editando um presente da sacola (${item.quantity} ${item.quantity === 1 ? 'unidade' : 'unidades'}). Revise antes de salvar as alterações.`;
  document.title = 'Editar presente — ICE GEN';
}
const editId = new URLSearchParams(location.search).get('editar');
if (editId !== null) enterEdit(editId);

function renderSteps() {
  const progress = giftProgress(selectionDraft(), catalog);
  const navigation = document.querySelector('#gift-steps');
  navigation.replaceChildren();
  giftSteps.forEach((item, index) => {
    const button = node('button', '', progress.valid[index] ? 'is-complete' : ''); button.type = 'button';
    const number = node('span', progress.valid[index] ? '✓' : String(index + 1).padStart(2, '0'));
    number.setAttribute('aria-hidden', 'true');
    button.append(number, node('span', item.label));
    button.disabled = locked || saved || saving || !progress.openable[index] || (pendingVariant && index > step);
    if (step === index && !saved) button.setAttribute('aria-current', 'step');
    button.setAttribute('aria-label', `Etapa ${index + 1}: ${item.label}${progress.valid[index] ? ', escolhida' : ''}`);
    button.addEventListener('click', () => gotoStep(index)); navigation.append(button);
  });
}
function choose(kind, choice, variantId, focusVariant = false) {
  if (saved || saving || locked) return;
  const result = prepareGiftChoice(draft, kind, { id: choice.id, quantity: draft[kind]?.quantity || 1, variantId }, catalog);
  if (!result.ok) { message('Escolha uma opção válida antes de continuar.', true); return; }
  draft = result.draft; pendingChoice = result.pending; pendingVariant = Boolean(pendingChoice);
  seeBag.hidden = true; newGift.hidden = true;
  message(pendingVariant ? `Escolha a opção de ${choice.name} para confirmar a peça.` : `${choice.name}: escolha atualizada.`);
  if (!pendingVariant) persistDraft();
  render();
  const target = pendingVariant || focusVariant ? document.getElementById(`gift-variant-${choice.id}`) : [...optionsHost.querySelectorAll('[data-choice-id]')].find(input => input.dataset.choiceId === choice.id);
  target?.focus({ preventScroll: true });
}
function renderChoices() {
  optionsHost.replaceChildren();
  optionsHost.removeAttribute('role'); optionsHost.removeAttribute('aria-labelledby');
  if (locked) { optionsHost.append(node('p', 'Abra a sacola para revisar seu presente.', 'gift-data-note')); return; }
  if (saved) {
    const success = node('div', '', 'gift-saved-state');
    const mark = node('span', '✓', 'gift-saved-mark'); mark.setAttribute('aria-hidden', 'true');
    success.append(mark, node('h3', 'Suas três escolhas estão juntas.'), node('p', 'O presente foi salvo. Você pode conferir a sacola ou começar outra combinação.'));
    optionsHost.append(success); return;
  }
  optionsHost.setAttribute('role', 'radiogroup'); optionsHost.setAttribute('aria-labelledby', 'gift-step-title');
  const { kind, label } = giftSteps[step];
  for (const choice of giftChoices(kind, catalog)) {
    const pending = pendingChoice?.kind === kind && pendingChoice.id === choice.id;
    const selected = pendingChoice?.kind !== kind && draft[kind]?.id === choice.id;
    const card = node('div', '', `gift-choice${selected ? ' is-selected' : pending ? ' is-pending' : ''}`);
    const input = node('input', '', 'gift-choice-radio');
    Object.assign(input, { id: `gift-choice-${choice.id}`, type: 'radio', name: `gift-${kind}`, value: choice.id, checked: selected || pending });
    input.dataset.choiceId = choice.id;
    input.setAttribute('aria-labelledby', `gift-name-${choice.id}`);
    input.setAttribute('aria-describedby', `gift-price-${choice.id} gift-status-${choice.id}`);
    const option = node('label', '', 'gift-choice-label'); option.htmlFor = input.id;
    const media = node('span', '', 'gift-choice-media');
    if (kind === 'wrap') {
      const placeholder = node('span', '', 'gift-wrap-placeholder');
      placeholder.append(node('span', choice.id === 'wrap-paper' ? '01' : '02'), node('small', 'Fotografia em preparação')); media.append(placeholder);
    } else {
      const image = node('img', '', 'gift-choice-image');
      Object.assign(image, { src: choice.image, alt: `Ilustração provisória de ${choice.name}`, width: 1000, height: 1000 });
      media.append(image, node('span', 'Ilustração', 'gift-choice-image-label'));
    }
    const body = node('span', '', 'gift-choice-content');
    const name = node('strong', choice.name, 'gift-choice-name'); name.id = `gift-name-${choice.id}`;
    const variant = selected && choice.variants?.find(item => item.id === draft[kind].variantId);
    const price = node('span', money.format(variant ? variant.price ?? choice.price : choice.price), 'gift-choice-price'); price.id = `gift-price-${choice.id}`;
    price.append(node('small', 'Valor demonstrativo'));
    const status = node('span', pending ? 'Escolha a opção abaixo' : selected ? '✓ Selecionada' : 'Selecionar esta opção', 'gift-choice-status'); status.id = `gift-status-${choice.id}`;
    body.append(node('span', label, 'eyebrow light'), name, price, node('span', kind === 'wrap' ? 'Detalhes e fotografia aguardam confirmação.' : `${choice.material}${choice.measurement ? ` · ${choice.measurement}` : ''}`, 'gift-choice-meta'), status);
    option.append(media, body); card.append(input, option);
    if (choice.variants?.length) {
      const variantArea = node('div', '', 'gift-variant-area');
      const variantLabel = node('label', 'Escolha a opção', 'gift-choice-variant-label'); variantLabel.htmlFor = `gift-variant-${choice.id}`;
      const select = node('select'); select.id = variantLabel.htmlFor; select.setAttribute('aria-label', `Opção de ${choice.name}`);
      select.disabled = !(selected || pending);
      const placeholder = node('option', 'Selecione'); placeholder.value = ''; select.append(placeholder);
      choice.variants.forEach(item => { const option = node('option', item.label); option.value = item.id; select.append(option); });
      if (selected) select.value = draft[kind].variantId || '';
      select.addEventListener('change', () => choose(kind, choice, select.value, true));
      variantArea.append(variantLabel, select); card.append(variantArea);
    }
    input.addEventListener('change', () => { if (input.checked) choose(kind, choice, draft[kind]?.id === choice.id ? draft[kind].variantId : undefined); });
    optionsHost.append(card);
  }
}
function renderSummary() {
  const progress = giftProgress(selectionDraft(), catalog);
  summaryItems.replaceChildren();
  giftSteps.forEach(({ kind, label }, index) => {
    const selection = selectionDraft()[kind];
    const choice = selection && giftChoices(kind, catalog).find(item => item.id === selection.id);
    const button = node('button', '', 'gift-summary-row'); button.type = 'button';
    button.disabled = locked || saved || saving || !progress.openable[index] || (pendingVariant && index > step);
    button.setAttribute('aria-label', `${choice ? 'Alterar' : 'Escolher'} ${label.toLocaleLowerCase('pt-BR')}${choice ? `: ${choice.name}` : ''}`);
    if (choice?.image && kind !== 'wrap') {
      const image = node('img', '', 'gift-summary-image');
      Object.assign(image, { src: choice.image, alt: '', width: 54, height: 54 }); button.append(image);
    } else button.append(node('span', kind === 'wrap' ? 'Embal.' : '—', 'gift-summary-placeholder'));
    const text = node('span', '', 'gift-summary-copy');
    text.append(node('span', label, 'gift-summary-label'), node('span', choice?.name || 'A escolher', 'gift-summary-name'));
    if (choice) {
      const variant = choice.variants?.find(item => item.id === selection.variantId);
      if (variant) text.append(node('span', variant.label, 'gift-summary-label'));
      const cents = priceCents(variant?.price ?? choice.price) * selection.quantity;
      text.append(node('span', `${money.format(cents / 100)}${selection.quantity > 1 ? ` · ${selection.quantity} unidades` : ''}`, 'gift-summary-price'));
    }
    button.append(text, node('span', saved ? '✓' : choice ? 'Alterar' : progress.openable[index] ? 'Escolher' : 'Depois', 'gift-summary-edit'));
    button.addEventListener('click', () => gotoStep(index)); summaryItems.append(button);
  });
  const total = giftDraftTotal(selectionDraft(), catalog);
  document.querySelector('#gift-total-label').textContent = progress.ready ? 'Total do presente' : 'Total parcial';
  document.querySelector('#gift-total').textContent = !progress.selectedCount ? 'A selecionar' : total === null ? 'A conferir' : money.format(total / 100);
  document.querySelector('#gift-missing').textContent = saved ? 'Presente salvo na sacola.' : progress.ready ? 'Tudo escolhido. Confira os detalhes antes de salvar.' : `Falta escolher: ${giftSteps.filter((_, index) => !progress.valid[index]).map(({ label }) => label.toLocaleLowerCase('pt-BR')).join(', ')}.`;
  document.querySelector('#gift-progress').textContent = `${progress.selectedCount} de 3 escolhidos`;
  saveButton.hidden = saved || locked;
  saveButton.disabled = !progress.ready || saving || pendingVariant;
  const currentKind = giftSteps[step].kind;
  const current = selectionDraft()[currentKind];
  const currentChoice = current && giftChoices(currentKind, catalog).find(item => item.id === current.id);
  document.querySelector('#gift-selection-status').textContent = pendingVariant ? 'Escolha a opção para confirmar esta peça.' : saved ? 'Presente salvo.' : currentChoice ? `Sua escolha: ${currentChoice.name}` : 'Selecione uma opção para continuar.';
  saveButton.querySelector('span').textContent = saving ? 'Salvando…' : editing ? 'Revisar alterações' : 'Revisar presente';
  stepActions.hidden = saved || locked;
  backButton.hidden = step === 0;
  nextButton.disabled = !progress.valid[step] || saving || pendingVariant || (step === 2 && !progress.ready);
  nextButton.querySelector('span').textContent = step === 2 ? 'Revisar presente' : 'Continuar';
  nextButton.setAttribute('aria-label', step === 2 ? 'Revisar presente' : `Continuar para ${giftSteps[step + 1].label.toLocaleLowerCase('pt-BR')}`);
}
function render() {
  renderSteps();
  document.querySelector('#gift-step-number').textContent = saved ? 'Combinação concluída' : `Etapa ${step + 1} de 3 — ${giftSteps[step].label}`;
  stepTitle.textContent = saved ? 'Seu presente está na sacola.' : giftSteps[step].title;
  document.querySelector('#gift-step-copy').textContent = saved ? 'Cada detalhe escolhido por você.' : 'Clique no card para escolher uma opção. Você pode trocar antes de revisar.';
  renderChoices(); renderSummary();
}
function leaveEdit() {
  editing = null; locked = false; saved = false; pendingVariant = false; pendingChoice = null; banner.hidden = true;
  draft = { ...previousDraft }; step = giftProgress(selectionDraft(), catalog).firstMissing;
  history.replaceState(null, '', '/presentes.html'); document.title = 'Monte um presente — ICE GEN';
  message(''); seeBag.hidden = true; newGift.hidden = true; render(); ui.openBag();
}
function saveGift() {
  if (saving || saved || locked || pendingVariant || !giftProgress(selectionDraft(), catalog).ready) return false;
  saving = true; renderSummary();
  const result = editing ? ui.cart.replaceGift(editing.id, giftComponents(draft), { signature: editing.signature }) : ui.cart.addGift(giftComponents(draft));
  if (!result.ok) {
    saving = false; renderSummary();
    message(['missing', 'conflict'].includes(result.reason) ? 'Este presente foi removido ou alterado em outra aba. Cancele a edição e abra a versão atual pela sacola.' : result.reason === 'storage' ? 'Não foi possível salvar no navegador. Suas escolhas foram mantidas. Permita o armazenamento e tente novamente.' : 'Confira as três escolhas e suas opções antes de salvar.', true);
    ui.notify(feedback.textContent); return false;
  }
  const wasEditing = Boolean(editing);
  saved = true; saving = false; editing = null; banner.hidden = true;
  ui.dialog.close();
  history.replaceState(null, '', '/presentes.html'); document.title = 'Monte um presente — ICE GEN';
  if (wasEditing) {
    location.assign(`/sacola.html?presente=${encodeURIComponent(result.itemId)}&atualizado=1`); return true;
  }
  previousDraft = {};
  try { draftStorage?.removeItem(draftKey); } catch { /* A sacola já foi salva. */ }
  message('Presente adicionado à sacola com as três escolhas juntas.');
  seeBag.hidden = false; newGift.hidden = false; render();
  requestAnimationFrame(() => seeBag.focus({ preventScroll: true }));
  return true;
}
function reviewGift() {
  if (locked || saved || saving || pendingVariant || !giftProgress(selectionDraft(), catalog).ready) return;
  ui.show(() => {
    ui.content.append(node('p', 'Última conferência', 'eyebrow'));
    ui.title(editing ? 'Revise suas alterações.' : 'Seu presente, do seu jeito.');
    ui.content.append(node('p', 'Confira as três escolhas antes de salvar na sacola.', 'dialog-lead'));
    const list = node('div', '', 'gift-review-list');
    giftSteps.forEach(({ kind, label }, index) => {
      const selection = draft[kind]; const choice = giftChoices(kind, catalog).find(item => item.id === selection.id);
      const variant = choice.variants?.find(item => item.id === selection.variantId);
      const row = node('div', '', 'gift-review-row');
      const details = node('div');
      details.append(node('p', label, 'eyebrow'), node('h3', choice.name));
      if (variant) details.append(node('p', variant.label));
      details.append(node('p', `${money.format(priceCents(variant?.price ?? choice.price) * selection.quantity / 100)}${selection.quantity > 1 ? ` · ${selection.quantity} unidades` : ''}`, 'gift-review-price'));
      const change = node('button', 'Alterar', 'gift-review-change'); change.type = 'button'; change.setAttribute('aria-label', `Alterar ${label.toLocaleLowerCase('pt-BR')}`);
      change.addEventListener('click', () => { ui.dialog.close(); requestAnimationFrame(() => gotoStep(index)); });
      row.append(node('span', String(index + 1).padStart(2, '0'), 'gift-review-number'), details, change); list.append(row);
    });
    const total = node('div', '', 'gift-review-total');
    total.append(node('span', 'Total do presente'), node('strong', money.format(giftDraftTotal(draft, catalog) / 100)));
    ui.content.append(list, total);
    ui.note('Valores demonstrativos. As três escolhas serão salvas como um único presente.');
    const actions = node('div', '', 'gift-review-actions');
    const confirm = node('button', editing ? 'Salvar alterações' : 'Adicionar presente à sacola', 'button button-dark'); confirm.type = 'button'; confirm.append(icon('bag'));
    confirm.addEventListener('click', () => { confirm.disabled = true; if (!saveGift()) confirm.disabled = false; });
    const cancel = node('button', 'Continuar editando', 'button button-secondary'); cancel.type = 'button'; cancel.addEventListener('click', () => ui.dialog.close());
    actions.append(confirm, cancel); ui.content.append(actions);
  });
}
document.querySelector('#cancel-edit').addEventListener('click', leaveEdit);
const newGift = node('button', 'Montar outro presente', 'gift-see-bag');
newGift.type = 'button'; newGift.hidden = true; seeBag.after(newGift);
newGift.addEventListener('click', () => {
  draft = {}; previousDraft = {}; saved = false; pendingVariant = false; pendingChoice = null; step = 0; message(''); seeBag.hidden = true; newGift.hidden = true;
  persistDraft(); render(); stepTitle.focus({ preventScroll: true }); stepTitle.scrollIntoView({ block: 'start', behavior: 'auto' });
});
seeBag.addEventListener('click', () => ui.openBag());
backButton.addEventListener('click', () => gotoStep(step - 1));
nextButton.addEventListener('click', () => step === 2 ? reviewGift() : gotoStep(step + 1));
saveButton.addEventListener('click', reviewGift);
render();
