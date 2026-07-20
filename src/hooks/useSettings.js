import { useCallback, useEffect, useRef, useState } from 'react';
import * as SettingsService from '../services/settings';
import { DEFAULT_TARIFF } from '../constants';

const DEFAULTS = {
  tariff:        DEFAULT_TARIFF,
  tariffSource:  'manual',
  uf:            null,
  distribuidora: null,
  cep:           '',
  solarRegion:   'sudeste',
  location:      null,
};

const FLUSH_DELAY_MS = 600;

// Sincroniza preferências do usuário com /api/settings.
// Escritas são otimistas e debounced (acumula múltiplos campos numa única PUT).
export function useSettings(enabled) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const pendingRef = useRef({});
  const timerRef   = useRef(null);

  useEffect(() => {
    if (!enabled) { setSettings(DEFAULTS); setLoading(false); return; }
    let alive = true;
    setLoading(true);
    SettingsService.getSettings()
      .then((s) => {
        if (!alive) return;
        setSettings(s ? { ...DEFAULTS, ...s } : DEFAULTS);
        setError(null);
      })
      .catch((e) => { if (alive) setError(e.message); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [enabled]);

  const flush = useCallback(async () => {
    timerRef.current = null;
    const patch = pendingRef.current;
    if (!Object.keys(patch).length) return;
    pendingRef.current = {};
    try {
      const saved = await SettingsService.saveSettings(patch);
      setSettings((s) => ({ ...s, ...saved }));
    } catch (e) {
      setError(e.message);
    }
  }, []);

  // Flush imediato ao desmontar, garantindo que o último input não se perde.
  useEffect(() => () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      flush();
    }
  }, [flush]);

  const patch = useCallback((p) => {
    setSettings((s) => ({ ...s, ...p }));
    pendingRef.current = { ...pendingRef.current, ...p };
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flush, FLUSH_DELAY_MS);
  }, [flush]);

  return { settings, loading, error, patch };
}
