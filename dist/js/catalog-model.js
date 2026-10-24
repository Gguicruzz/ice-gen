// Regras de descoberta compartilhadas pela Home e pelo catálogo.
// IDs, categorias e aliases preservam os registros do projeto original.
export const categories = [
  { id: 'corrente', label: 'Correntes', aliases: ['corrente', 'correntes', 'colar', 'colares'] },
  { id: 'pingente', label: 'Pingentes', aliases: ['pingente', 'pingentes'] },
  { id: 'pulseira', label: 'Pulseiras', aliases: ['pulseira', 'pulseiras'] },
  { id: 'anel', label: 'Anéis', aliases: ['anel', 'anéis', 'aneis'] },
  { id: 'brinco', label: 'Brincos', aliases: ['brinco', 'brincos'] },
  { id: 'alianca', label: 'Alianças', aliases: ['aliança', 'alianças', 'alianca', 'aliancas'] },
];

const sortOptions = new Set(['featured', 'price-asc', 'price-desc', 'name']);
const nameOrder = new Intl.Collator('pt-BR', { sensitivity: 'base', numeric: true });

export function normalizeSearch(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim()
    .replace(/\s+/g, ' ');
}

const categoryByAlias = new Map(categories.flatMap(category =>
  [category.id, category.label, ...category.aliases].map(alias => [normalizeSearch(alias), category.id])
));

function sanitizeState(state = {}) {
  const values = Array.isArray(state.categories) ? state.categories : [];
  return {
    query: typeof state.query === 'string' ? state.query.trim().slice(0, 100).trim() : '',
    categories: [...new Set(values
      .filter(value => typeof value === 'string')
      .map(value => categoryByAlias.get(normalizeSearch(value)))
      .filter(Boolean))],
    sort: sortOptions.has(state.sort) ? state.sort : 'featured',
    favorites: state.favorites === true,
  };
}

export function readCatalogState(search = '') {
  const params = search instanceof URLSearchParams ? search : new URLSearchParams(search);
  return sanitizeState({
    query: params.get('busca') || '',
    categories: params.getAll('categoria').flatMap(value => value.split(',')),
    sort: params.get('ordem'),
    favorites: params.get('favoritos') === '1',
  });
}

// Retorna apenas parâmetros do catálogo; o chamador escolhe a rota e o fragmento.
export function catalogSearchParams(state = {}) {
  const safe = sanitizeState(state);
  const params = new URLSearchParams();
  if (safe.query) params.set('busca', safe.query);
  for (const category of safe.categories) params.append('categoria', category);
  if (safe.sort !== 'featured') params.set('ordem', safe.sort);
  if (safe.favorites) params.set('favoritos', '1');
  return params;
}

function priceCents(price) {
  if (typeof price !== 'number' && typeof price !== 'string') return null;
  if (typeof price === 'string' && !price.trim()) return null;
  const numeric = Number(price);
  const cents = Math.round(numeric * 100);
  return numeric >= 0 && Number.isSafeInteger(cents) ? cents : null;
}

export function selectProducts(products, state = {}, { favoriteIds = [] } = {}) {
  const safe = sanitizeState(state);
  const source = Array.isArray(products) ? products : [];
  const knownIds = new Set(source.map(product => product.id));
  const favorites = new Set((Array.isArray(favoriteIds) ? favoriteIds : [])
    .filter(id => typeof id === 'string' && id.trim() && knownIds.has(id)));
  const terms = normalizeSearch(safe.query).split(' ').filter(Boolean);
  const selectedCategories = new Set(safe.categories);

  const selection = source.map((product, index) => ({ product, index })).filter(({ product }) => {
    if (selectedCategories.size && !selectedCategories.has(product.category)) return false;
    if (safe.favorites && !favorites.has(product.id)) return false;
    if (!terms.length) return true;
    const aliases = categories.find(category => category.id === product.category)?.aliases || [];
    const searchable = normalizeSearch([product.name, product.category, product.categoryLabel, product.material, product.measurement, ...aliases].join(' '));
    return terms.every(term => searchable.includes(term));
  });

  if (safe.sort === 'name') {
    selection.sort((a, b) => nameOrder.compare(a.product.name, b.product.name) || a.index - b.index);
  } else if (safe.sort === 'price-asc' || safe.sort === 'price-desc') {
    const direction = safe.sort === 'price-asc' ? 1 : -1;
    selection.sort((a, b) => {
      const first = priceCents(a.product.price);
      const second = priceCents(b.product.price);
      if (first === null || second === null) {
        if (first === second) return a.index - b.index;
        return first === null ? 1 : -1;
      }
      return direction * (first - second) || a.index - b.index;
    });
  }

  return selection.map(({ product }) => product);
}
