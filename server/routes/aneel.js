import { Router } from 'express';
import { cacheGet, cacheSet, TTL_24H } from '../cache.js';
import { DISTRIBUIDORAS_POR_UF, TARIFA_MEDIA_UF } from '../data/distribuidoras.js';

const router = Router();
const TIMEOUT_MS = 8000;

// Dataset CKAN "Tarifas Homologadas das Distribuidoras de Energia Elétrica" (ANEEL).
// Configurável via env porque o resource_id pode mudar quando a ANEEL re-publica.
const ANEEL_RESOURCE_ID =
  process.env.ANEEL_RESOURCE_ID || 'fcf2906c-7c32-4b9b-a637-054e7a5234f4';
const ANEEL_BASE = 'https://dadosabertos.aneel.gov.br/api/3/action/datastore_search';
const UA = { 'User-Agent': 'EnergyTrack/0.1 (academic project)' };

async function fetchWithTimeout(url, options = {}) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: ctrl.signal, headers: { ...UA, ...(options.headers || {}) } });
  } finally {
    clearTimeout(id);
  }
}

function parseBRL(s) {
  if (s == null) return null;
  const v = parseFloat(String(s).replace(',', '.'));
  return Number.isFinite(v) ? v : null;
}

// Filtros que isolam a tarifa residencial B1 "padrão" (Convencional, sem posto,
// sem detalhe de micro-geração), evitando misturar SCEE, Branca, Baixa Renda etc.
const STANDARD_FILTERS = {
  DscSubGrupo: 'B1',
  DscClasse: 'Residencial',
  DscSubClasse: 'Residencial',
  DscBaseTarifaria: 'Tarifa de Aplicação',
  DscModalidadeTarifaria: 'Convencional',
  NomPostoTarifario: 'Não se aplica',
  DscDetalhe: 'Não se aplica',
};

async function queryAneelTariff(sigAgente) {
  const filters = { ...STANDARD_FILTERS, SigAgente: sigAgente };
  const url =
    `${ANEEL_BASE}?resource_id=${ANEEL_RESOURCE_ID}` +
    `&limit=20&sort=${encodeURIComponent('DatInicioVigencia desc')}` +
    `&filters=${encodeURIComponent(JSON.stringify(filters))}`;

  const r = await fetchWithTimeout(url);
  if (!r.ok) throw new Error(`ANEEL CKAN ${r.status}`);
  const json = await r.json();
  if (!json.success) throw new Error('ANEEL CKAN: success=false');
  const records = json.result?.records || [];
  if (!records.length) return null;

  // O primeiro registro já é o mais recente (sort desc).
  const rec = records[0];
  const tusd = parseBRL(rec.VlrTUSD);
  const te   = parseBRL(rec.VlrTE);
  if (tusd == null || te == null) return null;

  // Valores no dataset são em R$/MWh. Converter para R$/kWh.
  const totalKwh = (tusd + te) / 1000;
  return {
    tariff: Number(totalKwh.toFixed(4)),
    vigencia: rec.DatInicioVigencia || null,
    distribuidora: sigAgente,
    tusd: Number((tusd / 1000).toFixed(4)),
    te: Number((te / 1000).toFixed(4)),
  };
}

function resolveSigAgente(uf, distribuidoraInput) {
  const list = DISTRIBUIDORAS_POR_UF[uf] || [];
  if (!distribuidoraInput) return list[0]?.sigAgente || null;
  // Aceita tanto o `label` amigável quanto o próprio `sigAgente` canônico.
  const match = list.find(
    (d) =>
      d.sigAgente === distribuidoraInput ||
      d.label.toLowerCase() === distribuidoraInput.toLowerCase()
  );
  return match?.sigAgente || distribuidoraInput;
}

router.get('/tarifa', async (req, res) => {
  const uf = (req.query.uf || '').toString().toUpperCase().trim();
  const distribuidoraInput = (req.query.distribuidora || '').toString().trim();
  if (!uf) return res.status(400).json({ error: 'Parâmetro "uf" é obrigatório.' });

  const sigAgente = resolveSigAgente(uf, distribuidoraInput);
  if (!sigAgente) {
    return res.status(404).json({ error: `UF "${uf}" não tem distribuidora mapeada.` });
  }

  const cacheKey = `tarifa:${uf}:${sigAgente}`;
  const cached = cacheGet(cacheKey);
  if (cached) return res.json({ ...cached, cached: true });

  try {
    const result = await queryAneelTariff(sigAgente);
    if (result) {
      const payload = { ...result, uf, source: 'aneel' };
      cacheSet(cacheKey, payload, TTL_24H);
      return res.json(payload);
    }
    const fallback = {
      tariff: TARIFA_MEDIA_UF[uf] ?? 0.75,
      vigencia: null,
      distribuidora: sigAgente,
      uf,
      source: 'fallback-static',
      warning: 'Dataset ANEEL não retornou registros para os filtros informados.',
    };
    cacheSet(cacheKey, fallback, TTL_24H);
    res.json(fallback);
  } catch (e) {
    console.error('[aneel/tarifa] erro:', e.message);
    res.status(502).json({
      error: `Falha ao consultar ANEEL: ${e.message}`,
      fallback: {
        tariff: TARIFA_MEDIA_UF[uf] ?? 0.75,
        uf,
        distribuidora: sigAgente,
        source: 'fallback-static',
      },
    });
  }
});

router.get('/distribuidoras', (req, res) => {
  const uf = (req.query.uf || '').toString().toUpperCase().trim();
  if (!uf) return res.status(400).json({ error: 'Parâmetro "uf" é obrigatório.' });
  const list = DISTRIBUIDORAS_POR_UF[uf];
  if (!list) return res.status(404).json({ error: `UF "${uf}" não reconhecida.` });
  res.json({ uf, distribuidoras: list, source: 'static' });
});

export default router;
