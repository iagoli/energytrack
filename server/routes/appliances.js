import { Router } from 'express';
import * as Appliances from '../repositories/appliances.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody, ApplianceSchema, ApplianceUpdateSchema } from '../utils/validation.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const list = await Appliances.listByUser(req.user.id);
    res.json({ appliances: list });
  } catch (e) {
    console.error('[appliances] list erro:', e.message);
    res.status(500).json({ error: 'Falha ao listar aparelhos.' });
  }
});

router.post('/', validateBody(ApplianceSchema), async (req, res) => {
  try {
    const created = await Appliances.create(req.user.id, req.body);
    res.status(201).json(created);
  } catch (e) {
    console.error('[appliances] create erro:', e.message);
    res.status(500).json({ error: 'Falha ao criar aparelho.' });
  }
});

router.patch('/:id', validateBody(ApplianceUpdateSchema), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });
  try {
    const updated = await Appliances.updateById(req.user.id, id, req.body);
    if (!updated) return res.status(404).json({ error: 'Aparelho não encontrado.' });
    res.json(updated);
  } catch (e) {
    console.error('[appliances] update erro:', e.message);
    res.status(500).json({ error: 'Falha ao atualizar aparelho.' });
  }
});

router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });
  try {
    const ok = await Appliances.deleteById(req.user.id, id);
    if (!ok) return res.status(404).json({ error: 'Aparelho não encontrado.' });
    res.json({ ok: true });
  } catch (e) {
    console.error('[appliances] delete erro:', e.message);
    res.status(500).json({ error: 'Falha ao remover aparelho.' });
  }
});

export default router;
