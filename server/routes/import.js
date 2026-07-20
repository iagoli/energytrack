import { Router } from 'express';
import * as Appliances from '../repositories/appliances.js';
import * as Settings from '../repositories/settings.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody, ImportSchema } from '../utils/validation.js';

const router = Router();
router.use(requireAuth);

// Importação one-shot: usado quando o usuário acabou de se cadastrar e quer
// trazer o que estava no localStorage do navegador para a conta nova.
router.post('/', validateBody(ImportSchema), async (req, res) => {
  try {
    const { appliances, settings } = req.body;
    const created = appliances?.length
      ? await Appliances.bulkInsert(req.user.id, appliances)
      : [];
    const saved = settings
      ? await Settings.upsertForUser(req.user.id, settings)
      : null;
    res.json({ imported: created.length, appliances: created, settings: saved });
  } catch (e) {
    console.error('[import] erro:', e.message);
    res.status(500).json({ error: 'Falha ao importar dados.' });
  }
});

export default router;
