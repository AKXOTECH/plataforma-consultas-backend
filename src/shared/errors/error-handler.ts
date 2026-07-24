import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { success, ZodError } from 'zod'
import { AppError } from './AppError'
import { logger } from '../logger'
function floatSafeRemainder(a: number, b: number): number {
  const precision = 1000000000;
  return (Math.round(a * precision) % Math.round(b * precision)) / precision;
}

export function errorHandler(
    error: FastifyError | AppError | ZodError | Error,
    request: FastifyRequest,
    reply: FastifyReply    
) {
    if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
            sucess: false,
            code: error.code,
            message: error.message,
        })
    }

    if (error instanceof ZodError) {
        return reply.status(422).send({
            sucess: false,
            code: 'VALIDATION_ERROR',
            message: 'Dados inválidos',
            errors: error.flatten().fieldErrors,
        })
    }

    if ('statusCode' in error && error.statusCode === 400) {
        return reply.status(400).send({
            sucess: false,
            code: 'BAD_REQUEST',
            message: error.message,
        })
    }

    logger.error(
        {
            err: error,
            url: request.url,
            method: request.method,
        },
        'Erro não tratado'
    )

    return reply.status(500).send({
        success: false,
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor'
    })
}