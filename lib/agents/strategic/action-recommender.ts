/**
 * Action Recommender Agent
 * 
 * Synthesizes findings from other agents into actionable recommendations:
 * - Cross-references white space + investment + capability gaps
 * - Prioritizes actions by urgency and impact
 * - Groups related actions into strategic initiatives
 * - Identifies "no-regrets" moves
 */

import { BaseAgent, AgentDataContext, DELOITTE_CAPABILITIES, NICHE_CAPABILITIES, COMPETITORS } from '../base-agent'
import { AgentInsight, SuggestedAction, InsightPriority } from '../types'

// ============================================================================
// ACTION CATEGORIES & PRIORITIES
// ============================================================================

interface ActionCategory {
  id: string
  name: string
  description: string
  urgencyMultiplier: number
}

const ACTION_CATEGORIES: ActionCategory[] = [
  {
    id: 'pursue',
    name: 'Pursue Now',
    description: 'Time-sensitive opportunities requiring immediate action',
    urgencyMultiplier: 1.5,
  },
  {
    id: 'build',
    name: 'Build Capability',
    description: 'Develop or acquire capabilities to capture emerging opportunities',
    urgencyMultiplier: 1.0,
  },
  {
    id: 'position',
    name: 'Position for Future',
    description: 'Strategic moves to establish presence in growing markets',
    urgencyMultiplier: 0.8,
  },
  {
    id: 'monitor',
    name: 'Monitor & Track',
    description: 'Keep watching these developments for action triggers',
    urgencyMultiplier: 0.5,
  },
]

// Strategic initiative templates
const STRATEGIC_INITIATIVES = {
  'greenfield-ot': {
    name: 'Greenfield OT Security Initiative',
    description: 'Capture OT security work for new facilities from design through commissioning',
    capabilities: ['Commissioning-to-Operate Security', 'EPC/Vendor Governance', 'OT Asset Canonization'],
    triggers: ['expansion', 'groundbreaking', 'construction', 'new facility', 'breaks ground'],
  },
  'build-cycle': {
    name: 'Build Cycle Intelligence',
    description: 'Leverage OT Vantage insights to identify and pursue opportunities before competitors',
    capabilities: ['Build Cycle Intelligence', 'Market Intelligence'],
    triggers: ['investment wave', 'policy change', 'funding announcement'],
  },
  'nuclear-leadership': {
    name: 'Nuclear Sector Leadership',
    description: 'Establish Deloitte as the go-to partner for nuclear projects',
    capabilities: ['OT Strategy', 'Commissioning Security', 'Regulatory Compliance'],
    triggers: ['nuclear', 'SMR', 'reactor', 'NRC', 'fission'],
  },
  'ai-industrial': {
    name: 'Industrial AI Security',
    description: 'Own the intersection of AI and industrial/OT security',
    capabilities: ['Industrial AI Security', 'AI Governance', 'OT Security'],
    triggers: ['AI', 'industrial AI', 'data center', 'AI infrastructure'],
  },
}

export class ActionRecommenderAgent extends BaseAgent {
  private recentInsights: AgentInsight[] = []
  
  constructor() {
    super({
      id: 'action-recommender',
      name: 'Action Recommender',
      type: 'strategic',
      description: 'Synthesizes findings into prioritized, actionable recommendations',
      keywords: [
        'opportunity', 'action', 'recommend', 'pursue', 'invest',
        'capability', 'build', 'develop', 'establish', 'position',
      ],
      runIntervalMinutes: 180, // Run less frequently, synthesizes other agents' work
      minConfidenceThreshold: 0.6,
      maxInsightsPerRun: 10,
    })
  }
  
  /**
   * Inject insights from other agents for synthesis
   */
  injectInsights(insights: AgentInsight[]): void {
    this.recentInsights = insights
  }
  
  getKeywords(): string[] {
    return this.config.keywords
  }
  
  getSearchQueries(): string[] {
    // This agent primarily synthesizes, but also watches for action triggers
    return [
      'RFP announcement industrial',
      'seeking vendor OT security',
      'looking for partner nuclear',
      'due diligence opportunity',
      'consortium forming',
      'strategic partner needed',
    ]
  }
  
  async analyze(data: AgentDataContext): Promise<AgentInsight[]> {
    const insights: AgentInsight[] = []
    
    // Analyze injected insights from other agents
    if (this.recentInsights.length > 0) {
      const synthesized = this.synthesizeInsights(this.recentInsights)
      insights.push(...synthesized)
    }
    
    // Look for direct action triggers in news
    for (const news of data.newsItems) {
      const text = `${news.title} ${news.description}`
      
      // Check for RFP/opportunity signals
      const rfpInsight = this.detectRfpOpportunity(text, news)
      if (rfpInsight) insights.push(rfpInsight)
      
      // Check for strategic initiative triggers
      const initiativeInsight = this.detectInitiativeTrigger(text, news)
      if (initiativeInsight) insights.push(initiativeInsight)
    }
    
    // Generate "no-regrets" moves
    const noRegrets = this.identifyNoRegretsMoves(this.recentInsights, data)
    insights.push(...noRegrets)
    
    // Prioritize and deduplicate
    return this.prioritizeActions(insights)
  }
  
  // ============================================================================
  // SYNTHESIS METHODS
  // ============================================================================
  
  private synthesizeInsights(insights: AgentInsight[]): AgentInsight[] {
    const synthesized: AgentInsight[] = []
    
    // Group insights by sector
    const bySector = this.groupBy(insights, i => i.relevantSectors[0] || 'general')
    
    // Group insights by type
    const byType = this.groupBy(insights, i => i.insightType)
    
    // Generate sector-focused action recommendations
    for (const [sector, sectorInsights] of Object.entries(bySector)) {
      if (sectorInsights.length >= 2) {
        const synthesis = this.synthesizeSectorActions(sector, sectorInsights)
        if (synthesis) synthesized.push(synthesis)
      }
    }
    
    // Cross-reference white space with investments
    const whiteSpaces = byType['white-space'] || []
    const investments = byType['investment'] || []
    
    for (const ws of whiteSpaces) {
      // Find related investments
      const relatedInvestments = investments.filter(inv =>
        inv.relevantSectors.some(s => ws.relevantSectors.includes(s))
      )
      
      if (relatedInvestments.length > 0) {
        synthesized.push(this.createCrossReferenceInsight(ws, relatedInvestments))
      }
    }
    
    // Identify capability gaps that multiple insights point to
    const capabilityMentions = new Map<string, AgentInsight[]>()
    for (const insight of insights) {
      for (const cap of insight.relevantCapabilities) {
        const existing = capabilityMentions.get(cap) || []
        existing.push(insight)
        capabilityMentions.set(cap, existing)
      }
    }
    
    for (const [capability, capInsights] of capabilityMentions) {
      if (capInsights.length >= 3) {
        synthesized.push(this.createCapabilityFocusInsight(capability, capInsights))
      }
    }
    
    return synthesized
  }
  
  private synthesizeSectorActions(sector: string, insights: AgentInsight[]): AgentInsight | null {
    // Calculate aggregate metrics
    const totalInvestment = insights
      .filter(i => i.investmentData?.amount)
      .reduce((sum, i) => sum + (i.investmentData?.amount || 0), 0)
    
    const avgConfidence = insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length
    const highPriorityCount = insights.filter(i => i.priority === 'critical' || i.priority === 'high').length
    
    if (totalInvestment < 100 && highPriorityCount < 2) return null
    
    // Identify top actions across all insights
    const allActions = insights.flatMap(i => i.suggestedActions)
    const uniqueActions = this.deduplicateActions(allActions)
    
    // Find relevant strategic initiative
    const matchingInitiative = Object.entries(STRATEGIC_INITIATIVES).find(([_, init]) =>
      init.triggers.some(t => sector.toLowerCase().includes(t.toLowerCase()))
    )
    
    return this.createInsight({
      insightType: 'action',
      title: `Strategic Focus: ${sector.charAt(0).toUpperCase() + sector.slice(1)} Sector`,
      summary: `${insights.length} signals detected in ${sector} with $${this.formatAmount(totalInvestment)} in investment activity. ${highPriorityCount} high-priority opportunities require attention.`,
      details: matchingInitiative 
        ? `Aligns with ${matchingInitiative[1].name}: ${matchingInitiative[1].description}`
        : undefined,
      confidence: Math.min(0.9, avgConfidence + 0.1),
      impactScore: Math.min(10, 5 + Math.floor(insights.length / 2) + (totalInvestment >= 1000 ? 2 : 0)),
      relevantSectors: [sector],
      relevantCapabilities: [...new Set(insights.flatMap(i => i.relevantCapabilities))],
      suggestedActions: uniqueActions.slice(0, 5).map(a => ({
        ...a,
        urgency: this.escalateUrgency(a.urgency, highPriorityCount),
      })),
      sources: insights.flatMap(i => i.sources).slice(0, 5),
    })
  }
  
  private createCrossReferenceInsight(
    whiteSpace: AgentInsight,
    investments: AgentInsight[]
  ): AgentInsight {
    const totalInvestment = investments
      .filter(i => i.investmentData?.amount)
      .reduce((sum, i) => sum + (i.investmentData?.amount || 0), 0)
    
    return this.createInsight({
      insightType: 'action',
      title: `Validated Opportunity: White Space + Capital Flow`,
      summary: `White space in ${whiteSpace.relevantSectors.join(', ')} is being validated by $${this.formatAmount(totalInvestment)} in recent investments. This is a high-confidence opportunity.`,
      details: `White space: ${whiteSpace.title}\n\nRelated investments: ${investments.map(i => i.title).join(', ')}`,
      confidence: Math.min(0.95, whiteSpace.confidence + 0.15),
      impactScore: Math.min(10, whiteSpace.impactScore + 2),
      relevantSectors: whiteSpace.relevantSectors,
      relevantCapabilities: [...new Set([
        ...whiteSpace.relevantCapabilities,
        ...investments.flatMap(i => i.relevantCapabilities),
      ])],
      suggestedActions: [
        this.createAction(
          'Fast-track pursuit of this validated opportunity',
          'Both white space analysis and capital flows point to this opportunity',
          'immediate',
          'BD Team'
        ),
        this.createAction(
          'Develop targeted offering for this space',
          'Investment activity suggests clients will need services soon',
          'short-term',
          'OT Practice'
        ),
        ...(whiteSpace.suggestedActions || []).slice(0, 2),
      ],
      sources: [...whiteSpace.sources, ...investments.flatMap(i => i.sources)].slice(0, 5),
      whiteSpaceData: whiteSpace.whiteSpaceData,
    })
  }
  
  private createCapabilityFocusInsight(
    capability: string,
    insights: AgentInsight[]
  ): AgentInsight {
    const isNicheCapability = NICHE_CAPABILITIES.includes(capability)
    
    return this.createInsight({
      insightType: 'action',
      title: `Capability Demand: ${capability}`,
      summary: `${insights.length} separate signals indicate demand for ${capability}. ${isNicheCapability ? 'This is a niche capability where we can differentiate.' : 'Consider strengthening this capability.'}`,
      confidence: 0.75,
      impactScore: isNicheCapability ? 9 : 7,
      relevantCapabilities: [capability],
      relevantSectors: [...new Set(insights.flatMap(i => i.relevantSectors))],
      suggestedActions: [
        this.createAction(
          `${isNicheCapability ? 'Productize and market' : 'Strengthen'} ${capability} offering`,
          `Multiple signals indicate market demand`,
          isNicheCapability ? 'immediate' : 'short-term',
          'OT Practice'
        ),
        this.createAction(
          'Create eminence content showcasing this capability',
          'Build market awareness and thought leadership',
          'short-term',
          'Marketing'
        ),
      ],
      sources: insights.flatMap(i => i.sources).slice(0, 3),
    })
  }
  
  // ============================================================================
  // DETECTION METHODS
  // ============================================================================
  
  private detectRfpOpportunity(text: string, news: any): AgentInsight | null {
    const textLower = text.toLowerCase()
    
    const rfpSignals = [
      'RFP', 'request for proposal', 'seeking vendor', 'looking for partner',
      'solicitation', 'bid opportunity', 'procurement', 'seeking bids',
    ]
    
    if (!rfpSignals.some(s => textLower.includes(s.toLowerCase()))) return null
    
    // Check for relevant sectors
    const sectors = ['nuclear', 'semiconductor', 'data center', 'energy', 'industrial']
    const matchedSector = sectors.find(s => textLower.includes(s))
    
    if (!matchedSector) return null
    
    return this.createInsight({
      insightType: 'action',
      title: `RFP/Procurement Opportunity: ${matchedSector}`,
      summary: `Active procurement or RFP detected in ${matchedSector} sector. ${news.title}`,
      confidence: 0.85,
      impactScore: 8,
      relevantSectors: [matchedSector],
      suggestedActions: [
        this.createAction(
          'Respond to RFP/procurement opportunity',
          'Active opportunity with defined timeline',
          'immediate',
          'BD Team'
        ),
        this.createAction(
          'Assemble pursuit team',
          'Dedicated resources needed for proposal',
          'immediate',
          'Delivery Lead'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
    })
  }
  
  private detectInitiativeTrigger(text: string, news: any): AgentInsight | null {
    const textLower = text.toLowerCase()
    
    for (const [id, initiative] of Object.entries(STRATEGIC_INITIATIVES)) {
      const matchedTriggers = initiative.triggers.filter(t => textLower.includes(t.toLowerCase()))
      
      if (matchedTriggers.length >= 2) {
        return this.createInsight({
          insightType: 'action',
          title: `Initiative Trigger: ${initiative.name}`,
          summary: `News aligns with ${initiative.name} initiative. ${initiative.description}`,
          confidence: 0.7,
          impactScore: 7,
          relevantCapabilities: initiative.capabilities,
          suggestedActions: [
            this.createAction(
              `Activate ${initiative.name} playbook`,
              'Strategic initiative trigger detected',
              'short-term',
              'Strategy Team'
            ),
          ],
          sources: [this.createSource(news.url, news.title, news.source)],
        })
      }
    }
    
    return null
  }
  
  // ============================================================================
  // NO-REGRETS ANALYSIS
  // ============================================================================
  
  private identifyNoRegretsMoves(
    insights: AgentInsight[],
    data: AgentDataContext
  ): AgentInsight[] {
    const noRegrets: AgentInsight[] = []
    
    // No-regrets move criteria:
    // 1. Low risk, high potential reward
    // 2. Aligns with multiple signals
    // 3. Builds capabilities regardless of specific opportunity outcome
    
    // Capability building that shows up repeatedly
    const capabilityDemand = new Map<string, number>()
    for (const insight of insights) {
      for (const cap of insight.relevantCapabilities) {
        capabilityDemand.set(cap, (capabilityDemand.get(cap) || 0) + 1)
      }
    }
    
    // Find capabilities with strong demand
    for (const [cap, count] of capabilityDemand) {
      if (count >= 3 && NICHE_CAPABILITIES.includes(cap)) {
        noRegrets.push(this.createInsight({
          insightType: 'action',
          title: `No-Regrets Move: Invest in ${cap}`,
          summary: `${count} signals point to ${cap}. Building this capability is low-risk as demand is clearly emerging across multiple opportunities.`,
          confidence: 0.85,
          impactScore: 8,
          relevantCapabilities: [cap],
          suggestedActions: [
            this.createAction(
              `Invest in ${cap} capability development`,
              'Multiple signals confirm demand - low-risk investment',
              'short-term',
              'OT Practice'
            ),
            this.createAction(
              'Recruit/train specialists in this area',
              'Build team capacity to capture emerging demand',
              'medium-term',
              'Talent'
            ),
          ],
          sources: [],
        }))
      }
    }
    
    // Geographic presence that shows up repeatedly
    const geoMentions = new Map<string, number>()
    for (const insight of insights) {
      if (insight.whiteSpaceData?.geographicFocus) {
        for (const geo of insight.whiteSpaceData.geographicFocus) {
          geoMentions.set(geo, (geoMentions.get(geo) || 0) + 1)
        }
      }
    }
    
    for (const [geo, count] of geoMentions) {
      if (count >= 2) {
        noRegrets.push(this.createInsight({
          insightType: 'action',
          title: `No-Regrets Move: Establish ${geo} Presence`,
          summary: `${count} opportunities identified in ${geo}. Establishing presence now will position us for multiple pursuits.`,
          confidence: 0.75,
          impactScore: 7,
          suggestedActions: [
            this.createAction(
              `Develop ${geo} market presence`,
              'Multiple opportunities in this geography',
              'short-term',
              'BD Team'
            ),
          ],
          sources: [],
          whiteSpaceData: {
            competitorPresence: 'minimal',
            competitorsList: [],
            marketMaturity: 'growing',
            geographicFocus: [geo],
            entryBarriers: 'low',
            requiredCapabilities: [],
            windowOfOpportunity: 'open',
          },
        }))
      }
    }
    
    return noRegrets
  }
  
  // ============================================================================
  // PRIORITIZATION
  // ============================================================================
  
  private prioritizeActions(insights: AgentInsight[]): AgentInsight[] {
    // Score and sort insights
    const scored = insights.map(insight => {
      let score = insight.impactScore * 10 + insight.confidence * 10
      
      // Boost for immediate urgency
      const hasImmediateAction = insight.suggestedActions.some(a => a.urgency === 'immediate')
      if (hasImmediateAction) score += 20
      
      // Boost for multiple aligned signals
      if (insight.sources.length >= 3) score += 10
      
      // Boost for niche capabilities
      if (insight.relevantCapabilities.some(c => NICHE_CAPABILITIES.includes(c))) {
        score += 15
      }
      
      return { insight, score }
    })
    
    // Sort by score and deduplicate
    scored.sort((a, b) => b.score - a.score)
    
    const seen = new Set<string>()
    const unique: AgentInsight[] = []
    
    for (const { insight } of scored) {
      const key = insight.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 40)
      if (!seen.has(key)) {
        seen.add(key)
        unique.push(insight)
      }
    }
    
    return unique.slice(0, this.config.maxInsightsPerRun)
  }
  
  // ============================================================================
  // HELPER METHODS
  // ============================================================================
  
  private groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
    return items.reduce((groups, item) => {
      const key = keyFn(item)
      if (!groups[key]) groups[key] = []
      groups[key].push(item)
      return groups
    }, {} as Record<string, T[]>)
  }
  
  private deduplicateActions(actions: SuggestedAction[]): SuggestedAction[] {
    const seen = new Set<string>()
    const unique: SuggestedAction[] = []
    
    for (const action of actions) {
      const key = action.action.toLowerCase().slice(0, 50)
      if (!seen.has(key)) {
        seen.add(key)
        unique.push(action)
      }
    }
    
    return unique
  }
  
  private escalateUrgency(
    current: SuggestedAction['urgency'],
    highPriorityCount: number
  ): SuggestedAction['urgency'] {
    if (highPriorityCount < 2) return current
    
    const escalation: Record<string, SuggestedAction['urgency']> = {
      'long-term': 'medium-term',
      'medium-term': 'short-term',
      'short-term': 'immediate',
      'immediate': 'immediate',
    }
    
    return escalation[current] || current
  }
  
  private formatAmount(millions: number): string {
    if (millions >= 1000) {
      return `${(millions / 1000).toFixed(1)}B`
    }
    return `${millions}M`
  }
}

// Export singleton instance
export const actionRecommender = new ActionRecommenderAgent()
