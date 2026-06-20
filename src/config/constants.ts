// ─── Relatórios prontos (combos fixos de endpoints) 

export const REPORTS = {
  CHECK_BASIC: 'check_basic',
  CHECK_PRO: 'check_pro',
  CHECK_PREMIUM: 'check_premium',
  CHECK_LEILAO_SINISTRO: 'check_leilao_sinistro',
  CHECK_LEILAO_COMPLETO: 'check_leilao_completo',
} as const

export type ReportType = (typeof REPORTS)[keyof typeof REPORTS]



export const REPORT_PRICES: Record<ReportType, number> = {
  [REPORTS.CHECK_BASIC]: 19.20,
  [REPORTS.CHECK_PRO]: 39.90,
  [REPORTS.CHECK_PREMIUM]: 54.20,
  [REPORTS.CHECK_LEILAO_SINISTRO]: 35.50,
  [REPORTS.CHECK_LEILAO_COMPLETO]: 24.90,
}



export const API_COSTS = {
  binnacional: 1.95,
  binnacional_v2: 1.95,
  binestadual: 1.95,
  csv: 2.60,
  csv2: 3.00,
  veiculoDoc: 5.96,
  veiculoDoc_excedente: 0.75,
  veiculoDoc2: 4.70,

  crlv: 9.00,
  crlvsp: 12.00,
  crlvsp3: 12.00,
  debitosveiculares: 2.50,

  renajud: 2.93,
  detalhesgravame: 2.60,
  detalhesGravameHist: 3.58,
  roubofurto: 2.47,
  roubofurto2: 2.50,

  Leilao1: 3.54,
  Leilao2: 6.48,
  Leilao3: 1.89,
  LeilaoRemarketing: 3.90,

  IndicioSinistro: 0.94,
  IndicioSinistro1: 1.35,
  Remarketing: 1.30,

  comunicadoVenda: 23.00,

  Agregados: 0.39,
  decodificador: 0.98,
  ParecerTecnico: 2.41,
  historicoProprietario: 2.00,
  recall: 1.20,

  FlagCNH: 0.68,
  cnh: 2.55,
  cnh2: 2.55,
  cnhplus: 2.30,
} as const

export type ApiEndpoint = keyof typeof API_COSTS



export const ENDPOINT_SALE_PRICES: Record<ApiEndpoint, number> = {
  binnacional: 4.50,
  binnacional_v2: 4.50,
  binestadual: 4.50,
  csv: 5.90,
  csv2: 6.50,
  veiculoDoc: 12.90,
  veiculoDoc_excedente: 2.00,
  veiculoDoc2: 10.50,

  crlv: 19.90,
  crlvsp: 24.90,
  crlvsp3: 24.90,
  debitosveiculares: 6.50,

  renajud: 6.90,
  detalhesgravame: 6.50,
  detalhesGravameHist: 7.90,
  roubofurto: 5.90,
  roubofurto2: 5.90,

  Leilao1: 8.90,
  Leilao2: 13.90,
  Leilao3: 5.90,
  LeilaoRemarketing: 8.90,

  IndicioSinistro: 3.50,
  IndicioSinistro1: 4.50,
  Remarketing: 3.90,

  comunicadoVenda: 39.90,

  Agregados: 2.50,
  decodificador: 3.50,
  ParecerTecnico: 6.90,
  historicoProprietario: 5.90,
  recall: 3.90,

  FlagCNH: 2.50,
  cnh: 6.50,
  cnh2: 6.50,
  cnhplus: 6.50,
}


export const REPORT_ENDPOINTS: Record<ReportType, ApiEndpoint[]> = {
  [REPORTS.CHECK_BASIC]: [
    'binnacional',
    'binestadual',
    'roubofurto2',
    'renajud',
    'recall',
  ],
  [REPORTS.CHECK_PRO]: [
    'binnacional',
    'binestadual',
    'csv',
    'renajud',
    'detalhesGravameHist',
    'recall',
    'IndicioSinistro',
    'IndicioSinistro1',
    'decodificador',
  ],
  [REPORTS.CHECK_PREMIUM]: [
    'binnacional_v2',
    'binestadual',
    'csv',
    'roubofurto2',
    'Leilao2',
    'LeilaoRemarketing',
    'Leilao3',
    'IndicioSinistro',
    'IndicioSinistro1',
    'decodificador',
    'historicoProprietario',
  ],
  [REPORTS.CHECK_LEILAO_SINISTRO]: [
    'IndicioSinistro',
    'IndicioSinistro1',
    'Leilao2',
    'LeilaoRemarketing',
    'Leilao3',
  ],
  [REPORTS.CHECK_LEILAO_COMPLETO]: [
    'Leilao2',
    'LeilaoRemarketing',
    'Leilao3',
  ],
}



export const REPORT_API_COST: Record<ReportType, number> = Object.fromEntries(
  Object.entries(REPORT_ENDPOINTS).map(([report, endpoints]) => [
    report,
    Number(
      endpoints.reduce((sum, ep) => sum + API_COSTS[ep], 0).toFixed(2)
    ),
  ])
) as Record<ReportType, number>



export function calculateCustomOrderPrice(endpoints: ApiEndpoint[]): {
  totalCost: number
  totalPrice: number
  profit: number
} {
  const totalCost = Number(
    endpoints.reduce((sum, ep) => sum + API_COSTS[ep], 0).toFixed(2)
  )
  const totalPrice = Number(
    endpoints.reduce((sum, ep) => sum + ENDPOINT_SALE_PRICES[ep], 0).toFixed(2)
  )
  const profit = Number((totalPrice - totalCost).toFixed(2))

  return { totalCost, totalPrice, profit }
}

export const PROVIDER_ENDPOINT_PATH: Record<ApiEndpoint, string> = {
  binnacional: '/Consultas/binnacional',
  binnacional_v2: '/Consultas/binnacional2',
  binestadual: '/Consultas/binestadual',
  csv: '/Consultas/csv',
  csv2: '/Consultas/csv2',
  veiculoDoc: '/Consultas/veiculoDoc',
  veiculoDoc_excedente: '/Consultas/veiculoDoc',
  veiculoDoc2: '/Consultas/veiculoDoc2',
  crlv: '/Consultas/crlv',
  crlvsp: '/Consultas/crlvsp',
  crlvsp3: '/Consultas/crlvsp3',
  debitosveiculares: '/Consultas/DebitosVeiculares',
  renajud: '/Consultas/renajud',
  detalhesgravame: '/Consultas/detalhesgravame',
  detalhesGravameHist: '/Consultas/detalhesGravameHist',
  roubofurto: '/Consultas/roubofurto',
  roubofurto2: '/Consultas/roubofurto2',
  Leilao1: '/Consultas/Leilao1',
  Leilao2: '/Consultas/Leilao2',
  Leilao3: '/Consultas/Leilao3',
  LeilaoRemarketing: '/Consultas/LeilaoRemarketing',
  IndicioSinistro: '/Consultas/IndicioSinistro',
  IndicioSinistro1: '/Consultas/IndicioSinistro1',
  Remarketing: '/Consultas/Remarketing',
  comunicadoVenda: '/Consultas/comunicadoVenda',
  Agregados: '/Consultas/Agregados',
  decodificador: '/Consultas/decodificador',
  ParecerTecnico: '/Consultas/ParecerTecnico',
  historicoProprietario: '/Consultas/historicoprop',
  recall: '/Consultas/recall',
  FlagCNH: '/Consultas/FlagCNH',
  cnh: '/Consultas/cnh',
  cnh2: '/Consultas/cnh2',
  cnhplus: '/Consultas/cnhplus', 
}

export const ENDPOINT_LABELS: Record<ApiEndpoint, string> = {
  binnacional: 'Consulta Nacional',
  binnacional_v2: 'Consulta Nacional V2',
  binestadual: 'Consulta Estadual',
  csv: 'CSV',
  csv2: 'CSV 2',
  veiculoDoc: 'Consulta de Frotas',
  veiculoDoc_excedente: 'Excedente por Placa',
  veiculoDoc2: 'VeiculoDoc 2',
  crlv: 'CRLV Nacional',
  crlvsp: 'CRLV SP',
  crlvsp3: 'CRLV SP 3',
  debitosveiculares: 'Débitos Veiculares',
  renajud: 'Renajud',
  detalhesgravame: 'Detalhes do Gravame',
  detalhesGravameHist: 'Histórico de Gravame',
  roubofurto: 'Histórico de Roubo e Furto',
  roubofurto2: 'Roubo e Furto 2',
  Leilao1: 'Leilão (Info)',
  Leilao2: 'Leilão (ABS - Completo)',
  Leilao3: 'Leilão (ABS - Básico)',
  LeilaoRemarketing: 'Leilão Remarketing',
  IndicioSinistro: 'Indício de Sinistro',
  IndicioSinistro1: 'Indício de Sinistro (ABS)',
  Remarketing: 'Remarketing',
  comunicadoVenda: 'Comunicado de Venda',
  Agregados: 'Agregados',
  decodificador: 'Decodificador FIPE',
  ParecerTecnico: 'Parecer Técnico',
  historicoProprietario: 'Histórico de Proprietário',
  recall: 'Recall',
  FlagCNH: 'Flag CNH',
  cnh: 'CNH',
  cnh2: 'CNH 2',
  cnhplus: 'CNH Plus',  
}

export const REPORT_LABELS: Record<ReportType, string> = {
  [REPORTS.CHECK_BASIC]: 'Check Basic',
  [REPORTS.CHECK_PRO]: 'Check Pro',
  [REPORTS.CHECK_PREMIUM]: 'Check Premium',
  [REPORTS.CHECK_LEILAO_SINISTRO]: 'Check Leilão & Sinistro',
  [REPORTS.CHECK_LEILAO_COMPLETO]: 'Check Leilão Completo',
}
