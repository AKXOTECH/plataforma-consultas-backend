import type { UserRole } from '../models/User.model'

// Payload do JWT 

export interface JwtPayload {
  sub: string      // userId
  email: string
  role: UserRole
  iat?: number
  exp?: number
}


declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtPayload
    user: JwtPayload
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    user: JwtPayload
  }
}

// padrão da API 

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  code?: string
}

// Paginação 

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}