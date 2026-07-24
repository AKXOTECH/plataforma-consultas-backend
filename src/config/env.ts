import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config()

const envSchema = z.object({
    
    HOST: z.string().default('0.0.0.0'),
    PORT: z.coerce.number().default(3333),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    MONGODB_URI: z.url('MONGODB_URI inválida'),

    JWT_SECRET: z.string().min(16, 'JWT_SECRET deve ter ao menos 16 caracteres'),
    JWT_EXPIRES_IN: z.string().default('7d'),

    PROVIDER_BASE_URL: z.url('PROVIDER_BASE_URL inválida'),
    PROVIDER_USERNAME: z.string().min(1, 'PROVIDER_USERNAME obrigatório'),
    PROVIDER_PASSWORD: z.string().min(1, 'PROVIDER_PASSWORD obrigatório'),

    FRONTEND_URL: z.string().default('*'),

    RATE_LIMIT_MAX: z.coerce.number().default(100),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),

    MIN_OPERATIONAL_COST: z.coerce.number().default(500),
    DEV_PROFIT_SHARE: z.coerce.number().default(0.20),
    DEV_PROFIT_CAP: z.coerce.number().default(2000),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
    console.error(' Variáveis de ambiente inválidas')
    console.error(parsed.error.flatten().fieldErrors)
    process.exit(1)

}

export const env = parsed.data
export type Env = typeof env

