import mongosse from 'mongoose'
import { env } from './config/env'
import { logger } from './shared/logger'

export async function connectDatabase(): Promise<void> {
    try {
        mongosse.set('strictQuery', true)

        await mongosse.connect(env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        })


        logger.info('MongoDB conectado')

        mongosse.connection.on('disconnected', () => {
            logger.error('MongoDB desconectado')
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