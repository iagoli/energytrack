# Deploy $0 — EnergyTrack (Vercel + Render + Supabase)

Arquitetura:
- Frontend (React/Vite) → **Vercel** (static, gratuito)
- Backend (Express)     → **Render** web service free
- Banco (PostgreSQL)    → **Supabase** free (não expira)
- `/api/*` é roteado via rewrite da Vercel → backend Render (resolve o caminho relativo do front).

---

## 0. Pré-requisitos
- Conta GitHub com o repo do EnergyTrack.
- Conta gratuita em: https://vercel.com , https://render.com , https://supabase.com
- (Opcional) Login Google: Project no Google Cloud Console.

---

## 1. Supabase (banco de dados)
1. Crie um projeto (free tier). Escolha região `South America (São Paulo)` se disponível.
2. Vá em **Project Settings → Database → Connection string → URI**.
3. Copie a URI (formato `postgresql://postgres.[projeto]:[senha]@...:6543/postgres`).
   - Guarde ela: será a `DATABASE_URL` no Render.
   - O `server/db/pool.js` já habilita SSL automaticamente quando a URL contém "supabase".
4. As migrations (`server/db/migrations/*.sql`) são aplicadas automaticamente pelo
   `preDeployCommand` do Render. Se quiser testar manualmente antes:
   `DATABASE_URL=<uri_supabase> node server/db/migrate.js`

---

## 2. Render (backend)
1. Em https://dashboard.render.com → **New → Blueprint** → conecte o repo do GitHub.
   (O `render.yaml` deste repo já define tudo; basta clicar em "Apply".)
   - Ou **New → Web Service** manual: Runtime `Node`, Build `npm install`,
     Start `node server/index.js`, Plan `Free`, Health check `/api/health`.
2. Em **Environment**, defina:
   - `DATABASE_URL` = URI do Supabase (passo 1.3)
   - `JWT_SECRET` = gere: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
   - `ALLOWED_ORIGIN` = `https://<seu-projeto>.vercel.app` (domínio que criaremos no passo 3)
   - `GOOGLE_CLIENT_ID` / `VITE_GOOGLE_CLIENT_ID` = (opcional) seu Client ID do Google
3. Deploy. O `preDeployCommand` roda as migrations. Guarde a URL gerada:
   `https://<algo>.onrender.com` — ela entra no `vercel.json`.

> Nota free tier: o serviço "dorme" após ~15 min ocioso. O primeiro acesso
> depois de dormir leva ~20–30 s (cold start). Aceitável para demo acadêmica.

---

## 3. Vercel (frontend)
1. Em https://vercel.com → **Add New → Project** → import o repo do GitHub.
2. Framework preset: **Vite**. Build command `npm run build`, Output `dist`.
   (O `vercel.json` já configura isso + o rewrite de `/api`.)
3. Antes de fazer deploy, edite o `vercel.json` e troque
   `https://SEU_BACK_NO_RENDER.onrender.com` pela URL real do Render (passo 2.3).
4. **Environment Variables** (Settings → Environment):
   - `VITE_GOOGLE_CLIENT_ID` = (opcional) mesmo Client ID do Google.
5. Deploy. Guarde a URL: `https://<seu-projeto>.vercel.app`.
6. Volte ao Render e ajuste `ALLOWED_ORIGIN` para essa URL da Vercel (se ainda não tivesse feito).

---

## 4. Login Google (opcional)
1. Google Cloud Console → **Credentials → OAuth 2.0 Client ID → Web application**.
2. **Authorized JavaScript origins** adicione:
   - `https://<seu-projeto>.vercel.app`
3. Copie o Client ID para `GOOGLE_CLIENT_ID` (Render) e `VITE_GOOGLE_CLIENT_ID` (Vercel).

---

## 5. Verificação
- Acesse `https://<seu-projeto>.vercel.app` → cadastre um usuário → adicione aparelhos.
- `https://<algo>.onrender.com/api/health` deve retornar `{"ok":true,...}`.
- Se o CORS reclamar, confira se `ALLOWED_ORIGIN` no Render = URL exata da Vercel.

---

## 6. Variáveis resumo (cole no `.env` local se quiser testar produção localmente)
Veja `.env.production.example`. NUNCA commite o `.env` real.
