/**
 * OT Radar Signal Schema
 *
 * Shared contract between OT Radar (data collection layer on Vercel)
 * and OT Vantage (intelligence/analysis layer).
 *
 * OT Radar normalizes data from SAM.gov, USASpending, FPDS, EPA,
 * SEC EDGAR, EIA, and other feeds into this common format.
 */

export type RadarSource =
  | 'sam.gov'
  | 'usaspending'
  | 'fpds'
  | 'epa'
  | 'sec-edgar'
  | 'eia'
  | 'fred'
  | 'fda'
  | 'federal-register'
  | 'news-rss'

export type RadarSignalType =
  | 'rfp'
  | 'contract-award'
  | 'facility-permit'
  | 'enforcement'
  | 'capex-disclosure'
  | 'cyber-incident'
  | 'funding-flow'
  | 'expansion'
  | 'regulatory-action'
  | 'risk-disclosure'
  | 'inspection'
  | 'modification'

export type RadarSector =
  | 'defense'
  | 'aerospace'
  | 'life-sciences'
  | 'pharma'
  | 'nuclear'
  | 'semiconductor'
  | 'data-center'
  | 'energy'
  | 'critical-minerals'
  | 'ev-battery'
  | 'manufacturing'
  | 'chemical'
  | 'water'
  | 'oil-gas'

export interface OTRadarSignal {
  id: string
  source: RadarSource
  sourceId: string
  timestamp: string

  entity: string
  sector: RadarSector
  signalType: RadarSignalType

  location?: string
  value?: number
  description: string
  url: string

  otRelevanceScore: number
  otKeywords: string[]
  rawData?: Record<string, unknown>
}

export interface RadarFetchOptions {
  sector?: RadarSector | RadarSector[]
  since?: string
  signalType?: RadarSignalType | RadarSignalType[]
  minRelevance?: number
  limit?: number
}

export interface RadarResponse {
  success: boolean
  signals: OTRadarSignal[]
  meta: {
    total: number
    filtered: number
    timestamp: string
    source: string
  }
}
