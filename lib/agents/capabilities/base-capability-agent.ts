/**
 * Base Capability Agent
 * 
 * Base class for capability-specific agents that monitor opportunities
 * aligned with Deloitte's niche capabilities (from DELOITTE_NICHE_OPPORTUNITIES.md):
 * 1. OT Asset Canonization
 * 2. Commissioning-to-Operate Security
 * 3. Industrial AI Security
 * 4. EPC/Vendor Governance
 * 5. Build Cycle Intelligence
 */

import { BaseAgent, AgentDataContext, NICHE_CAPABILITIES } from '../base-agent'
import { AgentInsight, CapabilityAgentId } from '../types'

// ============================================================================
// CAPABILITY CONFIGURATION
// ============================================================================

export interface CapabilityConfig {
  id: CapabilityAgentId
  name: string
  description: string
  
  // The niche capability this agent represents
  capability: string
  
  // Keywords that signal need for this capability
  demandSignals: string[]
  
  // Project phases where this capability is most relevant
  relevantPhases: ('design' | 'construction' | 'commissioning' | 'operation')[]
  
  // Sectors where this capability is most applicable
  targetSectors: string[]
  
  // Search queries for this capability
  searchQueries: string[]
  
  // Competitive differentiation
  competitors: string[]
  differentiators: string[]
}

export abstract class BaseCapabilityAgent extends BaseAgent {
  protected capabilityConfig: CapabilityConfig
  
  constructor(capabilityConfig: CapabilityConfig) {
    super({
      id: capabilityConfig.id,
      name: capabilityConfig.name,
      type: 'capability',
      description: capabilityConfig.description,
      keywords: capabilityConfig.demandSignals,
      sectors: capabilityConfig.targetSectors,
      runIntervalMinutes: 120,
      minConfidenceThreshold: 0.5,
      maxInsightsPerRun: 12,
    })
    
    this.capabilityConfig = capabilityConfig
  }
  
  getKeywords(): string[] {
    return this.capabilityConfig.demandSignals
  }
  
  getSearchQueries(): string[] {
    return this.capabilityConfig.searchQueries
  }
  
  async analyze(data: AgentDataContext): Promise<AgentInsight[]> {
    const insights: AgentInsight[] = []
    
    for (const news of data.newsItems) {
      const text = `${news.title} ${news.description}`
      
      // Check for demand signals
      const demandInsight = this.analyzeDemandSignal(text, news)
      if (demandInsight) insights.push(demandInsight)
      
      // Check for phase-relevant opportunities
      const phaseInsight = this.analyzeProjectPhase(text, news)
      if (phaseInsight) insights.push(phaseInsight)
      
      // Check for competitive gaps
      const gapInsight = this.analyzeCompetitiveGap(text, news)
      if (gapInsight) insights.push(gapInsight)
    }
    
    // Run capability-specific analysis
    const specificInsights = await this.analyzeCapabilitySpecific(data)
    insights.push(...specificInsights)
    
    // Deduplicate and sort
    return this.deduplicateInsights(insights)
      .sort((a, b) => b.confidence - a.confidence)
  }
  
  /**
   * Override this for capability-specific analysis
   */
  protected abstract analyzeCapabilitySpecific(data: AgentDataContext): Promise<AgentInsight[]>
  
  // ============================================================================
  // ANALYSIS METHODS
  // ============================================================================
  
  private analyzeDemandSignal(text: string, news: any): AgentInsight | null {
    const textLower = text.toLowerCase()
    
    // Count demand signal matches
    const matchedSignals = this.capabilityConfig.demandSignals.filter(signal =>
      textLower.includes(signal.toLowerCase())
    )
    
    if (matchedSignals.length < 2) return null
    
    // Check for sector relevance
    const matchedSectors = this.capabilityConfig.targetSectors.filter(sector =>
      textLower.includes(sector.toLowerCase())
    )
    
    const confidence = 0.5 + (matchedSignals.length * 0.1) + (matchedSectors.length * 0.1)
    
    return this.createInsight({
      insightType: 'capability-gap',
      title: `${this.capabilityConfig.capability} Demand Signal`,
      summary: `Market demand detected for ${this.capabilityConfig.capability}. Signals: ${matchedSignals.join(', ')}. ${news.title}`,
      details: text.slice(0, 500),
      confidence: Math.min(0.9, confidence),
      impactScore: 7,
      relevantSectors: matchedSectors,
      relevantCapabilities: [this.capabilityConfig.capability],
      suggestedActions: [
        this.createAction(
          `Pursue opportunity for ${this.capabilityConfig.capability}`,
          `Direct demand signal detected`,
          'short-term',
          'BD Team'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
    })
  }
  
  private analyzeProjectPhase(text: string, news: any): AgentInsight | null {
    const textLower = text.toLowerCase()
    
    const phaseKeywords: Record<string, string[]> = {
      design: ['design phase', 'engineering', 'architecture', 'planning', 'FEED'],
      construction: ['construction', 'building', 'erecting', 'EPC', 'contractor'],
      commissioning: ['commissioning', 'startup', 'go-live', 'first production', 'handover'],
      operation: ['operations', 'operating', 'production', 'maintenance', 'ongoing'],
    }
    
    // Find matching phases
    const matchedPhases = this.capabilityConfig.relevantPhases.filter(phase =>
      phaseKeywords[phase].some(kw => textLower.includes(kw))
    )
    
    if (matchedPhases.length === 0) return null
    
    // Must also have sector relevance
    const hasSectorRelevance = this.capabilityConfig.targetSectors.some(sector =>
      textLower.includes(sector.toLowerCase())
    )
    
    if (!hasSectorRelevance) return null
    
    const investmentAmount = this.extractInvestmentAmount(text)
    
    return this.createInsight({
      insightType: 'signal',
      title: `${this.capabilityConfig.capability}: ${matchedPhases[0].charAt(0).toUpperCase() + matchedPhases[0].slice(1)} Phase`,
      summary: `Project in ${matchedPhases.join('/')} phase - prime timing for ${this.capabilityConfig.capability}. ${news.title}`,
      details: text.slice(0, 500),
      confidence: 0.7,
      impactScore: investmentAmount && investmentAmount >= 500 ? 9 : 7,
      relevantCapabilities: [this.capabilityConfig.capability],
      suggestedActions: [
        this.createAction(
          `Engage during ${matchedPhases[0]} phase`,
          `Optimal timing for ${this.capabilityConfig.capability} engagement`,
          'immediate',
          'BD Team'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
      investmentData: investmentAmount ? {
        investmentType: 'expansion',
        amount: investmentAmount,
        serviceOpportunity: [this.capabilityConfig.capability],
      } : undefined,
    })
  }
  
  private analyzeCompetitiveGap(text: string, news: any): AgentInsight | null {
    const textLower = text.toLowerCase()
    
    // Check if any competitor is mentioned
    const mentionedCompetitors = this.capabilityConfig.competitors.filter(comp =>
      textLower.includes(comp.toLowerCase())
    )
    
    // If competitors are mentioned, less interesting (they're already there)
    if (mentionedCompetitors.length > 0) return null
    
    // Check for capability demand signals without competitor presence
    const hasDemand = this.capabilityConfig.demandSignals.some(signal =>
      textLower.includes(signal.toLowerCase())
    )
    
    if (!hasDemand) return null
    
    // This is a gap - demand exists but competitors not mentioned
    return this.createInsight({
      insightType: 'white-space',
      title: `${this.capabilityConfig.capability}: No Competitor Presence`,
      summary: `Demand for ${this.capabilityConfig.capability} detected without competitor mention. White space opportunity. ${news.title}`,
      details: `Differentiators: ${this.capabilityConfig.differentiators.join(', ')}`,
      confidence: 0.65,
      impactScore: 8,
      relevantCapabilities: [this.capabilityConfig.capability],
      suggestedActions: [
        this.createAction(
          `Fast-track pursuit - no competitor presence`,
          `Opportunity to establish position before competitors`,
          'immediate',
          'BD Team'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
      whiteSpaceData: {
        competitorPresence: 'none',
        competitorsList: [],
        marketMaturity: 'emerging',
        entryBarriers: 'low',
        requiredCapabilities: [this.capabilityConfig.capability],
        windowOfOpportunity: 'wide-open',
      },
    })
  }
  
  // ============================================================================
  // HELPER METHODS
  // ============================================================================
  
  private deduplicateInsights(insights: AgentInsight[]): AgentInsight[] {
    const seen = new Set<string>()
    const unique: AgentInsight[] = []
    
    for (const insight of insights) {
      const key = insight.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 50)
      if (!seen.has(key)) {
        seen.add(key)
        unique.push(insight)
      }
    }
    
    return unique
  }
}
