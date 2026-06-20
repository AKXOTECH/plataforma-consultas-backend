import type { FastifyInstance } from 'fastify'
import { ordersController } from './orders.controller'
import { authMiddleware, adminMiddleware } from '../../shared/middlewares/auth.middleware'

export async function ordersRoutes(fastify: FastifyInstance) {
  // ─── Rotas (clientes) 
  fastify.post('/', { preHandler: authMiddleware }, ordersController.create)
  fastify.get('/mine', { preHandler: authMiddleware }, ordersController.listMine)
  fastify.get('/:id', { preHandler: authMiddleware }, ordersController.getOne)

  // ─── Rotas administrativas 
  fastify.get(
    '/admin/pending-review',
    { preHandler: adminMiddleware },
    ordersController.listPendingReview
  )
  fastify.get(
    '/admin/pending-payment',
    { preHandler: adminMiddleware },
    ordersController.listPendingPayment
  )
  fastify.patch(
    '/admin/:id/review',
    { preHandler: adminMiddleware },
    ordersController.review
  )
  fastify.patch(
    '/admin/:id/confirm-payment',
    { preHandler: adminMiddleware },
    ordersController.confirmPayment
  )
}