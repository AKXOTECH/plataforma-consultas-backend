import PDFDocument from 'pdfkit'
import fs from 'node:fs'
import path, { format } from 'node:path'
import type { IOrder } from '../../models/Order.model'
import { ENDPOINT_LABELS, REPORT_LABELS, type ApiEndpoint } from '../../config/constants'
import { success } from 'zod'
import { info } from 'node:console'

const OUTPUT_DIR = path.resolve(process.cwd(), 'storage', 'reports')
const LOGO_PATH = path.resolve(process.cwd(), 'src', 'assets', 'logo.png')

const COLORS = {
  primary: '#1a3a6b',
  secondary: '#2563eb',
  accent: '#0f6e56',
  danger: '#991b1b',
  warning: '#92400e',
  text: '#1a1a1a',
  textLight: '#4b5563',
  textMuted: '#9ca3af',
  border: '#e5e7eb',
  bgLight: '#f8fafc',
  white: '#ffffff',
  success: '#166534',
}

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

const CAMPOS_IGNORADOS = new Set([
  'idConsulta', 'dataConsulta', 'parametro', 'usuario',
  'tipoConsulta', 'tempoTotalMs', 'id', 'pdfUrl',
  'resposta', 'nuCdCombustivel', 'marcaModeloCodigo',
  'tipoVeiculoCodigo', 'corCodigo', 'combustivelCodigo',
  'municipioEmplacamentoCodigo', 'orgaoRfbCodigo',
])

const FIELDS_LABELS: Record<string, string> = {
  // Veículo requisitado
  placa: 'Placa',
  chassi: 'Chassi',
  dsChassi: 'Placa/Chassi',
  dsChassiTratado: 'Chassi Tratado',
  codigoRenavam: 'Renavam',
  anoFabricacao: 'Ano de Fabricação',
  anoModelo: 'Ano do Modelo',
  nuAnoModelo: 'Ano do Modelo',
  marcaModeloDescricao: 'Marca/Modelo',
  dsMarca: 'Marca',
  dsModelo: 'Modelo',
  dsVersao: 'Versão',
  corDescricao: 'Cor',
  combustivelDescricao: 'Combustível',
  dsCombustivel: 'Combustível',
  dsTipoCarroceria: 'Carroceria',
  dsMotor: 'Motor',
  dsOrigem: 'Origem',
  dsPais: 'País',
  dsRegiao: 'Região',
  dsCategoria: 'Categoria',
  dsLocalFabricacao: 'Local de Fabricação',
  especieDescricao: 'Espécie',
  tipoVeiculoDescricao: 'Tipo de Veículo',
  tipoCarroceriaDescricao: 'Tipo de Carroceria',

  // Proprietário
  nomeProprietario: 'Nome do Proprietário',
  numeroIdentificacaoProprietario: 'CPF/CNPJ do Proprietário',
  possuidorNome: 'Nome do Possuidor',
  possuidorNumeroDocumento: 'Documento do Possuidor',
  municipioEmplacamentoDescricao: 'Município de Emplacamento',
  ufJurisdicao: 'UF',

  // Indicadores
  indicadorRouboFurto: 'Roubo/Furto',
  indicadorLeilao: 'Leilão',
  indicadorComunicacaoVenda: 'Comunicado de Venda',
  indicadorMultaRenainf: 'Multa Renainf',
  indicadorAlarme: 'Alarme',
  indicadorPendenciaEmissao: 'Pendência de Emissão',
  indicadorOstentaPIV: 'Ostenta PIV',
  indicadorRestricaoRenajud: 'Restrição Renajud',
  restricaoRfbIndicador: 'Restrição RFB',
  restricaoRfbDescricao: 'Descrição Restrição RFB',

  // Restrições
  restricao1Descricao: 'Restrição 1',
  restricao2Descricao: 'Restrição 2',
  restricao3Descricao: 'Restrição 3',
  restricao4Descricao: 'Restrição 4',

  // FIPE
  dsCodigo: 'Código FIPE',
  nuValor: 'Valor Atual (R$)',
  nuValorZeroKM: 'Valor 0km (R$)',
  mesRefFipeZeroKM: 'Referência 0km',
  dsNuValor: 'Valor (R$)',

  // Recall
  recallQuantidade: 'Quantidade de Recalls',
  recallQuantidadeReal: 'Recalls Confirmados',

  // Geral
  situacao: 'Situação',
  procedencia: 'Procedência',
  message: 'Situação',
  status: 'Status',
  data: 'Dados',
}

// Functions que auxiliam na criação

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não'
  if (typeof value === 'number') return value.toLocaleString('pt-BR')
  if (typeof value === 'string' && value.trim() === '') return '-'
  return String(value) 
}

function drawLine(doc: PDFKit.PDFDocument, y?: number) {
  const lineY = y ?? doc.y
  doc.strokeColor(COLORS.border).lineWidth(0.5)
    .moveTo(50, lineY).lineTo(545, lineY).stroke()
  doc.lineWidth(1)  
}

function drawSectionHeader(doc: PDFKit.PDFDocument, title: string, icon: string) {
  doc.moveDown(0.8)

  // Fundo azul escuro
  const y = doc.y
  doc.rect(50, y, 495, 26).fill(COLORS.primary)

  doc
    .fillColor(COLORS.white)
    .fontSize(11)
    .font('Helvetica-Bold')
    .text(`${icon} ${title}`, 58, y + 7, { width: 479 })
  doc.font('Helvetica').moveDown(0.6)
}

function drawFieldRow(
  doc: PDFKit.PDFDocument,
  label: string,
  value: string,
  isAlternate: boolean
) {
  const y = doc.y
  const rowHeight = 18

  if (isAlternate) {
    doc.rect(50, y, 495, rowHeight).fill(COLORS.bgLight)
  }

  doc.fillColor(COLORS.textLight).fontSize(9).font('Helvetica-Bold')
    .text(label, 58, y + 4, { width: 180, continued: false })
  
    doc.fillColor(COLORS.text).fontSize(9).font('Helvetica')
      .text(value, 242, y + 4, { width: 295 })

    doc.y = y + rowHeight    
}

function drawIndicatorBadge(
  doc: PDFKit.PDFDocument,
  label: string,
  value: boolean | null | undefined,
  x: number,
  y: number
) {
  const isPositive = value === true
  const isNull = value === null || value === undefined
  const bgColor = isNull ? COLORS.border : isPositive ? '#fef2f2': '#f0fdf4'
  const textColor = isNull ? COLORS.textMuted : isPositive ? COLORS.danger : COLORS.success
  const icon = isNull ? '?' : isPositive ? 'x' : '✓'

  doc.rect(x, y, 155, 32).fill(bgColor)
  doc.rect(x, y, 155, 32).stroke(isNull ? COLORS.border : isPositive ? '#fca5a5' : '#86efac')

  doc.fillColor(textColor).fontSize(8).font('Helvetica-Bold')
    .text(`${icon} ${label}`, x + 6, y + 5, { width: 143 })
  
  doc.fillColor(textColor).fontSize(7).font('Helvetica')
    .text(isNull ? 'Sem informação' : isPositive ? 'Consta' : 'Não consta', x + 6, y + 17, { width: 143 })
}

// Especificações para endpoints

function renderDecodificador(doc: PDFKit.PDFDocument, retorno: Record<string, unknown>) {
  drawSectionHeader(doc, 'Identificação do Veículo (FIPE)', '')

  const camposVeiculo = [
    'dsMarca', 'dsModelo', 'dsVersao', 'nuAnoModelo',
    'dsTipoCarroceria', 'dsMotor', 'dsCombustivel',
    'dsOrigem', 'dsPais', 'dsCategoria',
  ]

  let alt = false
  for (const campo of camposVeiculo) {
    if (retorno[campo] !== null && retorno[campo] !== undefined) {
      const label = FIELDS_LABELS[campo] ?? campo
      drawFieldRow(doc, label, formatValue(retorno[campo]), alt)
      alt = !alt
    }
  }

  const fipe = retorno['precificadorIHistFipe'] as Array<Record<string, unknown>> | undefined
  if (fipe && fipe.length > 0) {
    const item = fipe[0]
    if (!item) return
    doc.moveDown(0.6)
    doc.fillColor(COLORS.primary).fontSize(10).font('Helvetica-Bold')
      .text('Tabela FIPE', 58)
    doc.font('Helvetica').moveDown(0.3)
    
    alt = false
    const camposFipe = ['dsCodigo', 'nuValor', 'nuValorZeroKM', 'mesRefFipeZeroKM']
    for (const campo of camposFipe) {
      const valor = item[campo]
      if (valor !== null && valor !== undefined) {
        const label = FIELDS_LABELS[campo] ?? campo
        let val = formatValue(valor)
        if ((campo === 'nuValor' || campo === 'nuValorZeroKM') && typeof valor === 'number') {
          val = `R$ ${valor.toLocaleString('pt-BR')}`
        }
        drawFieldRow(doc, label, val, alt)
        alt = !alt
      }
    }

    const hist = item['historio12Meses'] as Array<Record<string,unknown>> | undefined
    if (hist && hist.length > 0) {
      doc.moveDown(0.6)
      doc.fillColor(COLORS.primary).fontSize(10).font('Helvetica-Bold')
        .text('Histórico de Preços (12 meses)', 58)
      doc.font('Helvetica').moveDown(0.3)
      
      for (let i = 0; i < hist.length; i++) {
        const entrada = hist[i]
        if (!entrada) continue
        drawFieldRow(
          doc,
          String(entrada['anoMes'] ?? ''),
          String(entrada['valor'] ?? ''),
          i % 2 === 0
        )
      }
    }
  }
}
function renderCsv(doc: PDFKit.PDFDocument, retorno: Record<string, unknown>) {
  drawSectionHeader(doc, 'Dados do Veículo (DETRAN)', '')

  const camposBasicos = [
    'placa', 'chassi', 'codigoRenavam', 'nomeProprietario',
    'numeroIdentificacaoProprietario', 'municipioEmplacamentoDescricao',
    'ufJurisdicao', 'anoFabricacao', 'anoModelo',
    'marcaModeloDescricao', 'corDescricao', 'combustivelDescricao',
    'especieDescricao', 'tipoVeiculoDescricao', 'situacao', 'procedencia',
  ]

  let alt = false
  for (const campo of camposBasicos) {
    if(retorno[campo] !== null && retorno[campo] !== undefined) {
      drawFieldRow(doc, FIELDS_LABELS[campo] ?? campo, formatValue(retorno[campo]), alt)
      alt = !alt
    }
  }
  
  doc.moveDown(0.8)
  doc.fillColor(COLORS.primary).fontSize(10).font('Helvetica-Bold')
    .text('Indicadores', 58)
  doc.font('Helvetica').moveDown(0.4)  

  const indicadores = [
    { campo: 'indicadorRouboFurto', label: 'Roubo/Furto'},
    { campo: 'indicadorLeilao', label: 'Leilão' },
    { campo: 'indicadorComunicacaoVenda', label: 'Comunicado de Venda' },
    { campo: 'indicadorMultaRenainf', label: 'Multa Renainf' },
  ]

  const startY = doc.y
  indicadores.forEach((ind, i) => {
    const col = i % 3
    const row = Math.floor(i / 3)
    drawIndicatorBadge(
      doc,
      ind.label,
      retorno[ind.campo] as boolean | null,
      50 + col * 165,
      startY + row * 40
    )
  })

  doc.y = startY + Math.ceil(indicadores.length / 3) * 40 + 8

  const restricoes = ['restricao1Descricao', 'restricao2Descricao', 'restricao3Descricao', 'restricao4Descricao']
  const restricoesPresentes = restricoes.filter(r => retorno[r])

  if (restricoesPresentes.length > 0) {
    doc.moveDown(0.6)
    doc.fillColor(COLORS.danger).fontSize(10).font('Helvetica-Bold')
      .text('Restrições', 58)
    doc.font('Helvetica').moveDown(0.3)  

    restricoesPresentes.forEach((r, i) => {
      drawFieldRow(doc, `Restrição ${i + 1}`, formatValue(retorno[r]), i % 2 === 0)
    })
  }

  if (retorno['pdfUrl']) {
    doc.moveDown(0.6)
    doc.fillColor(COLORS.secondary).fontSize(9).font('Helvetica')
      .text(`PDF original disponível em sistema`, 58)
  }
}

function renderRenajud(doc: PDFKit.PDFDocument, retorno: Record<string, unknown>) {
  drawSectionHeader(doc, 'Restrições Judiciais (RENAJUD)', '')

  const data = retorno['data'] as Record<string, unknown> | undefined
  const message = data?.['message'] && retorno['message']

  if (message) {
    const isOk = String(message).toLowerCase().includes('Não constam')
    doc.moveDown(0.4)
    doc.rect(50, doc.y, 495, 36)
      .fill(isOk ? '#f0fdf4' : '#fef2f2')
    
    doc.fillColor(isOk ? COLORS.success : COLORS.danger)
      .fontSize(10).font('Helvetica-Bold')
      .text(
        isOk ? 'Nada consta' : 'Atenção',
        58, doc.y - 30, { width:479 }
      )
  
    doc.fillColor(isOk ? COLORS.success : COLORS.danger)
      .fontSize(9).font('Helvetica')
      .text(String(message), 58, doc.y - 16, { width: 479 })
    
    doc.moveDown(0.8)
  } else {
    // Caso de dados estruturados

    let alt = false
    for (const [k, v] of Object.entries(retorno)) {
      if (CAMPOS_IGNORADOS.has(k) || v === null || v === undefined) continue
      drawFieldRow(doc, FIELDS_LABELS[k] ?? k, formatValue(v), alt)
      alt = !alt
    }
  }          
}

function renderGeneric(
  doc: PDFKit.PDFDocument,
  endpoint: string,
  retorno: Record<string, unknown>,
  label: string
) {
  drawSectionHeader(doc, label, '📄')

  const data = retorno['data'] as Record<string, unknown> | undefined
  const message = data?.['message'] ?? retorno['message']

  if (message) {
    doc.moveDown(0.4)
    const isOk = String(message).toLowerCase().includes('Não constam') ||
      String(message).toLowerCase().includes('Nada consta')
    
    doc.rect(50, doc.y, 495, 36)
      .fill(isOk ? '#f0fdf4' : '#fef2f2')
    
    doc.fillColor(isOk ? COLORS.success : COLORS.danger)
      .fontSize(10).font('Helvetica-Bold')
      .text(isOk ? 'Nada consta' : 'Atenção', 58, doc.y - 30, { width: 479 })
    
    doc.fillColor(isOk ? COLORS.success : COLORS.danger)
      .fontSize(9).font('Helvetica')
      .text(String(message), 58, doc.y - 16, { width: 479 })
    
    doc.moveDown(0.8)
    return  
  }

  let alt = false
  for (const [k, v] of Object.entries(retorno)) {
    if (CAMPOS_IGNORADOS.has(k)) continue
    if (v === null || v === undefined) continue
    if (typeof v === 'object' && !Array.isArray(v)) continue

    const fieldLabel = FIELDS_LABELS[k] ?? k
    drawFieldRow(doc, fieldLabel, formatValue(v), alt)
    alt = !alt
  }
}

// Função de geração

export function generateOrderReportPdf(order: IOrder): { relativePath: string; absolutePath: string } {
  const fileName = `relatorio-${order._id}.pdf`
  const absolutePath = path.join(OUTPUT_DIR, fileName)
  const relativePath = `/reports/${fileName}`

  const doc = new PDFDocument({ 
    size: 'A4', 
    margin: 50,
    info: {
      Title: `Relatório de Consulta Veicular - ${order.placa}`,
      Author: `LS Serviços de Engenharia LTDA`,
    },
  })

  const stream = fs.createWriteStream(absolutePath)
  doc.pipe(stream)

  // ─── Cabeçalho ──────────────────────────────────────────────────────────────
  doc.rect(0, 0, 595, 90).fill(COLORS.primary)

  // Logo
  const logoExists = fs.existsSync(LOGO_PATH)
  if (logoExists) {
    doc.image(LOGO_PATH, 50, 12, { height: 66 })
  }

  // Título próximo a logo

  const titleX = logoExists ? 160 : 50
  doc.fillColor(COLORS.white).fontSize(18).font('Helvetica-Bold')
    .text('Relatório de Consulta Veicular', titleX, 22, { width: 395 - (logoExists ? 110 : 0) })
  
  doc.fillColor('#93c5fd').fontSize(10).font('Helvetica')
    .text('LS Serviços de Engenharia LTDA', titleX, 46, { width: 395 })
  
  doc.fillColor('#bfdbfe').fontSize(9)
    .text(`Emitido em: ${new Date().toLocaleString('pt-BR')}`, titleX, 62, { width: 395 })
  
  doc.y = 100  

  // Dados do pedido

  doc.rect(50, doc.y, 495, 56).fill(COLORS.bgLight).stroke(COLORS.border)

  const infoY = doc.y + 10

  doc.fillColor(COLORS.primary).fontSize(22).font('Helvetica-Bold')
    .text(order.placa, 65, infoY)
  
  doc.fillColor(COLORS.textLight).fontSize(9).font('Helvetica')
    .text('Placa consultada', 65, infoY + 26)
  
  const tipoLabel = order.orderType === 'report' && order.reportType
    ? REPORT_LABELS[order.reportType]
    : 'Consulta avulsa'
  
  doc.fillColor(COLORS.text).fontSize(10).font('Helvetica-Bold')
    .text(tipoLabel, 200, infoY, { width: 200 })
  
  doc.fillColor(COLORS.textLight).fontSize(9).font('Helvetica')
    .text('Tipo de relatório', 200, infoY + 16)
  
  doc.fillColor(COLORS.text).fontSize(10).font('Helvetica-Bold')
    .text(`${order.endpoints.length} itens`, 200, infoY + 32)
  
  doc.fillColor(COLORS.textLight).fontSize(9).font('Helvetica')
    .text(new Date(order.createdAt).toLocaleDateString('pt-BR'), 380, infoY + 32)
  
  doc.y = infoY + 66

  // ─── Resultados por endpoint ──────────────────────────────────────────────
  const results = (order.results ?? {}) as Record<string, unknown>
  const endpoints = order.endpoints as ApiEndpoint[]

  // Separa os erros, dos sucessos

  const endpointsOk = endpoints.filter(ep => {
    const d = results[ep]
    return d && !(typeof d === 'object' && 'error' in (d as Record<string, unknown>))
  })
  const endpointsErro = endpoints.filter(ep => {
    const d = results[ep]
    return !d || (typeof d === 'object' && 'error' in (d as Record<string, unknown>))
  })

  for (const endpoint of endpointsOk) {
    const raw = results[endpoint] as Record<string, unknown>
    const retorno = (raw['retorno'] ?? raw) as Record<string, unknown>

    // Checa necessidade de página nova

    if (doc.y > 680) doc.addPage()

    if (endpoint === 'decodificador') {
      renderDecodificador(doc, retorno)
    } else if (endpoint === 'csv' || endpoint === 'csv2') {
      renderCsv(doc, retorno)
    } else if (endpoint === 'renajud') {
      renderRenajud(doc, retorno)
    } else {
      const label = endpoint
      renderGeneric(doc, endpoint, retorno, label)
    }

    doc.moveDown(0.5)
  }

  // Itens com erro
  if (endpointsErro.length > 0) {
    if (doc.y > 680) doc.addPage()
      drawSectionHeader(doc, 'Itens não disponíveis', '')

    doc.moveDown(0.3)
    for (const ep of endpointsErro) {
      const err = results[ep] as Record<string, unknown> | undefined
      doc.fillColor(COLORS.danger).fontSize(9).font('Helvetica')
        .text(`• ${ep}: ${err?.error ?? 'Não foi possível obter este item'}`, 58)
      doc.moveDown(0.2)  
    }
  }
 

  // ─── Rodapé ─────────────────────────────────────────────────────────────────
  doc.moveDown(1.5)
  drawLine(doc)
  doc.moveDown(0.4)

  doc.rect(50, doc.y, 495, 42).fill(COLORS.bgLight)

  doc.fillColor(COLORS.textMuted).fontSize(7.5).font('Helvetica')
    .text(
      'Este relatório é gerado automaticamente com base em dados de fontes públicas e do provedor de consultas veiculares. ' +
      'A LS Serviços de Engenharia não se responsabiliza por eventuais desatualizações ou inconsistências nos dados fornecidos por terceiros. ' +
      'Para fins legais, consulte sempre os órgãos oficiais.',
      58, doc.y + 6,
      { width: 479, align: 'justify' }
    )

  doc.end()

  return { relativePath, absolutePath }
}