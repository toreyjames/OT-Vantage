/**
 * Build Cycle Intelligence Agent
 * 
 * Monitors opportunities for Build Cycle Intelligence capability:
 * - Policy to pipeline connections
 * - Market timing signals
 * - Procurement intelligence
 * - Service demand patterns
 */

import { BaseCapabilityAgent, CapabilityConfig } from './base-capability-agent'
import { AgentDataContext } from '../base-agent'
import { AgentInsight } from '../types'

const BUILD_INTELLIGENCE_CONFIG: CapabilityConfig = {
  id: 'build-intelligence-agent',
  name: 'Build Cycle Intelligence',
  description: 'Monitors market intelligence opportunities connecting policy to pipeline',
  
  capability: 'Build Cycle Intelligence',
  
  demandSignals: [
    'market intelligence', 'pipeline', 'procurement',
    'policy impact', 'investment pipeline', 'project pipeline',
    'market analysis', 'competitive intelligence', 'market research',
    'sector analysis', 'industry trends', 'market outlook',
    'capital flows', 'investment trends', 'funding trends',
  ],
  
  relevantPhases: ['design', 'construction', 'commissioning', 'operation'],
  
  targetSectors: [
    'nuclear', 'semiconductor', 'data center', 'battery',
    'clean energy', 'critical minerals', 'grid', 'hydrogen',
  ],
  
  searchQueries: [
    'industrial policy impact investment',
    'CHIPS Act pipeline projects',
    'IRA investment pipeline',
    'infrastructure investment outlook',
    'manufacturing investment trends',
    'energy transition investment',
    'industrial reshoring pipeline',
    'build economy trends',
  ],
  
  competitors: [],
  
  differentiators: [
    'Policy to pipeline connection',
    'Real-time investment tracking',
    'Procurement timing intelligence',
    'Service demand forecasting',
    'Cross-sector pattern recognition',
  ],
}

export class BuildIntelligenceAgent extends BaseCapabilityAgent {
  constructor() {
    super(BUILD_INTELLIGENCE_CONFIG)
  }
  
  protected async analyzeCapabilitySpecific(data: AgentDataContext): Promise<AgentInsight[]> {
    const insights: AgentInsight[] = []
    
    for (const news of data.newsItems) {
      const text = `${news.title} ${news.description}`
      const textLower = text.toLowerCase()
      
      // Check for policy-pipeline connections
      const policyInsight = this.analyzePolicyPipeline(text, textLower, news)
      if (policyInsight) insights.push(policyInsight)
      
      // Check for investment trend signals
      const trendInsight = this.analyzeInvestmentTrend(text, textLower, news)
      if (trendInsight) insights.push(trendInsight)
      
      // Check for procurement signals
      const procurementInsight = this.analyzeProcurement(text, textLower, news)
      if (procurementInsight) insights.push(procurementInsight)
    }
    
    // Generate aggregate market intelligence
    const marketInsights = this.generateMarketIntelligence(data)
    insights.push(...marketInsights)
    
    return insights
  }
  
  private analyzePolicyPipeline(text: string, textLower: string, news: any): AgentInsight | null {
    const policySignals = [
      'chips act', 'ira', 'inflation reduction act', 'bipartisan infrastructure',
      'doe', 'department of energy', 'executive order', 'administration',
      'policy', 'regulation', 'incentive', 'subsidy',
    ]
    
    const pipelineSignals = [
      'investment', 'project', 'facility', 'plant', 'factory',
      'construction', 'development', 'pipeline',
    ]
    
    const hasPolicy = policySignals.some(s => textLower.includes(s))
    const hasPipeline = pipelineSignals.some(s => textLower.includes(s))
    
    if (!hasPolicy || !hasPipeline) return null
    
    const investmentAmount = this.extractInvestmentAmount(text)
    
    // Identify the policy
    let policyName = 'Policy'
    if (textLower.includes('chips')) policyName = 'CHIPS Act'
    else if (textLower.includes('ira') || textLower.includes('inflation reduction')) policyName = 'IRA'
    else if (textLower.includes('doe') || textLower.includes('department of energy')) policyName = 'DOE'
    
    // Identify the sector
    const targetSector = this.capabilityConfig.targetSectors.find(s => textLower.includes(s))
    
    return this.createInsight({
      insightType: 'signal',
      title: `Policy-Pipeline: ${policyName} → ${targetSector || 'Industrial'} Investment`,
      summary: `${policyName} driving ${targetSector || 'industrial'} investment pipeline. Build Cycle Intelligence value. ${news.title}`,
      details: `Policy to pipeline connection demonstrates our unique market intelligence capability.`,
      confidence: 0.75,
      impactScore: investmentAmount && investmentAmount >= 500 ? 8 : 7,
      relevantSectors: targetSector ? [targetSector] : [],
      relevantPolicies: [policyName],
      relevantCapabilities: ['Build Cycle Intelligence'],
      suggestedActions: [
        this.createAction(
          'Update OT Vantage with policy-pipeline connection',
          'Capture this for client intelligence briefings',
          'short-term',
          'Intelligence Team'
        ),
        this.createAction(
          'Prepare client briefing on this development',
          'Demonstrate value of Build Cycle Intelligence',
          'short-term',
          'BD Team'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
    })
  }
  
  private analyzeInvestmentTrend(text: string, textLower: string, news: any): AgentInsight | null {
    const trendSignals = [
      'trend', 'wave', 'surge', 'boom', 'acceleration',
      'momentum', 'growth', 'increase', 'uptick',
    ]
    
    const investmentSignals = [
      'investment', 'funding', 'capital', 'spending',
      'billion', 'million', 'dollars',
    ]
    
    const hasTrend = trendSignals.some(s => textLower.includes(s))
    const hasInvestment = investmentSignals.some(s => textLower.includes(s))
    
    if (!hasTrend || !hasInvestment) return null
    
    // Check for sector relevance
    const targetSector = this.capabilityConfig.targetSectors.find(s => textLower.includes(s))
    if (!targetSector) return null
    
    return this.createInsight({
      insightType: 'signal',
      title: `Investment Trend: ${targetSector}`,
      summary: `Investment trend signal in ${targetSector} sector. Market momentum indicator. ${news.title}`,
      confidence: 0.7,
      impactScore: 7,
      relevantSectors: [targetSector],
      relevantCapabilities: ['Build Cycle Intelligence'],
      suggestedActions: [
        this.createAction(
          `Increase BD focus on ${targetSector}`,
          'Investment trend indicates growing opportunity',
          'short-term',
          'BD Team'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
    })
  }
  
  private analyzeProcurement(text: string, textLower: string, news: any): AgentInsight | null {
    const procurementSignals = [
      'rfp', 'request for proposal', 'procurement', 'bid',
      'solicitation', 'tender', 'contract award', 'vendor selection',
    ]
    
    const hasProcurement = procurementSignals.some(s => textLower.includes(s))
    if (!hasProcurement) return null
    
    // Check for sector relevance
    const targetSector = this.capabilityConfig.targetSectors.find(s => textLower.includes(s))
    
    return this.createInsight({
      insightType: 'signal',
      title: `Procurement Signal: ${targetSector || 'Industrial'}`,
      summary: `Active procurement activity detected. Timing intelligence for pursuit. ${news.title}`,
      confidence: 0.8,
      impactScore: 8,
      relevantSectors: targetSector ? [targetSector] : [],
      relevantCapabilities: ['Build Cycle Intelligence'],
      suggestedActions: [
        this.createAction(
          'Investigate procurement for pursuit opportunity',
          'Active procurement = immediate opportunity',
          'immediate',
          'BD Team'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
    })
  }
  
  private generateMarketIntelligence(data: AgentDataContext): AgentInsight[] {
    const insights: AgentInsight[] = []
    
    // Aggregate sector activity
    const sectorCounts = new Map<string, { count: number; investment: number }>()
    
    for (const news of data.newsItems) {
      const text = `${news.title} ${news.description}`.toLowerCase()
      const investment = this.extractInvestmentAmount(`${news.title} ${news.description}`) || 0
      
      for (const sector of this.capabilityConfig.targetSectors) {
        if (text.includes(sector)) {
          const current = sectorCounts.get(sector) || { count: 0, investment: 0 }
          current.count++
          current.investment += investment
          sectorCounts.set(sector, current)
        }
      }
    }
    
    // Generate insight for most active sector
    let maxSector = ''
    let maxCount = 0
    for (const [sector, data] of sectorCounts) {
      if (data.count > maxCount) {
        maxCount = data.count
        maxSector = sector
      }
    }
    
    if (maxCount >= 3) {
      const sectorData = sectorCounts.get(maxSector)!
      
      insights.push(this.createInsight({
        insightType: 'signal',
        title: `Market Intelligence: ${maxSector} Activity Spike`,
        summary: `${maxCount} news items about ${maxSector} detected. ${sectorData.investment > 0 ? `$${this.formatAmount(sectorData.investment)} in tracked investments.` : ''} Elevated market activity.`,
        confidence: 0.75,
        impactScore: 7,
        relevantSectors: [maxSector],
        relevantCapabilities: ['Build Cycle Intelligence'],
        suggestedActions: [
          this.createAction(
            `Prioritize ${maxSector} in BD activities`,
            'Market activity spike indicates opportunity concentration',
            'short-term',
            'BD Team'
          ),
          this.createAction(
            `Prepare ${maxSector} intelligence briefing`,
            'Package insights for client delivery',
            'short-term',
            'Intelligence Team'
          ),
        ],
        sources: [],
      }))
    }
    
    return insights
  }
  
  private formatAmount(millions: number): string {
    if (millions >= 1000) {
      return `${(millions / 1000).toFixed(1)}B`
    }
    return `${millions}M`
  }
}

export const buildIntelligenceAgent = new BuildIntelligenceAgent()
