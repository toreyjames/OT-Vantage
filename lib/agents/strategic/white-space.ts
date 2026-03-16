/**
 * White Space Hunter Agent
 * 
 * Finds areas where competitors aren't playing:
 * - Emerging sectors with low competition
 * - Geographic gaps (states/regions without coverage)
 * - Capability gaps (services no one is offering)
 * - Timing opportunities (first-mover advantages)
 */

import { BaseAgent, AgentDataContext, COMPETITORS, NICHE_CAPABILITIES } from '../base-agent'
import { AgentInsight, WhiteSpaceData } from '../types'

// ============================================================================
// WHITE SPACE KEYWORDS & PATTERNS
// ============================================================================

const WHITE_SPACE_INDICATORS = {
  // Signals that an area is underserved
  underserved: [
    'lack of', 'shortage of', 'need for', 'gap in',
    'no providers', 'limited options', 'underserved',
    'emerging', 'nascent', 'early-stage', 'greenfield',
    'first-ever', 'pioneering', 'novel approach',
  ],
  
  // New market signals
  newMarket: [
    'new market', 'untapped', 'unexplored', 'virgin territory',
    'first-of-its-kind', 'unprecedented', 'groundbreaking',
    'disruptive', 'paradigm shift', 'revolutionary',
  ],
  
  // Geographic opportunity signals
  geographic: [
    'rural', 'midwest', 'heartland', 'underinvested states',
    'emerging hub', 'new corridor', 'economic development zone',
  ],
  
  // Timing signals
  timing: [
    'window of opportunity', 'first mover', 'early entrant',
    'before competitors', 'ahead of the curve', 'leading edge',
    'preemptive', 'proactive',
  ],
}

// Sectors to monitor for white space
const EMERGING_SECTORS = [
  'fusion energy',
  'advanced nuclear',
  'SMR deployment',
  'critical minerals processing',
  'domestic semiconductor packaging',
  'AI data center security',
  'industrial AI governance',
  'OT security for greenfield',
  'hydrogen infrastructure',
  'grid modernization',
  'battery recycling',
  'rare earth refining',
]

// Geographic areas often underserved
const UNDERSERVED_REGIONS = [
  'Midwest', 'Appalachia', 'Great Plains', 'Rural America',
  'Ohio', 'Indiana', 'Kentucky', 'West Virginia', 'Pennsylvania',
  'Tennessee', 'Alabama', 'Mississippi', 'Louisiana',
]

export class WhiteSpaceHunterAgent extends BaseAgent {
  constructor() {
    super({
      id: 'white-space-hunter',
      name: 'White Space Hunter',
      type: 'strategic',
      description: 'Finds areas where competitors are not playing - untapped markets, geographic gaps, and first-mover opportunities',
      keywords: [
        ...WHITE_SPACE_INDICATORS.underserved,
        ...WHITE_SPACE_INDICATORS.newMarket,
        ...EMERGING_SECTORS,
      ],
      runIntervalMinutes: 120,
      minConfidenceThreshold: 0.4,
      maxInsightsPerRun: 15,
    })
  }
  
  getKeywords(): string[] {
    return this.config.keywords
  }
  
  getSearchQueries(): string[] {
    return [
      // Emerging sector queries
      'fusion energy startup funding',
      'SMR nuclear project announcement',
      'critical minerals processing US',
      'domestic rare earth production',
      'AI data center OT security',
      'industrial AI security gap',
      'greenfield manufacturing security',
      
      // Geographic opportunity queries
      'Midwest manufacturing investment',
      'Appalachia energy project',
      'rural America data center',
      'heartland semiconductor',
      
      // Competition gap queries
      'no provider for industrial',
      'shortage of OT security',
      'need for commissioning services',
      
      // First mover queries
      'first ever nuclear AI',
      'pioneering OT approach',
      'novel industrial security',
    ]
  }
  
  async analyze(data: AgentDataContext): Promise<AgentInsight[]> {
    const insights: AgentInsight[] = []
    
    // Analyze news for white space signals
    for (const news of data.newsItems) {
      const text = `${news.title} ${news.description}`
      
      // Check for emerging sector opportunities
      const sectorInsight = this.analyzeEmergingSector(text, news)
      if (sectorInsight) insights.push(sectorInsight)
      
      // Check for geographic white space
      const geoInsight = this.analyzeGeographicGap(text, news)
      if (geoInsight) insights.push(geoInsight)
      
      // Check for capability gaps
      const capInsight = this.analyzeCapabilityGap(text, news)
      if (capInsight) insights.push(capInsight)
      
      // Check for timing opportunities
      const timingInsight = this.analyzeTimingOpportunity(text, news)
      if (timingInsight) insights.push(timingInsight)
    }
    
    // Analyze for competitor absence patterns
    const competitorInsights = this.analyzeCompetitorAbsence(data)
    insights.push(...competitorInsights)
    
    // Deduplicate and sort by confidence
    return this.deduplicateInsights(insights)
      .sort((a, b) => b.confidence - a.confidence)
  }
  
  // ============================================================================
  // ANALYSIS METHODS
  // ============================================================================
  
  private analyzeEmergingSector(text: string, news: any): AgentInsight | null {
    const textLower = text.toLowerCase()
    
    // Check for emerging sector mentions
    const matchedSectors = EMERGING_SECTORS.filter(sector => 
      textLower.includes(sector.toLowerCase())
    )
    
    if (matchedSectors.length === 0) return null
    
    // Check for underserved signals
    const underservedMatches = this.countKeywordMatches(text, WHITE_SPACE_INDICATORS.underserved)
    const newMarketMatches = this.countKeywordMatches(text, WHITE_SPACE_INDICATORS.newMarket)
    
    // Calculate confidence based on signal strength
    const signalStrength = underservedMatches + newMarketMatches
    if (signalStrength < 1) return null
    
    const confidence = Math.min(0.95, 0.5 + (signalStrength * 0.15))
    const investmentAmount = this.extractInvestmentAmount(text)
    
    // Assess competitor presence
    const competitorMentions = this.countCompetitorMentions(text)
    const competitorPresence = this.assessCompetitorPresence(competitorMentions)
    
    return this.createInsight({
      insightType: 'white-space',
      title: `White Space: ${matchedSectors[0]} - Low Competition Detected`,
      summary: `Emerging opportunity in ${matchedSectors.join(', ')} with ${competitorPresence} competitor presence. ${news.title}`,
      details: text.slice(0, 500),
      confidence,
      impactScore: this.calculateImpactScore(matchedSectors, investmentAmount, competitorPresence),
      relevantSectors: matchedSectors,
      relevantCapabilities: this.mapSectorsToCapabilities(matchedSectors),
      suggestedActions: [
        this.createAction(
          `Research ${matchedSectors[0]} market opportunity`,
          'Emerging sector with low competition - first mover advantage possible',
          'short-term',
          'Strategy Team'
        ),
        this.createAction(
          'Develop capability assessment for this space',
          'Identify what capabilities we need to enter',
          'short-term',
          'OT Practice'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
      whiteSpaceData: {
        competitorPresence,
        competitorsList: this.extractCompetitorNames(text),
        marketMaturity: 'emerging',
        estimatedMarketSize: investmentAmount,
        entryBarriers: 'medium',
        requiredCapabilities: this.mapSectorsToCapabilities(matchedSectors),
        windowOfOpportunity: signalStrength >= 2 ? 'wide-open' : 'open',
      },
    })
  }
  
  private analyzeGeographicGap(text: string, news: any): AgentInsight | null {
    const textLower = text.toLowerCase()
    
    // Check for underserved region mentions
    const matchedRegions = UNDERSERVED_REGIONS.filter(region => 
      textLower.includes(region.toLowerCase())
    )
    
    if (matchedRegions.length === 0) return null
    
    // Check for investment/development signals
    const investmentSignals = [
      'investment', 'factory', 'plant', 'facility', 'campus',
      'breaks ground', 'construction', 'expansion', 'development',
    ]
    const hasInvestmentSignal = investmentSignals.some(s => textLower.includes(s))
    
    if (!hasInvestmentSignal) return null
    
    const investmentAmount = this.extractInvestmentAmount(text)
    const competitorMentions = this.countCompetitorMentions(text)
    
    // Low competitor mentions = white space opportunity
    if (competitorMentions > 2) return null
    
    const confidence = Math.min(0.9, 0.5 + (investmentAmount ? 0.2 : 0) + (competitorMentions === 0 ? 0.2 : 0))
    
    return this.createInsight({
      insightType: 'white-space',
      title: `Geographic White Space: ${matchedRegions[0]}`,
      summary: `Industrial development in ${matchedRegions.join(', ')} with minimal competitor presence. ${news.title}`,
      details: text.slice(0, 500),
      confidence,
      impactScore: investmentAmount ? Math.min(10, 5 + Math.log10(investmentAmount)) : 6,
      relevantSectors: news.extractedData?.sector ? [news.extractedData.sector] : [],
      suggestedActions: [
        this.createAction(
          `Establish presence in ${matchedRegions[0]}`,
          'Geographic white space with active investment - plant the flag',
          'short-term',
          'BD Team'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
      whiteSpaceData: {
        competitorPresence: competitorMentions === 0 ? 'none' : 'minimal',
        competitorsList: [],
        marketMaturity: 'growing',
        estimatedMarketSize: investmentAmount,
        geographicFocus: matchedRegions,
        entryBarriers: 'low',
        requiredCapabilities: ['Local presence', 'Regional relationships'],
        windowOfOpportunity: 'open',
      },
    })
  }
  
  private analyzeCapabilityGap(text: string, news: any): AgentInsight | null {
    const textLower = text.toLowerCase()
    
    // Check for capability gap signals
    const gapSignals = [
      'lack of expertise', 'shortage of skills', 'need for specialists',
      'no vendor offers', 'gap in services', 'underserved need',
      'looking for provider', 'seeking partner', 'RFP for',
    ]
    
    const hasGapSignal = gapSignals.some(s => textLower.includes(s))
    if (!hasGapSignal) return null
    
    // Check if it relates to our niche capabilities
    const relevantCapabilities = NICHE_CAPABILITIES.filter(cap =>
      textLower.includes(cap.toLowerCase().split(' ')[0]) ||
      textLower.includes(cap.toLowerCase().split(' ').slice(-1)[0])
    )
    
    if (relevantCapabilities.length === 0) {
      // Check for general OT/industrial mentions
      const otSignals = ['ot ', 'operational technology', 'industrial', 'manufacturing', 'scada', 'ics']
      if (!otSignals.some(s => textLower.includes(s))) return null
    }
    
    const confidence = 0.6 + (relevantCapabilities.length * 0.1)
    
    return this.createInsight({
      insightType: 'capability-gap',
      title: `Capability Gap: ${relevantCapabilities[0] || 'Industrial Services'}`,
      summary: `Market need identified for ${relevantCapabilities.join(', ') || 'industrial/OT services'} that we can address. ${news.title}`,
      details: text.slice(0, 500),
      confidence,
      impactScore: 7,
      relevantCapabilities: relevantCapabilities.length > 0 ? relevantCapabilities : ['OT Services'],
      suggestedActions: [
        this.createAction(
          'Develop targeted offering for this capability gap',
          'Direct market need identified - productize our solution',
          'immediate',
          'OT Practice'
        ),
        this.createAction(
          'Create eminence content showcasing our capability',
          'Position as thought leader in this gap area',
          'short-term',
          'Marketing'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
      whiteSpaceData: {
        competitorPresence: 'minimal',
        competitorsList: [],
        marketMaturity: 'emerging',
        entryBarriers: 'low',
        requiredCapabilities: relevantCapabilities,
        windowOfOpportunity: 'wide-open',
      },
    })
  }
  
  private analyzeTimingOpportunity(text: string, news: any): AgentInsight | null {
    const textLower = text.toLowerCase()
    
    // Check for timing signals
    const timingMatches = this.countKeywordMatches(text, WHITE_SPACE_INDICATORS.timing)
    if (timingMatches === 0) return null
    
    // Must also have industry relevance
    const industrySignals = [
      'nuclear', 'semiconductor', 'data center', 'battery', 'energy',
      'manufacturing', 'industrial', 'infrastructure',
    ]
    const hasIndustryRelevance = industrySignals.some(s => textLower.includes(s))
    if (!hasIndustryRelevance) return null
    
    const investmentAmount = this.extractInvestmentAmount(text)
    const confidence = Math.min(0.85, 0.55 + (timingMatches * 0.1) + (investmentAmount ? 0.15 : 0))
    
    return this.createInsight({
      insightType: 'white-space',
      title: `First Mover Opportunity Detected`,
      summary: `Timing window for early market entry. ${news.title}`,
      details: text.slice(0, 500),
      confidence,
      impactScore: 8,
      suggestedActions: [
        this.createAction(
          'Fast-track pursuit of this opportunity',
          'First mover advantage is time-sensitive',
          'immediate',
          'BD Team'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
      whiteSpaceData: {
        competitorPresence: 'none',
        competitorsList: [],
        marketMaturity: 'emerging',
        estimatedMarketSize: investmentAmount,
        entryBarriers: 'medium',
        requiredCapabilities: [],
        windowOfOpportunity: 'closing-fast',
      },
    })
  }
  
  private analyzeCompetitorAbsence(data: AgentDataContext): AgentInsight[] {
    const insights: AgentInsight[] = []
    
    // Aggregate competitor mentions across all news
    const competitorMentionCounts = new Map<string, number>()
    const allCompetitors = [
      ...COMPETITORS.bigFour,
      ...COMPETITORS.otSecurity,
      ...COMPETITORS.consulting,
    ]
    
    for (const competitor of allCompetitors) {
      competitorMentionCounts.set(competitor, 0)
    }
    
    // Count mentions across news
    for (const news of data.newsItems) {
      const text = `${news.title} ${news.description}`.toLowerCase()
      for (const competitor of allCompetitors) {
        if (text.includes(competitor.toLowerCase())) {
          competitorMentionCounts.set(
            competitor,
            (competitorMentionCounts.get(competitor) || 0) + 1
          )
        }
      }
    }
    
    // Find sectors/areas where ALL competitors are absent
    const sectorCompetitorPresence = new Map<string, number>()
    const sectors = ['nuclear', 'fusion', 'semiconductor', 'data center', 'battery', 'critical minerals']
    
    for (const sector of sectors) {
      let competitorCount = 0
      for (const news of data.newsItems) {
        const text = `${news.title} ${news.description}`.toLowerCase()
        if (text.includes(sector)) {
          competitorCount += this.countCompetitorMentions(text)
        }
      }
      sectorCompetitorPresence.set(sector, competitorCount)
    }
    
    // Generate insight for sectors with no competitor presence
    for (const [sector, count] of sectorCompetitorPresence) {
      if (count === 0) {
        const sectorNews = data.newsItems.filter(n => 
          `${n.title} ${n.description}`.toLowerCase().includes(sector)
        )
        
        if (sectorNews.length >= 2) {
          insights.push(this.createInsight({
            insightType: 'white-space',
            title: `Competitor-Free Zone: ${sector.charAt(0).toUpperCase() + sector.slice(1)}`,
            summary: `No competitor mentions detected in ${sectorNews.length} recent news items about ${sector}. This sector may be a white space opportunity.`,
            confidence: 0.7,
            impactScore: 7,
            relevantSectors: [sector],
            suggestedActions: [
              this.createAction(
                `Assess ${sector} market for entry`,
                'Competitors not active - opportunity to establish leadership',
                'short-term',
                'Strategy Team'
              ),
            ],
            sources: sectorNews.slice(0, 3).map(n => this.createSource(n.url, n.title, n.source)),
            whiteSpaceData: {
              competitorPresence: 'none',
              competitorsList: [],
              marketMaturity: 'growing',
              entryBarriers: 'medium',
              requiredCapabilities: [],
              windowOfOpportunity: 'open',
            },
          }))
        }
      }
    }
    
    return insights
  }
  
  // ============================================================================
  // HELPER METHODS
  // ============================================================================
  
  private countCompetitorMentions(text: string): number {
    const textLower = text.toLowerCase()
    let count = 0
    
    for (const list of Object.values(COMPETITORS)) {
      for (const competitor of list) {
        if (textLower.includes(competitor.toLowerCase())) {
          count++
        }
      }
    }
    
    return count
  }
  
  private assessCompetitorPresence(mentions: number): WhiteSpaceData['competitorPresence'] {
    if (mentions === 0) return 'none'
    if (mentions <= 2) return 'minimal'
    if (mentions <= 5) return 'moderate'
    return 'heavy'
  }
  
  private extractCompetitorNames(text: string): string[] {
    const textLower = text.toLowerCase()
    const found: string[] = []
    
    for (const list of Object.values(COMPETITORS)) {
      for (const competitor of list) {
        if (textLower.includes(competitor.toLowerCase())) {
          found.push(competitor)
        }
      }
    }
    
    return found
  }
  
  private mapSectorsToCapabilities(sectors: string[]): string[] {
    const mapping: Record<string, string[]> = {
      'fusion energy': ['Industrial AI Security', 'Commissioning-to-Operate Security'],
      'advanced nuclear': ['OT Asset Canonization', 'Commissioning-to-Operate Security', 'EPC/Vendor Governance'],
      'SMR deployment': ['OT Asset Canonization', 'Commissioning-to-Operate Security'],
      'critical minerals processing': ['OT Strategy', 'Supply Chain'],
      'AI data center security': ['Industrial AI Security', 'OT Asset Canonization'],
      'OT security for greenfield': ['Commissioning-to-Operate Security', 'EPC/Vendor Governance'],
    }
    
    const capabilities = new Set<string>()
    for (const sector of sectors) {
      const caps = mapping[sector] || []
      caps.forEach(c => capabilities.add(c))
    }
    
    return Array.from(capabilities)
  }
  
  private calculateImpactScore(
    sectors: string[],
    investmentAmount: number | undefined,
    competitorPresence: WhiteSpaceData['competitorPresence']
  ): number {
    let score = 5
    
    // High-value sectors
    const highValueSectors = ['fusion energy', 'advanced nuclear', 'AI data center security']
    if (sectors.some(s => highValueSectors.includes(s))) {
      score += 2
    }
    
    // Investment size
    if (investmentAmount) {
      if (investmentAmount >= 1000) score += 2 // $1B+
      else if (investmentAmount >= 100) score += 1 // $100M+
    }
    
    // Competitor presence (less = better)
    if (competitorPresence === 'none') score += 2
    else if (competitorPresence === 'minimal') score += 1
    
    return Math.min(10, score)
  }
  
  private deduplicateInsights(insights: AgentInsight[]): AgentInsight[] {
    const seen = new Set<string>()
    const unique: AgentInsight[] = []
    
    for (const insight of insights) {
      // Create a key based on title similarity
      const key = insight.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 50)
      if (!seen.has(key)) {
        seen.add(key)
        unique.push(insight)
      }
    }
    
    return unique
  }
}

// Export singleton instance
export const whiteSpaceHunter = new WhiteSpaceHunterAgent()
