import mongosse from 'mongoose'
import { env } from './config/env'
import { logger } from './shared/logger'
import { error } from 'node:console'

export async function connectDatabase(): Promise<void> {
    try {
        mongosse.set('strictQuery', true)

        await mongosse.connect(env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        })


        logger.info('MongoDB conectado')

        mongosse.connection.on('disconnected', () => {
            logger.warn('MongoDB desconectado - tentando reconectar ...')
            setTimeout(() => {
                mongosse.connect(env.MONGODB_URI).catch((err) => {
                    logger.error({ err }, 'Falha ao reconectar ao MongoDB')
                })
            }, 5000)
        })

        mongosse.connection.on('error', (err) => {
            logger.error({ err }, 'Erro na conexão MongoDB')
        })
    }   catch (err) {
        logger.error({ err }, 'Falha ao conectar ao MongoDB')
        process.exit(1)
    }
    
}

export async function disconnectDatabase(): Promise<void>  {
    await mongosse.disconnect()
    logger.info('MongoDB desconectado com sucesso')    
}