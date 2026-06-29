import mongoose, { Document, Schema } from "mongoose";

export interface IEndpointConfig extends Document {
    key: string
    path: string
    label: string
    isActive: boolean
    updatedBy: mongoose.Types.ObjectId | null
    createdAt: Date
    updatedAt: Date
}

const EndpointConfigSchema = new Schema<IEndpointConfig>(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        path: {
            type: String,
            required: true,
            trim: true,
        },
        label: {
            type: String,
            required: true,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
    },
    { timestamps: true }
)


export const EndpointConfig = mongoose.model<IEndpointConfig>(
    'EndpointConfig',
    EndpointConfigSchema
)