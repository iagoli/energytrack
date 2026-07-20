import { Router } from 'express';
import { cacheGet, cacheSet, TTL_24H } from '../cache.js';

const router = Router();
const TIMEOUT_MS = 8000;

// NASA POWER API — climatologia mensal de ALLSKY_SFC_SW_DWN (kWh/m²/dia).
// Mesma grandeza física que o Atlas Solarimétrico CRESESB, com cobertura global
// e API JSON estável. Usada como provedora primária; CRESESB direto não tem
// endpoint JSON público confiável.
const NASA_POWER_BASE = 'https://power.larc.nasa.gov/api/temporal/climatology/point';

const MONTH_KEYS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const MONTH_LABELS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

async function fetchWithTimeout(url, options = {}) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: ctrl.signal });
  } finally {
    clearTimeout(id);
  }
}

router.get('/', async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return res.status(400).json({ error: 'Parâmetros "lat" e "lng" são obrigatórios e numéricos.' });
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({ error: 'Coordenadas fora do intervalo válido.' });
  }

  const cacheKey = `irradiacao:${lat.toFixed(2)}:${lng.toFixed(2)}`;
  const cached = cacheGet(cacheKey);
  if (cached) return res.json({ ...cached, cached: true });

  const url =
    `${NASA_POWER_BASE}?parameters=ALLSKY_SFC_SW_DWN` +
    `&community=RE&longitude=${lng}&latitude=${lat}&format=JSON`;

  try {
    const r = await fetchWithTimeout(url);
    if (!r.ok) throw new Error(`NASA POWER ${r.status}`);
    const json = await r.json();
    const param = json?.properties?.parameter?.ALLSKY_SFC_SW_DWN;
    if (!param) throw new Error('NASA POWER: payload sem ALLSKY_SFC_SW_DWN');

    const monthly = MONTH_KEYS.map((k, i) => ({
      mes: MONTH_LABELS[i],
      value: Number(parseFloat(param[k]).toFixed(2)),
    }));
    const annual = param.ANN != null
      ? Number(parseFloat(param.ANN).toFixed(2))
      : Number((monthly.reduce((s, m) => s + m.value, 0) / 12).toFixed(2));

    const payload = {
      lat,
      lng,
      irradiacaoMedia: annual,      // kWh/m²/dia, média anual
      monthly,
      unit: 'kWh/m²/dia',
      source: 'nasa-power',
      methodology: 'NASA POWER climatology (equivalente metodológico CRESESB SunData)',
    };
    cacheSet(cacheKey, payload, TTL_24H);
    res.json(payload);
  } catch (e) {
    if (e.name === 'AbortError') {
      return res.status(504).json({ error: 'Timeout ao consultar NASA POWER.' });
    }
    console.error('[cresesb/irradiacao] erro:', e.message);
    res.status(502).json({ error: `Falha ao obter irradiação: ${e.message}` });
  }
});

export default router;
