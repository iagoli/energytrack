import { z } from 'zod';

// Helper para padronizar a resposta de erro de validação Zod nas rotas.
export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issues = result.error.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      }));
      return res.status(400).json({ error: 'Dados inválidos.', issues });
    }
    req.body = result.data;
    next();
  };
}

export const RegisterSchema = z.object({
  email:    z.string().email('Email inválido').max(255),
  password: z.string().min(8, 'Senha precisa de pelo menos 8 caracteres').max(128),
  name:     z.string().min(1).max(255).optional(),
});

export const LoginSchema = z.object({
  email:    z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

export const GoogleSchema = z.object({
  credential: z.string().min(20, 'credential (ID token) obrigatório'),
});

export const ApplianceSchema = z.object({
  applianceId: z.string().min(1).max(64),
  nome:        z.string().min(1).max(255),
  icone:       z.string().max(8).optional().nullable(),
  potencia_w:  z.number().int().positive().max(50_000),
  horas_dia:   z.number().positive().max(24),
  dias_mes:    z.number().int().min(1).max(31),
  quantidade:  z.number().int().min(1).max(100).default(1),
});

export const ApplianceUpdateSchema = z.object({
  potencia_w: z.number().int().positive().max(50_000),
  horas_dia:  z.number().positive().max(24),
  dias_mes:   z.number().int().min(1).max(31),
  quantidade: z.number().int().min(1).max(100).default(1),
});

export const SettingsSchema = z.object({
  tariff:        z.number().positive().max(10).optional(),
  tariffSource:  z.enum(['manual', 'aneel', 'fallback-static', 'offline']).optional(),
  uf:            z.string().length(2).optional().nullable(),
  distribuidora: z.string().max(128).optional().nullable(),
  cep:           z.string().max(9).optional().nullable(),
  solarRegion:   z.enum(['norte','nordeste','centro_oeste','sudeste','sul']).optional(),
  location:      z.any().optional().nullable(),
}).strict();

export const ImportSchema = z.object({
  appliances: z.array(ApplianceSchema).max(200).default([]),
  settings:   SettingsSchema.optional(),
});
