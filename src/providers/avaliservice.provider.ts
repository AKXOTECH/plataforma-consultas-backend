import axios, { type AxiosInstance } from 'axios'
import axiosRetry from 'axios-retry'
import { env } from '../config/env'
import { logger } from '../shared/logger'
import { AppError } from '../shared/errors/AppError'
import { PROVIDER_ENDPOINT_PATH, type ApiEndpoint } from '../config/constants'

/**
 *API do fornecedor AvaliService.
 *
 * Autenticação: usuário e senha geram um token válido por 24h.
 * O token é cacheado em memória e renovado automaticamente quando expira
 * (ou quando o fornecedor responde 401).
 */

interface CachedToken {
  token: string
  expiresAt: number
}

class AvaliServiceProvider {
  private client: AxiosInstance
  private cachedToken: CachedToken | null = null

  constructor() {
    this.client = axios.create({
      baseURL: env.PROVIDER_BASE_URL,
      timeout: 30_000,
    })

    axiosRetry(this.client, {
      retries: 2,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return (
          axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          error.response?.status === 429
        )
      },
    })
  }

  private async getToken(): Promise<string> {
    const now = Date.now()
    const safetyMarginMs = 5 * 60 * 1000

    if (this.cachedToken && this.cachedToken.expiresAt - safetyMarginMs > now) {
      return this.cachedToken.token
    }

    return this.authenticate()
  }

  private async authenticate(): Promise<string> {
    try {
      logger.info(' Autenticando no AvaliService...')

      const response = await this.client.post('/Auth/login', {
        username: env.PROVIDER_USERNAME,
        password: env.PROVIDER_PASSWORD,
      })

      const token: string | undefined =
        response.data?.token ?? response.data?.accessToken ?? response.data?.access_token

      if (!token) {
        throw new Error('Token não encontrado na resposta de autenticação')
      }

      this.cachedToken = {
        token,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      }

      logger.info('✅ Autenticado no AvaliService com sucesso')

      return token
    } catch (err) {
      logger.error({ err }, 'Falha ao autenticar no AvaliService')
      throw AppError.externalApiError('Falha ao autenticar no provedor de consultas')
    }
  }

  async query(endpoint: ApiEndpoint, placa: string): Promise<Record<string, unknown>> {
    const path = PROVIDER_ENDPOINT_PATH[endpoint]
    let token = await this.getToken()

    const doRequest = async (authToken: string) => {
        return this.client.post(
            path,
            null,
            {
                params: { placa, parametro: placa },
                headers: { Authorization: `Bearer ${authToken}` },
            }
        )
    }

    try {
      const response = await doRequest(token)
      return response.data
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        logger.warn(' Token expirado, renovando e tentando novamente...')
        this.cachedToken = null
        token = await this.getToken()

        try {
          const retryResponse = await doRequest(token)
          return retryResponse.data
        } catch (retryErr) {
          logger.error(
            { err: retryErr, endpoint, placa },
            '❌ Falha na consulta após renovar token'
          )
          throw AppError.externalApiError(`Falha ao consultar "${endpoint}" no provedor`)
        }
      }

      logger.error({ err, endpoint, placa }, ' Falha na consulta ao provedor')
      throw AppError.externalApiError(`Falha ao consultar "${endpoint}" no provedor`)
    }
  }
}

export const avaliServiceProvider = new AvaliServiceProvider()