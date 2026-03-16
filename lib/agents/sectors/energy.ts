/**
 * Energy Sector Agent
 * 
 * Monitors the broader energy sector including:
 * - Grid infrastructure and modernization
 * - Clean energy deployments
 * - Hydrogen infrastructure
 * - Energy storage
 */

import { BaseSectorAgent, SectorConfig } from './base-sector-agent'
import { AgentDataContext } from '../base-agent'
import { AgentInsight } from '../types'

const ENERGY_CONFIG: SectorConfig = {
  id: 'energy-agent',
  name: 'Energy Sector',
  description: 'Monitors grid, clean energy, hydrogen, and energy storage',
  
  keywords: [
    'grid', 'transmission', 'substation', 'utility', 'power grid',
    'solar', 'wind', 'renewable', 'clean energy',
    'hydrogen', 'green hydrogen', 'blue hydrogen', 'electrolyzer',
    'energy storage', 'battery storage', 'grid storage',
    'HVDC', 'interconnection', 'grid modernization',
  ],
  
  keyPlayers: [
    // Utilities
    'NextEra', 'Duke Energy', 'Southern Company', 'Dominion',
    'AES', 'Xcel Energy', 'Entergy', 'PG&E', 'Edison',
    // Grid equipment
    'GE Vernova', 'Siemens Energy', 'Hitachi Energy', 'ABB',
    'Schneider Electric', 'Eaton',
    // Renewable developers
    'Invenergy', 'Pattern Energy', 'Avangrid', 'Clearway',
    'Orsted', 'Vestas', 'First Solar', 'Canadian Solar',
    // Hydrogen
    'Air Products', 'Plug Power', 'Nel', 'Bloom Energy',
    'Nikola', 'Hyzon', 'Cummins',
    // Storage
    'Tesla', 'Fluence', 'Form Energy', 'ESS',
  ],
  
  policies: [
    'IRA', 'Inflation Reduction Act', 'production tax credit', 'PTC',
    'investment tax credit', 'ITC', 'clean energy credit',
    'grid reliability', 'FERC', 'interconnection reform',
    'hydrogen hub', 'DOE hydrogen',
  ],
  
  serviceOpportunities: [
    'OT Strategy', 'Grid Modernization', 'SCADA Security',
    'Asset Management', 'Sustainability', 'Regulatory Compliance',
    'Smart Grid', 'Digital Twin', 'Workforce Planning',
  ],
  
  searchQueries: [
    'grid modernization investment',
    'transmission line construction',
    'utility infrastructure spending',
    'renewable energy project announcement',
    'hydrogen hub DOE funding',
    'energy storage deployment',
    'HVDC project announcement',
    'grid reliability investment',
    'clean energy tax credit',
    'utility rate case infrastructure',
  ],
  
  highValueSignals: [
    'grid modernization', 'transmission expansion', 'HVDC',
    'hydrogen hub', 'hydrogen production',
    'grid-scale storage', 'long-duration storage',
    'interconnection', 'FERC approval',
    'billion investment', 'rate case',
  ],
}

export class EnergySectorAgent extends BaseSectorAgent {
  constructor() {
    super(ENERGY_CONFIG)
  }
  
  protected async analyzeSectorSpecific(data: AgentDataContext): Promise<AgentInsight[]> {
    const insights: AgentInsight[] = []
    
    for (const news of data.newsItems) {
      const text = `${news.title} ${news.description}`
      const textLower = text.toLowerCase()
      
      // Check for grid infrastructure
      const gridInsight = this.analyzeGridInfrastructure(text, textLower, news)
      if (gridInsight) insights.push(gridInsight)
      
      // Check for hydrogen developments
      const hydrogenInsight = this.analyzeHydrogenDevelopment(text, textLower, news)
      if (hydrogenInsight) insights.push(hydrogenInsight)
      
      // Check for energy storage
      const storageInsight = this.analyzeEnergyStorage(text, textLower, news)
      if (storageInsight) insights.push(storageInsight)
    }
    
    return insights
  }
  
  private analyzeGridInfrastructure(text: string, textLower: string, news: any): AgentInsight | null {
    const gridSignals = [
      'grid modernization', 'transmission', 'substation',
      'grid infrastructure', 'hvdc', 'interconnection',
      'grid upgrade', 'grid expansion',
    ]
    
    const hasGridSignal = gridSignals.some(s => textLower.includes(s))
    if (!hasGridSignal) return null
    
    const investmentAmount = this.extractInvestmentAmount(text)
    if (!investmentAmount || investmentAmount < 50) return null
    
    // Find utility
    const utilities = ['NextEra', 'Duke Energy', 'Southern Company', 'Dominion', 'AES', 'Xcel', 'Entergy', 'PG&E']
    const mentionedUtility = utilities.find(u => text.includes(u))
    
    return this.createInsight({
      insightType: 'investment',
      title: `Grid Infrastructure: ${mentionedUtility || 'Utility'} Investment`,
      summary: `Grid infrastructure investment of $${this.formatAmount(investmentAmount)} detected. ${news.title}`,
      details: text.slice(0, 500),
      confidence: 0.8,
      impactScore: Math.min(10, 6 + Math.floor(investmentAmount / 500)),
      relevantSectors: ['energy', 'grid'],
      relevantPolicies: ['Grid Reliability', 'FERC'],
      relevantCapabilities: [
        'OT Strategy', 'SCADA Security', 'Grid Modernization',
        'Asset Management', 'Digital Twin',
      ],
      suggestedActions: [
        this.createAction(
          `Pursue ${mentionedUtility || 'utility'} grid modernization engagement`,
          'Grid infrastructure = OT security opportunity',
          'short-term',
          'BD Team'
        ),
        this.createAction(
          'Offer SCADA/OT security assessment',
          'Grid upgrades require security modernization',
          'short-term',
          'OT Practice'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
      investmentData: {
        investmentType: 'expansion',
        amount: investmentAmount,
        recipient: mentionedUtility || 'Utility',
        serviceOpportunity: ['OT Strategy', 'SCADA Security', 'Grid Modernization'],
        estimatedServiceValue: Math.round(investmentAmount * 0.01),
      },
    })
  }
  
  private analyzeHydrogenDevelopment(text: string, textLower: string, news: any): AgentInsight | null {
    const hydrogenSignals = [
      'hydrogen hub', 'hydrogen production', 'electrolyzer',
      'green hydrogen', 'blue hydrogen', 'hydrogen project',
      'h2 hub', 'hydrogen facility',
    ]
    
    const hasHydrogenSignal = hydrogenSignals.some(s => textLower.includes(s))
    if (!hasHydrogenSignal) return null
    
    const investmentAmount = this.extractInvestmentAmount(text)
    
    // Check for DOE funding
    const isDoeProject = textLower.includes('doe') || textLower.includes('department of energy')
    
    return this.createInsight({
      insightType: investmentAmount ? 'investment' : 'signal',
      title: `Hydrogen Development${isDoeProject ? ' (DOE Funded)' : ''}`,
      summary: `Hydrogen infrastructure development. ${investmentAmount ? `$${this.formatAmount(investmentAmount)} investment.` : ''} ${news.title}`,
      details: text.slice(0, 500),
      confidence: isDoeProject ? 0.85 : 0.7,
      impactScore: isDoeProject ? 8 : 7,
      relevantSectors: ['energy', 'hydrogen'],
      relevantPolicies: isDoeProject ? ['DOE Hydrogen Hub', 'IRA'] : ['IRA'],
      relevantCapabilities: [
        'OT Strategy', 'Process Safety', 'Commissioning Security',
        'Sustainability', 'Regulatory Compliance',
      ],
      suggestedActions: [
        this.createAction(
          'Track hydrogen project for future engagement',
          'Hydrogen is emerging sector with OT needs',
          'medium-term',
          'BD Team'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
      investmentData: investmentAmount ? {
        investmentType: isDoeProject ? 'government-grant' : 'corporate-investment',
        amount: investmentAmount,
        sourceOfCapital: isDoeProject ? 'DOE Hydrogen Hub' : 'Private',
        serviceOpportunity: ['OT Strategy', 'Commissioning Security'],
      } : undefined,
    })
  }
  
  private analyzeEnergyStorage(text: string, textLower: string, news: any): AgentInsight | null {
    const storageSignals = [
      'energy storage', 'battery storage', 'grid storage',
      'grid-scale battery', 'long-duration storage', 'bess',
      'storage deployment', 'megawatt storage',
    ]
    
    const hasStorageSignal = storageSignals.some(s => textLower.includes(s))
    if (!hasStorageSignal) return null
    
    const investmentAmount = this.extractInvestmentAmount(text)
    
    // Find company
    const storageCompanies = ['Tesla', 'Fluence', 'Form Energy', 'ESS', 'Powin']
    const mentionedCompany = storageCompanies.find(c => text.includes(c))
    
    return this.createInsight({
      insightType: investmentAmount ? 'investment' : 'signal',
      title: `Energy Storage: ${mentionedCompany || 'Project'}`,
      summary: `Energy storage deployment. ${investmentAmount ? `$${this.formatAmount(investmentAmount)} investment.` : ''} ${news.title}`,
      details: text.slice(0, 500),
      confidence: 0.75,
      impactScore: 7,
      relevantSectors: ['energy', 'storage'],
      relevantCapabilities: [
        'OT Strategy', 'Asset Management', 'Grid Integration',
        'Smart Grid', 'Sustainability',
      ],
      suggestedActions: [
        this.createAction(
          'Track storage project for OT engagement',
          'Energy storage = growing OT opportunity',
          'medium-term',
          'BD Team'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
    })
  }
  
  private formatAmount(millions: number): string {
    if (millions >= 1000) {
      return `${(millions / 1000).toFixed(1)}B`
    }
    return `${millions}M`
  }
}

export const energyAgent = new EnergySectorAgent()
