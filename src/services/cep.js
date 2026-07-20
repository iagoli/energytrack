import { fetchJson } from './http';
import { cacheGet, cacheSet, TTL_7D } from '../utils/cache';

export async function fetchCepData(cep) {
  const clean = String(cep).replace(/\D/g, '');
  if (clean.length !== 8) {
    return {
      data: null,
      isFallback: true,
      fallbackReason: 'CEP precisa ter 8 dígitos.',
      error: 'CEP inválido',
    };
  }

  const cacheKey = `cep:${clean}`;
  const cached = cacheGet(cacheKey);
  if (cached) {
    return { data: cached, isFallback: false, cached: true };
  }

  try {
    const data = await fetchJson(`/api/cep/${clean}`);
    cacheSet(cacheKey, data, TTL_7D);
    return { data, isFallback: false };
  } catch (e) {
    return {
      data: null,
      isFallback: true,
      fallbackReason: e.message || 'Falha ao consultar CEP',
      error: e.message,
      status: e.status,
    };
  }
}
