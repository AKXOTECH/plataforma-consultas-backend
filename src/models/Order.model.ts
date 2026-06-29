import mongoose, { Document, Schema } from 'mongoose'
import type { ReportType, ApiEndpoint } from '../config/constants'

export type OrderType = 'report' | 'custom'

export type OrderStatus =
  | 'pending_review'
  | 'queries_runnig'
  | 'queries_done'
  | 'pending_payment'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'rejected'

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId
  placa: string
  orderType: OrderType
  reportType: ReportType | null
  endpoints: ApiEndpoint[]
  totalCost: number
  totalPrice: number
  status: OrderStatus
  rejectionReason: string | null
  reviewedBy: mongoose.Types.ObjectId | null
  reviewedAt: Date | null
  paymentConfirmedBy: mongoose.Types.ObjectId | null
  paymentConfirmedAt: Date | null
  results: Record<string, unknown> | null
  pdfPath: string | null
  errorMessage: string | null
  createdAt: Date
  updatedAt: Date
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    placa: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    orderType: {
      type: String,
      enum: ['report', 'custom'],
      required: true,
    },
    reportType: {
      type: String,
      default: null,
    },
    endpoints: {
      type: [String],
      required: true,
    },
    totalCost: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        'pending_review',
        'queries_runnig',
        'queries_done',
        'pending_payment',
        'processing',
        'completed',
        'failed',
        'rejected',
      ],
      default: 'pending_review',
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    paymentConfirmedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    paymentConfirmedAt: {
      type: Date,
      default: null,
    },
    results: {
      type: Schema.Types.Mixed,
      default: null,
    },
    pdfPath: {
      type: String,
      default: null,
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

OrderSchema.index({ userId: 1, createdAt: -1 })
OrderSchema.index({ status: 1, createdAt: -1 })
OrderSchema.index({ placa: 1 })

export const Order = mongoose.model<IOrder>('Order', OrderSchema)