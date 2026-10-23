import { MAX_QUANTITY, priceCents, itemTotalCents, totalCents } from './cart-store.js';

const maximumTextLength = 200;
const maximumMessageLength = 6000;
const componentKinds = [
  ['chain', 'Corrente'],
  ['pendant', 'Pingente'],
  ['wrap', 'Embalagem'],
];
const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const money = cents => currency.format(cents / 100).replace(/\u00a0/g, ' ');
const record = value => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const failure = reason => ({ ok: false, reason });

function text(value, required = false) {
  if (value === undefined || value === null) return required ? failure('items') : { ok: true, value: '' };
  if (typeof value !== 'string') return failure('items');
  // Cada campo permanece em uma linha; nomes não podem introduzir instruções
  // ou totais adicionais por meio de quebras de linha e caracteres de controle.
  const cleaned = value.replace(/[\u0000-\u001f\u007f-\u009f]/g, ' ').replace(/\s+/gu, ' ').trim();
  if (cleaned.length > maximumTextLength) return failure('length');
  if (required && !cleaned) return failure('items');
  try { encodeURIComponent(cleaned); } catch { return failure('items'); }
  return { ok: true, value: cleaned };
}

function snapshot(value, { component = false } = {}) {
  if (!record(value)) return failure('items');
  const normalized = {};
  const required = component ? ['id', 'name', 'kind'] : ['id', 'name', 'category'];
  for (const field of [...required, 'variantLabel', 'variantId', 'measurement', 'material']) {
    const result = text(value[field], required.includes(field));
    if (!result.ok) return result;
    if (result.value) normalized[field] = result.value;
  }
  const rawQuantity = value.quantity === undefined ? 1 : value.quantity;
  if (!['number', 'string'].includes(typeof rawQuantity) || String(rawQuantity).trim() === '') return failure('quantity');
  const quantity = Number(rawQuantity);
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) return failure('quantity');
  if (!['number', 'string'].includes(typeof value.price)) return failure('price');
  const cents = priceCents(value.price);
  if (cents === null) return failure('price');
  const line = { ...normalized, price: value.price, quantity, cents };
  if (itemTotalCents(line) === null) return failure('limit');
  return { ok: true, value: line };
}

function giftComponents(value, group) {
  if (!Array.isArray(value) || value.length !== componentKinds.length) return failure('components');
  const parts = [];
  for (const component of value) {
    const result = snapshot(component, { component: true });
    if (!result.ok) return failure('components');
    parts.push(result.value);
  }
  if (new Set(parts.map(part => part.kind)).size !== componentKinds.length
    || parts.some(part => !componentKinds.some(([kind]) => kind === part.kind))
    || totalCents(parts) !== group.cents) return failure('components');
  return { ok: true, value: componentKinds.map(([kind]) => parts.find(part => part.kind === kind)) };
}

function details(line) {
  const lines = [];
  if (line.material) lines.push(`Material: ${line.material}`);
  if (line.measurement) lines.push(`Medida: ${line.measurement}`);
  if (line.variantLabel || line.variantId) lines.push(`Variante: ${line.variantLabel || line.variantId}`);
  return lines;
}

// Gera apenas um rascunho revisável. Não abre aplicativos, envia mensagens,
// confirma pedidos ou altera o armazenamento da sacola.
export function createWhatsAppDraft(items, contact) {
  if (!record(contact) || contact.validated !== true || typeof contact.number !== 'string'
    || !/^[1-9]\d{7,14}$/.test(contact.number)) return failure('contact');
  if (!Array.isArray(items)) return failure('items');
  if (!items.length) return failure('empty');
  const lines = [];
  for (const item of items) {
    const result = snapshot(item);
    if (!result.ok) return result;
    const line = result.value;
    if (line.category === 'presente') {
      const components = giftComponents(item.giftComponents, line);
      if (!components.ok) return components;
      line.giftComponents = components.value;
    }
    lines.push(line);
  }
  const total = totalCents(lines);
  if (total === null) return failure('limit');
  const sections = ['Olá, ICE GEN! Gostaria de consultar esta seleção:'];
  lines.forEach((line, index) => {
    const block = [`${index + 1}. ${line.name}`, ...details(line)];
    if (line.category === 'presente') {
      block.push(`Quantidade de presentes: ${line.quantity}`, 'Composição por presente:');
      for (const part of line.giftComponents) {
        const label = componentKinds.find(([kind]) => kind === part.kind)[1];
        block.push(`- ${label}: ${part.name}`, ...details(part).map(detail => `  ${detail}`),
          `  Quantidade por presente: ${part.quantity}; no grupo: ${part.quantity * line.quantity}.`,
          `  Valor unitário demonstrativo: ${money(part.cents)}; por presente: ${money(itemTotalCents(part))}.`);
      }
      block.push(`Valor por presente demonstrativo: ${money(line.cents)}`, `Subtotal do grupo: ${money(itemTotalCents(line))}`);
    } else {
      block.push(`Quantidade: ${line.quantity}`, `Valor unitário demonstrativo: ${money(line.cents)}`, `Subtotal: ${money(itemTotalCents(line))}`);
    }
    sections.push(block.join('\n'));
  });
  sections.push(`Total parcial demonstrativo: ${money(total)}`,
    'Gostaria de confirmar os preços, a disponibilidade e as condições de entrega no atendimento. Esta é uma consulta, sem pedido confirmado.');
  const message = sections.join('\n\n');
  if (message.length > maximumMessageLength) return failure('length');
  return { ok: true, message, url: `https://wa.me/${contact.number}?text=${encodeURIComponent(message)}` };
}
