import type { FastifyReply, FastifyRequest } from 'fastify'
import { createOrderSchema, reviewOrderSchema } from './orders.schema'
import { OrdersService, ordersService } from './orders.service'
import { processOrder, retryFailedEndpoints } from './orders.processor'
import { logger } from '@shared/logger'
import { successProcessor } from 'node_modules/zod/v4/core/json-schema-processors.cjs'
import { success } from 'zod'

export class OrdersController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const input = createOrderSchema.parse(request.body)

    const order = await ordersService.createOrder(request.user.sub, input)

    return reply.status(201).send({
      success: true,
      message: 'Pedido criado com sucesso. Aguardando análise.',
      data: { order },
    })
  }

  async listMine(request: FastifyRequest, reply: FastifyReply) {
    const orders = await ordersService.listByUser(request.user.sub)

    return reply.status(200).send({
      success: true,
      data: { orders },
    })
  }

  async getOne(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }

    const order = await ordersService.getById(id)

    return reply.status(200).send({
      success: true,
      data: { order },
    })
  }

  // ─── Rotas administrativas (fornecedor) ────────────────────────────────────

  async listPendingReview(_request: FastifyRequest, reply: FastifyReply) {
    const orders = await ordersService.listPendingReview()

    return reply.status(200).send({
      success: true,
      data: { orders },
    })
  }

  async listAll(request: FastifyRequest, reply: FastifyReply) {
    const { status, userId, startDate, endDate, page, limit } = request.query as Record<string, string>

    const result = await ordersService.listAll({
      status,
      userId,
      startDate,
      endDate,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    })

    return reply.status(200).send({
      success: true,
      data: result,
    })
    
  }

  async listPendingPayment(_request: FastifyRequest, reply: FastifyReply) {
    const orders = await ordersService.listPendingPayment()

    return reply.status(200).send({
      success: true,
      data: { orders },
    })
  }

  async review(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const input = reviewOrderSchema.parse(request.body)

    const order = await ordersService.review(id, request.user.sub, input)

    return reply.status(200).send({
      success: true,
      message: input.approved ? 'Pedido aprovado' : 'Pedido rejeitado',
      data: { order },
    })
  }

  async confirmPayment(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }

    const order = await ordersService.confirmPayment(id, request.user.sub)

    return reply.status(200).send({
      success: true,
      message: 'Pagamento confirmado. Processando consultas.',
      data: { order },
    })
  }

  async generatePdf(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id:string }

    const order = await ordersService.generatePdf(id)

    return reply.status(200).send({
      success: true,
      message: 'Gerando PDF. Aguarde alguns segundos e consulte o pedido.',
      data: { order }
    })
  }

  async runQueries(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id:string }

    // Atualiza o status para queries_running e dispara
    await ordersService.runQueries(id)

    processOrder(id, 'review').catch((err) => {
      logger.error({ err, orderId: id }, 'Erro no processamento de revisão')
    })

    return reply.status(200).send({
      sucess: true,
      message: 'Consultas disparadas. Aguarde alguns segundos para realizar a consultar o pedido novamente'
    })
  }

  async retryFailed(request: FastifyRequest,reply: FastifyReply) {
    const { id } = request.params as { id: string }

    retryFailedEndpoints(id).catch((err) => {
      logger.error({ err, orderId: id }, 'Erro no retry de endpoints')
    })

    return reply.status(200).send({
      success: true,
      message: 'Reprocessando endpoints com falha. Aguarde alguns segundos.'
    })
  }

  async approveAfterQueries(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }

    const order = await ordersService.approveAfterQueries(id, request.user.sub)

    return reply.status(200).send({
      success: true,
      message: 'Pedido aprovado! Aguardando confirmação de pagamento.',
      data: { order },
    })
  }

  async metrics(_request: FastifyRequest, reply: FastifyReply) {
    const data = await ordersService.getMetrics()
    return reply.status(200).send({ success: true, data })
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    await ordersService.delete(id)
    return reply.status(200).send({ success: true })
  }
  
}

export const ordersController = new OrdersController()