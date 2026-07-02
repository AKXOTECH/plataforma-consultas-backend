import type { FastifyReply, FastifyRequest } from "fastify";
import { usersService } from "./users.service"; 
import { success } from "zod";

export class UsersController {
    async listAll (_request: FastifyRequest,  reply: FastifyReply) {
        const data = await usersService.listAll()
        return reply.status(200).send({ success: true, data})
    }

    async delete(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id:string }
        await usersService.delete(id)
        return reply.status(200).send({ success: true})
    }
}

export const usersController = new UsersController()