/**
 * Data Center Sector Agent
 * 
 * Monitors the data center sector including:
 * - AI infrastructure buildout
 * - Hyperscaler expansions
 * - Power and energy challenges
 * - Stargate and mega-projects
 */

import { BaseSectorAgent, SectorConfig } from './base-sector-agent'
import { AgentDataContext } from '../base-agent'
import { AgentInsight } from '../types'

const DATA_CENTER_CONFIG: SectorConfig = {
  id: 'data-center-agent',
  name: 'Data Center Sector',
  description: 'Monitors data centers, AI infrastructure, and hyperscaler activity',
  
  keywords: [
    'data center', 'datacenter', 'hyperscale', 'hyperscaler',
    'colocation', 'colo', 'AI infrastructure', 'AI compute',
    'cloud infrastructure', 'server farm', 'compute facility',
    'GPU cluster', 'AI training', 'inference',
  ],
  
  keyPlayers: [
    // Hyperscalers
    'Microsoft', 'Google', 'Amazon', 'Meta', 'Oracle', 'Apple',
    // AI Companies
    'OpenAI', 'Anthropic', 'xAI', 'Nvidia',
    // Data center operators
    'Equinix', 'Digital Realty', 'QTS', 'CyrusOne', 'Vantage',
    'Compass Datacenters', 'Switch', 'CoreSite', 'DataBank',
    // Power players
    'SoftBank', 'BlackRock', 'Brookfield',
  ],
  
  policies: [
    'Stargate', 'AI infrastructure', 'AI executive order',
    'data center power', 'grid capacity', 'energy permitting',
    'AI Action Plan',
  ],
  
  serviceOpportunities: [
    'OT Strategy', 'Industrial AI Security', 'Power Strategy',
    'Sustainability', 'Smart Building', 'Asset Management',
    'Commissioning Security', 'EPC Governance',
  ],
  
  searchQueries: [
    'data center construction announcement',
    'hyperscale data center investment',
    'AI infrastructure buildout',
    'Stargate AI project',
    'data center power shortage',
    'AI compute facility groundbreaking',
    'Microsoft data center expansion',
    'Google data center investment',
    'Amazon AWS infrastructure',
    'Meta AI data center',
    'data center nuclear power',
  ],
  
  highValueSignals: [
    'Stargate', 'hundred billion', 'billion dollar',
    'AI campus', 'AI cluster', 'GPU',
    'power purchase agreement', 'PPA', 'nuclear', 'clean energy',
    'megawatt', 'gigawatt', 'power capacity',
    'construction begins', 'groundbreaking',
  ],
}

export class DataCenterSectorAgent extends BaseSectorAgent {
  constructor() {
    super(DATA_CENTER_CONFIG)
  }
  
  protected async analyzeSectorSpecific(data: AgentDataContext): Promise<AgentInsight[]> {
    const insights: AgentInsight[] = []
    
    for (const news of data.newsItems) {
      const text = `${news.title} ${news.description}`
      const textLower = text.toLowerCase()
      
      // Check for Stargate/mega-project activity
      const stargateInsight = this.analyzeStargateActivity(text, textLower, news)
      if (stargateInsight) insights.push(stargateInsight)
      
      // Check for power/energy challenges
      const powerInsight = this.analyzePowerChallenge(text, textLower, news)
      if (powerInsight) insights.push(powerInsight)
      
      // Check for hyperscaler expansion
      const hyperscaleInsight = this.analyzeHyperscalerExpansion(text, textLower, news)
      if (hyperscaleInsight) insights.push(hyperscaleInsight)
    }
    
    return insights
  }
  
  private analyzeStargateActivity(text: string, textLower: string, news: any): AgentInsight | null {
    const stargateSignals = [
      'stargate', 'hundred billion', '$500 billion', '$100 billion',
      'ai infrastructure initiative', 'national ai', 'ai buildout',
    ]
    
    const hasStargateSignal = stargateSignals.some(s => textLower.includes(s))
    if (!hasStargateSignal) return null
    
    const investmentAmount = this.extractInvestmentAmount(text)
    
    // Find partners
    const partners = ['OpenAI', 'SoftBank', 'Oracle', 'Microsoft']
    const mentionedPartners = partners.filter(p => text.includes(p))
    
    return this.createInsight({
      insightType: 'signal',
      title: 'CRITICAL: Stargate/Major AI Infrastructure',
      summary: `Major AI infrastructure initiative activity. ${mentionedPartners.length > 0 ? `Partners: ${mentionedPartners.join(', ')}.` : ''} ${news.title}`,
      details: text.slice(0, 500),
      confidence: 0.95,
      impactScore: 10,
      relevantSectors: ['data-center', 'ai-infrastructure'],
      relevantPolicies: ['Stargate', 'AI Action Plan', 'eo-14179-ai-leadership'],
      relevantCapabilities: [
        'OT Strategy', 'Industrial AI Security', 'Power Strategy',
        'Commissioning Security', 'EPC Governance', 'Sustainability',
      ],
      suggestedActions: [
        this.createAction(
          'URGENT: Position for Stargate-related engagements',
          'Largest AI infrastructure initiative in history',
          'immediate',
          'BD Team'
        ),
        this.createAction(
          'Develop AI infrastructure security offering',
          'These facilities will need OT and AI security',
          'short-term',
          'OT Practice'
        ),
        this.createAction(
          'Engage with identified partners',
          'Build relationships across the ecosystem',
          'immediate',
          'BD Team'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
      investmentData: {
        investmentType: 'expansion',
        amount: investmentAmount,
        serviceOpportunity: ['OT Strategy', 'AI Security', 'Power Strategy'],
        estimatedServiceValue: investmentAmount ? Math.round(investmentAmount * 0.005) : undefined,
      },
    })
  }
  
  private analyzePowerChallenge(text: string, textLower: string, news: any): AgentInsight | null {
    const powerSignals = [
      'power shortage', 'power constraint', 'grid capacity',
      'power demand', 'energy challenge', 'electricity demand',
      'power purchase', 'ppa', 'clean energy', 'nuclear power',
    ]
    
    const hasPowerSignal = powerSignals.some(s => textLower.includes(s))
    const hasDataCenter = textLower.includes('data center') || textLower.includes('ai') || textLower.includes('hyperscale')
    
    if (!hasPowerSignal || !hasDataCenter) return null
    
    // Check if it's a solution or a problem
    const solutionSignals = ['partnership', 'agreement', 'investment', 'building', 'developing']
    const isSolution = solutionSignals.some(s => textLower.includes(s))
    
    return this.createInsight({
      insightType: isSolution ? 'signal' : 'capability-gap',
      title: `Data Center Power: ${isSolution ? 'Solution' : 'Challenge'}`,
      summary: `Data center power ${isSolution ? 'solution' : 'challenge'} detected. ${news.title}`,
      details: text.slice(0, 500),
      confidence: 0.8,
      impactScore: 8,
      relevantSectors: ['data-center', 'energy'],
      relevantCapabilities: [
        'Power Strategy', 'Sustainability', 'OT Strategy',
        'Grid Integration', 'Energy Advisory',
      ],
      suggestedActions: [
        this.createAction(
          'Offer power strategy advisory services',
          'Power is critical bottleneck for AI infrastructure',
          'short-term',
          'Energy Practice'
        ),
        this.createAction(
          'Connect data center clients with energy solutions',
          'Bridge tech and energy sectors',
          'short-term',
          'BD Team'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
    })
  }
  
  private analyzeHyperscalerExpansion(text: string, textLower: string, news: any): AgentInsight | null {
    const hyperscalers = ['microsoft', 'google', 'amazon', 'aws', 'meta', 'oracle', 'apple']
    const expansionSignals = [
      'expansion', 'new data center', 'building', 'construction',
      'investment', 'campus', 'facility', 'region',
    ]
    
    const mentionedHyperscaler = hyperscalers.find(h => textLower.includes(h))
    const hasExpansionSignal = expansionSignals.some(s => textLower.includes(s))
    const hasDataCenter = textLower.includes('data center') || textLower.includes('cloud') || textLower.includes('infrastructure')
    
    if (!mentionedHyperscaler || !hasExpansionSignal || !hasDataCenter) return null
    
    const investmentAmount = this.extractInvestmentAmount(text)
    if (!investmentAmount || investmentAmount < 100) return null
    
    const formattedHyperscaler = mentionedHyperscaler.charAt(0).toUpperCase() + mentionedHyperscaler.slice(1)
    
    // Extract location
    const states = [
      'Virginia', 'Texas', 'Arizona', 'Oregon', 'Ohio', 'Georgia',
      'Iowa', 'Oklahoma', 'Nevada', 'North Carolina',
    ]
    const location = states.find(s => text.includes(s)) || 'US'
    
    return this.createInsight({
      insightType: 'investment',
      title: `Hyperscaler Expansion: ${formattedHyperscaler} in ${location}`,
      summary: `${formattedHyperscaler} expanding data center capacity in ${location} with $${this.formatAmount(investmentAmount)} investment.`,
      details: text.slice(0, 500),
      confidence: 0.85,
      impactScore: Math.min(10, 7 + Math.floor(investmentAmount / 2000)),
      relevantSectors: ['data-center'],
      relevantCapabilities: [
        'OT Strategy', 'Commissioning Security', 'Smart Building',
        'Sustainability', 'Power Strategy',
      ],
      suggestedActions: [
        this.createAction(
          `Pursue ${formattedHyperscaler} ${location} engagement`,
          'Large hyperscaler investment = significant service opportunity',
          'immediate',
          'BD Team'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
      investmentData: {
        investmentType: 'expansion',
        amount: investmentAmount,
        investor: formattedHyperscaler,
        destination: `${formattedHyperscaler} ${location} Data Center`,
        serviceOpportunity: ['OT Strategy', 'Commissioning Security', 'Sustainability'],
        estimatedServiceValue: Math.round(investmentAmount * 0.008),
      },
    })
  }
  
  private formatAmount(millions: number): string {
    if (millions >= 1000) {
      return `${(millions / 1000).toFixed(1)}B`
    }
    return `${millions}M`
  }
}

export const dataCenterAgent = new DataCenterSectorAgent()
