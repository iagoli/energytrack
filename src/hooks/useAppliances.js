import { useCallback, useEffect, useState } from 'react';
import * as AppliancesService from '../services/appliances';

// Mantém a lista de aparelhos sincronizada com /api/appliances.
// Expõe add/update/remove com atualização otimista da UI.
export function useAppliances(enabled) {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    if (!enabled) { setItems([]); setLoading(false); return; }
    let alive = true;
    setLoading(true);
    AppliancesService.listAppliances()
      .then((list) => { if (alive) { setItems(list); setError(null); } })
      .catch((e)   => { if (alive) setError(e.message); })
      .finally(()  => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [enabled]);

  const add = useCallback(async (data) => {
    const created = await AppliancesService.createAppliance(data);
    setItems((curr) => [...curr, created]);
    return created;
  }, []);

  const update = useCallback(async (id, data) => {
    const updated = await AppliancesService.updateAppliance(id, data);
    setItems((curr) => curr.map((a) => (a.id === id ? updated : a)));
    return updated;
  }, []);

  const remove = useCallback(async (id) => {
    // Otimista: remove já da UI, reverte se a API falhar.
    const previous = items;
    setItems((curr) => curr.filter((a) => a.id !== id));
    try { await AppliancesService.deleteAppliance(id); }
    catch (e) {
      setItems(previous);
      throw e;
    }
  }, [items]);

  return { items, loading, error, add, update, remove };
}
