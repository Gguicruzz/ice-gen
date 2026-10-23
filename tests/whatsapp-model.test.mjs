import test from 'node:test';
import assert from 'node:assert/strict';
import { createWhatsAppDraft } from '../dist/js/whatsapp-model.js';

const contact = Object.freeze({ number: '5511948608322', validated: true });
const loose = Object.freeze({
  id: 'anel-descontinuado::18', productId: 'anel-descontinuado', name: 'Anel Coração & Luz + edição #1?',
  category: 'anel', price: 189.1, quantity: 3, variantId: '18', variantLabel: 'Aro 18', measurement: '4 mm', material: 'Prata 925',
});
const gift = () => ({
  id: 'gift-snapshot', name: 'Seu presente', category: 'presente', price: 517.3, quantity: 2,
  giftComponents: [
    { kind: 'chain', id: 'corrente-antiga', name: 'Corrente da coleção anterior', price: 189.1, quantity: 2, variantLabel: '50 cm' },
    { kind: 'pendant', id: 'pingente-antigo', name: 'Pingente Coração', price: 119.1, quantity: 1 },
    { kind: 'wrap', id: 'caixa-antiga', name: 'Embalagem anterior', price: 20, quantity: 1 },
  ],
});
const copy = value => JSON.parse(JSON.stringify(value));

test('rascunho preserva acentos, caracteres reservados, variante e total em centavos', () => {
  const result = createWhatsAppDraft([loose], contact);
  assert.equal(result.ok, true);
  assert.match(result.message, /Anel Coração & Luz \+ edição #1\?/);
  assert.match(result.message, /Material: Prata 925\nMedida: 4 mm\nVariante: Aro 18/);
  assert.match(result.message, /Quantidade: 3/);
  assert.match(result.message, /Valor unitário demonstrativo: R\$ 189,10/);
  assert.match(result.message, /Subtotal: R\$ 567,30/);
  assert.match(result.message, /Total parcial demonstrativo: R\$ 567,30/);
  const url = new URL(result.url);
  assert.equal(url.origin, 'https://wa.me');
  assert.equal(url.pathname, '/5511948608322');
  assert.deepEqual([...url.searchParams.keys()], ['text']);
  assert.equal(url.searchParams.get('text'), result.message);
  assert.match(result.message, /preços, a disponibilidade e as condições de entrega/);
  assert.match(result.message, /consulta, sem pedido confirmado/);
});

test('presentes usam snapshots desconhecidos e quantidade de grupo sem duplicar componentes no total', () => {
  const result = createWhatsAppDraft([loose, gift()], contact);
  assert.equal(result.ok, true);
  assert.match(result.message, /Quantidade de presentes: 2/);
  assert.match(result.message, /Corrente da coleção anterior/);
  assert.match(result.message, /Quantidade por presente: 2; no grupo: 4\./);
  assert.match(result.message, /Valor unitário demonstrativo: R\$ 189,10; por presente: R\$ 378,20/);
  assert.match(result.message, /Valor por presente demonstrativo: R\$ 517,30/);
  assert.match(result.message, /Subtotal do grupo: R\$ 1\.034,60/);
  assert.match(result.message, /Total parcial demonstrativo: R\$ 1\.601,90/);
  assert.equal((result.message.match(/Total parcial demonstrativo:/g) || []).length, 1);
});

test('snapshots legados sem quantidade usam uma unidade no item e nos componentes', () => {
  const oldGift = gift();
  delete oldGift.quantity;
  oldGift.giftComponents.forEach(component => delete component.quantity);
  oldGift.price = 328.2;
  const oldLoose = { ...loose };
  delete oldLoose.quantity;
  const result = createWhatsAppDraft([oldLoose, oldGift], contact);
  assert.equal(result.ok, true);
  assert.match(result.message, /Quantidade: 1/);
  assert.match(result.message, /Quantidade de presentes: 1/);
  assert.match(result.message, /Quantidade por presente: 1; no grupo: 1/);
  assert.match(result.message, /Total parcial demonstrativo: R\$ 517,30/);
});

test('contato exige validação explícita e somente dígitos E164 com comprimento válido', () => {
  for (const invalid of [undefined, null, [], {}, { number: contact.number }, { ...contact, validated: 'true' },
    { ...contact, validated: false }, { ...contact, number: 5511948608322 },
    ...['+5511948608322', ' 5511948608322', '5511948608322 ', '0511948608322', '55119', '1'.repeat(16), '5511&text=oi'].map(number => ({ ...contact, number }))]) {
    assert.deepEqual(createWhatsAppDraft([loose], invalid), { ok: false, reason: 'contact' });
  }
  assert.equal(createWhatsAppDraft([loose], { ...contact, number: '12345678' }).ok, true);
  assert.equal(createWhatsAppDraft([loose], { ...contact, number: '1'.repeat(15) }).ok, true);
});

test('entrada e snapshots inválidos falham sem rascunho parcial ou substituição de nomes', () => {
  for (const value of [undefined, null, {}, '[]']) assert.deepEqual(createWhatsAppDraft(value, contact), { ok: false, reason: 'items' });
  assert.deepEqual(createWhatsAppDraft([], contact), { ok: false, reason: 'empty' });
  for (const value of [null, [], {}, { ...loose, name: ' \n\t ' }, { ...loose, name: {} }, { ...loose, material: ['prata'] }, { ...loose, category: false }, { ...loose, id: '' }, { ...loose, name: '\ud800' }]) {
    assert.deepEqual(createWhatsAppDraft([value], contact), { ok: false, reason: 'items' });
  }
});

test('quantidades fora de 1 a 99 e preços inválidos são recusados', () => {
  for (const quantity of [null, true, false, '', ' ', 0, -1, 1.5, 100, Infinity, [], {}]) {
    assert.deepEqual(createWhatsAppDraft([{ ...loose, quantity }], contact), { ok: false, reason: 'quantity' });
  }
  for (const price of [null, undefined, false, '', ' ', -1, NaN, Infinity, [], {}, Number.MAX_SAFE_INTEGER]) {
    assert.deepEqual(createWhatsAppDraft([{ ...loose, price }], contact), { ok: false, reason: 'price' });
  }
  const result = createWhatsAppDraft([{ ...loose, price: '0.10', quantity: '99' }, { ...loose, id: 'outra', price: .2, quantity: 2 }], contact);
  assert.equal(result.ok, true);
  assert.match(result.message, /Total parcial demonstrativo: R\$ 10,30/);
  assert.deepEqual(createWhatsAppDraft([{ ...loose, price: 8e13, quantity: 2 }], contact), { ok: false, reason: 'limit' });
  assert.deepEqual(createWhatsAppDraft([{ ...loose, price: 8e13, quantity: 1 }, { ...loose, id: 'outra', price: 8e13, quantity: 1 }], contact), { ok: false, reason: 'limit' });
});

test('presentes incompletos, tipos repetidos, componentes inválidos e preços incoerentes são recusados', () => {
  const invalid = [
    { ...gift(), giftComponents: undefined }, { ...gift(), giftComponents: [] },
    { ...gift(), giftComponents: gift().giftComponents.slice(0, 2) },
    { ...gift(), giftComponents: [null, ...gift().giftComponents.slice(1)] },
    { ...gift(), price: 1 },
  ];
  for (const change of [
    { kind: 'pendant' }, { kind: 'desconhecido' }, { name: {} }, { price: [] },
    { quantity: 0 }, { quantity: 100 }, { quantity: 1.5 }, { id: '' }, { variantLabel: true },
  ]) {
    const changed = gift();
    Object.assign(changed.giftComponents[0], change);
    invalid.push(changed);
  }
  for (const item of invalid) assert.deepEqual(createWhatsAppDraft([item], contact), { ok: false, reason: 'components' });
});

test('nomes e detalhes permanecem em uma linha e limites não truncam a mensagem', () => {
  const result = createWhatsAppDraft([{ ...loose, name: '  Anel\n Coração\t&  Luz\u0000 ', variantLabel: ' Aro\r\n18 ' }], contact);
  assert.equal(result.ok, true);
  assert.match(result.message, /1\. Anel Coração & Luz\n/);
  assert.match(result.message, /Variante: Aro 18\n/);
  for (const field of ['name', 'variantLabel', 'material', 'measurement']) {
    assert.deepEqual(createWhatsAppDraft([{ ...loose, [field]: 'a'.repeat(201) }], contact), { ok: false, reason: 'length' });
  }
  const largeSelection = Array.from({ length: 30 }, (_, index) => ({ ...loose, id: `item-${index}`, name: `${index} ${'a'.repeat(190)}` }));
  assert.deepEqual(createWhatsAppDraft(largeSelection, contact), { ok: false, reason: 'length' });
});

test('geração pura não altera sacola, componentes ou contato', () => {
  const frozenGift = gift();
  frozenGift.giftComponents.forEach(Object.freeze);
  Object.freeze(frozenGift.giftComponents);
  Object.freeze(frozenGift);
  const items = Object.freeze([loose, frozenGift]);
  const before = copy(items);
  const result = createWhatsAppDraft(items, contact);
  assert.equal(result.ok, true);
  assert.deepEqual(items, before);
  assert.deepEqual(contact, { number: '5511948608322', validated: true });
  assert.equal('url' in createWhatsAppDraft([], contact), false);
});
