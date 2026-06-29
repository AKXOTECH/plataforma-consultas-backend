import type { FastifyReply, FastifyRequest } from 'fastify'
import { success, z } from 'zod'
import { endpointConfigsService } from './endpoint-configs.service'

const updateSchema = z.object({
    path: z.string().min(1).trim().optional(),
    label: z.string().min(1).trim().optional(),
    isActive: z.boolean().optional(),
})

export class EndpointConfigsController {
    async listAll(_request: FastifyRequest, reply: FastifyReply) {
        const configs = await endpointConfigsService.listAll()

        return reply.status(200).send({
            success: true,
            data: { configs },
        })
    }

    async update(request: FastifyRequest, reply: FastifyReply) {
        const { key } = request.params as { key: string }
        const input = updateSchema.parse(request.body)

        const config = await endpointConfigsService.update(
            key,
            input,
            request.user.sub
        )

        return reply.status(200).send({
            success: true,
            message: `Endpoint "${key}" atualizado com sucesso`,
            data: { config },
        })
    }
}

export const endpointConfigsController = new EndpointConfigsController()