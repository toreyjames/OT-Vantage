/**
 * Nuclear Sector Agent
 * 
 * Monitors the nuclear energy sector including:
 * - Fission (SMRs, plant restarts, new builds)
 * - Fusion energy developments
 * - Big Tech + nuclear partnerships
 * - NRC approvals and regulatory developments
 */

import { BaseSectorAgent, SectorConfig } from './base-sector-agent'
import { AgentDataContext } from '../base-agent'
import { AgentInsight } from '../types'

const NUCLEAR_CONFIG: SectorConfig = {
  id: 'nuclear-agent',
  name: 'Nuclear Sector',
  description: 'Monitors nuclear fission, fusion, and related developments',
  
  keywords: [
    'nuclear', 'reactor', 'SMR', 'small modular reactor', 'fission',
    'fusion', 'fusion energy', 'tokamak', 'stellarator',
    'uranium', 'enrichment', 'NRC', 'Nuclear Regulatory Commission',
    'nuclear power', 'nuclear plant', 'nuclear restart', 'nuclear construction',
    'advanced reactor', 'Generation IV', 'Gen IV',
  ],
  
  keyPlayers: [
    // Fission
    'Oklo', 'NuScale', 'TerraPower', 'X-energy', 'Kairos Power',
    'Terrestrial Energy', 'Lightbridge', 'BWXT', 'Westinghouse',
    'GE Hitachi', 'Holtec', 'Centrus Energy', 'Ultra Safe Nuclear',
    // Fusion
    'Helion', 'Commonwealth Fusion', 'TAE Technologies', 'General Fusion',
    'Zap Energy', 'Type One Energy', 'Tokamak Energy', 'First Light Fusion',
    'Marvel Fusion', 'Focused Energy',
    // Utilities pursuing nuclear
    'Constellation', 'Vistra', 'Southern Company', 'Duke Energy',
    'NextEra', 'Dominion', 'TVA',
    // Big Tech
    'Microsoft', 'Google', 'Amazon', 'Meta', 'Oracle',
  ],
  
  policies: [
    'ADVANCE Act', 'nuclear restart', 'NRC approval', 'license extension',
    'DOE loan guarantee', 'nuclear tax credit', 'IRA nuclear',
    'nuclear workforce', 'supply chain', 'enrichment',
  ],
  
  serviceOpportunities: [
    'OT Strategy', 'Commissioning Security', 'EPC Governance',
    'Asset Canonization', 'Regulatory Compliance', 'Workforce Planning',
    'Supply Chain', 'Smart Plant', 'Digital Twin',
  ],
  
  searchQueries: [
    // Fission queries
    'nuclear plant restart announcement',
    'SMR deployment NRC approval',
    'nuclear company funding investment',
    'nuclear construction groundbreaking',
    'advanced reactor DOE funding',
    'nuclear plant license extension',
    // Fusion queries
    'fusion startup funding round',
    'fusion company partnership',
    'fusion breakthrough announcement',
    'fusion net energy gain',
    // Big Tech nuclear
    'Microsoft nuclear power deal',
    'Google nuclear data center',
    'Amazon nuclear energy',
    'Meta nuclear partnership',
    'Big Tech nuclear agreement',
    'tech company nuclear power',
  ],
  
  highValueSignals: [
    'NRC license', 'construction permit', 'operating license',
    'DOE loan', 'conditional commitment', 'ADVANCE Act',
    'net energy gain', 'Q > 1', 'ignition',
    'Three Mile Island', 'Palisades', 'Diablo Canyon',
    'power purchase agreement', 'PPA',
    'Stargate', 'AI data center nuclear',
  ],
}

export class NuclearSectorAgent extends BaseSectorAgent {
  constructor() {
    super(NUCLEAR_CONFIG)
  }
  
  protected async analyzeSectorSpecific(data: AgentDataContext): Promise<AgentInsight[]> {
    const insights: AgentInsight[] = []
    
    for (const news of data.newsItems) {
      const text = `${news.title} ${news.description}`
      const textLower = text.toLowerCase()
      
      // Check for Big Tech + Nuclear partnerships (HIGHEST VALUE)
      const bigTechNuclearInsight = this.analyzeBigTechNuclear(text, textLower, news)
      if (bigTechNuclearInsight) insights.push(bigTechNuclearInsight)
      
      // Check for plant restart announcements
      const restartInsight = this.analyzePlantRestart(text, textLower, news)
      if (restartInsight) insights.push(restartInsight)
      
      // Check for fusion breakthroughs
      const fusionInsight = this.analyzeFusionProgress(text, textLower, news)
      if (fusionInsight) insights.push(fusionInsight)
      
      // Check for NRC regulatory actions
      const nrcInsight = this.analyzeNrcAction(text, textLower, news)
      if (nrcInsight) insights.push(nrcInsight)
    }
    
    return insights
  }
  
  private analyzeBigTechNuclear(text: string, textLower: string, news: any): AgentInsight | null {
    const bigTech = ['microsoft', 'google', 'amazon', 'meta', 'oracle', 'openai']
    const nuclearTerms = ['nuclear', 'reactor', 'smr', 'fusion', 'power purchase', 'ppa']
    
    const hasBigTech = bigTech.some(t => textLower.includes(t))
    const hasNuclear = nuclearTerms.some(t => textLower.includes(t))
    
    if (!hasBigTech || !hasNuclear) return null
    
    const investmentAmount = this.extractInvestmentAmount(text)
    
    // Find which Big Tech company
    const techCompany = bigTech.find(t => textLower.includes(t))
    const formattedTech = techCompany ? techCompany.charAt(0).toUpperCase() + techCompany.slice(1) : 'Big Tech'
    
    return this.createInsight({
      insightType: 'signal',
      title: `CRITICAL: ${formattedTech} Nuclear Partnership`,
      summary: `Big Tech + Nuclear partnership detected. ${news.title}`,
      details: text.slice(0, 500),
      confidence: 0.95,
      impactScore: 10,
      relevantSectors: ['nuclear', 'data-centers'],
      relevantPolicies: ['Stargate', 'AI Infrastructure', 'Energy Dominance'],
      relevantCapabilities: [
        'OT Strategy', 'Commissioning Security', 'Industrial AI Security',
        'EPC Governance', 'Power Strategy',
      ],
      suggestedActions: [
        this.createAction(
          `URGENT: Pursue ${formattedTech} nuclear program engagement`,
          'Highest-value convergence of Big Tech and nuclear - top priority',
          'immediate',
          'BD Team'
        ),
        this.createAction(
          'Develop Big Tech + Nuclear playbook',
          'This trend will continue - systematize our approach',
          'short-term',
          'OT Practice'
        ),
        this.createAction(
          'Identify nuclear partner company for introduction',
          'Position Deloitte as connector between tech and nuclear',
          'immediate',
          'BD Team'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
      investmentData: investmentAmount ? {
        investmentType: 'corporate-investment',
        amount: investmentAmount,
        investor: formattedTech,
        serviceOpportunity: ['OT Strategy', 'Commissioning Security', 'Power Strategy'],
        estimatedServiceValue: Math.round(investmentAmount * 0.015),
      } : undefined,
    })
  }
  
  private analyzePlantRestart(text: string, textLower: string, news: any): AgentInsight | null {
    const restartSignals = [
      'restart', 'restarting', 'reopening', 'reopen',
      'bringing back online', 'return to service',
    ]
    
    const plantNames = [
      'three mile island', 'tmi', 'palisades', 'diablo canyon',
      'duane arnold', 'crystal river', 'kewaunee',
    ]
    
    const hasRestartSignal = restartSignals.some(s => textLower.includes(s))
    const hasPlantName = plantNames.some(p => textLower.includes(p))
    const hasNuclear = textLower.includes('nuclear')
    
    if (!hasRestartSignal || (!hasPlantName && !hasNuclear)) return null
    
    const plantName = plantNames.find(p => textLower.includes(p)) || 'Nuclear plant'
    const formattedPlant = plantName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    
    return this.createInsight({
      insightType: 'signal',
      title: `Nuclear Restart: ${formattedPlant}`,
      summary: `Nuclear plant restart activity detected. ${news.title}`,
      details: text.slice(0, 500),
      confidence: 0.85,
      impactScore: 9,
      relevantSectors: ['nuclear'],
      relevantPolicies: ['nuclear-restart', 'ADVANCE Act'],
      relevantCapabilities: [
        'Commissioning Security', 'OT Asset Canonization',
        'Regulatory Compliance', 'Workforce Planning',
      ],
      suggestedActions: [
        this.createAction(
          `Pursue ${formattedPlant} restart program`,
          'Plant restarts need commissioning support and OT security',
          'immediate',
          'BD Team'
        ),
        this.createAction(
          'Offer regulatory compliance and NRC support',
          'Restarts require extensive regulatory navigation',
          'short-term',
          'Nuclear Team'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
    })
  }
  
  private analyzeFusionProgress(text: string, textLower: string, news: any): AgentInsight | null {
    const fusionCompanies = [
      'helion', 'commonwealth fusion', 'tae technologies',
      'general fusion', 'zap energy', 'type one energy',
    ]
    
    const progressSignals = [
      'breakthrough', 'milestone', 'achievement', 'record',
      'net energy', 'Q > 1', 'ignition', 'plasma',
      'funding', 'raises', 'investment', 'partnership',
    ]
    
    const hasFusion = textLower.includes('fusion')
    const hasFusionCompany = fusionCompanies.some(c => textLower.includes(c))
    const hasProgress = progressSignals.some(s => textLower.includes(s))
    
    if ((!hasFusion && !hasFusionCompany) || !hasProgress) return null
    
    const investmentAmount = this.extractInvestmentAmount(text)
    const company = fusionCompanies.find(c => textLower.includes(c))
    const formattedCompany = company 
      ? company.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      : 'Fusion company'
    
    return this.createInsight({
      insightType: 'signal',
      title: `Fusion Progress: ${formattedCompany}`,
      summary: `Fusion energy development: ${news.title}`,
      details: text.slice(0, 500),
      confidence: 0.8,
      impactScore: 8,
      relevantSectors: ['nuclear', 'fusion'],
      relevantCapabilities: [
        'Industrial AI Security', 'OT Strategy',
        'Commissioning Security', 'R&D Advisory',
      ],
      suggestedActions: [
        this.createAction(
          `Track ${formattedCompany} for future facility planning`,
          'Fusion companies approaching commercialization will need OT services',
          'medium-term',
          'BD Team'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
      investmentData: investmentAmount ? {
        investmentType: 'funding-round',
        amount: investmentAmount,
        recipient: formattedCompany,
        serviceOpportunity: ['OT Strategy', 'Commissioning Security'],
      } : undefined,
    })
  }
  
  private analyzeNrcAction(text: string, textLower: string, news: any): AgentInsight | null {
    const nrcSignals = [
      'nrc', 'nuclear regulatory commission',
      'license', 'licensing', 'approval', 'approved',
      'construction permit', 'operating license', 'design certification',
    ]
    
    const hasNrc = nrcSignals.some(s => textLower.includes(s))
    if (!hasNrc) return null
    
    // Check for positive action
    const positiveSignals = ['approved', 'grants', 'issued', 'accepts', 'certifies']
    const isPositive = positiveSignals.some(s => textLower.includes(s))
    
    if (!isPositive) return null
    
    return this.createInsight({
      insightType: 'policy',
      title: 'NRC Regulatory Approval',
      summary: `NRC regulatory action detected. ${news.title}`,
      details: text.slice(0, 500),
      confidence: 0.85,
      impactScore: 8,
      relevantSectors: ['nuclear'],
      relevantPolicies: ['NRC', 'ADVANCE Act'],
      relevantCapabilities: ['Regulatory Compliance', 'Commissioning Security'],
      suggestedActions: [
        this.createAction(
          'Identify company receiving approval for engagement',
          'NRC approval = project moving forward = service opportunity',
          'short-term',
          'BD Team'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
    })
  }
}

export const nuclearAgent = new NuclearSectorAgent()
