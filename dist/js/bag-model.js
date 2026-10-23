const nonempty = value => typeof value === 'string' && value.trim().length > 0;

function knownProducts(products) {
  const catalog = new Map();
  if (!Array.isArray(products)) return catalog;
  for (const product of products) {
    if (!product || !nonempty(product.id) || !nonempty(product.category) || catalog.has(product.id)) continue;
    catalog.set(product.id, product);
  }
  return catalog;
}

// Exclui todas as variantes de uma peça já selecionada. Embalagens e IDs que
// deixaram de existir no catálogo não criam categorias nem recomendações.
export function bagProductIds(items, products) {
  const catalog = knownProducts(products);
  const occupied = new Set();
  if (!Array.isArray(items)) return [];
  function collect(item) {
    const id = item?.productId || item?.id;
    if (catalog.has(id)) occupied.add(id);
  }
  for (const item of items) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
    if (item.category === 'presente') {
      if (Array.isArray(item.giftComponents)) item.giftComponents.forEach(collect);
    } else collect(item);
  }
  return [...occupied];
}

// Preserva a regra do legado: uma opção de cada categoria relacionada antes
// de repetir a categoria, com a ordem de origem do catálogo em cada grupo.
export function selectBagSuggestions(products, items, complements, { limit = 3 } = {}) {
  if (!Number.isSafeInteger(limit) || limit < 1) return [];
  const catalog = knownProducts(products);
  const occupied = new Set(bagProductIds(items, [...catalog.values()]));
  if (!occupied.size || !complements || typeof complements !== 'object') return [];
  const categories = new Set([...occupied].map(id => catalog.get(id).category));
  const needed = new Set();
  for (const category of categories) {
    if (!Object.hasOwn(complements, category) || !Array.isArray(complements[category])) continue;
    for (const related of complements[category]) if (nonempty(related)) needed.add(related);
  }
  const groups = [...needed].map(category => [...catalog.values()].filter(product => product.category === category && !occupied.has(product.id)));
  const suggestions = [];
  for (let index = 0; suggestions.length < limit && groups.some(group => index < group.length); index += 1) {
    for (const group of groups) {
      if (group[index]) suggestions.push(group[index]);
      if (suggestions.length === limit) return suggestions;
    }
  }
  return suggestions;
}
