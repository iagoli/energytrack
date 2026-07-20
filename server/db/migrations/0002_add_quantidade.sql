-- Adiciona campo quantidade em user_appliances.
-- Antes desta migration, o usuário precisava criar uma linha por unidade
-- (ex.: 3 TVs = 3 linhas). Agora uma linha representa N unidades do mesmo
-- aparelho, eliminando redundância.

ALTER TABLE user_appliances
  ADD COLUMN IF NOT EXISTS quantidade INTEGER NOT NULL DEFAULT 1
    CHECK (quantidade >= 1 AND quantidade <= 100);

COMMENT ON COLUMN user_appliances.quantidade IS
  'Número de unidades deste aparelho na residência. kWh total = base × quantidade.';
