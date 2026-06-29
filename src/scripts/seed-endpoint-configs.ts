import { EndpointConfig  } from '../models/EndpointConfig.model'
import {
    PROVIDER_ENDPOINT_PATH,
    ENDPOINT_LABELS,
    type ApiEndpoint,
} from '../config/constants'
import { logger } from '../shared/logger'

export async function seedEndpointConfigs(): Promise<void> {
    try {
        const endpoints = Object.keys(PROVIDER_ENDPOINT_PATH) as ApiEndpoint[]
        let inserted = 0

        for (const key of endpoints) {
            const exists = await EndpointConfig.findOne({ key })

            if (!exists) {
                await EndpointConfig.create({
                    key,
                    path: PROVIDER_ENDPOINT_PATH[key],
                    label: ENDPOINT_LABELS[key] ?? key,
                    isActive: true,
                    updatedBy: null,
                })
                inserted++
            }
        }

        if (inserted > 0) {
            logger.info(`Seed de endpoints: ${inserted} configs inseridas no banco`)
        } else {
            logger.info('Seed de endpoints: todos os configs já existem no banco')
        }
    } catch (err) {
        logger.error({ err }, 'Erro no seed de endpoint configs')
    }
    
}