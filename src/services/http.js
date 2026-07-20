// Wrapper de fetch com timeout, token JWT automático e parse de erro padronizado.
const DEFAULT_TIMEOUT = 8000;
const isDev = import.meta.env?.DEV;
const TOKEN_KEY = 'et_auth_token';

export function getToken() {
  try { return window.localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
export function setToken(token) {
  try { window.localStorage.setItem(TOKEN_KEY, token); } catch {}
}
export function clearToken() {
  try { window.localStorage.removeItem(TOKEN_KEY); } catch {}
}

// Callback opcional: o AuthContext registra aqui para reagir a 401 (expirado).
let onUnauthorized = null;
export function setOnUnauthorized(cb) { onUnauthorized = cb; }

export async function fetchJson(url, { timeout = DEFAULT_TIMEOUT, method = 'GET', body, headers } = {}) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeout);
  const token = getToken();

  try {
    const res = await fetch(url, {
      method,
      signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers || {}),
      },
      body: body != null ? JSON.stringify(body) : undefined,
    });
    let parsed = null;
    try { parsed = await res.json(); } catch { /* sem corpo JSON */ }

    if (res.status === 401 && parsed?.code === 'TOKEN_EXPIRED' && onUnauthorized) {
      onUnauthorized();
    }

    if (!res.ok) {
      let msg = parsed?.error;
      if (!msg) {
        msg = res.status >= 500
          ? 'Servidor indisponível. Verifique se o backend (npm run server) está rodando.'
          : `HTTP ${res.status}`;
      }
      const err = new Error(msg);
      err.status = res.status;
      err.body = parsed;
      throw err;
    }
    if (isDev) console.debug('[fetchJson]', method, url, parsed);
    return parsed;
  } catch (e) {
    if (e.name === 'AbortError') {
      const err = new Error('Timeout na requisição. O backend pode estar fora do ar.');
      err.code = 'TIMEOUT';
      throw err;
    }
    if (e instanceof TypeError && /fetch/i.test(e.message)) {
      const err = new Error('Não foi possível conectar ao backend. Rode `npm run server` ou `npm run dev:all`.');
      err.code = 'NETWORK';
      throw err;
    }
    throw e;
  } finally {
    clearTimeout(id);
  }
}
