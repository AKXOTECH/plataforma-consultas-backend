import type { FastifyInstance } from "fastify";
import { usersController } from "./users.controller";
import { adminMiddleware } from "@shared/middlewares/auth.middleware";

export async function usersRoutes(fastify: FastifyInstance) {
    fastify.get('/', { preHandler: adminMiddleware}, usersController.listAll )
    fastify.delete('/:id', { preHandler: adminMiddleware}, usersController.delete)
}
