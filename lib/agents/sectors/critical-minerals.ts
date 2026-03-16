/**
 * Critical Minerals Sector Agent
 * 
 * Monitors the critical minerals sector including:
 * - Rare earth processing
 * - Lithium production and refining
 * - Domestic mineral supply chain
 * - Battery material production
 */

import { BaseSectorAgent, SectorConfig } from './base-sector-agent'
import { AgentDataContext } from '../base-agent'
import { AgentInsight } from '../types'

const CRITICAL_MINERALS_CONFIG: SectorConfig = {
  id: 'critical-minerals-agent',
  name: 'Critical Minerals Sector',
  description: 'Monitors rare earths, lithium, and critical mineral supply chains',
  
  keywords: [
    'rare earth', 'rare earths', 'REE', 'critical mineral', 'critical minerals',
    'lithium', 'cobalt', 'nickel', 'graphite', 'manganese',
    'gallium', 'germanium', 'vanadium', 'tungsten',
    'mineral processing', 'mineral refining', 'mineral extraction',
    'battery materials', 'cathode', 'anode',
  ],
  
  keyPlayers: [
    // US Players
    'MP Materials', 'Piedmont Lithium', 'Albemarle', 'Livent',
    'Redwood Materials', 'Li-Cycle', 'American Battery Technology',
    'Energy Fuels', 'Ucore', 'USA Rare Earth',
    // International (US operations)
    'Lynas', 'Syrah Resources', 'Novonix',
    // Automotive/Battery
    'Tesla', 'Ford', 'GM', 'Toyota', 'Panasonic', 'LG Energy',
  ],
  
  policies: [
    'critical minerals', 'supply chain security', 'Defense Production Act',
    'DPA', 'IRA critical minerals', 'domestic processing',
    'China dependence', 'mineral security', 'strategic reserve',
  ],
  
  serviceOpportunities: [
    'Supply Chain', 'OT Strategy', 'Regulatory Compliance',
    'Process Safety', 'Environmental Compliance', 'Sustainability',
    'M&A Advisory', 'Due Diligence',
  ],
  
  searchQueries: [
    'rare earth processing US announcement',
    'lithium production facility investment',
    'critical minerals DOE funding',
    'battery materials plant construction',
    'domestic mineral refining',
    'rare earth separation facility',
    'lithium refinery groundbreaking',
    'critical minerals supply chain',
    'battery recycling facility',
    'mineral processing expansion',
  ],
  
  highValueSignals: [
    'DOE funding', 'DPA', 'Defense Production Act',
    'domestic production', 'onshore', 'reshoring',
    'refinery', 'processing facility', 'separation plant',
    'billion investment', 'supply chain security',
    'China', 'reduce dependence',
  ],
}

export class CriticalMineralsSectorAgent extends BaseSectorAgent {
  constructor() {
    super(CRITICAL_MINERALS_CONFIG)
  }
  
  protected async analyzeSectorSpecific(data: AgentDataContext): Promise<AgentInsight[]> {
    const insights: AgentInsight[] = []
    
    for (const news of data.newsItems) {
      const text = `${news.title} ${news.description}`
      const textLower = text.toLowerCase()
      
      // Check for domestic production initiatives
      const domesticInsight = this.analyzeDomesticProduction(text, textLower, news)
      if (domesticInsight) insights.push(domesticInsight)
      
      // Check for supply chain security
      const supplyChainInsight = this.analyzeSupplyChainSecurity(text, textLower, news)
      if (supplyChainInsight) insights.push(supplyChainInsight)
      
      // Check for battery material developments
      const batteryInsight = this.analyzeBatteryMaterials(text, textLower, news)
      if (batteryInsight) insights.push(batteryInsight)
    }
    
    return insights
  }
  
  private analyzeDomesticProduction(text: string, textLower: string, news: any): AgentInsight | null {
    const domesticSignals = [
      'domestic production', 'us production', 'onshore',
      'reshoring', 'domestic processing', 'us refinery',
      'american production', 'made in america',
    ]
    
    const mineralSignals = [
      'rare earth', 'lithium', 'cobalt', 'nickel',
      'graphite', 'critical mineral', 'battery material',
    ]
    
    const hasDomestic = domesticSignals.some(s => textLower.includes(s))
    const hasMineral = mineralSignals.some(s => textLower.includes(s))
    
    if (!hasDomestic || !hasMineral) return null
    
    const investmentAmount = this.extractInvestmentAmount(text)
    
    // Find company
    const companies = CRITICAL_MINERALS_CONFIG.keyPlayers.filter(c =>
      textLower.includes(c.toLowerCase())
    )
    const company = companies[0] || 'Company'
    
    return this.createInsight({
      insightType: investmentAmount ? 'investment' : 'signal',
      title: `Domestic Critical Minerals: ${company}`,
      summary: `Domestic critical minerals production initiative. ${investmentAmount ? `$${this.formatAmount(investmentAmount)} investment.` : ''} ${news.title}`,
      details: text.slice(0, 500),
      confidence: 0.8,
      impactScore: 8,
      relevantSectors: ['critical-minerals'],
      relevantPolicies: ['Supply Chain Security', 'IRA', 'DPA'],
      relevantCapabilities: [
        'Supply Chain', 'OT Strategy', 'Process Safety',
        'Environmental Compliance', 'Regulatory Compliance',
      ],
      suggestedActions: [
        this.createAction(
          `Pursue ${company} for supply chain and OT services`,
          'Domestic mineral production = strategic priority with service needs',
          'short-term',
          'BD Team'
        ),
        this.createAction(
          'Offer environmental and regulatory compliance support',
          'Mineral processing has complex permitting requirements',
          'short-term',
          'Environmental Practice'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
      investmentData: investmentAmount ? {
        investmentType: 'expansion',
        amount: investmentAmount,
        recipient: company,
        serviceOpportunity: ['Supply Chain', 'OT Strategy', 'Regulatory Compliance'],
        estimatedServiceValue: Math.round(investmentAmount * 0.01),
      } : undefined,
    })
  }
  
  private analyzeSupplyChainSecurity(text: string, textLower: string, news: any): AgentInsight | null {
    const securitySignals = [
      'supply chain security', 'reduce dependence', 'china dependence',
      'strategic reserve', 'defense production act', 'dpa',
      'secure supply', 'supply chain resilience',
    ]
    
    const mineralSignals = [
      'rare earth', 'lithium', 'critical mineral', 'battery',
    ]
    
    const hasSecurity = securitySignals.some(s => textLower.includes(s))
    const hasMineral = mineralSignals.some(s => textLower.includes(s))
    
    if (!hasSecurity || !hasMineral) return null
    
    // Check if it's a government action
    const governmentSignals = ['doe', 'department of energy', 'dod', 'defense', 'administration', 'federal']
    const isGovernment = governmentSignals.some(s => textLower.includes(s))
    
    return this.createInsight({
      insightType: isGovernment ? 'policy' : 'signal',
      title: `Critical Minerals Supply Chain Security${isGovernment ? ' (Government Action)' : ''}`,
      summary: `Supply chain security initiative for critical minerals. ${news.title}`,
      details: text.slice(0, 500),
      confidence: isGovernment ? 0.85 : 0.7,
      impactScore: isGovernment ? 8 : 7,
      relevantSectors: ['critical-minerals'],
      relevantPolicies: ['Supply Chain Security', 'DPA', 'IRA'],
      relevantCapabilities: [
        'Supply Chain', 'Risk Advisory', 'Due Diligence',
        'M&A Advisory', 'Strategy',
      ],
      suggestedActions: [
        this.createAction(
          'Develop critical minerals supply chain advisory offering',
          'Supply chain security is top priority for government and industry',
          'short-term',
          'Supply Chain Practice'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
    })
  }
  
  private analyzeBatteryMaterials(text: string, textLower: string, news: any): AgentInsight | null {
    const batterySignals = [
      'battery material', 'cathode', 'anode', 'battery recycling',
      'battery grade', 'ev battery', 'cell manufacturing',
    ]
    
    const productionSignals = [
      'facility', 'plant', 'factory', 'production',
      'investment', 'expansion', 'construction',
    ]
    
    const hasBattery = batterySignals.some(s => textLower.includes(s))
    const hasProduction = productionSignals.some(s => textLower.includes(s))
    
    if (!hasBattery || !hasProduction) return null
    
    const investmentAmount = this.extractInvestmentAmount(text)
    if (!investmentAmount || investmentAmount < 50) return null
    
    // Find company
    const batteryCompanies = ['Redwood Materials', 'Li-Cycle', 'American Battery Technology', 'Tesla', 'Panasonic']
    const company = batteryCompanies.find(c => textLower.includes(c.toLowerCase())) || 'Battery company'
    
    return this.createInsight({
      insightType: 'investment',
      title: `Battery Materials: ${company} Investment`,
      summary: `Battery materials production investment of $${this.formatAmount(investmentAmount)}. ${news.title}`,
      details: text.slice(0, 500),
      confidence: 0.8,
      impactScore: Math.min(10, 6 + Math.floor(investmentAmount / 200)),
      relevantSectors: ['critical-minerals', 'ev-battery'],
      relevantCapabilities: [
        'Supply Chain', 'OT Strategy', 'Process Safety',
        'Sustainability', 'Smart Factory',
      ],
      suggestedActions: [
        this.createAction(
          `Pursue ${company} for manufacturing services`,
          'Battery materials = growing sector with OT needs',
          'short-term',
          'BD Team'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
      investmentData: {
        investmentType: 'expansion',
        amount: investmentAmount,
        recipient: company,
        serviceOpportunity: ['Supply Chain', 'OT Strategy', 'Smart Factory'],
        estimatedServiceValue: Math.round(investmentAmount * 0.01),
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

export const criticalMineralsAgent = new CriticalMineralsSectorAgent()
