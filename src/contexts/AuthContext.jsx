import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as AuthService from '../services/auth';
import { getToken, setOnUnauthorized, clearToken } from '../services/http';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    await AuthService.logout();
    setUser(null);
  }, []);

  // Inicialização: se há token salvo, tenta restaurar a sessão via /api/auth/me.
  useEffect(() => {
    setOnUnauthorized(() => {
      clearToken();
      setUser(null);
    });
    let alive = true;
    (async () => {
      if (!getToken()) { setLoading(false); return; }
      try {
        const me = await AuthService.fetchMe();
        if (alive) setUser(me);
      } catch {
        clearToken();
        if (alive) setUser(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const login = useCallback(async (credentials) => {
    const u = await AuthService.login(credentials);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (data) => {
    const u = await AuthService.register(data);
    setUser(u);
    return u;
  }, []);

  const loginWithGoogle = useCallback(async (credential) => {
    const u = await AuthService.loginWithGoogle(credential);
    setUser(u);
    return u;
  }, []);

  const value = { user, loading, login, register, loginWithGoogle, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve estar dentro de <AuthProvider>');
  return ctx;
}
