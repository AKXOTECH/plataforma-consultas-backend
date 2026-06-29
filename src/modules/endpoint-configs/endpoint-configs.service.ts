import { EndpointConfig } from '../../models/EndpointConfig.model'
import {
  PROVIDER_ENDPOINT_PATH,
  ENDPOINT_LABELS,
  type ApiEndpoint,
} from '../../config/constants'
import { AppError } from '../../shared/errors/AppError'
import { logger } from '../../shared/logger'
import { BlobOptions } from 'node:buffer'
import { config } from 'dotenv'

// Evita bater no banco a cada consulta. (Cache em memória)

interface ConfigCache {
    data: Record<string, { path: string; label: string; isActive: boolean}>
    expiresAt: number
}

let cache: ConfigCache | null = null
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutos..

export class EndpointConfigsService {

    static invalidateCache(): void {
        cache = null
        logger.info('Cache de endpoint configs invalidado')
    }

    async loadAll(): Promise<ConfigCache['data']> {
        const now = Date.now()

        if (cache && cache.expiresAt > now) {
            return cache.data
        }

        const configs = await EndpointConfig.find({ isActive: true})

        const data: ConfigCache['data'] = {}

        for (const config of configs) {
            data[config.key] = {
                path: config.path,
                label: config.label,
                isActive: config.isActive,
            }
        }

        cache = { data, expiresAt: now + CACHE_TTL_MS }

        return data
    }

    async getPath(key: ApiEndpoint): Promise<string> {
        const configs = await this.loadAll()

        if (configs[key]?.path) {
            return configs[key].path
        }

        const fallback = PROVIDER_ENDPOINT_PATH[key]

        if (fallback) {
            logger.warn(
                { key },
                'Endpoint config não encontrado em banco, utilizando fallback.'
            )
            return fallback
        }

        throw AppError.notFound(`Configuração não encontrada para o endpoint "${key}"`)

    }

    async getLabel(key: ApiEndpoint): Promise<string> {
        const configs = await this.loadAll()

        if (configs[key]?.label) {
            return configs[key].label
        }

        return ENDPOINT_LABELS[key] ?? key
    }

    async listAll() {
        return EndpointConfig.find().sort({ key: 1 })
    }


    async update(
        key: string,
        data: { path?: string | undefined; label?: string | undefined; isActive?: boolean | undefined},
        adminId: string
    ) {
        const config = await EndpointConfig.findOne({ key })

        if (!config) {
            throw AppError.notFound(`Endpoint "${key}" não encontrado`)
        }

        if (data.path !== undefined) config.path = data.path
        if (data.label  !== undefined) config.label = data.label
        if (data.isActive !== undefined) config.isActive = data.isActive
        config.updatedBy = adminId as unknown as typeof config.updatedBy

        await config.save()

        EndpointConfigsService.invalidateCache()

        return config
    }
}

export const endpointConfigsService = new EndpointConfigsService()