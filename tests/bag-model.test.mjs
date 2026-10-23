import test from 'node:test';
import assert from 'node:assert/strict';
import { products, complements } from '../dist/data/catalog.js';
import { bagProductIds, selectBagSuggestions } from '../dist/js/bag-model.js';

const ids = selection => selection.map(product => product.id);

test('sugestões preservam os complementos legados e a ordem do catálogo', () => {
  const items = [{ id: 'corrente-veneziana', category: 'corrente', quantity: 1 }];
  assert.deepEqual(ids(selectBagSuggestions(products, items, complements)), ['pingente-luz', 'pingente-coracao']);
});

test('uma categoria relacionada é atendida antes de repetir outra categoria', () => {
  const items = [{ id: 'pingente-luz', category: 'pingente' }];
  assert.deepEqual(ids(selectBagSuggestions(products, items, complements)), ['corrente-veneziana', 'pulseira-riviera', 'corrente-cartier']);
  assert.deepEqual(ids(selectBagSuggestions(products, items, complements, { limit: 4 })), ['corrente-veneziana', 'pulseira-riviera', 'corrente-cartier', 'pulseira-elo']);
});

test('produto ocupado por uma variante exclui todas as variantes da sugestão', () => {
  const items = [
    { id: 'pingente-luz', category: 'pingente' },
    { id: 'corrente-veneziana::55cm', productId: 'corrente-veneziana', category: 'categoria-antiga', variantId: '55cm' },
    { id: 'corrente-veneziana::60cm', productId: 'corrente-veneziana', category: 'categoria-antiga', variantId: '60cm' },
  ];
  assert.deepEqual(bagProductIds(items, products), ['pingente-luz', 'corrente-veneziana']);
  assert.deepEqual(ids(selectBagSuggestions(products, items, complements)), ['corrente-cartier', 'pulseira-riviera', 'pingente-coracao']);
});

test('componentes conhecidos de presentes ficam excluídos e originam complementos', () => {
  const items = [{
    id: 'gift-1', category: 'presente', quantity: 2,
    giftComponents: [
      { kind: 'chain', id: 'corrente-veneziana', quantity: 1 },
      { kind: 'pendant', id: 'pingente-luz', quantity: 1 },
      { kind: 'wrap', id: 'wrap-paper', quantity: 1 },
    ],
  }];
  assert.deepEqual(bagProductIds(items, products), ['corrente-veneziana', 'pingente-luz']);
  assert.deepEqual(ids(selectBagSuggestions(products, items, complements)), ['pingente-coracao', 'corrente-cartier', 'pulseira-riviera']);
});

test('IDs desconhecidos e categorias de snapshots não inventam sugestões', () => {
  const items = [
    null, {}, [],
    { id: 'ausente', category: 'pingente' },
    { id: 'presente-antigo', category: 'presente' },
    { id: 'presente-invalido', category: 'presente', giftComponents: [null, {}, { id: 'wrap-paper' }, { id: 'ausente' }] },
  ];
  assert.deepEqual(bagProductIds(items, products), []);
  assert.deepEqual(selectBagSuggestions(products, items, complements), []);
  assert.deepEqual(ids(selectBagSuggestions(products, [{ id: 'brinco-argola', category: 'pingente' }], complements)), ['brinco-gota']);
});

test('vazio, categoria sem complementos e limite inválido não produzem opções', () => {
  assert.deepEqual(selectBagSuggestions(products, [], complements), []);
  assert.deepEqual(selectBagSuggestions(products, null, complements), []);
  assert.deepEqual(selectBagSuggestions(null, [{ id: 'pingente-luz' }], complements), []);
  assert.deepEqual(selectBagSuggestions(products, [{ id: 'pingente-luz' }], null), []);
  assert.deepEqual(selectBagSuggestions(products, [{ id: 'pingente-luz' }], {}), []);
  for (const limit of [0, -1, 1.5, NaN, Infinity, '2', null, false]) {
    assert.deepEqual(selectBagSuggestions(products, [{ id: 'pingente-luz' }], complements, { limit }), [], String(limit));
  }
  assert.deepEqual(ids(selectBagSuggestions(products, [{ id: 'pingente-luz' }], complements, { limit: 1 })), ['corrente-veneziana']);
  assert.equal(selectBagSuggestions(products, [{ id: 'pingente-luz' }], complements, { limit: Number.MAX_SAFE_INTEGER }).length, 4);
});

test('categorias repetidas, produtos repetidos e relações desconhecidas não duplicam opções', () => {
  const catalog = [...products, products[0], null, { id: 'sem-categoria' }];
  const relations = { pingente: ['corrente', 'corrente', null, 'ausente', 'pulseira'] };
  assert.deepEqual(ids(selectBagSuggestions(catalog, [{ id: 'pingente-luz' }], relations)), ['corrente-veneziana', 'pulseira-riviera', 'corrente-cartier']);
  assert.deepEqual(selectBagSuggestions(products, [{ id: 'pingente-luz' }], Object.create({ pingente: ['corrente'] })), []);
});

test('seleção não altera entradas e retorna os objetos originais do catálogo', () => {
  const catalog = Object.freeze(products.map(product => Object.freeze({ ...product })));
  const items = Object.freeze([Object.freeze({ id: 'pingente-luz', category: 'pingente' })]);
  const relations = Object.freeze({ pingente: Object.freeze(['corrente', 'pulseira']) });
  const before = JSON.stringify({ catalog, items, relations });
  const result = selectBagSuggestions(catalog, items, relations);
  assert.equal(result[0], catalog[0]);
  assert.equal(JSON.stringify({ catalog, items, relations }), before);
  result.pop();
  assert.equal(catalog.length, 10);
});
