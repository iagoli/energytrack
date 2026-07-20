import { fetchJson } from './http';
import { cacheGet, cacheSet, TTL_24H } from '../utils/cache';
import { DEFAULT_TARIFF } from '../constants';

export async function fetchDistribuidoras(uf) {
  if (!uf) return { data: [], isFallback: true, fallbackReason: 'UF não informada' };

  const cacheKey = `distribuidoras:${uf}`;
  const cached = cacheGet(cacheKey);
  if (cached) return { data: cached, isFallback: false, cached: true };

  try {
    const body = await fetchJson(`/api/distribuidoras?uf=${encodeURIComponent(uf)}`);
    cacheSet(cacheKey, body.distribuidoras, TTL_24H);
    return { data: body.distribuidoras, isFallback: false };
  } catch (e) {
    return {
      data: [],
      isFallback: true,
      fallbackReason: e.message || 'Falha ao listar distribuidoras',
    };
  }
}

export async function fetchTarifa(uf, distribuidora) {
  if (!uf) {
    return {
      data: { tariff: DEFAULT_TARIFF, source: 'fallback-static' },
      isFallback: true,
      fallbackReason: 'UF não informada',
    };
  }

  const cacheKey = `tarifa:${uf}:${distribuidora || '_'}`;
  const cached = cacheGet(cacheKey);
  if (cached) return { data: cached, isFallback: false, cached: true };

  const params = new URLSearchParams({ uf });
  if (distribuidora) params.set('distribuidora', distribuidora);

  try {
    const data = await fetchJson(`/api/tarifa?${params.toString()}`);
    cacheSet(cacheKey, data, TTL_24H);
    return {
      data,
      isFallback: data.source === 'fallback-static',
      fallbackReason:
        data.source === 'fallback-static'
          ? data.warning || 'Dataset ANEEL sem resposta — usando média da UF'
          : null,
    };
  } catch (e) {
    // Backend pode ter retornado 502 com um campo `fallback` no body.
    const fallback = e.body?.fallback;
    if (fallback) {
      return {
        data: fallback,
        isFallback: true,
        fallbackReason: e.message || 'ANEEL indisponível — média da UF aplicada',
      };
    }
    return {
      data: { tariff: DEFAULT_TARIFF, source: 'offline', uf, distribuidora },
      isFallback: true,
      fallbackReason: e.message || 'Backend offline — usando tarifa padrão',
    };
  }
}
