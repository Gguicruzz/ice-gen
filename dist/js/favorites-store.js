// IDs locais; a chave mantém compatibilidade com o projeto anterior.
export const FAVORITES_KEY = 'icegen-favorites';
export function normalizeFavorites(value, validIds) {
  const valid = new Set(validIds);
  return Array.isArray(value) ? [...new Set(value.filter(id => typeof id === 'string' && valid.has(id)))] : [];
}
export function createFavoritesStore({ storage, validIds = [] } = {}) {
  const valid = new Set(validIds);
  const listeners = new Set();
  function read() {
    try {
      const saved = storage?.getItem(FAVORITES_KEY);
      if (!saved) return [];
      try { return normalizeFavorites(JSON.parse(saved), valid); } catch { return []; }
    } catch { return null; }
  }
  let ids = read() || [];
  function publish() { listeners.forEach(listener => listener([...ids])); }
  return {
    getIds() { return [...ids]; },
    toggle(id) {
      if (!valid.has(id)) return { ids: [...ids], saved: false, changed: false };
      ids = ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id];
      let saved = false;
      try {
        if (storage) { storage.setItem(FAVORITES_KEY, JSON.stringify(ids)); saved = true; }
      } catch { /* Mantém a seleção em memória e informa a falha ao chamador. */ }
      publish();
      return { ids: [...ids], saved, changed: true };
    },
    refresh() {
      const next = read();
      if (next && (ids.length !== next.length || ids.some((id, index) => id !== next[index]))) {
        ids = next;
        publish();
      }
      return [...ids];
    },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
  };
}
