import { verifyAccessToken } from '../utils/jwt.js';
import * as Users from '../repositories/users.js';

// Carrega o usuário do JWT (Authorization: Bearer ...) e injeta em req.user.
// Retorna 401 se header ausente, token inválido ou usuário inexistente.
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return res.status(401).json({ error: 'Token de autenticação ausente.' });
  }
  try {
    const payload = verifyAccessToken(match[1]);
    const user = await Users.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado.' });
    }
    req.user = user;
    next();
  } catch (e) {
    const isExpired = e.name === 'TokenExpiredError';
    res.status(401).json({
      error: isExpired ? 'Sessão expirada. Faça login novamente.' : 'Token inválido.',
      code: isExpired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID',
    });
  }
}
