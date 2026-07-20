// In-memory TTL cache. Keys are strings; values are { value, expiresAt }.
const store = new Map();

export function cacheGet(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

export function cacheSet(key, value, ttlMs) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export const TTL_24H = 24 * 60 * 60 * 1000;
export const TTL_7D  = 7 * 24 * 60 * 60 * 1000;
