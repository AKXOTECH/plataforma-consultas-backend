import bcrypt from 'bcryptjs'
import { User } from '../../models/User.model'
import { AppError } from '../../shared/errors/AppError'
import type { RegisterInput, LoginInput } from './auth.schema'

const SALT_ROUNDS = 10

export class AuthService {
  async register(input: RegisterInput) {
    const existingUser = await User.findOne({ email: input.email })

    if (existingUser) {
      throw AppError.conflict('Este email já está cadastrado')
    }

    const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS)

    const user = await User.create({
      name: input.name,
      email: input.email,
      password: hashedPassword,
      phone: input.phone,
      role: 'client',
    })

    return user
  }

  async validateCredentials(input: LoginInput) {
    const user = await User.findOne({ email: input.email })

    if (!user) {
      throw AppError.unauthorized('Email ou senha inválidos')
    }

    if (!user.isActive) {
      throw AppError.forbidden('Conta desativada. Entre em contato com o suporte.')
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password)

    if (!isPasswordValid) {
      throw AppError.unauthorized('Email ou senha inválidos')
    }

    return user
  }
}

export const authService = new AuthService()