import test from 'node:test';
import assert from 'node:assert/strict';
import { products } from '../dist/data/catalog.js';
import { wraps } from '../dist/data/gifts.js';
import { selectGiftChoice, prepareGiftChoice, readGiftDraft, canOpenGiftStep, giftComponents, giftDraftTotal, giftProgress } from '../dist/js/gift-model.js';

const catalog = { products, wraps };
const complete = () => readGiftDraft(JSON.stringify({ chain: { id: 'corrente-veneziana' }, pendant: { id: 'pingente-luz' }, wrap: { id: 'wrap-paper' } }), catalog);

test('etapas exigem as escolhas anteriores, sem permitir índices inválidos', () => {
  assert.equal(canOpenGiftStep(0, {}), true);
  assert.equal(canOpenGiftStep(1, {}), false);
  assert.equal(canOpenGiftStep(2, { chain: { id: 'corrente-veneziana' } }), false);
  assert.equal(canOpenGiftStep(2, complete()), true);
  for (const index of [-1, 3, 1.5, '1']) assert.equal(canOpenGiftStep(index, complete()), false);
});

test('rascunho rejeita dados corrompidos, IDs inexistentes e categorias erradas', () => {
  for (const raw of ['{', 'null', '[]', '"text"']) assert.deepEqual(readGiftDraft(raw, catalog), {});
  const draft = readGiftDraft(JSON.stringify({ chain: { id: 'pingente-luz' }, pendant: { id: 'inexistente' }, wrap: { id: 'wrap-paper' } }), catalog);
  assert.deepEqual(draft, { wrap: { id: 'wrap-paper', quantity: 1 } });
});

test('trocar uma peça preserva as outras escolhas e não modifica o rascunho original', () => {
  const initial = complete(); const snapshot = structuredClone(initial);
  const next = selectGiftChoice(initial, 'chain', { id: 'corrente-cartier', quantity: 1 }, catalog);
  assert.equal(next.chain.id, 'corrente-cartier');
  assert.deepEqual(next.pendant, initial.pendant); assert.deepEqual(next.wrap, initial.wrap);
  assert.deepEqual(initial, snapshot);
  assert.equal(giftDraftTotal(initial, catalog), 34700);
  assert.equal(giftDraftTotal(next, catalog), 40700);
});

test('total parcial e completo usam valores atuais em centavos e quantidades de componentes', () => {
  assert.equal(giftDraftTotal({}, catalog), 0);
  assert.equal(giftDraftTotal({ chain: { id: 'corrente-veneziana', quantity: 2 } }, catalog), 37800);
  assert.equal(giftDraftTotal({ chain: { id: 'inexistente' } }, catalog), null);
  assert.equal(giftDraftTotal(complete(), catalog), 34700);
  assert.deepEqual(giftComponents(complete()).map(item => item.kind), ['chain', 'pendant', 'wrap']);
});

test('variante cadastrada é obrigatória e é preservada no rascunho e no total', () => {
  const variantCatalog = { products: [{ id: 'chain', name: 'Corrente', category: 'corrente', price: 10, variants: [{ id: 'v1', label: 'Opção cadastrada', price: 12.35 }] }], wraps };
  assert.equal(selectGiftChoice({}, 'chain', { id: 'chain' }, variantCatalog), null);
  const draft = selectGiftChoice({}, 'chain', { id: 'chain', variantId: 'v1', quantity: 2 }, variantCatalog);
  assert.deepEqual(giftComponents(draft), [{ kind: 'chain', id: 'chain', quantity: 2, variantId: 'v1' }]);
  assert.equal(giftDraftTotal(draft, variantCatalog), 2470);
  assert.deepEqual(readGiftDraft(JSON.stringify(draft), variantCatalog), draft);
});


test('progresso libera a próxima etapa somente após uma escolha válida', () => {
  const empty = {};
  assert.deepEqual(giftProgress(empty, catalog), { valid: [false, false, false], selectedCount: 0, firstMissing: 0, ready: false, openable: [true, false, false] });
  const draft = selectGiftChoice(empty, 'chain', { id: 'corrente-veneziana' }, catalog);
  const progress = giftProgress(draft, catalog);
  assert.equal(progress.selectedCount, 1);
  assert.equal(progress.firstMissing, 1);
  assert.equal(progress.ready, false);
  assert.deepEqual(progress.openable, [true, true, false]);
  assert.deepEqual(empty, {});
});

test('revisão exige as três escolhas válidas e preserva o rascunho', () => {
  const draft = complete(); const before = structuredClone(draft);
  assert.equal(giftProgress(draft, catalog).ready, true);
  assert.equal(giftProgress(draft, catalog).selectedCount, 3);
  assert.equal(giftProgress(draft, catalog).firstMissing, 2);
  assert.deepEqual(giftProgress(draft, catalog).openable, [true, true, true]);
  assert.deepEqual(draft, before);
  const invalid = { ...draft, chain: { id: 'apagada', quantity: 1 } };
  assert.equal(giftProgress(invalid, catalog).ready, false);
  assert.deepEqual(giftProgress(invalid, catalog).openable, [true, false, false]);
  assert.equal(giftProgress({ ...draft, wrap: { id: 'wrap-paper', quantity: 0 } }, catalog).ready, false);
});

test('uma variante não confirmada mantém o avanço e a revisão bloqueados', () => {
  const options = { products: [{ id: 'chain', name: 'Corrente de exemplo', category: 'corrente', price: 10, variants: [{ id: 'v1', label: '50 cm', price: 12 }] }, ...products.filter(item => item.category === 'pingente')], wraps };
  const pending = { chain: { id: 'chain', quantity: 1 }, pendant: { id: 'pingente-luz', quantity: 1 }, wrap: { id: 'wrap-paper', quantity: 1 } };
  assert.equal(giftProgress(pending, options).ready, false);
  assert.deepEqual(giftProgress(pending, options).openable, [true, false, false]);
  const confirmed = selectGiftChoice(pending, 'chain', { id: 'chain', quantity: 1, variantId: 'v1' }, options);
  assert.equal(giftProgress(confirmed, options).ready, true);
});


test('trocar a opção substitui somente a joia da etapa e recalcula o presente', () => {
  const initial = complete(); const snapshot = structuredClone(initial);
  const changed = prepareGiftChoice(initial, 'chain', { id: 'corrente-cartier', quantity: 1 }, catalog);
  assert.equal(changed.ok, true); assert.equal(changed.pending, null);
  assert.equal(changed.draft.chain.id, 'corrente-cartier');
  assert.deepEqual(changed.draft.pendant, initial.pendant);
  assert.deepEqual(changed.draft.wrap, initial.wrap);
  assert.equal(giftComponents(changed.draft).filter(item => item.kind === 'chain').length, 1);
  assert.equal(giftDraftTotal(changed.draft, catalog), 40700);
  assert.deepEqual(initial, snapshot);
});

test('uma peça com variantes só substitui a escolha confirmada após escolher a opção', () => {
  const initial = complete();
  const options = { products: [...products, { id: 'chain-options', name: 'Corrente com opções', category: 'corrente', price: 200, variants: [{ id: 'v1', label: '50 cm', price: 250 }] }], wraps };
  const pending = prepareGiftChoice(initial, 'chain', { id: 'chain-options', quantity: 1 }, options);
  assert.equal(pending.ok, true);
  assert.deepEqual(pending.pending, { kind: 'chain', id: 'chain-options' });
  assert.equal(pending.draft, initial);
  assert.equal(pending.draft.chain.id, 'corrente-veneziana');
  const confirmed = prepareGiftChoice(pending.draft, 'chain', { id: 'chain-options', variantId: 'v1', quantity: 1 }, options);
  assert.equal(confirmed.pending, null);
  assert.equal(confirmed.draft.chain.variantId, 'v1');
  assert.equal(giftDraftTotal(confirmed.draft, options), 40800);
  assert.equal(giftProgress(confirmed.draft, options).ready, true);
});

test('categoria errada, quantidade inválida e variante desconhecida conservam a seleção', () => {
  const draft = complete();
  const options = { products: [...products, { id: 'chain-options', name: 'Corrente com opções', category: 'corrente', price: 200, variants: [{ id: 'v1', label: '50 cm', price: 250 }] }], wraps };
  for (const selection of [{ id: 'pingente-luz' }, { id: 'apagada' }, { id: 'corrente-cartier', quantity: 0 }, { id: 'chain-options', variantId: 'inexistente' }, { id: 'chain-options', quantity: 0 }]) {
    const result = prepareGiftChoice(draft, 'chain', selection, options);
    assert.equal(result.ok, false);
    assert.equal(result.draft, draft);
    assert.equal(result.pending, null);
  }
});
