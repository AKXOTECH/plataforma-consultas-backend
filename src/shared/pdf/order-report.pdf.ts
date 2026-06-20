import PDFDocument from 'pdfkit'
import fs from 'node:fs'
import path from 'node:path'
import type { IOrder } from '../../models/Order.model'
import { ENDPOINT_LABELS, REPORT_LABELS, type ApiEndpoint } from '../../config/constants'

const OUTPUT_DIR = path.resolve(process.cwd(), 'storage', 'reports')

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

/**
 * Gera o PDF do relatório de um pedido já processado (status completed/failed)
 * e salva em disco. Retorna o caminho relativo do arquivo (para servir via
 * @fastify/static) e o caminho absoluto (para uso interno).
 */
export function generateOrderReportPdf(order: IOrder): { relativePath: string; absolutePath: string } {
  const fileName = `relatorio-${order._id}.pdf`
  const absolutePath = path.join(OUTPUT_DIR, fileName)
  const relativePath = `/reports/${fileName}`

  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  const stream = fs.createWriteStream(absolutePath)
  doc.pipe(stream)

  // ─── Cabeçalho ──────────────────────────────────────────────────────────────
  doc
    .fontSize(20)
    .fillColor('#1a1a1a')
    .text('Relatório de Consulta Veicular', { align: 'center' })

  doc.moveDown(0.3)
  doc
    .fontSize(10)
    .fillColor('#666666')
    .text('LS Serviços de Engenharia LTDA', { align: 'center' })

  doc.moveDown(1.5)
  doc.strokeColor('#cccccc').moveTo(50, doc.y).lineTo(545, doc.y).stroke()
  doc.moveDown(1)

  // ─── Dados do pedido ────────────────────────────────────────────────────────
  doc.fontSize(12).fillColor('#1a1a1a')
  doc.text(`Placa consultada: ${order.placa}`, { continued: false })
  doc.moveDown(0.3)

  if (order.orderType === 'report' && order.reportType) {
    doc.text(`Relatório: ${REPORT_LABELS[order.reportType]}`)
  } else {
    doc.text('Relatório: Consulta avulsa (itens selecionados)')
  }

  doc.moveDown(0.3)
  doc.text(`Data da consulta: ${new Date(order.createdAt).toLocaleString('pt-BR')}`)
  doc.moveDown(0.3)
  doc.text(`Itens consultados: ${order.endpoints.length}`)

  doc.moveDown(1.5)
  doc.strokeColor('#cccccc').moveTo(50, doc.y).lineTo(545, doc.y).stroke()
  doc.moveDown(1)

  // ─── Resultados por endpoint ──────────────────────────────────────────────
  const results = (order.results ?? {}) as Record<string, unknown>

  for (const endpoint of order.endpoints as ApiEndpoint[]) {
    const label = ENDPOINT_LABELS[endpoint] ?? endpoint
    const data = results[endpoint]

    doc.fontSize(14).fillColor('#0f6e56').text(label)
    doc.moveDown(0.3)
    doc.fontSize(9).fillColor('#333333')

    if (data && typeof data === 'object' && 'error' in (data as Record<string, unknown>)) {
      doc
        .fillColor('#993c1d')
        .text(`Não foi possível obter este item: ${(data as { error: string }).error}`)
    } else if (data) {
      const formatted = JSON.stringify(data, null, 2)
      doc.font('Courier').fontSize(8).text(formatted, { width: 495 })
      doc.font('Helvetica')
    } else {
      doc.fillColor('#999999').text('Sem dados retornados.')
    }

    doc.moveDown(1)
  }

  // ─── Rodapé ─────────────────────────────────────────────────────────────────
  doc.moveDown(1)
  doc.strokeColor('#cccccc').moveTo(50, doc.y).lineTo(545, doc.y).stroke()
  doc.moveDown(0.5)
  doc
    .fontSize(8)
    .fillColor('#999999')
    .text(
      'Este relatório é gerado automaticamente com base em dados de fontes públicas e do provedor de consultas. ' +
        'A LS Serviços de Engenharia não se responsabiliza por desatualizações de terceiros.',
      { align: 'center' }
    )

  doc.end()

  return { relativePath, absolutePath }
}