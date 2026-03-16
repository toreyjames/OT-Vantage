// Real-time monitoring types

export interface PolicyUpdate {
  id: string
  title: string
  source: 'federal-register' | 'white-house' | 'congress' | 'agency' | 'news'
  sourceUrl: string
  publishedAt: Date
  summary: string
  agencies?: string[]
  documentType?: string
  relevantPolicies: PolicyCategory[]
  impactScore: number // 1-10, how significant
  discoveredAt: Date
  analyzed: boolean
}

export type PolicyCategory = 
  | 'eo-14179-ai-leadership'
  | 'genesis-mission'
  | 'stargate-project'
  | 'eo-14365-national-ai-framework'
  | 'ai-action-plan'
  | 'chips-sovereignty'
  | 'energy-dominance'
  | 'nuclear-restart'

export interface OpportunitySignal {
  id: string
  source: 'sec-filing' | 'press-release' | 'government-contract' | 'news' | 'state-announcement'
  sourceUrl: string
  company?: string
  title: string
  summary: string
  estimatedValue?: number
  location?: {
    state: string
    city?: string
  }
  sector: 'semiconductors' | 'data-centers' | 'energy' | 'nuclear' | 'ai-infrastructure'
  relevantPolicies: PolicyCategory[]
  confidenceScore: number // 0-1, how confident we are this is relevant
  discoveredAt: Date
  status: 'new' | 'reviewing' | 'added-to-pipeline' | 'dismissed'
}

export interface FeedSource {
  id: string
  name: string
  type: 'rss' | 'api' | 'scraper'
  url: string
  enabled: boolean
  lastChecked?: Date
  lastSuccess?: Date
  errorCount: number
  checkIntervalMinutes: number
}

export interface SystemStatus {
  lastSync: Date
  policiesMonitored: number
  opportunitiesDiscovered: number
  pendingReview: number
  feedsActive: number
  feedsError: number
  aiClassifierStatus: 'active' | 'rate-limited' | 'error'
}

export interface MonitoringConfig {
  feeds: FeedSource[]
  aiEnabled: boolean
  autoClassify: boolean
  notifyOnHighImpact: boolean
  syncIntervalMinutes: number
}


