import { User } from "@models/User.model";
import { AppError } from "@shared/errors/AppError";
import { string } from "zod";

export class UsersService {
    async listAll() {
        const users = await User.find().sort({ createdAt: -1 })
        const admins = users.filter(u => u.role === 'admin')
        const clientes = users.filter(u => u.role === 'client')
        return { admins, usuarios: clientes }
    }

    async delete(userId: string) {
        const user = await User.findByIdAndDelete(userId)
        if (!user) throw AppError.notFound('Usuário não encontrado')
            return { success: true}

    }
}

export const usersService = new UsersService()