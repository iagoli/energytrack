import { fetchJson, setToken, clearToken } from './http';

export async function register({ email, password, name }) {
  const res = await fetchJson('/api/auth/register', {
    method: 'POST',
    body: { email, password, name },
  });
  setToken(res.token);
  return res.user;
}

export async function login({ email, password }) {
  const res = await fetchJson('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  setToken(res.token);
  return res.user;
}

export async function loginWithGoogle(credential) {
  const res = await fetchJson('/api/auth/google', {
    method: 'POST',
    body: { credential },
  });
  setToken(res.token);
  return res.user;
}

export async function fetchMe() {
  const res = await fetchJson('/api/auth/me');
  return res.user;
}

export async function logout() {
  try { await fetchJson('/api/auth/logout', { method: 'POST' }); } catch {}
  clearToken();
}
