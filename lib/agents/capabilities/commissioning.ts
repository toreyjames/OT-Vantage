/**
 * Commissioning-to-Operate Agent
 * 
 * Monitors opportunities for Commissioning-to-Operate Security capability:
 * - New facility construction and commissioning
 * - Greenfield projects in design phase
 * - Security-by-design opportunities
 */

import { BaseCapabilityAgent, CapabilityConfig } from './base-capability-agent'
import { AgentDataContext } from '../base-agent'
import { AgentInsight } from '../types'

const COMMISSIONING_CONFIG: CapabilityConfig = {
  id: 'commissioning-agent',
  name: 'Commissioning-to-Operate Security',
  description: 'Monitors greenfield projects for security-by-design opportunities',
  
  capability: 'Commissioning-to-Operate Security',
  
  demandSignals: [
    'commissioning', 'go-live', 'startup', 'handover',
    'new facility', 'new plant', 'greenfield', 'construction',
    'groundbreaking', 'breaks ground', 'design phase',
    'security architecture', 'OT security design',
    'day one', 'day 1', 'first production',
  ],
  
  relevantPhases: ['design', 'construction', 'commissioning'],
  
  targetSectors: [
    'nuclear', 'semiconductor', 'data center', 'battery',
    'pharmaceutical', 'chemical', 'energy', 'manufacturing',
  ],
  
  searchQueries: [
    'new facility construction announcement',
    'plant groundbreaking ceremony',
    'greenfield project industrial',
    'factory construction begins',
    'commissioning phase project',
    'new manufacturing plant',
    'facility design approval',
    'construction milestone industrial',
  ],
  
  competitors: [
    'Dragos', 'Claroty', 'Accenture',
  ],
  
  differentiators: [
    'Security-by-design from construction phase',
    'Integrated with EPC governance',
    'Day 1 operational security baseline',
    'Full lifecycle approach',
    'Commissioning security validation',
  ],
}

export class CommissioningAgent extends BaseCapabilityAgent {
  constructor() {
    super(COMMISSIONING_CONFIG)
  }
  
  protected async analyzeCapabilitySpecific(data: AgentDataContext): Promise<AgentInsight[]> {
    const insights: AgentInsight[] = []
    
    for (const news of data.newsItems) {
      const text = `${news.title} ${news.description}`
      const textLower = text.toLowerCase()
      
      // Check for groundbreaking/construction start
      const constructionInsight = this.analyzeConstructionStart(text, textLower, news)
      if (constructionInsight) insights.push(constructionInsight)
      
      // Check for large investments (typically new builds)
      const investmentInsight = this.analyzeLargeInvestment(text, textLower, news)
      if (investmentInsight) insights.push(investmentInsight)
      
      // Check for commissioning announcements
      const commissioningInsight = this.analyzeCommissioningPhase(text, textLower, news)
      if (commissioningInsight) insights.push(commissioningInsight)
    }
    
    return insights
  }
  
  private analyzeConstructionStart(text: string, textLower: string, news: any): AgentInsight | null {
    const constructionSignals = [
      'groundbreaking', 'breaks ground', 'construction begins',
      'construction starts', 'building new', 'new construction',
      'construction contract', 'EPC awarded',
    ]
    
    const hasConstruction = constructionSignals.some(s => textLower.includes(s))
    if (!hasConstruction) return null
    
    // Must be in target sector
    const targetSector = this.capabilityConfig.targetSectors.find(s => textLower.includes(s))
    if (!targetSector) return null
    
    const investmentAmount = this.extractInvestmentAmount(text)
    
    // Extract company if possible
    const company = news.extractedData?.company || 'Company'
    
    return this.createInsight({
      insightType: 'signal',
      title: `PRIORITY: Construction Start - ${targetSector}`,
      summary: `New facility construction starting. Ideal timing for Commissioning-to-Operate Security engagement. ${news.title}`,
      details: `Security-by-design from construction phase. Differentiators: ${this.capabilityConfig.differentiators.slice(0, 2).join(', ')}`,
      confidence: 0.85,
      impactScore: investmentAmount && investmentAmount >= 1000 ? 10 : 9,
      relevantSectors: [targetSector],
      relevantCapabilities: ['Commissioning-to-Operate Security', 'EPC/Vendor Governance'],
      suggestedActions: [
        this.createAction(
          `URGENT: Pursue ${company} commissioning engagement`,
          'Construction phase is optimal entry point for security-by-design',
          'immediate',
          'BD Team'
        ),
        this.createAction(
          'Propose security architecture integration',
          'Get OT security into design specs before construction advances',
          'immediate',
          'OT Practice'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
      investmentData: investmentAmount ? {
        investmentType: 'expansion',
        amount: investmentAmount,
        recipient: company,
        serviceOpportunity: ['Commissioning-to-Operate Security', 'EPC/Vendor Governance'],
        estimatedServiceValue: Math.round(investmentAmount * 0.015),
      } : undefined,
    })
  }
  
  private analyzeLargeInvestment(text: string, textLower: string, news: any): AgentInsight | null {
    const investmentAmount = this.extractInvestmentAmount(text)
    if (!investmentAmount || investmentAmount < 500) return null // Min $500M
    
    // Check for new build signals
    const newBuildSignals = [
      'new facility', 'new plant', 'new factory', 'expansion',
      'megaproject', 'campus', 'complex',
    ]
    
    const hasNewBuild = newBuildSignals.some(s => textLower.includes(s))
    if (!hasNewBuild) return null
    
    // Check for target sector
    const targetSector = this.capabilityConfig.targetSectors.find(s => textLower.includes(s))
    if (!targetSector) return null
    
    const company = news.extractedData?.company || 'Company'
    
    return this.createInsight({
      insightType: 'investment',
      title: `Large Build: $${this.formatAmount(investmentAmount)} ${targetSector} Project`,
      summary: `Major investment signals greenfield opportunity for commissioning-to-operate security package. ${news.title}`,
      confidence: 0.8,
      impactScore: Math.min(10, 8 + Math.floor(investmentAmount / 5000)),
      relevantSectors: [targetSector],
      relevantCapabilities: ['Commissioning-to-Operate Security', 'OT Strategy', 'EPC/Vendor Governance'],
      suggestedActions: [
        this.createAction(
          `Track ${company} project for engagement timing`,
          'Large investment will require OT security services',
          'short-term',
          'BD Team'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
      investmentData: {
        investmentType: 'expansion',
        amount: investmentAmount,
        recipient: company,
        serviceOpportunity: ['Commissioning-to-Operate Security'],
        estimatedServiceValue: Math.round(investmentAmount * 0.012),
      },
    })
  }
  
  private analyzeCommissioningPhase(text: string, textLower: string, news: any): AgentInsight | null {
    const commissioningSignals = [
      'commissioning phase', 'entering commissioning', 'startup phase',
      'pre-operational', 'operational testing', 'systems testing',
      'first production', 'production begins', 'go-live',
    ]
    
    const hasCommissioning = commissioningSignals.some(s => textLower.includes(s))
    if (!hasCommissioning) return null
    
    // Check for target sector
    const targetSector = this.capabilityConfig.targetSectors.find(s => textLower.includes(s))
    
    return this.createInsight({
      insightType: 'signal',
      title: `Commissioning Phase: ${targetSector || 'Industrial'} Facility`,
      summary: `Facility entering commissioning - last chance for security-by-design engagement. ${news.title}`,
      confidence: 0.75,
      impactScore: 8,
      relevantSectors: targetSector ? [targetSector] : [],
      relevantCapabilities: ['Commissioning-to-Operate Security', 'OT Asset Canonization'],
      suggestedActions: [
        this.createAction(
          'Engage for commissioning security validation',
          'Commissioning phase is critical for establishing security baseline',
          'immediate',
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

export const commissioningAgent = new CommissioningAgent()
