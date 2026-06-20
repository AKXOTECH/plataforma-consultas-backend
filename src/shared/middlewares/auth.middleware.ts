import type { FastifyReply, FastifyRequest } from 'fastify'
import { AppError } from '../errors/AppError'

export async function authMiddleware(request: FastifyRequest, _reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch {
    throw AppError.unauthorized('Token inválido ou expirado')
  }
}

export async function adminMiddleware(request: FastifyRequest, _reply: FastifyReply) {
  await authMiddleware(request, _reply)

  if (request.user.role !== 'admin') {
    throw AppError.forbidden('Acesso restrito a administradores')
  }
}