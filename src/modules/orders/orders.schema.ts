import { z } from 'zod'
import { REPORTS } from '../../config/constants'
import { API_COSTS } from '../../config/constants'

const reportTypeValues = Object.values(REPORTS) as [string, ...string[]]
const endpointValues = Object.keys(API_COSTS) as [string, ...string[]]

// Pedido de relatório pronto 
export const createReportOrderSchema = z.object({
  placa: z.string().min(7, 'Placa inválida').max(8, 'Placa inválida').trim(),
  orderType: z.literal('report'),
  reportType: z.enum(reportTypeValues),
})

// Pedido avulso 
export const createCustomOrderSchema = z.object({
  placa: z.string().min(7, 'Placa inválida').max(8, 'Placa inválida').trim(),
  orderType: z.literal('custom'),
  endpoints: z
    .array(z.enum(endpointValues))
    .min(1, 'Escolha ao menos 1 item para consultar'),
})

// União
export const createOrderSchema = z.discriminatedUnion('orderType', [
  createReportOrderSchema,
  createCustomOrderSchema,
])

export type CreateOrderInput = z.infer<typeof createOrderSchema>

// Aprovação / rejeição 
export const reviewOrderSchema = z.object({
  approved: z.boolean(),
  rejectionReason: z.string().optional(),
})

export type ReviewOrderInput = z.infer<typeof reviewOrderSchema>