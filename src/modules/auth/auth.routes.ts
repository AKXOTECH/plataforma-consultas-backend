import type { FastifyInstance } from 'fastify'
import { authController } from './auth.controller'
import { authMiddleware } from '../../shared/middlewares/auth.middleware'

export async function authRoutes(fastify: FastifyInstance) {
    fastify.post('/register', authController.register)
    fastify.post('/login', authController.login)
    fastify.get('/me', { preHandler: authMiddleware}, authController.me)
}

