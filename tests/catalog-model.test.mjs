import test from 'node:test';
import assert from 'node:assert/strict';
import { products } from '../dist/data/catalog.js';
import {
  categories, normalizeSearch, readCatalogState, catalogSearchParams, selectProducts,
} from '../dist/js/catalog-model.js';

const ids = selection => selection.map(product => product.id);

test('busca ignora acentos, caixa e espaços repetidos', () => {
  assert.equal(normalizeSearch('  ALIANÇAS   CLÁSSICAS  '), 'aliancas classicas');
  assert.equal(normalizeSearch(null), '');
  assert.deepEqual(ids(selectProducts(products, { query: '  CORAÇÃO  ' })), ['pingente-coracao']);
});

test('nomes singulares e plurais encontram as seis categorias preservadas', () => {
  const queries = [
    ['colares', 'corrente'], ['COLAR', 'corrente'], ['correntes', 'corrente'],
    ['pingentes', 'pingente'], ['pulseiras', 'pulseira'], ['ANÉIS', 'anel'],
    ['aneis', 'anel'], ['brincos', 'brinco'], ['ALIANÇAS', 'alianca'],
  ];
  for (const [query, category] of queries) {
    assert.deepEqual(ids(selectProducts(products, { query })), ids(products.filter(product => product.category === category)), query);
  }
  assert.deepEqual(new Set(categories.map(category => category.id)), new Set(products.map(product => product.category)));
});

test('vários termos podem combinar alias da categoria e nome do produto', () => {
  assert.deepEqual(ids(selectProducts(products, { query: 'COLARES  VENEZIANA' })), ['corrente-veneziana']);
  assert.deepEqual(ids(selectProducts(products, { query: 'aneis liso' })), ['anel-liso']);
});

test('busca, categorias múltiplas e favoritos se intersectam', () => {
  const state = { query: 'elo', categories: ['corrente', 'pulseira'], favorites: true };
  const favoriteIds = ['pulseira-elo', 'brinco-gota', '', null, {}, 'id-ausente', 'pulseira-elo'];
  assert.deepEqual(ids(selectProducts(products, state, { favoriteIds })), ['pulseira-elo']);
  assert.deepEqual(ids(selectProducts(products, { ...state, favorites: false })), ['corrente-cartier', 'pulseira-elo']);
  assert.deepEqual(selectProducts(products, state, { favoriteIds: 'pulseira-elo' }), []);
});

test('nenhum resultado é criado para termos ou favoritos ausentes', () => {
  assert.deepEqual(selectProducts(products, { query: 'joia inexistente' }), []);
  assert.deepEqual(selectProducts(products, { favorites: true }, { favoriteIds: ['apagado', 1, false, ''] }), []);
});

test('ordenação usa centavos e mantém a ordem de origem em empates', () => {
  const sample = Object.freeze([
    Object.freeze({ id: 'caro', name: 'Prata', category: 'anel', price: 100 }),
    Object.freeze({ id: 'empate-a', name: 'Ágata', category: 'anel', price: 9.9 }),
    Object.freeze({ id: 'barato', name: 'Brilho', category: 'anel', price: 2 }),
    Object.freeze({ id: 'empate-b', name: 'Agata', category: 'anel', price: '9.90' }),
    Object.freeze({ id: 'centavo', name: 'Diamante', category: 'anel', price: 9.91 }),
  ]);
  assert.deepEqual(ids(selectProducts(sample, { sort: 'price-asc' })), ['barato', 'empate-a', 'empate-b', 'centavo', 'caro']);
  assert.deepEqual(ids(selectProducts(sample, { sort: 'price-desc' })), ['caro', 'centavo', 'empate-a', 'empate-b', 'barato']);
  assert.deepEqual(ids(selectProducts(sample, { sort: 'name' })), ['empate-a', 'empate-b', 'barato', 'centavo', 'caro']);
  const featured = selectProducts(sample);
  assert.deepEqual(ids(featured), ['caro', 'empate-a', 'barato', 'empate-b', 'centavo']);
  assert.notEqual(featured, sample);
  assert.equal(featured[0], sample[0]);
});

test('estado e URL fazem roundtrip com categorias repetidas e termo acentuado', () => {
  const state = { query: 'Coração & luz', categories: ['pingente', 'corrente'], sort: 'price-desc', favorites: true };
  const params = catalogSearchParams(state);
  assert.ok(params instanceof URLSearchParams);
  assert.deepEqual(params.getAll('categoria'), state.categories);
  assert.deepEqual(readCatalogState(`?${params}`), state);
  assert.deepEqual(readCatalogState(params), state);
  assert.equal(catalogSearchParams(readCatalogState()).toString(), '');
});

test('URL sanitiza categorias e ordem desconhecidas sem inventar filtros', () => {
  assert.deepEqual(readCatalogState('?categoria=desconhecida&categoria=anéis&categoria=anel&categoria=colares,pingentes&ordem=mais-vendidos&favoritos=true&material=ouro'), {
    query: '', categories: ['anel', 'corrente', 'pingente'], sort: 'featured', favorites: false,
  });
  assert.deepEqual(ids(selectProducts(products, { categories: ['sem-categoria'], sort: 'novidade' })), ids(products));
});

test('termo da URL é aparado e limitado antes de retornar e serializar', () => {
  const longQuery = `   ${'á'.repeat(120)}   `;
  const state = readCatalogState(new URLSearchParams({ busca: longQuery }));
  assert.equal(state.query.length, 100);
  assert.equal(state.query, 'á'.repeat(100));
  assert.equal(catalogSearchParams({ query: longQuery }).get('busca'), state.query);
});

test('filtrar e serializar não modificam produtos nem o estado recebido', () => {
  const state = Object.freeze({ query: 'elo', categories: Object.freeze(['pulseiras', 'corrente', 'pulseiras']), sort: 'price-asc', favorites: false });
  const before = JSON.stringify(products);
  const selected = selectProducts(products, state);
  assert.deepEqual(ids(selected), ['pulseira-elo', 'corrente-cartier']);
  assert.deepEqual(catalogSearchParams(state).getAll('categoria'), ['pulseira', 'corrente']);
  assert.deepEqual(state.categories, ['pulseiras', 'corrente', 'pulseiras']);
  assert.equal(JSON.stringify(products), before);
});
