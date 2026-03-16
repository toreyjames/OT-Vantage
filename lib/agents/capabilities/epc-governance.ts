/**
 * EPC/Vendor Governance Agent
 * 
 * Monitors opportunities for EPC/Vendor OT Security Governance:
 * - Construction projects with multiple vendors
 * - EPC contract announcements
 * - Vendor access and security concerns
 */

import { BaseCapabilityAgent, CapabilityConfig } from './base-capability-agent'
import { AgentDataContext } from '../base-agent'
import { AgentInsight } from '../types'

const EPC_GOVERNANCE_CONFIG: CapabilityConfig = {
  id: 'epc-governance-agent',
  name: 'EPC/Vendor Governance',
  description: 'Monitors construction projects for vendor security governance opportunities',
  
  capability: 'EPC/Vendor Governance',
  
  demandSignals: [
    'EPC', 'engineering procurement construction', 'contractor',
    'system integrator', 'vendor management', 'third party',
    'subcontractor', 'construction partner', 'turnkey',
    'vendor access', 'remote access', 'third party risk',
    'supply chain security', 'vendor security', 'contractor security',
  ],
  
  relevantPhases: ['design', 'construction'],
  
  targetSectors: [
    'nuclear', 'semiconductor', 'battery', 'data center',
    'pharmaceutical', 'chemical', 'energy', 'oil gas',
  ],
  
  searchQueries: [
    'EPC contract awarded industrial',
    'construction contract semiconductor',
    'engineering contractor nuclear',
    'turnkey construction project',
    'system integrator manufacturing',
    'vendor management industrial',
    'third party security OT',
    'contractor access control',
  ],
  
  competitors: [
    'Bechtel', 'Fluor', 'Jacobs', 'KBR',
  ],
  
  differentiators: [
    'Construction-phase OT security governance',
    'Vendor security requirements templates',
    'Vendor access management during construction',
    'Security validation at construction milestones',
    'Transition to operational security',
  ],
}

export class EpcGovernanceAgent extends BaseCapabilityAgent {
  constructor() {
    super(EPC_GOVERNANCE_CONFIG)
  }
  
  protected async analyzeCapabilitySpecific(data: AgentDataContext): Promise<AgentInsight[]> {
    const insights: AgentInsight[] = []
    
    for (const news of data.newsItems) {
      const text = `${news.title} ${news.description}`
      const textLower = text.toLowerCase()
      
      // Check for EPC contract awards
      const epcInsight = this.analyzeEpcAward(text, textLower, news)
      if (epcInsight) insights.push(epcInsight)
      
      // Check for vendor/third party concerns
      const vendorInsight = this.analyzeVendorConcern(text, textLower, news)
      if (vendorInsight) insights.push(vendorInsight)
      
      // Check for large construction projects
      const constructionInsight = this.analyzeLargeConstruction(text, textLower, news)
      if (constructionInsight) insights.push(constructionInsight)
    }
    
    return insights
  }
  
  private analyzeEpcAward(text: string, textLower: string, news: any): AgentInsight | null {
    const epcSignals = [
      'epc contract', 'epc awarded', 'engineering procurement',
      'turnkey contract', 'construction contract awarded',
      'selected as contractor', 'construction partner',
    ]
    
    const hasEpc = epcSignals.some(s => textLower.includes(s))
    if (!hasEpc) return null
    
    // Check for target sector
    const targetSector = this.capabilityConfig.targetSectors.find(s => textLower.includes(s))
    if (!targetSector) return null
    
    const investmentAmount = this.extractInvestmentAmount(text)
    
    // Try to extract EPC and owner
    const epcCompanies = ['Bechtel', 'Fluor', 'Jacobs', 'KBR', 'Black & Veatch', 'Burns & McDonnell']
    const epc = epcCompanies.find(c => text.includes(c))
    const owner = news.extractedData?.company
    
    return this.createInsight({
      insightType: 'signal',
      title: `EPC Contract: ${targetSector} Project`,
      summary: `EPC contract awarded for ${targetSector} project. Multiple vendors will need security governance. ${epc ? `EPC: ${epc}.` : ''} ${news.title}`,
      details: `Construction-phase security governance opportunity. ${this.capabilityConfig.differentiators.slice(0, 2).join('. ')}`,
      confidence: 0.8,
      impactScore: investmentAmount && investmentAmount >= 1000 ? 9 : 8,
      relevantSectors: [targetSector],
      relevantCapabilities: ['EPC/Vendor Governance', 'Commissioning-to-Operate Security'],
      suggestedActions: [
        this.createAction(
          `Pursue ${owner || 'owner'} for construction-phase security`,
          'EPC award means construction starting - ideal timing',
          'immediate',
          'BD Team'
        ),
        this.createAction(
          `Engage ${epc || 'EPC'} as delivery partner`,
          'EPCs can be channel to owners',
          'short-term',
          'BD Team'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
      investmentData: investmentAmount ? {
        investmentType: 'expansion',
        amount: investmentAmount,
        serviceOpportunity: ['EPC/Vendor Governance', 'Commissioning Security'],
        estimatedServiceValue: Math.round(investmentAmount * 0.008),
      } : undefined,
    })
  }
  
  private analyzeVendorConcern(text: string, textLower: string, news: any): AgentInsight | null {
    const vendorConcerns = [
      'vendor breach', 'third party breach', 'supply chain attack',
      'contractor access', 'vendor access', 'remote access vulnerability',
      'third party risk', 'vendor risk', 'supply chain risk',
      'shadow it', 'unauthorized access',
    ]
    
    const hasVendorConcern = vendorConcerns.some(s => textLower.includes(s))
    if (!hasVendorConcern) return null
    
    // Check for industrial/OT context
    const industrialSignals = ['industrial', 'ot', 'manufacturing', 'plant', 'facility', 'scada', 'ics']
    const hasIndustrial = industrialSignals.some(s => textLower.includes(s))
    
    if (!hasIndustrial) return null
    
    return this.createInsight({
      insightType: 'capability-gap',
      title: 'Vendor/Third Party Security Concern',
      summary: `Vendor/third party security concern in industrial context. EPC Governance addresses root cause. ${news.title}`,
      confidence: 0.7,
      impactScore: 8,
      relevantCapabilities: ['EPC/Vendor Governance', 'OT Security'],
      suggestedActions: [
        this.createAction(
          'Propose vendor security governance program',
          'Vendor security incidents indicate governance gaps',
          'short-term',
          'OT Practice'
        ),
        this.createAction(
          'Develop vendor security requirements template',
          'Reusable asset for client engagements',
          'medium-term',
          'OT Practice'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
    })
  }
  
  private analyzeLargeConstruction(text: string, textLower: string, news: any): AgentInsight | null {
    const investmentAmount = this.extractInvestmentAmount(text)
    if (!investmentAmount || investmentAmount < 1000) return null // Min $1B
    
    // Check for construction signals
    const constructionSignals = [
      'construction', 'building', 'facility', 'plant', 'factory',
      'campus', 'complex', 'megaproject',
    ]
    const hasConstruction = constructionSignals.some(s => textLower.includes(s))
    if (!hasConstruction) return null
    
    // Check for target sector
    const targetSector = this.capabilityConfig.targetSectors.find(s => textLower.includes(s))
    if (!targetSector) return null
    
    return this.createInsight({
      insightType: 'investment',
      title: `Mega-Project: $${this.formatAmount(investmentAmount)} ${targetSector}`,
      summary: `Large construction project = many vendors needing governance. EPC security governance opportunity. ${news.title}`,
      details: 'Large projects typically involve 10-20+ vendors during construction - each a potential security gap.',
      confidence: 0.85,
      impactScore: 9,
      relevantSectors: [targetSector],
      relevantCapabilities: ['EPC/Vendor Governance', 'Commissioning-to-Operate Security'],
      suggestedActions: [
        this.createAction(
          'Pursue construction-phase security governance',
          'Mega-projects need comprehensive vendor security',
          'immediate',
          'BD Team'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
      investmentData: {
        investmentType: 'expansion',
        amount: investmentAmount,
        serviceOpportunity: ['EPC/Vendor Governance'],
        estimatedServiceValue: Math.round(investmentAmount * 0.005),
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

export const epcGovernanceAgent = new EpcGovernanceAgent()
