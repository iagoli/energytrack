# EnergyTrack — Testes Manuais

Checklist para validação ponta-a-ponta. Assume `npm run dev:all` rodando (web `:5173` + api `:3001`) e Postgres `:5432` via `npm run db:up`.

---

## 0 · Pré-requisitos

- [ ] `npm install` sem erros
- [ ] `npm run db:up` → `docker ps` mostra container `energytrack-db` saudável
- [ ] `npm run migrate` aplica `0001_init.sql`
- [ ] `curl http://localhost:3001/api/health` → `{"ok":true,...}` com `googleAuth: true|false`
- [ ] Browser abre `http://localhost:5173` e mostra tela de **Login** (não a app)

---

## 1 · Autenticação

### Cadastro (email/senha)

- [ ] Clicar em "Criar conta", preencher nome + email + senha (≥ 8 chars)
- [ ] Login automático após cadastro: app abre na aba **Aparelhos**
- [ ] DevTools → Application → Local Storage: chave `et_auth_token` presente
- [ ] DevTools → Application → Local Storage: chaves `et_*` antigas (se existiam) foram **removidas** (porque foram importadas)

### Cadastro com erro

- [ ] Senha < 8 chars → banner vermelho "Senha precisa de pelo menos 8 caracteres"
- [ ] Email já existente → banner "Já existe uma conta com este email"
- [ ] Email malformado → banner com mensagem do Zod

### Login (email/senha)

- [ ] Logout, depois login com credenciais corretas → entra normalmente
- [ ] Senha errada → banner "Credenciais inválidas"

### Login Google (se `GOOGLE_CLIENT_ID` configurado)

- [ ] Botão "Sign in with Google" renderiza (estilo nativo do Google)
- [ ] Clicar → popup do Google → escolher conta → app abre logado
- [ ] DB: `SELECT * FROM users WHERE google_id IS NOT NULL` mostra a conta
- [ ] Account linking: cadastrar email/senha com `meu@gmail.com`, depois entrar com Google do mesmo email → a mesma `users.id` continua, agora com `google_id` preenchido

### Persistência de sessão

- [ ] Após login, dar F5 → app volta direto na aba **Aparelhos** sem mostrar tela de login (token validado via `GET /api/auth/me`)
- [ ] Apagar o token no DevTools → F5 → volta para tela de login

### Logout

- [ ] Botão "Sair" no canto superior direito → volta para tela de login
- [ ] Token removido do localStorage

---

## 2 · Aba Aparelhos (persistência via API)

- [ ] Adicionar 3 aparelhos diferentes → todos aparecem na tabela "Meus aparelhos"
- [ ] DB: `SELECT id, nome, potencia_w FROM user_appliances WHERE user_id = (...)` → mostra os 3 registros
- [ ] Editar um aparelho → muda no DB com `updated_at` atualizado
- [ ] Remover um aparelho → some da UI **e** do DB
- [ ] Sair e logar de novo → aparelhos continuam lá (lidos do DB, não localStorage)
- [ ] Abrir em outro navegador anônimo / outra máquina, logar com a mesma conta → vê os mesmos aparelhos

---

## 3 · Aba Painel — Integração ANEEL + persistência

- [ ] Selecionar UF "SP" + Distribuidora "Enel SP" → tarifa atualiza para ~R$ 0,72, badge **ANEEL**
- [ ] DB: `SELECT tariff, tariff_source, uf, distribuidora FROM user_settings WHERE user_id = (...)` → bate com a UI
- [ ] Editar manualmente o input numérico → badge muda para **Manual**, `tariff_source` no DB vira `'manual'`
- [ ] Recarregar a página → UF/distribuidora/tarifa **mantidos** (lidos do DB)
- [ ] Trocar UF para "RJ" + "Enel Rio" → tarifa sobe para ~R$ 1,06

---

## 4 · Aba Energia Solar — CEP + irradiação

- [ ] Digitar CEP `01310-100` → mostra "São Paulo/SP" + coords
- [ ] Cartão de irradiação atualiza para ~4,53 kWh/m²/dia, badge **NASA POWER**
- [ ] DB: `SELECT cep, location_data FROM user_settings WHERE user_id = (...)` → CEP gravado, `location_data` é JSONB com `{cidade, uf, lat, lng, ...}`
- [ ] Apagar CEP → volta para seleção por região (fallback)
- [ ] CEP `00000-000` → ErrorBanner "CEP não encontrado"

---

## 5 · Aba Exportar

- [ ] Relatório renderiza com a logo, tarifa correta, lista de aparelhos
- [ ] Botão imprimir abre print preview

---

## 6 · Robustez (backend offline)

- [ ] `kill $(lsof -ti:3001)`
- [ ] No app, tentar adicionar aparelho → ErrorBanner "Failed to fetch" ou similar
- [ ] Trocar UF/distribuidora → tarifa cai para fallback estático, badge **Offline**/**Estimativa**
- [ ] Subir backend de novo (`npm run server`) → operações voltam a funcionar
- [ ] App **não** trava (não quebra a UI)

---

## 7 · Robustez (DB offline)

- [ ] `npm run db:down`
- [ ] No backend, tentar register: `curl -X POST ... /api/auth/register` → retorna 500 com mensagem JSON
- [ ] No frontend (já logado): chamadas a `/appliances` retornam 500; banner de erro aparece
- [ ] `npm run db:up` → operações voltam (Pool reconecta automaticamente)

---

## 8 · Resultados testados pelo agente

### Backend ponta-a-ponta (via curl)

- [x] `POST /api/auth/register` cria user, hash bcrypt, retorna `{token, user}` 201
- [x] `POST /api/auth/register` duplicado → 409 "Já existe uma conta..."
- [x] `POST /api/auth/register` com email malformado / senha curta → 400 com `issues[]`
- [x] `POST /api/auth/login` correto → `{token, user}` + `last_login_at` atualizado
- [x] `POST /api/auth/login` senha errada → 401 "Credenciais inválidas"
- [x] `GET /api/auth/me` sem token → 401 "Token de autenticação ausente"
- [x] `GET /api/auth/me` com token válido → `{user}` com `lastLoginAt` populado
- [x] `POST /api/appliances` com body válido → 201 com `id` do DB
- [x] `POST /api/appliances` com body inválido → 400 com `issues[]` do Zod
- [x] `GET /api/appliances` → array do usuário logado (isolado por `user_id`)
- [x] `PUT /api/settings` → upsert com retorno completo
- [x] `GET /api/settings` → leitura confirmando persistência
- [x] `POST /api/import` com 2 aparelhos → ambos inseridos atomicamente em transação

### Schema

- [x] Migration runner aplica `0001_init.sql` e registra em `schema_migrations`
- [x] Trigger `set_updated_at()` atualiza `updated_at` em UPDATE
- [x] FK ON DELETE CASCADE: deletar user remove appliances e settings
- [x] CHECK `users_has_credential` impede inserir user sem senha nem google_id

### Frontend

- [x] `npm run build` compila sem erro (592 KB JS, 24 KB CSS)
- [x] `npm run dev:all` sobe web + api em paralelo
- [x] Proxy `/api/*` do Vite encaminha para `:3001` (incluindo POST de auth)
- [x] Registro funciona via proxy do Vite (`POST /api/auth/register`)

### Não testado pelo agente (precisa de browser real)
- [ ] Renderização visual da AuthScreen e do botão Google Sign-In
- [ ] Comportamento do GIS quando `VITE_GOOGLE_CLIENT_ID` está vazio (mensagem de fallback)
- [ ] Account linking visual (entrar com email/senha, depois com Google do mesmo email)
- [ ] Debounce de 600ms no salvamento de settings (verificar via Network tab)
- [ ] Migração `localStorage` → DB no primeiro login após uso em "modo guest" anterior
