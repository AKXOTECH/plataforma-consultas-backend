import { Order } from '../../models/Order.model'
import { Transaction } from '../../models/Transaction.model'
import { AppError } from '../../shared/errors/AppError'
import {
  REPORT_ENDPOINTS,
  REPORT_API_COST,
  REPORT_PRICES,
  calculateCustomOrderPrice,
  type ApiEndpoint,
} from '../../config/constants'
import type { CreateOrderInput, ReviewOrderInput } from './orders.schema'
import type { ReportType } from '../../config/constants'
import { processOrder } from './orders.processor'
import { logger } from '../../shared/logger'
import { User } from '@models/User.model'
import path from 'node:path'

export class OrdersService {
  async createOrder(userId: string, input: CreateOrderInput) {
    let endpoints: ApiEndpoint[]
    let totalCost: number
    let totalPrice: number
    let reportType: ReportType | null = null

    if (input.orderType === 'report') {
      reportType = input.reportType as ReportType
      endpoints = REPORT_ENDPOINTS[input.reportType as keyof typeof REPORT_ENDPOINTS]
      totalCost = REPORT_API_COST[input.reportType as keyof typeof REPORT_API_COST]
      totalPrice = REPORT_PRICES[input.reportType as keyof typeof REPORT_PRICES]
    } else {
      endpoints = input.endpoints as ApiEndpoint[]
      const calc = calculateCustomOrderPrice(endpoints)
      totalCost = calc.totalCost
      totalPrice = calc.totalPrice
    }

    const order = await Order.create({
      userId,
      placa: input.placa,
      orderType: input.orderType,
      reportType,
      endpoints,
      totalCost,
      totalPrice,
      status: 'pending_review',
    })

    return order
  }

  async listByUser(userId: string) {
    return Order.find({ userId }).sort({ createdAt: -1 })
  }

  async listPendingReview() {
    return Order.find({ status: 'pending_review' })
      .populate('userId', 'name email phone')
      .sort({ createdAt: 1 })
  }

  async listPendingPayment() {
    return Order.find({ status: 'pending_payment' })
      .populate('userId', 'name email phone')
      .sort({ createdAt: 1 })
  }

  async getById(orderId: string) {
    const order = await Order.findById(orderId)

    if (!order) {
      throw AppError.notFound('Pedido não encontrado')
    }

    return order
  }

  async listAll(filters: {
    status?: string | undefined
    userId?: string | undefined 
    startDate?: string | undefined
    endDate?: string | undefined
    page?: number | undefined
    limit?: number | undefined
  }) {
    const query: Record<string, unknown> = {}

    if (filters.status) query.status = filters.status
    if (filters.userId) query.userId = filters.userId

    if (filters.startDate || filters.endDate) {
      query.createdAt = {
        ...(filters.startDate && { $gte: new Date(filters.startDate) }),
        ...(filters.endDate && { $lte: new Date(filters.endDate) }),
      }
    }

    const page = filters.page ?? 1
    const limit = filters.limit ?? 20
    const skip = (page - 1) * limit

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('userId', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query),  
    ])

    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async review(orderId: string, adminId: string, input: ReviewOrderInput) {
    const order = await this.getById(orderId)

    if (order.status !== 'pending_review') {
      throw AppError.conflict('Este pedido já foi revisado')
    }

    if (input.approved) {
      order.status = 'queries_runnig'
    } else {
      order.status = 'rejected'
      order.rejectionReason = input.rejectionReason ?? 'Não especificado'
    }

    order.reviewedBy = adminId as unknown as typeof order.reviewedBy
    order.reviewedAt = new Date()

    await order.save()

    return order
  }

  async runQueries(orderId: string) {
    const order = await this.getById(orderId)

    if (order.status !== 'pending_review' && order.status !== 'queries_done') {
      throw AppError.conflict(
      'Consultas só podem ser disparadas em pedidos pendentes de revisão ou já consultados'
      )
    }

    order.status = 'queries_runnig'
    await order.save()

    return order
  }

  async markQueriesDone(orderId: string) {
    const order = await this.getById(orderId)
    order.status = 'queries_done'
    await order.save()
    return order
  }

  async approveAfterQueries(orderId: string, adminId: string) {
    const order = await this.getById(orderId)

    if (order.status !== 'queries_done') {
      throw AppError.conflict (
        'O pedido precisa ter as consultas concluídas antes de ser aprovado para pagamento'
      )

    }

    order.status = 'pending_payment'
    order.reviewedBy = adminId as unknown as typeof order.reviewedBy
    order.reviewedAt = new Date()
    await order.save()

    return order
  }

  async confirmPayment(orderId: string, adminId: string) {
    const order = await this.getById(orderId)

    if (order.status !== 'pending_payment') {
      throw AppError.conflict('Este pedido não está aguardando pagamento')
    }

    order.status = 'processing'
    order.paymentConfirmedBy = adminId as unknown as typeof order.paymentConfirmedBy
    order.paymentConfirmedAt = new Date()

    await order.save()

    await Transaction.create({
      orderId: order._id,
      userId: order.userId,
      amount: order.totalPrice,
      description: `Pagamento confirmado — pedido ${order.placa}`,
    })

    // A partir daqui o processamento real (chamadas às APIs externas)
    order.status = 'pdf_review'
    await order.save()

    return order
  }
  async generatePdf(orderId: string) {
    const order = await this.getById(orderId)

    if (order.status !== 'pdf_review') {
      throw AppError.conflict(
        'O PDF só pode ser gerado após a confirmação de pagamento e revisão dos resultados'
      )
    }
    order.status = 'processing'
    await order.save()

    processOrder(order._id.toString(), 'payment').catch((err) => {
      logger.error({ err, orderId }, 'Erro ao gerar PDF')
    })

    return order
  }

  async getPdfPath(orderId: string, userId: string, userRole: string) {
    const order = await this.getById(orderId)

    if (order.userId.toString() !== userId && userRole !== 'admin') {
      throw AppError.forbidden('Você não tem permissão para acessar este relatório')
    }

    if (order.status !== 'completed') {
      throw AppError.conflict('O relatório ainda não está disponivel')
    }

    if (!order.pdfPath) {
      throw AppError.notFound('PDF não encontrado para este pedido')
    }

    const absolutePath = path.join(
      process.cwd(),
      'storage',
      'reports',
      order.pdfPath.replace('/reports/', '')
    )

    return { absolutePath, placa: order.placa }
  }



  async getMetrics() {
    const [total, pendingReview, completed, failed] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({status: 'pending_review'}),
      Order.countDocuments({ status: 'completed'}),
      Order.countDocuments({ status: 'failed' }),
    ])

    const admins = await User.countDocuments({ role: 'admin'})

    return {
      totalPedidos: total,
      pendentes: pendingReview,
      enviados: completed,
      admins,
    }
  }

  async delete(orderId: string) {
    const order = await Order.findByIdAndDelete(orderId)
    if (!order) throw AppError.notFound('Pedido não encontrado')
      return { success: true }

  }
}

export const ordersService = new OrdersService()