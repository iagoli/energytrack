// Cache simples em localStorage com TTL. Independente do useLocalStorage do
// estado do usuário — aqui guardamos respostas de APIs externas.
const PREFIX = 'et_cache:';

export function cacheGet(key) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const { value, expiresAt } = JSON.parse(raw);
    if (Date.now() > expiresAt) {
      window.localStorage.removeItem(PREFIX + key);
      return null;
    }
    return value;
  } catch {
    return null;
  }
}

export function cacheSet(key, value, ttlMs) {
  try {
    window.localStorage.setItem(
      PREFIX + key,
      JSON.stringify({ value, expiresAt: Date.now() + ttlMs })
    );
  } catch {
    // localStorage cheio ou indisponível — ignorar silenciosamente.
  }
}

export const TTL_24H = 24 * 60 * 60 * 1000;
export const TTL_7D = 7 * 24 * 60 * 60 * 1000;
