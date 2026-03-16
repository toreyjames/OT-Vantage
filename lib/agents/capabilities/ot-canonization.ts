/**
 * OT Asset Canonization Agent
 * 
 * Monitors opportunities for OT Asset Canonization capability:
 * - Organizations needing unified asset inventory
 * - New facilities requiring baseline establishment
 * - OT security assessments
 * - Insurance and risk management needs
 */

import { BaseCapabilityAgent, CapabilityConfig } from './base-capability-agent'
import { AgentDataContext } from '../base-agent'
import { AgentInsight } from '../types'

const OT_CANONIZATION_CONFIG: CapabilityConfig = {
  id: 'ot-canonization-agent',
  name: 'OT Asset Canonization',
  description: 'Monitors opportunities for OT Asset Canonization - unified asset inventory and visibility',
  
  capability: 'OT Asset Canonization',
  
  demandSignals: [
    'asset inventory', 'asset management', 'asset visibility',
    'OT inventory', 'OT assessment', 'OT security assessment',
    'network discovery', 'asset discovery', 'CMMS',
    'single source of truth', 'asset register', 'asset baseline',
    'blind spots', 'shadow OT', 'unknown devices',
    'cyber insurance', 'OT insurance', 'risk assessment',
  ],
  
  relevantPhases: ['commissioning', 'operation'],
  
  targetSectors: [
    'nuclear', 'semiconductor', 'data center', 'energy',
    'manufacturing', 'oil gas', 'chemical', 'water',
  ],
  
  searchQueries: [
    'OT asset inventory challenges',
    'industrial asset management',
    'OT security assessment RFP',
    'cyber insurance OT requirements',
    'manufacturing asset visibility',
    'SCADA inventory management',
    'ICS asset discovery',
    'operational technology baseline',
  ],
  
  competitors: [
    'Claroty', 'Dragos', 'Nozomi Networks', 'Armis', 'Forescout',
  ],
  
  differentiators: [
    'Assurance Twin canonization engine',
    'Engineering baseline cross-verification',
    'Blind spot and orphan detection',
    'Industry-specific templates',
    'Integration with OT Risk Score',
  ],
}

export class OtCanonizationAgent extends BaseCapabilityAgent {
  constructor() {
    super(OT_CANONIZATION_CONFIG)
  }
  
  protected async analyzeCapabilitySpecific(data: AgentDataContext): Promise<AgentInsight[]> {
    const insights: AgentInsight[] = []
    
    for (const news of data.newsItems) {
      const text = `${news.title} ${news.description}`
      const textLower = text.toLowerCase()
      
      // Check for insurance/risk signals
      const insuranceInsight = this.analyzeInsuranceNeed(text, textLower, news)
      if (insuranceInsight) insights.push(insuranceInsight)
      
      // Check for new facility commissioning
      const commissioningInsight = this.analyzeNewFacility(text, textLower, news)
      if (commissioningInsight) insights.push(commissioningInsight)
      
      // Check for OT security concerns
      const securityInsight = this.analyzeSecurityConcern(text, textLower, news)
      if (securityInsight) insights.push(securityInsight)
    }
    
    return insights
  }
  
  private analyzeInsuranceNeed(text: string, textLower: string, news: any): AgentInsight | null {
    const insuranceSignals = [
      'cyber insurance', 'insurance requirement', 'underwriting',
      'risk quantification', 'risk assessment', 'insurance policy',
    ]
    
    const otSignals = ['ot', 'operational technology', 'industrial', 'scada', 'ics', 'manufacturing']
    
    const hasInsurance = insuranceSignals.some(s => textLower.includes(s))
    const hasOt = otSignals.some(s => textLower.includes(s))
    
    if (!hasInsurance || !hasOt) return null
    
    return this.createInsight({
      insightType: 'capability-gap',
      title: 'OT Canonization: Insurance Requirement',
      summary: `Cyber insurance driving OT asset visibility needs. Assurance Twin provides the asset baseline insurers require. ${news.title}`,
      confidence: 0.8,
      impactScore: 8,
      relevantCapabilities: ['OT Asset Canonization', 'OT Risk Score'],
      suggestedActions: [
        this.createAction(
          'Pursue OT Asset Visibility engagement',
          'Insurance requirements create compelling need',
          'immediate',
          'BD Team'
        ),
        this.createAction(
          'Connect with insurance practice for joint offering',
          'Bundle Assurance Twin with cyber insurance advisory',
          'short-term',
          'OT Practice'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
    })
  }
  
  private analyzeNewFacility(text: string, textLower: string, news: any): AgentInsight | null {
    const newFacilitySignals = [
      'commissioning', 'go-live', 'startup', 'first production',
      'new facility', 'new plant', 'production start',
    ]
    
    const hasNewFacility = newFacilitySignals.some(s => textLower.includes(s))
    if (!hasNewFacility) return null
    
    // Must be in target sector
    const targetSector = this.capabilityConfig.targetSectors.find(s => textLower.includes(s))
    if (!targetSector) return null
    
    return this.createInsight({
      insightType: 'signal',
      title: `OT Canonization: New Facility in ${targetSector}`,
      summary: `New facility commissioning = Day 1 asset baseline opportunity. Establish asset visibility from start. ${news.title}`,
      confidence: 0.75,
      impactScore: 8,
      relevantSectors: [targetSector],
      relevantCapabilities: ['OT Asset Canonization', 'Commissioning Security'],
      suggestedActions: [
        this.createAction(
          'Propose Day 1 asset baseline establishment',
          'Commissioning is optimal time for asset canonization',
          'immediate',
          'BD Team'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
    })
  }
  
  private analyzeSecurityConcern(text: string, textLower: string, news: any): AgentInsight | null {
    const securityConcerns = [
      'ot breach', 'industrial attack', 'ransomware manufacturing',
      'scada vulnerability', 'ics security', 'ot incident',
      'asset unknown', 'unpatched devices', 'legacy systems',
    ]
    
    const hasSecurityConcern = securityConcerns.some(s => textLower.includes(s))
    if (!hasSecurityConcern) return null
    
    return this.createInsight({
      insightType: 'capability-gap',
      title: 'OT Canonization: Security Gap Identified',
      summary: `OT security concern indicates asset visibility gap. Assurance Twin addresses root cause - unknown assets. ${news.title}`,
      confidence: 0.7,
      impactScore: 8,
      relevantCapabilities: ['OT Asset Canonization', 'OT Security'],
      suggestedActions: [
        this.createAction(
          'Offer asset visibility assessment',
          'Security incidents often reveal asset inventory gaps',
          'short-term',
          'OT Practice'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
    })
  }
}

export const otCanonizationAgent = new OtCanonizationAgent()
