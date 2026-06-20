import dns from 'node:dns'
dns.setServers(['8.8.8.8', '1.1.1.1'])
import { buildApp } from './app'
import { connectDatabase } from './db'
import { env } from './config/env'
import { logger } from './shared/logger'
import { build } from 'pino-pretty'

async function bootstrap() {
    try {
        await connectDatabase()

        const app = await buildApp()

        await app.listen({
            host: env.HOST,
            port: env.PORT,
        })

        logger.info(`Servidor rodando em http://${env.HOST}:${env.PORT}`)
        logger.info(`Documentação em http://${env.HOST}:${env.PORT}/docs`)

        const shutdown = async (signal: string) => {
            logger.info(`${signal} recebido - encerrando servidor...`)
            await app.close()
            logger.info('Servidor encerrado com sucesso')
            process.exit(0)
        }

        process.on('SIGTERM', () => shutdown('SIGTERM'))
        process.on('SIGINT', () => shutdown('SIGINT'))

        process.on('unhandledRejection', (reason) => {
            logger.error({ reason }, 'Unhandled Rejection')
            process.exit(1)
        })

        process.on('uncaughtException', (err) => {
            logger.error({ err }, 'UncaughtException')
            process.exit(1)
        })

    } catch (err) {
        logger.error({ err }, 'Falha ao iniciar o servidor')
        process.exit(1)
    }  
    
}


bootstrap()