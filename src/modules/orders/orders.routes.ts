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
  fastify.get(
    '/admin/all',
    { preHandler: adminMiddleware },
    ordersController.listAll
  )
  fastify.get(
    '/admin/metrics',
    {  preHandler: adminMiddleware },
    ordersController.metrics
  )
  fastify.post(
    '/admin/:id/run-queries',
    { preHandler: adminMiddleware },
    ordersController.runQueries 
  )
  fastify.post(
    '/admin/:id/retry-failed',
    { preHandler: adminMiddleware },
    ordersController.retryFailed
  )
  fastify.post(
    '/admin/:id/generate-pdf',
    { preHandler: adminMiddleware },
    ordersController.generatePdf
  )
  fastify.patch(
    '/admin/:id/approve',
    { preHandler: adminMiddleware },
    ordersController.approveAfterQueries
  )
  
  fastify.patch(
    '/admin/:id/confirm-payment',
    { preHandler: adminMiddleware },
    ordersController.confirmPayment
  )
  fastify.patch(
    '/admin/:id/review',
    { preHandler: adminMiddleware },
    ordersController.review
  )
  fastify.delete(
    '/admin/:id',
    { preHandler: adminMiddleware },
    ordersController.delete
  )
  
  fastify.get(
    '/:id/pdf',
    ordersController.getPdf
  )
}