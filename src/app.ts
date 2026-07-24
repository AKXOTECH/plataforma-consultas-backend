import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import jwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { authRoutes } from './modules/auth/auth.routes'
import { ordersRoutes } from './modules/orders/orders.routes'

import { env } from './config/env'
import { errorHandler } from './shared/errors/error-handler'
import { logger } from './shared/logger'
import staticFiles from '@fastify/static'
import path from 'node:path'
import { endpointConfigsRoutes } from './modules/endpoint-configs/endpoint-configs.routes'
import { usersRoutes } from '@modules/users/users.routes'


export async function buildApp() {
    const app = Fastify({
        logger: env.NODE_ENV !== 'test',
        trustProxy: true,
    })

    await app.register(helmet, {
        contentSecurityPolicy: false,
    })

    
    await app.register(cors, {
        origin: env.NODE_ENV === 'production'
        ? env.FRONTEND_URL
        : true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    })
    
    await app.register(rateLimit, {
        max: env.RATE_LIMIT_MAX,
        timeWindow: env.RATE_LIMIT_WINDOW_MS,
        errorResponseBuilder: () => ({
            success: false,
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Muitas requisições. Aguarde um momento.',
        }),
    })
    
    await app.register(jwt, {
        secret: env.JWT_SECRET,
        sign: {
            expiresIn: env.JWT_EXPIRES_IN,
        },
    })

    await app.register(usersRoutes, { prefix: '/api/usuarios' })
    
    await app.register(swagger, {
        openapi: {
            info: {
                title: 'Consulta Veicular API',
                description: 'API de consulta veicular - LS ENGENHARIA',
                version: '1.0.0', 
            },
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                    },
                },
            },
        },
    })
    
    await app.register(swaggerUi, {
        routePrefix: '/docs',
        uiConfig: {
            docExpansion: 'list',
            deepLinking: false,
        },
    })
    await app.register(staticFiles, {
        root: path.join(process.cwd(), 'storage', 'reports'),
        prefix: '/reports/',
    })

    await app.register(staticFiles, {
        root: path.join(process.cwd(), 'public'),
        prefix: '/public/',
        decorateReply: false,
    })
    
    app.setErrorHandler(errorHandler)
    
    app.get('/health', async () => ({
        success: true,
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    }))

    // Rotas 
    await app.register(authRoutes,  { prefix: '/api/auth' })

    await app.register(ordersRoutes, { prefix: '/api/orders' })

    await app.register(endpointConfigsRoutes, { prefix: '/api/admin/endpoint-configs'})

    logger.info(' App Fastify configurado')

    return app
}