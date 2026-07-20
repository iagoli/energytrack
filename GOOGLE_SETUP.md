
# Configurando login com Google

O botão "Entrar com Google" aparece **desabilitado** com a mensagem _"Login com Google indisponível"_ enquanto a variável `VITE_GOOGLE_CLIENT_ID` (frontend) e `GOOGLE_CLIENT_ID` (backend) estiverem vazias no `.env`.

Para habilitar, você precisa criar um **OAuth 2.0 Client ID** no Google Cloud — leva ~3 minutos e é gratuito.

---

## Passo a passo

### 1. Acessar o Google Cloud Console

Entre em [console.cloud.google.com](https://console.cloud.google.com/) com qualquer conta Google.

### 2. Criar um projeto (ou reutilizar um)

- No topo, clique no seletor de projeto → **New Project**.
- Nome: `EnergyTrack` (qualquer um).
- Organization: pode deixar **No organization**.
- Confirme.

### 3. Configurar a tela de consentimento OAuth

Antes de criar o Client ID, o Google exige que você configure a tela que o usuário vê ao fazer login.

- No menu lateral: **APIs & Services → OAuth consent screen**.
- User Type: **External** → Create.
- Preencha o mínimo:
  - **App name**: `EnergyTrack`
  - **User support email**: seu email
  - **Developer contact**: seu email
- Avance pelos próximos passos (Scopes, Test users) **sem adicionar nada** — pode pular tudo.
- Em **Test users**: adicione o seu próprio email (assim o app fica em modo "Testing" e só você consegue logar, mas isso basta para desenvolvimento).

### 4. Criar o OAuth Client ID

- Menu lateral: **APIs & Services → Credentials**.
- **+ Create Credentials → OAuth Client ID**.
- **Application type**: `Web application`.
- **Name**: `EnergyTrack Web`.
- **Authorized JavaScript origins** — clique em **+ Add URI** e cole **cada uma destas linhas**:
  - `http://localhost:5173`
  - `http://localhost:5174`  _(reserva, caso 5173 esteja ocupada)_
  - `http://localhost:5175`  _(idem)_

> ⚠️ Não adicione barra no final. Não use `127.0.0.1` (Google Identity Services exige `localhost` literal).

- **Authorized redirect URIs**: deixe vazio (não usamos fluxo de redirect, e sim ID token via GIS).
- **Create**.
- Copie o **Client ID** que aparece — algo como `1234567890-abcdef.apps.googleusercontent.com`.

### 5. Colar no `.env`

Na raiz do projeto, crie/edite o `.env`:

```bash
# ID do Google OAuth Client (use o MESMO valor nas duas linhas)
GOOGLE_CLIENT_ID=1234567890-abcdef.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=1234567890-abcdef.apps.googleusercontent.com
```

> **Por que duas linhas?**
> - `GOOGLE_CLIENT_ID` é lida pelo backend Express (verifica a assinatura do ID token recebido).
> - `VITE_GOOGLE_CLIENT_ID` é lida pelo frontend Vite (sem o prefixo `VITE_` o Vite não expõe para o browser por segurança).
> - O Client ID em si **não é secreto** — é público por design no fluxo GIS.

### 6. Reiniciar a stack

```bash
docker compose down
docker compose up
```

Abra `http://localhost:5173`. O botão `Sign in with Google` deve aparecer no estilo nativo do Google.

---

## Como verificar se funcionou

1. **Frontend leu a env**: abra DevTools → Console → digite:
   ```js
   import.meta.env.VITE_GOOGLE_CLIENT_ID
   ```
   Deve mostrar seu Client ID.

2. **Botão renderiza**: na tela de login, em vez do placeholder cinza, aparece um botão branco arredondado com o logo do Google.

3. **Fluxo completo**: clique no botão → popup do Google → escolhe a conta → o popup fecha → você entra no app.

4. **Backend validou**: nos logs do `api` (no terminal do `docker compose up`) você vê uma chamada `POST /api/auth/google` sem erros.

5. **Usuário no banco**: abra o Adminer em `http://localhost:8080` → tabela `users` → o registro tem `google_id` preenchido e `email_verified = true`.

---

## Problemas comuns

| Sintoma | Causa | Solução |
|---|---|---|
| Placeholder "Login com Google indisponível" continua aparecendo após editar `.env` | Vite só lê env vars na inicialização | `docker compose down && docker compose up` (não basta F5 no navegador) |
| Botão aparece mas o popup mostra **"Acesso bloqueado: este aplicativo não foi verificado"** | Você não está como Test User no OAuth consent screen | Volte em **OAuth consent screen → Test users** e adicione seu email |
| Popup mostra **"Erro 400: redirect_uri_mismatch"** ou **"origin_mismatch"** | Origin do navegador não está autorizada | Volte em **Credentials → seu Client ID → Authorized JavaScript origins** e adicione a URL exata que o Vite está usando (verifique a porta no log do `web`) |
| Botão clica mas o app mostra "Token do Google inválido ou expirado" | O `GOOGLE_CLIENT_ID` do backend está diferente do `VITE_GOOGLE_CLIENT_ID` | Confira que ambos têm **exatamente** o mesmo valor no `.env` |
| `GET https://accounts.google.com/gsi/client` retorna ERR no DevTools | Sem internet ou bloqueio de proxy/adblock | Whitelist `accounts.google.com` |

---

## Por que isso funciona desse jeito

O fluxo é o **Google Identity Services (GIS)** — moderno, sem redirect:

```
1. Vite carrega o script https://accounts.google.com/gsi/client no <head>
2. GoogleSignInButton.jsx chama google.accounts.id.initialize({ client_id: VITE_GOOGLE_CLIENT_ID })
3. Usuário clica → Google mostra popup → usuário aprova
4. GIS chama o callback do frontend com um JWT assinado pelo Google (ID token)
5. Frontend envia esse JWT para POST /api/auth/google
6. Backend usa google-auth-library para verificar:
   - assinatura RSA do token (chaves públicas do Google)
   - claim `aud` (audience) bate com GOOGLE_CLIENT_ID
   - claim `exp` (expiration) não passou
   - claim `iss` (issuer) é accounts.google.com
7. Backend cria/atualiza o usuário e devolve um JWT próprio do EnergyTrack
```

O `GOOGLE_CLIENT_ID` no backend é o que garante que o token recebido foi emitido para o **seu** app — sem ele, qualquer um conseguiria mandar um token de outro app e fazer login.
