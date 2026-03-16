/**
 * Base Agent Class
 * 
 * Abstract base class that all strategic, sector, and capability agents extend.
 * Provides common functionality for:
 * - Data fetching and processing
 * - Insight generation and scoring
 * - State management and persistence
 */

import {
  AgentId,
  AgentType,
  AgentConfig,
  AgentInsight,
  AgentRunResult,
  AgentStatus,
  InsightType,
  InsightPriority,
  InsightSource,
  SuggestedAction,
} from './types'
import { fetchRelevantNews, NewsItem } from '../services/news-feed'
import { loadSignals, loadPolicyUpdates } from '../store'
import { fetchRadarSignals } from '../services/radar-client'
import { OTRadarSignal } from '../types/ot-radar-signal'

// ============================================================================
// BASE AGENT CLASS
// ============================================================================

export abstract class BaseAgent {
  protected config: AgentConfig
  protected status: AgentStatus
  
  constructor(config: Partial<AgentConfig> & { id: AgentId; name: string; type: AgentType }) {
    this.config = {
      id: config.id,
      name: config.name,
      type: config.type,
      description: config.description || '',
      enabled: config.enabled ?? true,
      runIntervalMinutes: config.runIntervalMinutes ?? 60,
      keywords: config.keywords || [],
      sectors: config.sectors,
      policyAreas: config.policyAreas,
      minConfidenceThreshold: config.minConfidenceThreshold ?? 0.5,
      maxInsightsPerRun: config.maxInsightsPerRun ?? 10,
      totalInsightsGenerated: 0,
      insightsActioned: 0,
      successRate: 1.0,
    }
    
    this.status = {
      agentId: config.id,
      status: 'idle',
      insightsFoundLastRun: 0,
      healthScore: 100,
    }
  }
  
  // ============================================================================
  // ABSTRACT METHODS - Must be implemented by subclasses
  // ============================================================================
  
  /**
   * Main analysis method - each agent implements its own logic
   */
  abstract analyze(data: AgentDataContext): Promise<AgentInsight[]>
  
  /**
   * Get the specific keywords this agent looks for
   */
  abstract getKeywords(): string[]
  
  /**
   * Get queries for news search
   */
  abstract getSearchQueries(): string[]
  
  // ============================================================================
  // PUBLIC METHODS
  // ============================================================================
  
  /**
   * Run the agent
   */
  async run(): Promise<AgentRunResult> {
    const startedAt = new Date()
    this.status.status = 'running'
    this.status.lastRun = startedAt
    
    try {
      // Gather data context
      const dataContext = await this.gatherDataContext()
      
      // Run analysis
      const insights = await this.analyze(dataContext)
      
      // Filter by confidence threshold
      const filteredInsights = insights
        .filter(i => i.confidence >= this.config.minConfidenceThreshold)
        .slice(0, this.config.maxInsightsPerRun)
      
      // Calculate duplicates
      const duplicatesSkipped = insights.length - filteredInsights.length
      
      // Update stats
      this.config.totalInsightsGenerated += filteredInsights.length
      this.status.insightsFoundLastRun = filteredInsights.length
      this.status.status = 'idle'
      this.status.healthScore = 100
      
      const completedAt = new Date()
      
      return {
        agentId: this.config.id,
        startedAt,
        completedAt,
        durationMs: completedAt.getTime() - startedAt.getTime(),
        success: true,
        insightsGenerated: filteredInsights,
        itemsProcessed: dataContext.newsItems.length + dataContext.signals.length + dataContext.radarSignals.length,
        duplicatesSkipped,
      }
    } catch (error) {
      this.status.status = 'error'
      this.status.lastError = error instanceof Error ? error.message : 'Unknown error'
      this.status.healthScore = Math.max(0, this.status.healthScore - 20)
      
      const completedAt = new Date()
      
      return {
        agentId: this.config.id,
        startedAt,
        completedAt,
        durationMs: completedAt.getTime() - startedAt.getTime(),
        success: false,
        error: this.status.lastError,
        insightsGenerated: [],
        itemsProcessed: 0,
        duplicatesSkipped: 0,
      }
    }
  }
  
  /**
   * Get agent configuration
   */
  getConfig(): AgentConfig {
    return { ...this.config }
  }
  
  /**
   * Get agent status
   */
  getStatus(): AgentStatus {
    return { ...this.status }
  }
  
  /**
   * Enable/disable the agent
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled
    if (!enabled) {
      this.status.status = 'disabled'
    } else if (this.status.status === 'disabled') {
      this.status.status = 'idle'
    }
  }
  
  // ============================================================================
  // PROTECTED METHODS - For use by subclasses
  // ============================================================================
  
  /**
   * Gather all relevant data for analysis
   */
  protected async gatherDataContext(): Promise<AgentDataContext> {
    // Fetch fresh news using agent-specific queries
    const queries = this.getSearchQueries()
    const newsItems = queries.length > 0 
      ? await fetchRelevantNews(queries)
      : await fetchRelevantNews()
    
    // Load existing signals and policy updates
    const signals = loadSignals()
    const policyUpdates = loadPolicyUpdates()

    // Fetch structured signals from OT Radar (graceful fallback to [])
    const radarSectors = this.config.sectors as any
    const radarSignals = await fetchRadarSignals({
      sector: radarSectors,
      limit: 100,
    })
    
    return {
      newsItems,
      signals,
      policyUpdates,
      radarSignals,
      timestamp: new Date(),
    }
  }
  
  /**
   * Create a new insight
   */
  protected createInsight(params: CreateInsightParams): AgentInsight {
    const now = new Date()
    
    return {
      id: `insight-${this.config.id}-${now.getTime()}-${Math.random().toString(36).substr(2, 9)}`,
      agentId: this.config.id,
      agentType: this.config.type,
      insightType: params.insightType,
      title: params.title,
      summary: params.summary,
      details: params.details,
      confidence: params.confidence,
      priority: this.calculatePriority(params.confidence, params.impactScore),
      impactScore: params.impactScore,
      relevantOpportunities: params.relevantOpportunities || [],
      relevantSectors: params.relevantSectors || [],
      relevantPolicies: params.relevantPolicies || [],
      relevantCapabilities: params.relevantCapabilities || [],
      suggestedActions: params.suggestedActions || [],
      sources: params.sources || [],
      discoveredAt: now,
      expiresAt: params.expiresAt,
      status: 'new',
      whiteSpaceData: params.whiteSpaceData,
      investmentData: params.investmentData,
    }
  }
  
  /**
   * Calculate priority based on confidence and impact
   */
  protected calculatePriority(confidence: number, impactScore: number): InsightPriority {
    const score = (confidence * 0.4) + ((impactScore / 10) * 0.6)
    
    if (score >= 0.85) return 'critical'
    if (score >= 0.7) return 'high'
    if (score >= 0.5) return 'medium'
    return 'low'
  }
  
  /**
   * Check if text contains any of the given keywords
   */
  protected containsKeywords(text: string, keywords: string[]): boolean {
    const textLower = text.toLowerCase()
    return keywords.some(kw => textLower.includes(kw.toLowerCase()))
  }
  
  /**
   * Count keyword matches in text
   */
  protected countKeywordMatches(text: string, keywords: string[]): number {
    const textLower = text.toLowerCase()
    return keywords.filter(kw => textLower.includes(kw.toLowerCase())).length
  }
  
  /**
   * Extract mentioned companies from text
   */
  protected extractCompanies(text: string): string[] {
    // This is a simplified version - subclasses can override for more sophisticated extraction
    const companyPatterns = [
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:Inc|Corp|LLC|Ltd|Energy|Power|Systems)/g,
    ]
    
    const companies = new Set<string>()
    for (const pattern of companyPatterns) {
      let match
      while ((match = pattern.exec(text)) !== null) {
        companies.add(match[0])
      }
    }
    
    return Array.from(companies)
  }
  
  /**
   * Extract investment amounts from text
   */
  protected extractInvestmentAmount(text: string): number | undefined {
    const patterns = [
      /\$(\d+(?:\.\d+)?)\s*(?:billion|B\b)/i,
      /\$(\d+(?:\.\d+)?)\s*(?:million|M\b)/i,
    ]
    
    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) {
        const amount = parseFloat(match[1])
        const isBillion = /billion|B\b/i.test(match[0])
        return isBillion ? amount * 1000 : amount // Return in millions
      }
    }
    
    return undefined
  }
  
  /**
   * Create a suggested action
   */
  protected createAction(
    action: string,
    rationale: string,
    urgency: SuggestedAction['urgency'] = 'medium-term',
    owner?: string
  ): SuggestedAction {
    return { action, rationale, urgency, owner }
  }
  
  /**
   * Create a source reference
   */
  protected createSource(url: string, title: string, source?: string): InsightSource {
    return {
      url,
      title,
      source,
      publishedAt: new Date().toISOString(),
    }
  }
}

// ============================================================================
// SUPPORTING TYPES
// ============================================================================

export interface AgentDataContext {
  newsItems: NewsItem[]
  signals: any[] // StoredSignal[]
  policyUpdates: any[] // StoredPolicyUpdate[]
  radarSignals: OTRadarSignal[]
  timestamp: Date
}

export interface CreateInsightParams {
  insightType: InsightType
  title: string
  summary: string
  details?: string
  confidence: number
  impactScore: number
  relevantOpportunities?: string[]
  relevantSectors?: string[]
  relevantPolicies?: string[]
  relevantCapabilities?: string[]
  suggestedActions?: SuggestedAction[]
  sources?: InsightSource[]
  expiresAt?: Date
  whiteSpaceData?: AgentInsight['whiteSpaceData']
  investmentData?: AgentInsight['investmentData']
}

// ============================================================================
// COMPETITOR DATA
// ============================================================================

export const COMPETITORS = {
  bigFour: ['Accenture', 'PwC', 'EY', 'KPMG'],
  otSecurity: ['Dragos', 'Claroty', 'Nozomi Networks', 'Armis', 'Forescout'],
  consulting: ['McKinsey', 'BCG', 'Bain'],
  techServices: ['IBM', 'Cognizant', 'Infosys', 'TCS', 'Wipro', 'Capgemini'],
  epcs: ['Bechtel', 'Fluor', 'Jacobs', 'KBR', 'Black & Veatch'],
}

export const DELOITTE_CAPABILITIES = [
  'OT Strategy',
  'Smart Factory',
  'Supply Chain',
  'ERP Implementation',
  'Workforce Planning',
  'Sustainability',
  'Tax Incentives',
  'Cyber Security',
  'AI/ML',
  'Cloud Migration',
  'Digital Twin',
  'Asset Management',
]

export const NICHE_CAPABILITIES = [
  'OT Asset Canonization',
  'Commissioning-to-Operate Security',
  'Industrial AI Security',
  'EPC/Vendor Governance',
  'Build Cycle Intelligence',
]
