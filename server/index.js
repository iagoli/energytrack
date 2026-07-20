import './env.js';
import express from 'express';
import cors from 'cors';
import { env } from './env.js';

// CORS: em produção restringe às origens do frontend (ALLOWED_ORIGIN, aceita
// vírgula para múltiplas). Em dev (sem a var) fica aberto, mantendo o
// comportamento atual do docker-compose.
const allowedOrigin = env.ALLOWED_ORIGIN
  ? env.ALLOWED_ORIGIN.split(',').map((o) => o.trim())
  : undefined; // undefined => cors reflete qualquer origem (dev)

const corsOptions = allowedOrigin
  ? { origin: allowedOrigin, credentials: true }
  : { origin: true };

import cepRoute      from './routes/cep.js';
import aneelRoute    from './routes/aneel.js';
import cresesbRoute  from './routes/cresesb.js';
import authRoute     from './routes/auth.js';
import appliancesRoute from './routes/appliances.js';
import settingsRoute from './routes/settings.js';
import importRoute   from './routes/import.js';

const app = express();

app.use(cors(corsOptions));
app.use(express.json({ limit: '256kb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'energytrack-api',
    uptime: process.uptime(),
    googleAuth: !!env.GOOGLE_CLIENT_ID,
  });
});

// Proxies para APIs externas (público).
app.use('/api/cep', cepRoute);
app.use('/api', aneelRoute);                // expõe /api/tarifa e /api/distribuidoras
app.use('/api/irradiacao', cresesbRoute);

// Auth + recursos do usuário autenticado.
app.use('/api/auth', authRoute);
app.use('/api/appliances', appliancesRoute);
app.use('/api/settings', settingsRoute);
app.use('/api/import', importRoute);

app.use((req, res) => {
  res.status(404).json({ error: `Rota não encontrada: ${req.method} ${req.path}` });
});

app.use((err, _req, res, _next) => {
  console.error('[server] erro não tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

app.listen(env.PORT, () => {
  console.log(`[energytrack-api] ouvindo em http://localhost:${env.PORT}`);
});
