import { Router } from 'express';
import * as Settings from '../repositories/settings.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody, SettingsSchema } from '../utils/validation.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const s = await Settings.getByUser(req.user.id);
    res.json({ settings: s });
  } catch (e) {
    console.error('[settings] get erro:', e.message);
    res.status(500).json({ error: 'Falha ao carregar preferências.' });
  }
});

router.put('/', validateBody(SettingsSchema), async (req, res) => {
  try {
    const s = await Settings.upsertForUser(req.user.id, req.body);
    res.json({ settings: s });
  } catch (e) {
    console.error('[settings] upsert erro:', e.message);
    res.status(500).json({ error: 'Falha ao salvar preferências.' });
  }
});

export default router;
