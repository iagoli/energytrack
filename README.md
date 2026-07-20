# ⚡ EnergyTrack

Plataforma web de monitoramento de consumo de energia residencial com **conta de usuário** (email/senha ou Google), **persistência em PostgreSQL** e integração a APIs públicas (ANEEL, BrasilAPI, NASA POWER).

> Projeto acadêmico — Disciplina de Introdução às Ciências Ambientais · Engenharia de Computação

---

## Como rodar localmente

### Pré-requisitos
- **Node.js 18+**
- **Docker** + **Docker Compose** (para o PostgreSQL)
- (opcional) **Google Cloud Console** para habilitar login com Google

### Setup completo (do zero)

```bash
cd energytrack
npm install
cp .env.example .env           # edite se quiser configurar Google
npm run db:up                  # sobe Postgres em container
npm run migrate                # cria tabelas
npm run dev:all                # sobe frontend (Vite) + backend (Express) juntos
```

Acesse: **http://localhost:5173** (Vite escolhe outra porta livre se 5173 estiver ocupada).

### Scripts

```bash
npm run dev          # frontend Vite isolado (porta 5173)
npm run server       # backend Express isolado (porta 3001)
npm run dev:all      # frontend + backend em paralelo
npm run build        # build de produção do frontend
npm run db:up        # docker compose up -d (Postgres)
npm run db:down      # docker compose down (preserva volume)
npm run db:reset     # apaga o volume e recria o banco
npm run migrate      # aplica migrations pendentes
```

---

## Configuração do `.env`

Copiar de `.env.example` e ajustar. Mínimo necessário para rodar local:

| Variável | Padrão | Função |
|---|---|---|
| `PORT` | `3001` | Porta do backend Express |
| `DATABASE_URL` | `postgres://energytrack:energytrack@localhost:5432/energytrack` | Conexão com Postgres |
| `JWT_SECRET` | **trocar!** | Segredo para assinar JWTs (mín. 32 bytes aleatórios). Gere: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `JWT_EXPIRES_IN` | `7d` | Duração do token |
| `GOOGLE_CLIENT_ID` | _vazio_ | Client ID do Google (backend, para verificar ID tokens). Sem ele o login com Google fica desabilitado mas a app funciona normalmente com email/senha. |
| `VITE_GOOGLE_CLIENT_ID` | _vazio_ | Mesmo Client ID exposto ao frontend (Vite só repassa env com prefixo `VITE_`). |
| `ANEEL_RESOURCE_ID` | `fcf2906c-...` | Resource ID do dataset CKAN de tarifas. Troque se a ANEEL re-publicar. |

### Habilitando login com Google

1. Acesse [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Crie **OAuth 2.0 Client ID** → **Web application**.
3. Adicione `http://localhost:5173` (e outras portas que o Vite usar) em **Authorized JavaScript origins**.
4. Copie o Client ID e cole em **ambos** `GOOGLE_CLIENT_ID` e `VITE_GOOGLE_CLIENT_ID` no `.env`.
5. Reinicie `npm run dev:all`.

---

## Arquitetura

```
┌──────────────┐  /api/*  ┌────────────────┐  pg  ┌─────────────┐
│  Frontend    │ ───────► │  Express :3001 │ ───► │ Postgres 16 │
│  React+Vite  │          │  JWT + routes  │      │  (Docker)   │
│  :5173       │ ◄─────── │  + proxies     │ ◄─── │             │
└──────────────┘   JSON   └────────────────┘      └─────────────┘
                              │
                              ▼  (APIs públicas, com cache 24h)
                          ANEEL CKAN · BrasilAPI · Nominatim · NASA POWER · Google OAuth
```

**Camadas:**
- **Frontend** — React SPA com `AuthProvider`, hooks que sincronizam estado com a API, e badges indicando origem de cada dado.
- **Backend (Express)** — rotas públicas (proxy de APIs externas), rotas de auth (`/api/auth/*`) e rotas protegidas por JWT (`/api/appliances`, `/api/settings`, `/api/import`).
- **Banco (PostgreSQL)** — 3 tabelas (`users`, `user_appliances`, `user_settings`) + `schema_migrations`. Migrations versionadas em SQL.
- **APIs externas** — ANEEL (tarifas), BrasilAPI+Nominatim (CEP→coords), NASA POWER (irradiação), Google (verificação de ID token).

---

## Modelo de dados

### `users`
| Coluna | Tipo | Notas |
|---|---|---|
| `id` | SERIAL PK | |
| `email` | VARCHAR(255) UNIQUE | login |
| `name` | VARCHAR(255) | opcional |
| `password_hash` | VARCHAR(255) | bcrypt, NULL para contas só-Google |
| `google_id` | VARCHAR(64) UNIQUE | `sub` do Google ID token |
| `avatar_url` | TEXT | foto do Google |
| `email_verified` | BOOLEAN | TRUE quando via Google |
| `created_at` / `updated_at` / `last_login_at` | TIMESTAMPTZ | mantidos por trigger |

Constraint: `password_hash IS NOT NULL OR google_id IS NOT NULL` (toda conta tem ao menos um método de login).

### `user_appliances`
| Coluna | Tipo |
|---|---|
| `id` | SERIAL PK |
| `user_id` | FK → users(id), ON DELETE CASCADE |
| `appliance_id` | VARCHAR(64) — chave da APPLIANCE_LIST (`ac`, `chuveiro`, etc.) |
| `nome` / `icone` | VARCHAR |
| `potencia_w` | INTEGER, CHECK > 0 |
| `horas_dia` | NUMERIC(5,2), CHECK > 0 AND ≤ 24 |
| `dias_mes` | INTEGER, CHECK 1–31 |

Índice: `idx_appliances_user` em `user_id`.

### `user_settings` (1:1 com `users`)
| Coluna | Tipo |
|---|---|
| `user_id` | PK + FK → users(id), ON DELETE CASCADE |
| `tariff` | NUMERIC(8,4), default `0.75` |
| `tariff_source` | VARCHAR(32) — `manual` / `aneel` / `fallback-static` / `offline` |
| `uf` | CHAR(2) |
| `distribuidora` | VARCHAR(128) — sigAgente canônico do dataset ANEEL |
| `cep` | VARCHAR(9) |
| `solar_region` | VARCHAR(32) — fallback regional |
| `location_data` | JSONB — `{ cidade, lat, lng, coordsSource, ... }` |

`updated_at` mantido por trigger compartilhado `set_updated_at()`.

---

## Endpoints da API

### Públicos (sem token)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/health` | Status do serviço |
| GET | `/api/cep/:cep` | CEP → `{ cidade, uf, lat, lng }` (BrasilAPI + Nominatim) |
| GET | `/api/distribuidoras?uf=SP` | Lista `{ label, sigAgente }` |
| GET | `/api/tarifa?uf=SP&distribuidora=...` | Tarifa B1 ANEEL vigente |
| GET | `/api/irradiacao?lat=X&lng=Y` | Irradiação anual + mensal (NASA POWER) |

### Autenticação
| Método | Rota | Body | Retorna |
|---|---|---|---|
| POST | `/api/auth/register` | `{email, password, name?}` | `{token, user}` |
| POST | `/api/auth/login` | `{email, password}` | `{token, user}` |
| POST | `/api/auth/google` | `{credential}` (ID token GIS) | `{token, user}` |
| GET | `/api/auth/me` | — | `{user}` |
| POST | `/api/auth/logout` | — | `{ok}` |

### Protegidas (`Authorization: Bearer <token>`)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/appliances` | Lista aparelhos do usuário |
| POST | `/api/appliances` | Cria |
| PATCH | `/api/appliances/:id` | Atualiza potência/horas/dias |
| DELETE | `/api/appliances/:id` | Remove |
| GET | `/api/settings` | Preferências do usuário |
| PUT | `/api/settings` | Upsert parcial (patch) |
| POST | `/api/import` | Importa em lote (usado após cadastro para migrar dados antigos do localStorage) |

Validação com Zod; erros retornam `{ error, issues: [...] }` quando aplicável.

---

## Fluxo de autenticação

```
1. Usuário abre o app → AuthProvider tenta restaurar sessão chamando GET /api/auth/me com o JWT do localStorage.
2. Sem token → mostra <AuthScreen/> (Login/Cadastro + botão Google).
3. Email/senha:
     POST /api/auth/login { email, password }
     → backend faz bcrypt.compare e devolve { token, user }
4. Google:
     Botão GIS → recebe ID token (window.google.accounts.id)
     POST /api/auth/google { credential: id_token }
     → backend chama googleClient.verifyIdToken (valida assinatura + audience)
     → busca ou cria user; faz linking automático se email já existe
5. Token salvo em localStorage (chave et_auth_token). Toda chamada via fetchJson anexa Authorization: Bearer.
6. JWT expirado → backend devolve 401 + code: TOKEN_EXPIRED → AuthContext limpa token e força re-login.
```

Após login, se havia dados no `localStorage` antigo (uso anterior em modo guest), o `AuthScreen` chama `POST /api/import` para migrar tudo para a conta nova e limpa o localStorage.

---

## Estrutura do projeto

```
energytrack/
├── docker-compose.yml         # Postgres 16
├── .env.example
├── package.json
├── vite.config.js             # proxy /api → :3001
├── README.md
├── TESTING.md
├── server/
│   ├── env.js                 # carrega .env + valida vars obrigatórias
│   ├── index.js               # bootstrap Express
│   ├── cache.js               # cache em memória (rotas públicas)
│   ├── db/
│   │   ├── pool.js            # node-postgres Pool
│   │   ├── migrate.js         # runner de migrations
│   │   └── migrations/0001_init.sql
│   ├── data/
│   │   └── distribuidoras.js  # UF → distribuidoras canônicas
│   ├── middleware/
│   │   └── auth.js            # requireAuth (verifica JWT)
│   ├── utils/
│   │   ├── jwt.js             # sign/verify
│   │   └── validation.js      # schemas Zod
│   ├── repositories/
│   │   ├── users.js
│   │   ├── appliances.js
│   │   └── settings.js
│   └── routes/
│       ├── auth.js            # register/login/google/me/logout
│       ├── appliances.js      # CRUD por user
│       ├── settings.js        # GET/PUT
│       ├── import.js          # POST bulk
│       ├── cep.js             # BrasilAPI + Nominatim
│       ├── aneel.js           # CKAN ANEEL
│       └── cresesb.js         # NASA POWER
└── src/
    ├── main.jsx               # ReactDOM + AuthProvider
    ├── App.jsx                # MainApp + guard de autenticação
    ├── constants.js
    ├── contexts/
    │   └── AuthContext.jsx
    ├── hooks/
    │   ├── useLocalStorage.js (legado, não usado quando autenticado)
    │   ├── useAppliances.js   # /api/appliances
    │   └── useSettings.js     # /api/settings com debounce
    ├── services/
    │   ├── http.js            # fetch + JWT automático
    │   ├── auth.js
    │   ├── appliances.js
    │   ├── settings.js
    │   ├── cep.js
    │   ├── aneel.js
    │   └── cresesb.js
    ├── utils/
    │   ├── calculations.js    # 100% puro
    │   └── cache.js           # cache local de respostas de API
    └── components/
        ├── Navigation.jsx
        ├── ApplianceForm.jsx
        ├── Dashboard.jsx
        ├── SolarSimulator.jsx
        ├── ExportReport.jsx
        ├── auth/
        │   ├── AuthScreen.jsx
        │   └── GoogleSignInButton.jsx
        └── ui/
            ├── LoadingSpinner.jsx
            ├── ErrorBanner.jsx
            └── DataSourceBadge.jsx
```

---

## Segurança — escolhas e ressalvas

- **Senhas com bcrypt** (custo 12).
- **JWT em `Authorization: Bearer`** com expiração de 7 dias. Armazenado em `localStorage` por simplicidade da SPA. Para produção, considere cookies `HttpOnly + Secure + SameSite=Lax` com refresh token.
- **Google ID token verificado server-side** com `google-auth-library` (assinatura RSA + claim `aud` = `GOOGLE_CLIENT_ID`).
- **Account linking**: se um email já existe (cadastro local) e o usuário entra com Google do mesmo email, o `google_id` é vinculado à conta existente — não duplica.
- **Validação de entrada com Zod** em todas as rotas que recebem body.
- **CORS** permissivo no dev. Em produção, restringir ao domínio do frontend.
- **Sem rate limit / sem CSRF**. Para projeto acadêmico local é aceitável; em produção adicionar `express-rate-limit` e proteção CSRF (especialmente se mudar para cookies).

---

## Limitações conhecidas

- ANEEL CKAN pode re-publicar o dataset e mudar o `resource_id` — fica em `.env`.
- Nominatim tem rate limit de 1 req/s (mitigado por cache de 7 dias).
- NASA POWER pode levar 2–6s na primeira chamada por coordenada nova (timeout backend = 8s).
- Logout é **stateless** (cliente apaga o token). Para revogação real seria preciso uma tabela de tokens revogados ou refresh tokens.
- Bundle do frontend > 500 KB (Recharts pesa). Code-splitting fica como melhoria futura.

---

## Testes

Ver [TESTING.md](TESTING.md) para o checklist completo (DB, auth, CRUD, integrações com APIs externas).
