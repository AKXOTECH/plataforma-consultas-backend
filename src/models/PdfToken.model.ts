import mongoose, { Document, Schema } from "mongoose";

export interface IPdfToken extends Document {
    orderId: mongoose.Types.ObjectId
    userId: mongoose.Types.ObjectId
    token: string
    expiresAt: Date
    createdAt: Date
}

const PdfTokenSchema = new Schema<IPdfToken>(
    {
        orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        token: { type: String, required: true, unique: true },
        expiresAt: { type: Date, required: true },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
)

// Remove tokens expirados do banco de forma automática
PdfTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const PdfToken = mongoose.model<IPdfToken>('PdfToken', PdfTokenSchema)

