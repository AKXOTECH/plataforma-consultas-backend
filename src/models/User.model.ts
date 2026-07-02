import mongoose, { Document, Schema } from 'mongoose'

export type UserRole = 'client' | 'admin'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  phone: string
  cpf?: string
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Nome obrigatório'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email obrigatório'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Senha obrigatória'],
      minlength: [6, 'Senha deve ter ao menos 6 caracteres'],
    },
    cpf: {
      type: String,
      trim: true,
      default: null,
    },
    phone: {
      type: String,
      required: [true, 'Telefone obrigatório'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['client', 'admin'],
      default: 'client',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

UserSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    delete ret.password
    return ret
  },
})

export const User = mongoose.model<IUser>('User', UserSchema)