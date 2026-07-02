import type { FastifyReply, FastifyRequest } from 'fastify'
import { registerSchema, loginSchema } from './auth.schema'
import { authService } from './auth.service'

export class AuthController {
  async register(request: FastifyRequest, reply: FastifyReply) {
    const input = registerSchema.parse(request.body)

    const user = await authService.register(input)

    const token = await reply.jwtSign({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    })

    return reply.status(201).send({
      success: true,
      message: 'Conta criada com sucesso',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          cpf: user.cpf,
          role: user.role,
        },
        token,
      },
    })
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    const input = loginSchema.parse(request.body)

    const user = await authService.validateCredentials(input)

    const token = await reply.jwtSign({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    })

    return reply.status(200).send({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    })
  }

  async me(request: FastifyRequest, reply: FastifyReply) {
    return reply.status(200).send({
      success: true,
      data: {
        user: request.user,
      },
    })
  }
}

export const authController = new AuthController()