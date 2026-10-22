import { validateProductSelection, priceCents } from './cart-store.js';

export const giftSteps = [
  { kind: 'chain', label: 'Corrente', title: 'Escolha uma corrente.', description: 'Comece pela peça principal do presente.', category: 'corrente' },
  { kind: 'pendant', label: 'Pingente', title: 'Um detalhe com significado.', description: 'Escolha o pingente que vai completar a composição.', category: 'pingente' },
  { kind: 'wrap', label: 'Embalagem', title: 'O último detalhe é seu.', description: 'Escolha uma embalagem para acompanhar as peças.', category: 'embalagem' }
];

export function giftChoices(kind, { products = [], wraps = [] } = {}) {
  const step = giftSteps.find(item => item.kind === kind);
  return !step ? [] : kind === 'wrap' ? wraps : products.filter(item => item.category === step.category);
}

export function selectGiftChoice(draft, kind, selection, catalog) {
  const choice = giftChoices(kind, catalog).find(item => item.id === selection?.id);
  if (!choice) return null;
  const checked = validateProductSelection({ ...choice, category: choice.category || 'embalagem' }, selection);
  if (!checked.ok) return null;
  return { ...draft, [kind]: { id: choice.id, quantity: checked.quantity, ...(checked.variant ? { variantId: checked.variant.id } : {}) } };
}

export function readGiftDraft(serialized, catalog) {
  let raw;
  try { raw = JSON.parse(serialized); } catch { return {}; }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  let draft = {};
  for (const { kind } of giftSteps) {
    const next = selectGiftChoice(draft, kind, raw[kind], catalog);
    if (next) draft = next;
  }
  return draft;
}

export function canOpenGiftStep(index, draft) {
  return Number.isInteger(index) && index >= 0 && index < giftSteps.length && giftSteps.slice(0, index).every(({ kind }) => draft[kind]);
}

export function giftComponents(draft) {
  return giftSteps.flatMap(({ kind }) => draft[kind] ? [{ kind, ...draft[kind] }] : []);
}

export function giftDraftTotal(draft, catalog) {
  let cents = 0;
  for (const { kind } of giftSteps) {
    const selection = draft[kind];
    if (!selection) continue;
    const choice = giftChoices(kind, catalog).find(item => item.id === selection.id);
    const checked = validateProductSelection(choice && { ...choice, category: choice.category || 'embalagem' }, selection);
    if (!checked.ok) return null;
    const next = priceCents(checked.price) * checked.quantity;
    if (!Number.isSafeInteger(next) || !Number.isSafeInteger(cents + next)) return null;
    cents += next;
  }
  return cents;
}
