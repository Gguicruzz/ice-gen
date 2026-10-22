import test from 'node:test';
import assert from 'node:assert/strict';
import { createFavoritesStore, normalizeFavorites, FAVORITES_KEY } from '../dist/js/favorites-store.js';

const validIds = ['a', 'b'];
function memory(initial) {
  const values = new Map(initial ? [[FAVORITES_KEY, initial]] : []);
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), values };
}
test('normaliza os IDs legados sem aceitar produtos inexistentes ou duplicados', () => {
  assert.deepEqual(normalizeFavorites(['a', '', 'a', 3, 'inexistente', 'b'], validIds), ['a', 'b']);
  assert.deepEqual(normalizeFavorites({ a: true }, validIds), []);
});
test('lê dados corrompidos e bloqueio de armazenamento sem interromper a navegação', () => {
  assert.deepEqual(createFavoritesStore({ storage: memory('{'), validIds }).getIds(), []);
  assert.deepEqual(createFavoritesStore({ storage: { getItem() { throw Error('blocked'); } }, validIds }).getIds(), []);
});
test('alternar um favorito persiste na mesma chave e não altera sacola', () => {
  const storage = memory('["a"]');
  storage.setItem('icegen-cart', 'seleção existente');
  const store = createFavoritesStore({ storage, validIds });
  assert.deepEqual(store.toggle('b'), { ids: ['a', 'b'], saved: true, changed: true });
  assert.deepEqual(store.toggle('a').ids, ['b']);
  assert.equal(storage.getItem(FAVORITES_KEY), '["b"]');
  assert.equal(storage.getItem('icegen-cart'), 'seleção existente');
  const returned = store.getIds();
  returned.push('a');
  assert.deepEqual(store.getIds(), ['b']);
});
test('falha de gravação mantém seleção em memória e retorna saved false', () => {
  const store = createFavoritesStore({ storage: { getItem() { return null; }, setItem() { throw Error('quota'); } }, validIds });
  assert.deepEqual(store.toggle('a'), { ids: ['a'], saved: false, changed: true });
  assert.deepEqual(store.toggle('unknown'), { ids: ['a'], saved: false, changed: false });
});
test('refresh comunica mudança externa e unsubscribe encerra notificações', () => {
  const storage = memory();
  const store = createFavoritesStore({ storage, validIds });
  const changes = [];
  const unsubscribe = store.subscribe(ids => changes.push(ids));
  storage.setItem(FAVORITES_KEY, '["b","b","invalid"]');
  assert.deepEqual(store.refresh(), ['b']);
  assert.deepEqual(changes, [['b']]);
  store.refresh();
  assert.equal(changes.length, 1);
  unsubscribe();
  store.toggle('a');
  assert.equal(changes.length, 1);
});
