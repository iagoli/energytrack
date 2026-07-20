// Carrega variáveis de .env e expõe constantes derivadas validadas.
// Importar este módulo deve ser a primeira coisa em qualquer entrypoint do server.
import 'dotenv/config';

function required(name) {
  const v = process.env[name];
  if (!v || v.trim() === '') {
    throw new Error(`[env] variável ${name} é obrigatória — defina no .env`);
  }
  return v;
}

export const env = {
  PORT:                Number(process.env.PORT) || 3001,
  DATABASE_URL:        required('DATABASE_URL'),
  JWT_SECRET:          required('JWT_SECRET'),
  JWT_EXPIRES_IN:      process.env.JWT_EXPIRES_IN || '7d',
  GOOGLE_CLIENT_ID:    process.env.GOOGLE_CLIENT_ID || '',
  ANEEL_RESOURCE_ID:   process.env.ANEEL_RESOURCE_ID || 'fcf2906c-7c32-4b9b-a637-054e7a5234f4',
};

// Aviso amigável quando Google auth não está configurado.
if (!env.GOOGLE_CLIENT_ID) {
  console.warn('[env] GOOGLE_CLIENT_ID não configurado — login com Google ficará desabilitado.');
}
