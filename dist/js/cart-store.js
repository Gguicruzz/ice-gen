// Sacola demonstrativa local. Nenhum pedido ou pagamento é confirmado aqui.
export const CART_KEY = 'icegen-cart';
export const MAX_QUANTITY = 99;
const giftKinds = ['chain', 'pendant', 'wrap'];
const clone = value => JSON.parse(JSON.stringify(value));
const nonempty = value => typeof value === 'string' && value.trim().length > 0;

export const productUrl = id => `/produto.html?id=${encodeURIComponent(id)}`;

export function priceCents(value) {
  if (value === null || value === undefined || typeof value === 'boolean' || String(value).trim() === '') return null;
  const amount = Number(value);
  const cents = Math.round(amount * 100);
  return Number.isFinite(amount) && amount >= 0 && Number.isSafeInteger(cents) ? cents : null;
}

function validQuantity(value = 1) {
  if (value === null || typeof value === 'boolean' || String(value).trim() === '') return null;
  const quantity = Number(value);
  return Number.isSafeInteger(quantity) && quantity >= 1 && quantity <= MAX_QUANTITY ? quantity : null;
}

export function itemTotalCents(item) {
  const price = priceCents(item?.price);
  const quantity = validQuantity(item?.quantity);
  const total = price === null || quantity === null ? null : price * quantity;
  return Number.isSafeInteger(total) ? total : null;
}

export function totalCents(items) {
  if (!Array.isArray(items)) return null;
  let total = 0;
  for (const item of items) {
    const value = itemTotalCents(item);
    if (value === null || !Number.isSafeInteger(total + value)) return null;
    total += value;
  }
  return total;
}

export function itemCount(items) {
  if (!Array.isArray(items)) return null;
  let count = 0;
  for (const item of items) {
    const quantity = validQuantity(item?.quantity);
    if (quantity === null || !Number.isSafeInteger(count + quantity)) return null;
    count += quantity;
  }
  return count;
}

export function validateProductSelection(product, { quantity = 1, variantId } = {}) {
  if (!product || ![product.id, product.name, product.category].every(nonempty)) return { ok: false, reason: 'product' };
  const count = validQuantity(quantity);
  if (count === null) return { ok: false, reason: 'quantity' };
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const variant = variants.length ? variants.find(option => nonempty(option?.id) && option.id === variantId) : undefined;
  if ((variants.length && !variant) || (!variants.length && variantId !== undefined && variantId !== null && variantId !== '')) {
    return { ok: false, reason: 'variant' };
  }
  const cents = priceCents(variant && Object.hasOwn(variant, 'price') ? variant.price : product.price);
  if (cents === null) return { ok: false, reason: 'price' };
  if (!Number.isSafeInteger(cents * count)) return { ok: false, reason: 'limit' };
  return { ok: true, quantity: count, price: cents / 100, ...(variant ? { variant: clone(variant) } : {}) };
}

function productLine(product, selection) {
  const variant = selection.variant;
  return {
    id: variant ? `${product.id}::${encodeURIComponent(variant.id)}` : product.id,
    productId: product.id,
    name: product.name,
    category: product.category,
    price: selection.price,
    quantity: selection.quantity,
    ...(nonempty(product.image) ? { image: product.image } : {}),
    ...(nonempty(product.material) ? { material: product.material } : {}),
    ...(nonempty(product.measurement) ? { measurement: product.measurement } : {}),
    ...(product.demonstration === true ? { demonstration: true } : {}),
    ...(product.imageIllustrative !== undefined ? { imageIllustrative: product.imageIllustrative } : {}),
    ...(variant ? { variantId: variant.id, variantLabel: variant.label || variant.id } : {}),
  };
}

// Presentes já gravados são snapshots: não trocar seus componentes/preços ao ler.
// Produtos avulsos são reconciliados com o catálogo atual e a variante escolhida.
export function normalizeCart(value, { products = [] } = {}) {
  if (!Array.isArray(value)) return [];
  return value.flatMap(item => {
    if (!item || typeof item !== 'object' || Array.isArray(item) || ![item.id, item.name, item.category].every(nonempty)) return [];
    // O legado gravava alguns produtos sem quantity; esse caso representa uma unidade.
    const quantity = item.quantity === undefined ? 1 : validQuantity(item.quantity);
    if (quantity === null) return [];
    if (item.category === 'presente') {
      const cents = priceCents(item.price);
      if (cents === null || !Number.isSafeInteger(cents * quantity)) return [];
      return [{ ...clone(item), price: cents / 100, quantity }];
    }
    const product = products.find(entry => entry.id === (item.productId || item.id));
    const selection = validateProductSelection(product, { quantity, variantId: item.variantId });
    return selection.ok ? [productLine(product, selection)] : [];
  });
}

export function giftSignature(item) {
  return item && typeof item === 'object' ? JSON.stringify([item.name, item.price, item.giftComponents]) : null;
}

function resolveComponents(components, products, wraps) {
  if (!Array.isArray(components) || components.length !== giftKinds.length) return { ok: false, reason: 'components' };
  if (new Set(components.map(component => component?.kind)).size !== giftKinds.length || components.some(component => !giftKinds.includes(component?.kind))) {
    return { ok: false, reason: 'components' };
  }
  const resolved = [];
  for (const kind of giftKinds) {
    const component = components.find(value => value.kind === kind);
    const choice = (kind === 'wrap' ? wraps : products).find(value => value.id === component.id);
    if (!choice || (kind === 'chain' && choice.category !== 'corrente') || (kind === 'pendant' && choice.category !== 'pingente')) {
      return { ok: false, reason: 'components' };
    }
    const selection = validateProductSelection(kind === 'wrap' ? { ...choice, category: 'embalagem' } : choice, {
      quantity: component.quantity === undefined ? 1 : component.quantity,
      variantId: component.variantId,
    });
    if (!selection.ok) return selection;
    const variant = selection.variant;
    resolved.push({
      kind, id: choice.id, name: choice.name, price: selection.price, quantity: selection.quantity,
      ...(kind !== 'wrap' && nonempty(choice.image) ? { image: choice.image } : {}),
      ...(variant ? { variantId: variant.id, variantLabel: variant.label || variant.id } : {}),
    });
  }
  const cents = totalCents(resolved);
  return cents === null ? { ok: false, reason: 'limit' } : { ok: true, components: resolved, price: cents / 100 };
}

function editableSelection(item, products, wraps) {
  if (item?.category !== 'presente' || !Array.isArray(item.giftComponents) || item.giftComponents.length !== giftKinds.length) return null;
  if (item.giftComponents.some(component => !component || !nonempty(component.name) || !nonempty(component.id))) return null;
  const storedTotal = totalCents(item.giftComponents);
  if (storedTotal === null || storedTotal !== priceCents(item.price)) return null;
  const resolution = resolveComponents(item.giftComponents, products, wraps);
  return resolution.ok ? resolution.components.map(({ kind, id, quantity, variantId }) => ({ kind, id, quantity, ...(variantId ? { variantId } : {}) })) : null;
}

export function createCartStore({ storage, products = [], wraps = [] } = {}) {
  const listeners = new Set();
  function read() {
    try {
      if (!storage || typeof storage.getItem !== 'function') return null;
      const saved = storage.getItem(CART_KEY);
      if (!saved) return [];
      let value;
      try { value = JSON.parse(saved); } catch { return []; }
      return normalizeCart(value, { products });
    } catch { return null; }
  }
  let items = read() || [];
  function publish(next) {
    if (JSON.stringify(items) === JSON.stringify(next)) return;
    items = clone(next);
    listeners.forEach(listener => listener(clone(items)));
  }
  const failure = reason => ({ ok: false, reason, items: clone(items) });
  function mutate(build) {
    const current = read();
    if (current === null) return failure('storage');
    // Uma aba pode ter atualizado a sacola desde a última renderização.
    publish(current);
    const result = build(current);
    if (!result.ok) return failure(result.reason);
    if (totalCents(result.items) === null || itemCount(result.items) === null) return failure('limit');
    try {
      if (!storage || typeof storage.setItem !== 'function') return failure('storage');
      storage.setItem(CART_KEY, JSON.stringify(result.items));
    } catch { return failure('storage'); }
    publish(result.items);
    return { ok: true, items: clone(items), ...(result.itemId ? { itemId: result.itemId } : {}) };
  }
  function uniqueIndex(current, id) {
    const matches = current.flatMap((item, index) => item.id === id ? [index] : []);
    return matches.length === 1 ? { ok: true, index: matches[0] } : { ok: false, reason: matches.length ? 'conflict' : 'missing' };
  }
  return {
    getItems() { return clone(items); },
    refresh() {
      const current = read();
      if (current !== null) publish(current);
      return clone(items);
    },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    addProduct(productId, selection = {}) {
      const product = products.find(item => item.id === productId);
      const validation = validateProductSelection(product, selection);
      if (!validation.ok) return failure(validation.reason);
      const line = productLine(product, validation);
      return mutate(current => {
        const matches = current.filter(item => item.id === line.id);
        if (matches.length > 1 || matches.some(item => item.category === 'presente')) return { ok: false, reason: 'conflict' };
        const quantity = validation.quantity + (matches[0]?.quantity || 0);
        if (validQuantity(quantity) === null) return { ok: false, reason: 'quantity' };
        const next = matches.length ? current.map(item => item.id === line.id ? { ...line, quantity } : item) : [...current, line];
        return { ok: true, items: next, itemId: line.id };
      });
    },
    setQuantity(id, quantity) {
      const count = validQuantity(quantity);
      if (count === null) return failure('quantity');
      return mutate(current => {
        const match = uniqueIndex(current, id);
        if (!match.ok) return match;
        return { ok: true, items: current.map((item, index) => index === match.index ? { ...item, quantity: count } : item) };
      });
    },
    remove(id) {
      return mutate(current => {
        const match = uniqueIndex(current, id);
        if (!match.ok) return match;
        return { ok: true, items: current.filter((item, index) => index !== match.index) };
      });
    },
    editableGift(item) { return editableSelection(item, products, wraps); },
    addGift(components) {
      const resolution = resolveComponents(components, products, wraps);
      if (!resolution.ok) return failure(resolution.reason);
      return mutate(current => {
        let id;
        do { id = `gift-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`; } while (current.some(item => item.id === id));
        const gift = { id, name: 'Presente personalizado ICE GEN', category: 'presente', price: resolution.price, quantity: 1, giftComponents: resolution.components, demonstration: true };
        return { ok: true, items: [...current, gift], itemId: id };
      });
    },
    replaceGift(id, components, { signature } = {}) {
      const resolution = resolveComponents(components, products, wraps);
      if (!resolution.ok) return failure(resolution.reason);
      return mutate(current => {
        const match = uniqueIndex(current, id);
        if (!match.ok) return match;
        const original = current[match.index];
        if (!editableSelection(original, products, wraps) || typeof signature !== 'string' || giftSignature(original) !== signature) return { ok: false, reason: 'conflict' };
        const replacement = { ...original, name: 'Presente personalizado ICE GEN', price: resolution.price, giftComponents: resolution.components };
        return { ok: true, items: current.map((item, index) => index === match.index ? replacement : item), itemId: id };
      });
    },
  };
}
