import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres').trim(),
  email: z.email('Email inválido').toLowerCase().trim(),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  phone: z.string().min(10, 'Telefone inválido').trim(),
  cpf: z.string().min(11, 'CPF inválido').trim(),
})

export const loginSchema = z.object({
  email: z.email('Email inválido').toLowerCase().trim(),
  password: z.string().min(1, 'Senha obrigatória'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>