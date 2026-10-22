import test from 'node:test';
import assert from 'node:assert/strict';
import { products } from '../dist/data/catalog.js';
import { wraps } from '../dist/data/gifts.js';
import { selectGiftChoice, readGiftDraft, canOpenGiftStep, giftComponents, giftDraftTotal } from '../dist/js/gift-model.js';

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
