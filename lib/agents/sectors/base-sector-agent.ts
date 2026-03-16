/**
 * Base Sector Agent
 * 
 * Base class for sector-specific agents that monitor:
 * - Sector-specific news and developments
 * - Key players and their activities
 * - Policy impacts on the sector
 * - Investment and expansion signals
 */

import { BaseAgent, AgentDataContext, COMPETITORS, DELOITTE_CAPABILITIES } from '../base-agent'
import { AgentInsight, SectorAgentId } from '../types'

// ============================================================================
// SECTOR CONFIGURATION
// ============================================================================

export interface SectorConfig {
  id: SectorAgentId
  name: string
  description: string
  
  // Core keywords for this sector
  keywords: string[]
  
  // Key companies to track
  keyPlayers: string[]
  
  // Related policies
  policies: string[]
  
  // Service opportunities for this sector
  serviceOpportunities: string[]
  
  // Search queries specific to this sector
  searchQueries: string[]
  
  // High-value signals specific to this sector
  highValueSignals: string[]
}

export abstract class BaseSectorAgent extends BaseAgent {
  protected sectorConfig: SectorConfig
  
  constructor(sectorConfig: SectorConfig) {
    super({
      id: sectorConfig.id,
      name: sectorConfig.name,
      type: 'sector',
      description: sectorConfig.description,
      keywords: sectorConfig.keywords,
      sectors: [sectorConfig.id.replace('-agent', '')],
      runIntervalMinutes: 90,
      minConfidenceThreshold: 0.45,
      maxInsightsPerRun: 15,
    })
    
    this.sectorConfig = sectorConfig
  }
  
  getKeywords(): string[] {
    return this.sectorConfig.keywords
  }
  
  getSearchQueries(): string[] {
    return this.sectorConfig.searchQueries
  }
  
  async analyze(data: AgentDataContext): Promise<AgentInsight[]> {
    const insights: AgentInsight[] = []
    
    for (const news of data.newsItems) {
      const text = `${news.title} ${news.description}`
      
      // Check if news is relevant to this sector
      if (!this.isRelevantToSector(text)) continue
      
      // Analyze key player activity
      const playerInsight = this.analyzeKeyPlayerActivity(text, news)
      if (playerInsight) insights.push(playerInsight)
      
      // Analyze policy impact
      const policyInsight = this.analyzePolicyImpact(text, news)
      if (policyInsight) insights.push(policyInsight)
      
      // Analyze high-value signals
      const signalInsight = this.analyzeHighValueSignal(text, news)
      if (signalInsight) insights.push(signalInsight)
      
      // Analyze investment/expansion
      const investmentInsight = this.analyzeInvestmentActivity(text, news)
      if (investmentInsight) insights.push(investmentInsight)
    }
    
    // Run sector-specific analysis
    const sectorSpecific = await this.analyzeSectorSpecific(data)
    insights.push(...sectorSpecific)
    
    // Deduplicate and sort
    return this.deduplicateInsights(insights)
      .sort((a, b) => b.confidence - a.confidence)
  }
  
  /**
   * Override this for sector-specific analysis
   */
  protected async analyzeSectorSpecific(data: AgentDataContext): Promise<AgentInsight[]> {
    return []
  }
  
  // ============================================================================
  // ANALYSIS METHODS
  // ============================================================================
  
  private isRelevantToSector(text: string): boolean {
    const textLower = text.toLowerCase()
    return this.sectorConfig.keywords.some(kw => textLower.includes(kw.toLowerCase()))
  }
  
  private analyzeKeyPlayerActivity(text: string, news: any): AgentInsight | null {
    const textLower = text.toLowerCase()
    
    // Check for key player mentions
    const mentionedPlayers = this.sectorConfig.keyPlayers.filter(player =>
      textLower.includes(player.toLowerCase())
    )
    
    if (mentionedPlayers.length === 0) return null
    
    // Check for activity signals
    const activitySignals = [
      'announces', 'announced', 'unveils', 'reveals', 'launches',
      'partnership', 'deal', 'agreement', 'investment', 'funding',
      'expansion', 'facility', 'plant', 'breaks ground',
    ]
    
    const hasActivitySignal = activitySignals.some(s => textLower.includes(s))
    if (!hasActivitySignal) return null
    
    const investmentAmount = this.extractInvestmentAmount(text)
    const confidence = 0.6 + (mentionedPlayers.length * 0.1) + (investmentAmount ? 0.15 : 0)
    
    return this.createInsight({
      insightType: 'signal',
      title: `${this.sectorConfig.name}: ${mentionedPlayers[0]} Activity`,
      summary: `Key player activity detected: ${mentionedPlayers.join(', ')}. ${news.title}`,
      details: text.slice(0, 500),
      confidence: Math.min(0.9, confidence),
      impactScore: this.calculatePlayerImpact(mentionedPlayers, investmentAmount),
      relevantSectors: [this.sectorConfig.id.replace('-agent', '')],
      relevantCapabilities: this.sectorConfig.serviceOpportunities,
      suggestedActions: [
        this.createAction(
          `Track ${mentionedPlayers[0]} for service opportunities`,
          'Key player activity indicates potential engagement opportunity',
          'short-term',
          'BD Team'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
      investmentData: investmentAmount ? {
        investmentType: 'corporate-investment',
        amount: investmentAmount,
        recipient: mentionedPlayers[0],
        serviceOpportunity: this.sectorConfig.serviceOpportunities,
      } : undefined,
    })
  }
  
  private analyzePolicyImpact(text: string, news: any): AgentInsight | null {
    const textLower = text.toLowerCase()
    
    // Check for policy mentions
    const mentionedPolicies = this.sectorConfig.policies.filter(policy =>
      textLower.includes(policy.toLowerCase())
    )
    
    if (mentionedPolicies.length === 0) return null
    
    // Check for impact signals
    const impactSignals = [
      'impact', 'affect', 'boost', 'support', 'enable', 'accelerate',
      'funding', 'incentive', 'credit', 'grant', 'approval', 'license',
    ]
    
    const hasImpactSignal = impactSignals.some(s => textLower.includes(s))
    if (!hasImpactSignal) return null
    
    return this.createInsight({
      insightType: 'policy',
      title: `${this.sectorConfig.name}: Policy Development`,
      summary: `Policy impact on sector: ${mentionedPolicies.join(', ')}. ${news.title}`,
      details: text.slice(0, 500),
      confidence: 0.7,
      impactScore: 7,
      relevantSectors: [this.sectorConfig.id.replace('-agent', '')],
      relevantPolicies: mentionedPolicies,
      relevantCapabilities: ['Regulatory Compliance', 'Policy Advisory'],
      suggestedActions: [
        this.createAction(
          'Analyze policy implications for clients',
          'Policy development may create opportunities or risks',
          'short-term',
          'Strategy Team'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
    })
  }
  
  private analyzeHighValueSignal(text: string, news: any): AgentInsight | null {
    const textLower = text.toLowerCase()
    
    // Check for high-value signals specific to this sector
    const matchedSignals = this.sectorConfig.highValueSignals.filter(signal =>
      textLower.includes(signal.toLowerCase())
    )
    
    if (matchedSignals.length === 0) return null
    
    const investmentAmount = this.extractInvestmentAmount(text)
    const confidence = 0.65 + (matchedSignals.length * 0.1) + (investmentAmount ? 0.1 : 0)
    
    return this.createInsight({
      insightType: 'signal',
      title: `${this.sectorConfig.name}: High-Value Signal`,
      summary: `Important development: ${matchedSignals.join(', ')}. ${news.title}`,
      details: text.slice(0, 500),
      confidence: Math.min(0.9, confidence),
      impactScore: 8,
      relevantSectors: [this.sectorConfig.id.replace('-agent', '')],
      relevantCapabilities: this.sectorConfig.serviceOpportunities,
      suggestedActions: [
        this.createAction(
          'Investigate this high-value signal',
          'Significant sector development detected',
          'immediate',
          'BD Team'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
    })
  }
  
  private analyzeInvestmentActivity(text: string, news: any): AgentInsight | null {
    const investmentAmount = this.extractInvestmentAmount(text)
    if (!investmentAmount || investmentAmount < 50) return null // Min $50M
    
    const textLower = text.toLowerCase()
    
    // Check for expansion signals
    const expansionSignals = [
      'expansion', 'new facility', 'new plant', 'breaks ground',
      'construction', 'building', 'factory', 'campus',
    ]
    
    const isExpansion = expansionSignals.some(s => textLower.includes(s))
    
    // Extract company if possible
    const mentionedPlayers = this.sectorConfig.keyPlayers.filter(player =>
      textLower.includes(player.toLowerCase())
    )
    
    const company = mentionedPlayers[0] || news.extractedData?.company || 'Unknown'
    
    return this.createInsight({
      insightType: 'investment',
      title: `${this.sectorConfig.name}: $${this.formatAmount(investmentAmount)} ${isExpansion ? 'Expansion' : 'Investment'}`,
      summary: `${company} ${isExpansion ? 'expansion' : 'investment'} of $${this.formatAmount(investmentAmount)} in ${this.sectorConfig.name.toLowerCase()} sector.`,
      details: text.slice(0, 500),
      confidence: 0.8,
      impactScore: this.calculateInvestmentImpact(investmentAmount, isExpansion),
      relevantSectors: [this.sectorConfig.id.replace('-agent', '')],
      relevantCapabilities: isExpansion 
        ? ['Commissioning Security', 'EPC Governance', ...this.sectorConfig.serviceOpportunities]
        : this.sectorConfig.serviceOpportunities,
      suggestedActions: [
        this.createAction(
          `Pursue ${company} for ${isExpansion ? 'commissioning and OT' : ''} services`,
          `Large investment = significant service opportunity`,
          'immediate',
          'BD Team'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
      investmentData: {
        investmentType: isExpansion ? 'expansion' : 'corporate-investment',
        amount: investmentAmount,
        recipient: company,
        serviceOpportunity: this.sectorConfig.serviceOpportunities,
        estimatedServiceValue: Math.round(investmentAmount * 0.01), // 1% estimate
      },
    })
  }
  
  // ============================================================================
  // HELPER METHODS
  // ============================================================================
  
  private calculatePlayerImpact(players: string[], investment?: number): number {
    let score = 5
    
    // More players = higher impact
    score += Math.min(2, players.length)
    
    // Investment amount
    if (investment) {
      if (investment >= 1000) score += 2
      else if (investment >= 100) score += 1
    }
    
    return Math.min(10, score)
  }
  
  private calculateInvestmentImpact(amount: number, isExpansion: boolean): number {
    let score = 5
    
    // Amount-based scoring
    if (amount >= 10000) score += 4
    else if (amount >= 1000) score += 3
    else if (amount >= 500) score += 2
    else if (amount >= 100) score += 1
    
    // Expansion bonus
    if (isExpansion) score += 1
    
    return Math.min(10, score)
  }
  
  private formatAmount(millions: number): string {
    if (millions >= 1000) {
      return `${(millions / 1000).toFixed(1)}B`
    }
    return `${millions}M`
  }
  
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
