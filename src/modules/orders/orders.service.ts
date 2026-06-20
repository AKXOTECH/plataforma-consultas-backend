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

  async review(orderId: string, adminId: string, input: ReviewOrderInput) {
    const order = await this.getById(orderId)

    if (order.status !== 'pending_review') {
      throw AppError.conflict('Este pedido já foi revisado')
    }

    if (input.approved) {
      order.status = 'pending_payment'
    } else {
      order.status = 'rejected'
      order.rejectionReason = input.rejectionReason ?? 'Não especificado'
    }

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
    processOrder(order._id.toString()).catch((err) => {
      throw err
    })

    return order
  }
}

export const ordersService = new OrdersService()