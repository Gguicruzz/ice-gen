// IDs locais; a chave mantém compatibilidade com o projeto anterior.
export const FAVORITES_KEY = 'icegen-favorites';
export function normalizeFavorites(value, validIds) {
  const valid = new Set(validIds);
  return Array.isArray(value) ? [...new Set(value.filter(id => typeof id === 'string' && valid.has(id)))] : [];
}
export function createFavoritesStore({ storage, validIds = [] } = {}) {
  const valid = new Set(validIds);
  const listeners = new Set();
  const pending = new Map();
  function read() {
    try {
      const saved = storage?.getItem(FAVORITES_KEY);
      if (!saved) return [];
      try { return normalizeFavorites(JSON.parse(saved), valid); } catch { return []; }
    } catch { return null; }
  }
  let ids = read() || [];
  function publish() { listeners.forEach(listener => listener([...ids])); }
  function currentIds() {
    const latest = read();
    const merged = new Set(latest || ids);
    // Mantém alterações locais não gravadas e incorpora escolhas de outra aba.
    pending.forEach((selected, id) => { if (selected) merged.add(id); else merged.delete(id); });
    return [...merged];
  }
  function change(id, selected) {
    if (!valid.has(id)) return { ids: [...ids], saved: false, changed: false };
    const previous = JSON.stringify(ids);
    ids = currentIds();
    const target = selected === undefined ? !ids.includes(id) : selected;
    ids = target ? ids.includes(id) ? ids : [...ids, id] : ids.filter(value => value !== id);
    pending.set(id, target);
    let saved = false;
    try {
      if (storage) { storage.setItem(FAVORITES_KEY, JSON.stringify(ids)); saved = true; pending.clear(); }
    } catch { /* A seleção continua em memória com aviso de falha. */ }
    const changed = previous !== JSON.stringify(ids);
    if (changed) publish();
    return { ids: [...ids], saved, changed };
  }
  return {
    getIds() { return [...ids]; },
    toggle(id) {
      return change(id);
    },
    remove(id) { return change(id, false); },
    refresh() {
      const next = currentIds();
      if (ids.length !== next.length || ids.some((id, index) => id !== next[index])) {
        ids = next;
        publish();
      }
      return [...ids];
    },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
  };
}
