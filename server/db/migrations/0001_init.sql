-- EnergyTrack — schema inicial
-- Usuários (auth local + Google), aparelhos cadastrados e preferências.

CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  email           VARCHAR(255) NOT NULL UNIQUE,
  name            VARCHAR(255),
  password_hash   VARCHAR(255),                 -- NULL para contas só-Google
  google_id       VARCHAR(64) UNIQUE,           -- 'sub' do Google ID token
  avatar_url      TEXT,
  email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at   TIMESTAMPTZ,
  CONSTRAINT users_has_credential CHECK (password_hash IS NOT NULL OR google_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (LOWER(email));

-- Aparelhos cadastrados por usuário (linha por instância configurada).
CREATE TABLE IF NOT EXISTS user_appliances (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  appliance_id  VARCHAR(64) NOT NULL,           -- chave do APPLIANCE_LIST (ex.: 'ac', 'chuveiro')
  nome          VARCHAR(255) NOT NULL,
  icone         VARCHAR(8),
  potencia_w    INTEGER NOT NULL CHECK (potencia_w > 0),
  horas_dia     NUMERIC(5,2) NOT NULL CHECK (horas_dia > 0 AND horas_dia <= 24),
  dias_mes      INTEGER NOT NULL CHECK (dias_mes >= 1 AND dias_mes <= 31),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appliances_user ON user_appliances (user_id);

-- Preferências/configuração do usuário — 1:1 com users.
CREATE TABLE IF NOT EXISTS user_settings (
  user_id        INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  tariff         NUMERIC(8,4) NOT NULL DEFAULT 0.75,
  tariff_source  VARCHAR(32)  NOT NULL DEFAULT 'manual',  -- 'manual' | 'aneel' | 'fallback-static'
  uf             CHAR(2),
  distribuidora  VARCHAR(128),
  cep            VARCHAR(9),
  solar_region   VARCHAR(32)  NOT NULL DEFAULT 'sudeste',
  location_data  JSONB,                                    -- { cidade, lat, lng, coordsSource, bairro, ... }
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger compartilhado para manter updated_at sempre fresco.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated ON users;
CREATE TRIGGER trg_users_updated
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_appliances_updated ON user_appliances;
CREATE TRIGGER trg_appliances_updated
  BEFORE UPDATE ON user_appliances
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_settings_updated ON user_settings;
CREATE TRIGGER trg_settings_updated
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
