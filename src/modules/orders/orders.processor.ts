import { Order, type IOrder } from '../../models/Order.model'
import { avaliServiceProvider } from '../../providers/avaliservice.provider'
import { generateOrderReportPdf } from '../../shared/pdf/order-report.pdf'
import { logger } from '../../shared/logger'
import type { ApiEndpoint } from '../../config/constants'

/**
 * Processa um pedido já com pagamento confirmado:
 * 1. Consulta cada endpoint selecionado no AvaliService (em paralelo)
 * 2. Salva os resultados (sucesso ou erro individual) no pedido
 * 3. Gera o PDF do relatório
 * 4. Marca o pedido como "completed" (ou "failed" se TODAS as consultas falharem)
 */

export async function processOrder(
    orderId: string,
    phase: 'review' | 'payment'
): Promise<void> {
    const order = await Order.findById(orderId)

    if (!order) {
        logger.error({ orderId }, 'Pedido não encontrado para processamento')
        return
    }

    logger.info({ orderId, placa: order.placa }, 'Iniciando processamento do pedido')

    const results: Record<string, unknown> = {}
    let successCount = 0

    await Promise.all (
        (order.endpoints as ApiEndpoint[]).map(async (endpoint) => {
            try {
                const data = await avaliServiceProvider.query(endpoint, order.placa)
                results[endpoint] = data
                successCount++
            } catch (err) {
                logger.error({ err, endpoint, placa: order.placa}, 'Falha em endpoint individual')
                results[endpoint] = {
                    error: err instanceof Error ? err.message : 'Erro desconhecido na consulta',
                }
            }
        })
    )

    order.results = results
    
    if (phase === 'review') {
        if (successCount === 0) {
            order.status = 'queries_done'
            order.errorMessage = 'Todas as consultas falharam. Verifique os endpoints ou tente novamente.'
        } else {
            order.status = 'queries_done'
            order.errorMessage = null
        }
        await order.save()
        logger.info({ orderId, successCount}, 'Consultas de revisão concluídas')
        return
    }

    if (successCount === 0) {
        order.status = 'failed'
        order.errorMessage = 'Todas as consultas falharam. Verifique a placa ou tente novamente.'
        await order.save()
        logger.error({ orderId }, 'Pedido falhou - nenhuma consulta teve sucesso.')
        return
    }

    try {
        const { relativePath } = generateOrderReportPdf(order as IOrder)
        order.pdfPath = relativePath
        order.status = 'completed'
        await order.save()

        logger.info({ orderId, placa: order.placa }, 'Pedido processado e PDF gerado')
    } catch (err) {
        logger.error ({ err, orderId }, 'Falha ao gerar PDF do pedido')
        order.status = 'failed'
        order.errorMessage = 'Consultas concluídas, mas houve falha ao gerar o PDF.'
        await order.save()
    }
}

export async function retryFailedEndpoints(orderId: string): Promise<void> {
    const order = await Order.findById(orderId)

    if (!order) {
        logger.error({ orderId}, 'Pedido não encontrado para retentar')
        return
    }

    if (order.status !== 'queries_done') {
        logger.warn({ orderId }, 'Pedido não está em queries_done, ignorando retry')
        return
    }

    const currentResults = (order.results ?? {}) as Record<string, unknown>

    const failedEndpoints = (order.endpoints as ApiEndpoint[]).filter((endpoint) => {
        const result = currentResults[endpoint]
        return (
            !result ||
            (typeof result === 'object' && 'error' in (result as Record<string, unknown>))
        )
    } )
    
    if (failedEndpoints.length === 0) {
        logger.info({ orderId }, 'Nenhum endpoint com falha para retentar')
        return
    }

    logger.info(
        { orderId, failedEndpoints },
        `Retentando ${failedEndpoints.length} endpoint(s) com falha`
    )

    const updatedResults = { ...currentResults }

    await Promise.all(
        failedEndpoints.map(async (endpoint) => {
            try {
                const data = await avaliServiceProvider.query(endpoint, order.placa)
                updatedResults[endpoint] = data
                logger.info({ endpoint }, 'Retry bem-sucedido')
            } catch (err) {
                logger.error({ err, endpoint }, 'Retry falhou')
                updatedResults[endpoint] = {
                    error: err instanceof Error ? err.message : 'Erro desconhecido na consulta'
                }
            }
        })
    )

    order.results = updatedResults
    order.status = 'queries_done'
    await order.save()

    logger.info({ orderId }, 'Retry concluído!')
}