/**
 * Semiconductor Sector Agent
 * 
 * Monitors the semiconductor sector including:
 * - CHIPS Act funding and announcements
 * - Fab construction and expansion
 * - Supply chain developments
 * - Equipment and packaging advances
 */

import { BaseSectorAgent, SectorConfig } from './base-sector-agent'
import { AgentDataContext } from '../base-agent'
import { AgentInsight } from '../types'

const SEMICONDUCTOR_CONFIG: SectorConfig = {
  id: 'semiconductor-agent',
  name: 'Semiconductor Sector',
  description: 'Monitors semiconductor manufacturing, CHIPS Act, and supply chain',
  
  keywords: [
    'semiconductor', 'chip', 'chips', 'fab', 'fabrication', 'foundry',
    'wafer', 'chipmaker', 'chip manufacturing', 'CHIPS Act',
    'advanced packaging', 'EUV', 'lithography', 'process node',
    'memory', 'logic', 'DRAM', 'NAND', 'HBM',
  ],
  
  keyPlayers: [
    // Fabs
    'Intel', 'TSMC', 'Samsung', 'GlobalFoundries', 'Micron',
    'SK Hynix', 'Texas Instruments', 'Wolfspeed', 'Onsemi',
    // Equipment
    'ASML', 'Applied Materials', 'Lam Research', 'KLA', 'Tokyo Electron',
    // Design
    'Nvidia', 'AMD', 'Qualcomm', 'Broadcom', 'Marvell',
    // Packaging
    'Amkor', 'ASE', 'JCET',
  ],
  
  policies: [
    'CHIPS Act', 'CHIPS and Science', 'CHIPS funding',
    'export controls', 'semiconductor incentives', 'fab subsidy',
    'supply chain security', 'trusted foundry',
  ],
  
  serviceOpportunities: [
    'Smart Factory', 'OT Strategy', 'Supply Chain',
    'ERP Implementation', 'Workforce Planning', 'Tax Incentives',
    'CHIPS Compliance', 'Digital Twin', 'Quality Systems',
  ],
  
  searchQueries: [
    'CHIPS Act funding announcement',
    'semiconductor fab construction',
    'chip plant groundbreaking',
    'fab expansion investment billion',
    'Intel CHIPS Act funding',
    'TSMC Arizona expansion',
    'Micron fab announcement',
    'semiconductor supply chain US',
    'advanced packaging facility',
    'semiconductor workforce training',
  ],
  
  highValueSignals: [
    'CHIPS Act award', 'preliminary agreement', 'final award',
    'fab construction', 'groundbreaking', 'breaks ground',
    'leading-edge', 'advanced node', '3nm', '2nm',
    'HBM', 'advanced packaging', 'CoWoS',
    'billion investment', 'megafab',
  ],
}

export class SemiconductorSectorAgent extends BaseSectorAgent {
  constructor() {
    super(SEMICONDUCTOR_CONFIG)
  }
  
  protected async analyzeSectorSpecific(data: AgentDataContext): Promise<AgentInsight[]> {
    const insights: AgentInsight[] = []
    
    for (const news of data.newsItems) {
      const text = `${news.title} ${news.description}`
      const textLower = text.toLowerCase()
      
      // Check for CHIPS Act funding
      const chipsInsight = this.analyzeChipsFunding(text, textLower, news)
      if (chipsInsight) insights.push(chipsInsight)
      
      // Check for fab construction
      const fabInsight = this.analyzeFabConstruction(text, textLower, news)
      if (fabInsight) insights.push(fabInsight)
      
      // Check for advanced technology signals
      const techInsight = this.analyzeAdvancedTech(text, textLower, news)
      if (techInsight) insights.push(techInsight)
    }
    
    return insights
  }
  
  private analyzeChipsFunding(text: string, textLower: string, news: any): AgentInsight | null {
    const chipsSignals = [
      'chips act', 'chips and science', 'chips funding',
      'preliminary agreement', 'chips award', 'semiconductor incentive',
    ]
    
    const hasChipsSignal = chipsSignals.some(s => textLower.includes(s))
    if (!hasChipsSignal) return null
    
    const investmentAmount = this.extractInvestmentAmount(text)
    
    // Find company
    const companies = SEMICONDUCTOR_CONFIG.keyPlayers.filter(c => 
      textLower.includes(c.toLowerCase())
    )
    const company = companies[0] || 'Semiconductor company'
    
    return this.createInsight({
      insightType: 'investment',
      title: `CHIPS Act: ${company} Funding`,
      summary: `CHIPS Act funding activity for ${company}. ${investmentAmount ? `$${this.formatAmount(investmentAmount)} announced.` : ''} ${news.title}`,
      details: text.slice(0, 500),
      confidence: 0.9,
      impactScore: investmentAmount && investmentAmount >= 1000 ? 10 : 8,
      relevantSectors: ['semiconductor'],
      relevantPolicies: ['CHIPS Act', 'chips-sovereignty'],
      relevantCapabilities: [
        'CHIPS Compliance', 'Smart Factory', 'Tax Incentives',
        'Workforce Planning', 'Supply Chain',
      ],
      suggestedActions: [
        this.createAction(
          `Pursue ${company} for CHIPS compliance services`,
          'CHIPS funding recipients have strict compliance requirements',
          'immediate',
          'BD Team'
        ),
        this.createAction(
          'Offer workforce planning and training programs',
          'CHIPS Act requires significant workforce development',
          'short-term',
          'Workforce Team'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
      investmentData: {
        investmentType: 'chips-act',
        amount: investmentAmount,
        recipient: company,
        sourceOfCapital: 'Federal Government - CHIPS Act',
        serviceOpportunity: ['CHIPS Compliance', 'Smart Factory', 'Workforce Planning'],
        estimatedServiceValue: investmentAmount ? Math.round(investmentAmount * 0.012) : undefined,
      },
    })
  }
  
  private analyzeFabConstruction(text: string, textLower: string, news: any): AgentInsight | null {
    const constructionSignals = [
      'groundbreaking', 'breaks ground', 'construction begins',
      'new fab', 'new facility', 'fab expansion', 'megafab',
      'factory construction', 'plant construction',
    ]
    
    const hasConstructionSignal = constructionSignals.some(s => textLower.includes(s))
    if (!hasConstructionSignal) return null
    
    const investmentAmount = this.extractInvestmentAmount(text)
    if (!investmentAmount || investmentAmount < 100) return null // Min $100M
    
    // Find company
    const companies = SEMICONDUCTOR_CONFIG.keyPlayers.filter(c => 
      textLower.includes(c.toLowerCase())
    )
    const company = companies[0] || 'Semiconductor company'
    
    // Extract location
    const states = ['Arizona', 'Ohio', 'Texas', 'New York', 'Oregon', 'Idaho', 'New Mexico']
    const location = states.find(s => text.includes(s)) || 'US'
    
    return this.createInsight({
      insightType: 'investment',
      title: `Fab Construction: ${company} in ${location}`,
      summary: `New semiconductor fab construction: ${company} investing $${this.formatAmount(investmentAmount)} in ${location}.`,
      details: text.slice(0, 500),
      confidence: 0.9,
      impactScore: Math.min(10, 7 + Math.floor(investmentAmount / 5000)),
      relevantSectors: ['semiconductor'],
      relevantCapabilities: [
        'Commissioning Security', 'EPC Governance', 'Smart Factory',
        'OT Strategy', 'Workforce Planning', 'Supply Chain',
      ],
      suggestedActions: [
        this.createAction(
          `PRIORITY: Pursue ${company} ${location} fab engagement`,
          'Greenfield fab = full lifecycle service opportunity',
          'immediate',
          'BD Team'
        ),
        this.createAction(
          'Propose commissioning-to-operate security package',
          'Get in at construction phase for long-term relationship',
          'immediate',
          'OT Practice'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
      investmentData: {
        investmentType: 'expansion',
        amount: investmentAmount,
        recipient: company,
        destination: `${company} ${location} Fab`,
        serviceOpportunity: ['Smart Factory', 'Commissioning Security', 'EPC Governance'],
        estimatedServiceValue: Math.round(investmentAmount * 0.015),
      },
    })
  }
  
  private analyzeAdvancedTech(text: string, textLower: string, news: any): AgentInsight | null {
    const advancedSignals = [
      '3nm', '2nm', 'angstrom', 'leading-edge', 'advanced node',
      'euv', 'high-na', 'gate-all-around', 'gaafet',
      'hbm', 'hbm3', 'hbm4', 'advanced packaging', 'cowos', '3d packaging',
    ]
    
    const hasAdvancedSignal = advancedSignals.some(s => textLower.includes(s))
    if (!hasAdvancedSignal) return null
    
    // Must also have investment/development signal
    const developmentSignals = [
      'investment', 'facility', 'production', 'manufacturing',
      'partnership', 'agreement', 'contract',
    ]
    const hasDevelopment = developmentSignals.some(s => textLower.includes(s))
    if (!hasDevelopment) return null
    
    const investmentAmount = this.extractInvestmentAmount(text)
    
    return this.createInsight({
      insightType: 'signal',
      title: 'Advanced Semiconductor Technology Development',
      summary: `Leading-edge semiconductor technology activity detected. ${news.title}`,
      details: text.slice(0, 500),
      confidence: 0.75,
      impactScore: 8,
      relevantSectors: ['semiconductor'],
      relevantCapabilities: [
        'Smart Factory', 'OT Strategy', 'R&D Advisory',
        'Supply Chain', 'Digital Twin',
      ],
      suggestedActions: [
        this.createAction(
          'Track for future facility announcements',
          'Advanced tech development often precedes major facility investments',
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

export const semiconductorAgent = new SemiconductorSectorAgent()
