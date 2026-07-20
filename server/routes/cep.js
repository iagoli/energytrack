import { Router } from 'express';
import { cacheGet, cacheSet, TTL_7D } from '../cache.js';

const router = Router();
const TIMEOUT_MS = 8000;
const UA = { 'User-Agent': 'EnergyTrack/0.1 (academic project)' };

async function fetchWithTimeout(url, options = {}) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...options,
      signal: ctrl.signal,
      headers: { ...UA, ...(options.headers || {}) },
    });
  } finally {
    clearTimeout(id);
  }
}

async function geocodeNominatim(cidade, uf) {
  const q = encodeURIComponent(`${cidade}, ${uf}, Brasil`);
  const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&countrycodes=br`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  const arr = await res.json();
  if (!arr?.length) throw new Error('Nominatim: sem resultados');
  return { lat: parseFloat(arr[0].lat), lng: parseFloat(arr[0].lon) };
}

function extractCoords(body) {
  const c = body?.location?.coordinates;
  if (!c) return null;
  const lat = c.latitude;
  const lng = c.longitude;
  if (lat == null || lng == null || lat === '' || lng === '') return null;
  const fLat = parseFloat(lat);
  const fLng = parseFloat(lng);
  if (Number.isNaN(fLat) || Number.isNaN(fLng)) return null;
  return { lat: fLat, lng: fLng };
}

router.get('/:cep', async (req, res) => {
  const raw = String(req.params.cep || '').replace(/\D/g, '');
  if (raw.length !== 8) {
    return res.status(400).json({ error: 'CEP inválido. Deve conter 8 dígitos.' });
  }

  const cacheKey = `cep:${raw}`;
  const cached = cacheGet(cacheKey);
  if (cached) return res.json({ ...cached, cached: true });

  try {
    const r = await fetchWithTimeout(`https://brasilapi.com.br/api/cep/v2/${raw}`);
    if (r.status === 404) {
      return res.status(404).json({ error: 'CEP não encontrado.' });
    }
    if (!r.ok) throw new Error(`BrasilAPI ${r.status}`);
    const body = await r.json();

    const cidade = body.city;
    const uf = body.state;
    let coords = extractCoords(body);
    let coordsSource = 'brasilapi';

    if (!coords) {
      try {
        coords = await geocodeNominatim(cidade, uf);
        coordsSource = 'nominatim';
      } catch (e) {
        console.warn('[cep] Nominatim fallback falhou:', e.message);
        return res.status(502).json({
          error: 'Não foi possível obter coordenadas para este CEP.',
          partial: { cep: raw, uf, cidade },
        });
      }
    }

    const payload = {
      cep: raw,
      uf,
      cidade,
      bairro: body.neighborhood || null,
      logradouro: body.street || null,
      lat: coords.lat,
      lng: coords.lng,
      coordsSource,
    };
    cacheSet(cacheKey, payload, TTL_7D);
    res.json(payload);
  } catch (e) {
    if (e.name === 'AbortError') {
      return res.status(504).json({ error: 'Timeout ao consultar BrasilAPI.' });
    }
    console.error('[cep] erro:', e.message);
    res.status(502).json({ error: `Falha na consulta de CEP: ${e.message}` });
  }
});

export default router;
