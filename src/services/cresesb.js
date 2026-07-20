import { fetchJson } from './http';
import { cacheGet, cacheSet, TTL_24H } from '../utils/cache';
import { SOLAR_IRRADIATION } from '../constants';

// Mapeia UF do CEP para a região do SOLAR_IRRADIATION, usado como fallback
// quando a API de irradiação por coordenadas falha.
const UF_TO_REGION = {
  AC: 'norte', AP: 'norte', AM: 'norte', PA: 'norte', RO: 'norte', RR: 'norte', TO: 'norte',
  AL: 'nordeste', BA: 'nordeste', CE: 'nordeste', MA: 'nordeste', PB: 'nordeste',
  PE: 'nordeste', PI: 'nordeste', RN: 'nordeste', SE: 'nordeste',
  DF: 'centro_oeste', GO: 'centro_oeste', MT: 'centro_oeste', MS: 'centro_oeste',
  ES: 'sudeste', MG: 'sudeste', RJ: 'sudeste', SP: 'sudeste',
  PR: 'sul', RS: 'sul', SC: 'sul',
};

export function regionFromUf(uf) {
  return UF_TO_REGION[uf] || 'sudeste';
}

export async function fetchIrradiacao(lat, lng) {
  if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) {
    return {
      data: null,
      isFallback: true,
      fallbackReason: 'Coordenadas inválidas',
    };
  }

  const key = `irradiacao:${lat.toFixed(2)}:${lng.toFixed(2)}`;
  const cached = cacheGet(key);
  if (cached) return { data: cached, isFallback: false, cached: true };

  try {
    const data = await fetchJson(`/api/irradiacao?lat=${lat}&lng=${lng}`);
    cacheSet(key, data, TTL_24H);
    return { data, isFallback: false };
  } catch (e) {
    return {
      data: null,
      isFallback: true,
      fallbackReason: e.message || 'Falha ao obter irradiação',
    };
  }
}

// Empacota a tabela regional como se fosse uma resposta da API, para a UI
// poder sempre consumir o mesmo shape mesmo no caminho de fallback.
export function fallbackByRegion(regionKey) {
  const entry = SOLAR_IRRADIATION[regionKey] || SOLAR_IRRADIATION.sudeste;
  return {
    irradiacaoMedia: entry.value,
    monthly: null,
    unit: 'kWh/m²/dia',
    source: 'fallback-static',
    region: regionKey,
    regionLabel: entry.label,
  };
}
