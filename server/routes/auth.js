import { Router } from 'express';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { env } from '../env.js';
import * as Users from '../repositories/users.js';
import { signAccessToken } from '../utils/jwt.js';
import { requireAuth } from '../middleware/auth.js';
import {
  validateBody, RegisterSchema, LoginSchema, GoogleSchema,
} from '../utils/validation.js';

const router = Router();

const googleClient = env.GOOGLE_CLIENT_ID
  ? new OAuth2Client(env.GOOGLE_CLIENT_ID)
  : null;

function toPublicUser(u) {
  return {
    id:            u.id,
    email:         u.email,
    name:          u.name,
    avatarUrl:     u.avatar_url,
    emailVerified: u.email_verified,
    hasGoogle:     !!u.google_id,
    createdAt:     u.created_at,
    lastLoginAt:   u.last_login_at,
  };
}

router.post('/register', validateBody(RegisterSchema), async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const existing = await Users.findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Já existe uma conta com este email.' });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await Users.createWithPassword({ email, name, passwordHash });
    await Users.touchLastLogin(user.id);
    const token = signAccessToken(user);
    res.status(201).json({ token, user: toPublicUser(user) });
  } catch (e) {
    console.error('[auth/register] erro:', e.message);
    res.status(500).json({ error: 'Falha ao registrar usuário.' });
  }
});

router.post('/login', validateBody(LoginSchema), async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Users.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        error: 'Não encontramos uma conta com este email. Crie uma conta para continuar.',
        code: 'USER_NOT_FOUND',
      });
    }
    if (!user.password_hash) {
      return res.status(401).json({
        error: 'Esta conta foi criada com o Google. Entre usando o botão "Entrar com o Google".',
        code: 'GOOGLE_ONLY',
      });
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Senha incorreta.', code: 'INVALID_PASSWORD' });
    }
    await Users.touchLastLogin(user.id);
    const token = signAccessToken(user);
    res.json({ token, user: toPublicUser(user) });
  } catch (e) {
    console.error('[auth/login] erro:', e.message);
    res.status(500).json({ error: 'Falha ao autenticar.' });
  }
});

router.post('/google', validateBody(GoogleSchema), async (req, res) => {
  if (!googleClient) {
    return res.status(503).json({
      error: 'Login com Google indisponível: GOOGLE_CLIENT_ID não configurado no servidor.',
    });
  }
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: req.body.credential,
      audience: env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email_verified) {
      return res.status(401).json({ error: 'Email do Google não verificado.' });
    }

    const googleId  = payload.sub;
    const email     = payload.email;
    const name      = payload.name || null;
    const avatarUrl = payload.picture || null;

    let user = await Users.findByGoogleId(googleId);
    if (!user) {
      // Pode existir conta local com mesmo email — fazemos linking.
      const byEmail = await Users.findByEmail(email);
      user = byEmail
        ? await Users.linkGoogleAccount(byEmail.id, { googleId, avatarUrl, name })
        : await Users.createWithGoogle({ email, name, googleId, avatarUrl });
    }
    await Users.touchLastLogin(user.id);
    const token = signAccessToken(user);
    res.json({ token, user: toPublicUser(user) });
  } catch (e) {
    console.error('[auth/google] erro:', e.message);
    res.status(401).json({ error: 'Token do Google inválido ou expirado.' });
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: toPublicUser(req.user) });
});

// Stateless: o cliente só descarta o token. Endpoint existe para semântica
// e para futura revogação (lista de tokens revogados, refresh tokens, etc).
router.post('/logout', requireAuth, (_req, res) => {
  res.json({ ok: true });
});

export default router;
