import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CART_KEY, MAX_QUANTITY, createCartStore, giftSignature, itemCount, itemTotalCents,
  normalizeCart, priceCents, productUrl, totalCents, validateProductSelection,
} from '../dist/js/cart-store.js';

const products = [
  { id: 'chain', name: 'Corrente de teste', category: 'corrente', price: 189.1, image: '/chain.png' },
  { id: 'chain-other', name: 'Outra corrente', category: 'corrente', price: 249 },
  { id: 'pendant', name: 'Pingente de teste', category: 'pingente', price: 119.2 },
  { id: 'ring', name: 'Anel com variante de teste', category: 'anel', price: 100, variants: [
    { id: '18', label: 'Aro 18' }, { id: '20/especial', label: 'Aro 20', price: 120 },
  ] },
];
const wraps = [{ id: 'wrap-paper', name: 'Embalagem 1', price: 39 }, { id: 'wrap-velvet', name: 'Embalagem 2', price: 59 }];
const components = [
  { kind: 'chain', id: 'chain' }, { kind: 'pendant', id: 'pendant' }, { kind: 'wrap', id: 'wrap-paper' },
];
const memory = initial => {
  const values = new Map(initial === undefined ? [] : [[CART_KEY, typeof initial === 'string' ? initial : JSON.stringify(initial)]]);
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), values };
};
const storeFor = (storage = memory()) => createCartStore({ storage, products, wraps });
const copy = value => JSON.parse(JSON.stringify(value));

test('centavos, quantidades e totais recusam valores ausentes, fracionários e overflow', () => {
  assert.equal(MAX_QUANTITY, 99);
  assert.equal(priceCents(.1), 10);
  for (const value of [null, undefined, false, '', NaN, Infinity, -1, Number.MAX_SAFE_INTEGER]) assert.equal(priceCents(value), null);
  assert.equal(totalCents([{ price: .1, quantity: 3 }, { price: .2, quantity: 2 }]), 70);
  assert.equal(itemTotalCents({ price: 2 }), 200);
  assert.equal(itemCount([{ quantity: 3 }, { quantity: 2 }]), 5);
  for (const quantity of [0, -1, 1.5, 100, true, '', Infinity]) assert.equal(itemTotalCents({ price: 1, quantity }), null);
  assert.equal(totalCents([{ price: 8e13 }, { price: 8e13 }]), null);
});

test('seleção exige variante cadastrada e distingue preço por variante sem inventar opções', () => {
  assert.equal(validateProductSelection(products[3]).reason, 'variant');
  assert.equal(validateProductSelection(products[3], { variantId: 'unknown' }).reason, 'variant');
  assert.equal(validateProductSelection(products[0], { variantId: 'fake' }).reason, 'variant');
  assert.equal(validateProductSelection(products[3], { variantId: '18', quantity: 2 }).price, 100);
  assert.equal(validateProductSelection(products[3], { variantId: '20/especial' }).price, 120);
  assert.equal(validateProductSelection(products[0], { quantity: 0 }).reason, 'quantity');
  assert.equal(validateProductSelection(undefined).reason, 'product');
  assert.equal(validateProductSelection({ ...products[0], price: -1 }).reason, 'price');
  assert.equal(productUrl('produto com /'), '/produto.html?id=produto%20com%20%2F');
});

test('dados corrompidos e leitura bloqueada não interrompem a página nem simulam gravação', () => {
  for (const initial of ['{', 'null', '{}', 'false']) assert.deepEqual(storeFor(memory(initial)).getItems(), []);
  const blocked = storeFor({ getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } });
  assert.deepEqual(blocked.getItems(), []);
  assert.equal(blocked.addProduct('chain').reason, 'storage');
  assert.deepEqual(blocked.refresh(), []);
  assert.equal(storeFor(undefined).addProduct('unknown').ok, false);
});

test('normalização mantém presentes desconhecidos e reconcilia avulsos com catálogo atual', () => {
  const unknownGift = { id: 'gift-old', name: 'Presente antigo', category: 'presente', price: 37.9, quantity: 2, giftComponents: [{ kind: 'old' }] };
  const items = normalizeCart([
    { ...products[0], price: 1 }, unknownGift,
    { id: 'missing', name: 'Não cadastrado', category: 'anel', price: 5 },
    null, {}, { ...products[0], quantity: 0 },
  ], { products });
  assert.equal(items.length, 2);
  assert.equal(items[0].price, products[0].price);
  assert.equal(items[0].quantity, 1);
  assert.deepEqual(items[1], unknownGift);
  const store = storeFor(memory(items));
  assert.equal(store.editableGift(items[1]), null);
  assert.equal(store.setQuantity('gift-old', 3).ok, true);
  assert.equal(store.remove('gift-old').ok, true);
});

test('avulsos iguais somam quantidade; variantes diferentes têm identidades independentes', () => {
  const storage = memory();
  storage.setItem('icegen-favorites', '["pendant"]');
  const store = storeFor(storage);
  assert.equal(store.addProduct('chain', { quantity: 2 }).ok, true);
  store.addProduct('chain', { quantity: 3 });
  store.addProduct('ring', { variantId: '18' });
  store.addProduct('ring', { variantId: '20/especial', quantity: 2 });
  const items = store.getItems();
  assert.equal(items.length, 3);
  assert.equal(items[0].quantity, 5);
  assert.equal(items[1].id, 'ring::18');
  assert.equal(items[2].id, 'ring::20%2Fespecial');
  assert.equal(items[2].variantLabel, 'Aro 20');
  assert.equal(items[2].price, 120);
  assert.equal(storage.getItem('icegen-favorites'), '["pendant"]');
  assert.deepEqual(storeFor(storage).getItems(), items);
});

test('quantidade entre 1 e 99 não remove linha e adição não ultrapassa o limite', () => {
  const store = storeFor();
  store.addProduct('chain', { quantity: 99 });
  assert.equal(store.addProduct('chain').reason, 'quantity');
  for (const quantity of [0, -1, 1.5, 100, '', null, false]) assert.equal(store.setQuantity('chain', quantity).reason, 'quantity');
  assert.equal(store.getItems()[0].quantity, 99);
  assert.equal(store.setQuantity('chain', 1).ok, true);
  assert.equal(store.getItems().length, 1);
  assert.equal(store.remove('chain').ok, true);
  assert.deepEqual(store.getItems(), []);
  assert.equal(store.remove('chain').reason, 'missing');
});

test('mutações releem armazenamento para conservar alterações de outra aba', () => {
  const storage = memory(), first = storeFor(storage), second = storeFor(storage);
  first.addProduct('chain', { quantity: 2 });
  second.addProduct('pendant');
  first.addProduct('chain');
  assert.deepEqual(first.getItems().map(({ productId, quantity }) => [productId, quantity]), [['chain', 3], ['pendant', 1]]);
  assert.deepEqual(second.refresh(), first.getItems());
});

test('falha de gravação preserva estado anterior sem fallback em memória', () => {
  const storage = memory(), store = storeFor(storage);
  store.addProduct('chain', { quantity: 2 });
  const before = store.getItems(), saved = storage.getItem(CART_KEY);
  storage.setItem = () => { throw Error('quota'); };
  assert.equal(store.addProduct('pendant').reason, 'storage');
  assert.equal(store.setQuantity('chain', 3).reason, 'storage');
  assert.equal(store.remove('chain').reason, 'storage');
  assert.equal(store.addGift(components).reason, 'storage');
  assert.deepEqual(store.getItems(), before);
  assert.equal(storage.getItem(CART_KEY), saved);
});

test('presente grava composição em centavos, quantidades e um grupo próprio sem foto falsa', () => {
  const store = storeFor();
  const result = store.addGift(components.map(component => ({ ...component, price: .01, name: 'Falso', image: '/false.png' })));
  assert.equal(result.ok, true);
  const gift = store.getItems()[0];
  assert.equal(result.itemId, gift.id);
  assert.match(gift.id, /^gift-/);
  assert.equal(gift.category, 'presente');
  assert.equal(gift.name, 'Presente personalizado ICE GEN');
  assert.equal(gift.price, 347.3);
  assert.equal(gift.quantity, 1);
  assert.deepEqual(gift.giftComponents.map(({ kind, quantity }) => [kind, quantity]), [['chain', 1], ['pendant', 1], ['wrap', 1]]);
  assert.equal('image' in gift.giftComponents[2], false);
  assert.equal(gift.giftComponents[0].name, products[0].name);
  store.addGift(components);
  assert.equal(store.getItems().length, 2);
  assert.notEqual(store.getItems()[0].id, store.getItems()[1].id);
});

test('presente preserva variante e quantidade de componente quando cadastradas', () => {
  const variantProducts = copy(products);
  variantProducts[0].variants = [{ id: '60', label: '60 cm', price: 200.1 }];
  const store = createCartStore({ storage: memory(), products: variantProducts, wraps });
  assert.equal(store.addGift(components).reason, 'variant');
  const chosen = components.map(component => component.kind === 'chain' ? { ...component, variantId: '60', quantity: 2 } : component);
  assert.equal(store.addGift(chosen).ok, true);
  const gift = store.getItems()[0];
  assert.equal(gift.price, 558.4);
  assert.equal(gift.giftComponents[0].variantId, '60');
  assert.equal(gift.giftComponents[0].quantity, 2);
  assert.deepEqual(store.editableGift(gift)[0], { kind: 'chain', id: 'chain', quantity: 2, variantId: '60' });
});

test('componentes incompletos, duplicados, de categoria errada ou sem embalagem conhecida são recusados', () => {
  const store = storeFor();
  for (const value of [null, [], components.slice(0, 2), [components[0], components[0], components[2]],
    components.map(component => component.kind === 'chain' ? { ...component, id: 'pendant' } : component),
    components.map(component => component.kind === 'wrap' ? { ...component, id: 'unknown' } : component)]) {
    assert.equal(store.addGift(value).ok, false);
  }
  assert.equal(createCartStore({ storage: memory(), products }).addGift(components).ok, false);
  assert.deepEqual(store.getItems(), []);
});

test('edição substitui presente preservando ID, quantidade mais recente e outras linhas', () => {
  const storage = memory(), store = storeFor(storage);
  const added = store.addGift(components);
  const original = store.getItems()[0], signature = giftSignature(original);
  store.addProduct('pendant', { quantity: 2 });
  const other = storeFor(storage);
  other.setQuantity(added.itemId, 3);
  const changed = components.map(component => component.kind === 'chain' ? { ...component, id: 'chain-other' } : component);
  const result = store.replaceGift(added.itemId, changed, { signature });
  assert.equal(result.ok, true);
  const items = store.getItems();
  assert.equal(items.length, 2);
  assert.equal(items[0].id, original.id);
  assert.equal(items[0].quantity, 3);
  assert.equal(items[0].giftComponents[0].id, 'chain-other');
  assert.equal(items[0].price, 407.2);
  assert.equal(itemTotalCents(items[0]), 122160);
  assert.equal(items[1].productId, 'pendant');
  assert.equal(items[1].quantity, 2);
});

test('edição não sobrescreve presente removido, composição externa ou identidade duplicada', () => {
  for (const kind of ['removed', 'changed', 'duplicate']) {
    const storage = memory(), store = storeFor(storage);
    store.addGift(components);
    const original = store.getItems()[0], signature = giftSignature(original);
    const external = kind === 'removed' ? [] : kind === 'duplicate' ? [original, original] : [{ ...original, name: 'Alterado em outra aba' }];
    storage.setItem(CART_KEY, JSON.stringify(external));
    const result = store.replaceGift(original.id, components, { signature });
    assert.equal(result.ok, false);
    assert.equal(result.reason, kind === 'removed' ? 'missing' : 'conflict');
    assert.deepEqual(storeFor(storage).getItems(), external);
  }
});

test('abrir edição não grava; snapshots retornados e rascunhos não alteram sacola', () => {
  const storage = memory(), store = storeFor(storage);
  store.addGift(components);
  const original = store.getItems()[0], saved = storage.getItem(CART_KEY);
  const selection = store.editableGift(original);
  selection[0].id = 'chain-other';
  original.giftComponents[0].name = 'Mutação externa';
  assert.equal(storage.getItem(CART_KEY), saved);
  assert.equal(store.getItems()[0].giftComponents[0].name, products[0].name);
});

test('falha ao salvar edição conserva composição anterior e permite repetir', () => {
  const storage = memory(), store = storeFor(storage);
  store.addGift(components);
  const original = store.getItems()[0], signature = giftSignature(original), write = storage.setItem;
  const next = components.map(component => component.kind === 'wrap' ? { ...component, id: 'wrap-velvet' } : component);
  storage.setItem = () => { throw Error('quota'); };
  assert.equal(store.replaceGift(original.id, next, { signature }).reason, 'storage');
  assert.deepEqual(store.getItems(), [original]);
  storage.setItem = write;
  assert.equal(store.replaceGift(original.id, next, { signature }).ok, true);
  assert.equal(store.getItems()[0].giftComponents[2].id, 'wrap-velvet');
});

test('presentes legados têm quantidade implícita de componente e edição exige snapshot coerente', () => {
  const store = storeFor();
  store.addGift(components);
  const gift = store.getItems()[0];
  gift.giftComponents.forEach(component => delete component.quantity);
  assert.equal(store.editableGift(gift).length, 3);
  assert.equal(store.editableGift({ ...gift, price: gift.price + 1 }), null);
  assert.equal(store.editableGift({ ...gift, giftComponents: undefined }), null);
  assert.equal(store.editableGift({ ...gift, giftComponents: [null, ...gift.giftComponents.slice(1)] }), null);
});

test('refresh notifica só mudanças e snapshots de assinatura excluem quantidade do grupo', () => {
  const storage = memory(), store = storeFor(storage), changes = [];
  const unsubscribe = store.subscribe(items => changes.push(items));
  store.addGift(components);
  const gift = store.getItems()[0];
  assert.equal(giftSignature(gift), giftSignature({ ...gift, quantity: 3 }));
  store.refresh();
  assert.equal(changes.length, 1);
  storage.setItem(CART_KEY, '[]');
  store.refresh();
  assert.equal(changes.length, 2);
  unsubscribe();
  store.addProduct('chain');
  assert.equal(changes.length, 2);
});
