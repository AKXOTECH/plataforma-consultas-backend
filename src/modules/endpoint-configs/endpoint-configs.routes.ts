import type { FastifyInstance } from 'fastify'
import { endpointConfigsController } from './endpoint-configs.controller'
import { adminMiddleware } from '../../shared/middlewares/auth.middleware'

export async function endpointConfigsRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/',
    { preHandler: adminMiddleware },
    endpointConfigsController.listAll
  )

  fastify.patch(
    '/:key',
    { preHandler: adminMiddleware },
    endpointConfigsController.update
  )
}