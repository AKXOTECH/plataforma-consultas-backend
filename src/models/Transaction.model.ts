import mongoose, { Document, Schema } from 'mongoose'

export interface ITransaction extends Document {
  orderId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  amount: number
  description: string
  createdAt: Date
}

const TransactionSchema = new Schema<ITransaction>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
)

TransactionSchema.index({ userId: 1, createdAt: -1 })

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema)