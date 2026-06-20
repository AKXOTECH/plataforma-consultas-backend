export class AppError extends Error {
    public readonly statusCode: number
    public readonly code: string
    public readonly isOperational: boolean

    constructor(message: string, statusCode = 400, code = 'BAD_REQUEST') {
        super(message)
        this.name = 'AppError'
        this.statusCode = statusCode
        this.code = code
        this.isOperational = true

        Error.captureStackTrace(this, this.constructor)
    }

    static unauthorized(message = 'Não autorizado') {
        return new AppError(message, 401, 'UNAUTHORIZED')
    }

    static forbidden(message = 'Acesso negado') {
        return new AppError(message, 403, 'FORBIDDEN')
    }

    static notFound(message = 'Recurso não encontrado') {
        return new AppError(message, 404, 'NOT_FOUND')
    }

    static conflict(message = 'Conflito de dados') {
        return new AppError(message, 409, 'CONFLICT')
    }

    static insufficientCredits(message = 'Créditos insuficientes para esta consulta') {
        return new AppError(message, 402, 'INSUFFICIENT_CREDITS')
    }

    static planNotAllowed(message = 'Seu plano não permite esta consulta') {
        return new AppError(message, 403, 'PLAN_NOT_ALLOWED')
    }

    static externalApiError(message = 'Erro ao consultar serviço externo') {
        return new AppError(message, 502, 'EXTERNAL_API_ERROR')
    }

    static internalError(message = 'Erro interno do servidor') {
        return new AppError(message, 500, 'INTERNAL_ERROR')
    }

}