/**
 * Industrial AI Security Agent
 * 
 * Monitors opportunities for Industrial AI Security capability:
 * - AI/ML systems in OT environments
 * - Autonomous operations and control
 * - AI governance in industrial settings
 */

import { BaseCapabilityAgent, CapabilityConfig } from './base-capability-agent'
import { AgentDataContext } from '../base-agent'
import { AgentInsight } from '../types'

const INDUSTRIAL_AI_CONFIG: CapabilityConfig = {
  id: 'industrial-ai-agent',
  name: 'Industrial AI Security',
  description: 'Monitors AI in OT environments for security opportunities',
  
  capability: 'Industrial AI Security',
  
  demandSignals: [
    'industrial AI', 'AI in manufacturing', 'AI in production',
    'predictive maintenance', 'autonomous operations', 'AI control',
    'machine learning OT', 'AI quality control', 'computer vision industrial',
    'AI model security', 'adversarial', 'model poisoning',
    'AI governance', 'AI risk', 'responsible AI',
    'digital twin AI', 'AI optimization', 'AI process control',
  ],
  
  relevantPhases: ['operation', 'commissioning'],
  
  targetSectors: [
    'semiconductor', 'data center', 'nuclear', 'pharmaceutical',
    'manufacturing', 'battery', 'chemical', 'automotive',
  ],
  
  searchQueries: [
    'industrial AI implementation',
    'AI manufacturing security',
    'autonomous operations industrial',
    'predictive maintenance deployment',
    'AI quality control factory',
    'machine learning OT environment',
    'AI governance manufacturing',
    'data center AI operations',
  ],
  
  competitors: [
    'Accenture', 'McKinsey', 'BCG',
  ],
  
  differentiators: [
    'OT-specific AI security assessment',
    'Adversarial testing for industrial AI',
    'AI/OT integration security',
    'AI incident response framework',
    'Physical consequence awareness',
  ],
}

export class IndustrialAiAgent extends BaseCapabilityAgent {
  constructor() {
    super(INDUSTRIAL_AI_CONFIG)
  }
  
  protected async analyzeCapabilitySpecific(data: AgentDataContext): Promise<AgentInsight[]> {
    const insights: AgentInsight[] = []
    
    for (const news of data.newsItems) {
      const text = `${news.title} ${news.description}`
      const textLower = text.toLowerCase()
      
      // Check for AI in industrial settings
      const industrialAiInsight = this.analyzeIndustrialAi(text, textLower, news)
      if (industrialAiInsight) insights.push(industrialAiInsight)
      
      // Check for AI governance needs
      const governanceInsight = this.analyzeAiGovernance(text, textLower, news)
      if (governanceInsight) insights.push(governanceInsight)
      
      // Check for autonomous operations
      const autonomousInsight = this.analyzeAutonomousOps(text, textLower, news)
      if (autonomousInsight) insights.push(autonomousInsight)
    }
    
    return insights
  }
  
  private analyzeIndustrialAi(text: string, textLower: string, news: any): AgentInsight | null {
    const aiSignals = [
      'artificial intelligence', 'machine learning', 'ml model',
      'ai system', 'neural network', 'deep learning',
    ]
    
    const industrialSignals = [
      'manufacturing', 'factory', 'plant', 'production',
      'industrial', 'operational', 'process control',
      'semiconductor', 'fab', 'nuclear', 'data center',
    ]
    
    const hasAi = aiSignals.some(s => textLower.includes(s))
    const hasIndustrial = industrialSignals.some(s => textLower.includes(s))
    
    if (!hasAi || !hasIndustrial) return null
    
    // Check for deployment/implementation signals
    const deploymentSignals = ['deploy', 'implement', 'launch', 'roll out', 'adopt', 'integrate']
    const hasDeployment = deploymentSignals.some(s => textLower.includes(s))
    
    if (!hasDeployment) return null
    
    const targetSector = this.capabilityConfig.targetSectors.find(s => textLower.includes(s))
    
    return this.createInsight({
      insightType: 'signal',
      title: `Industrial AI Deployment: ${targetSector || 'Manufacturing'}`,
      summary: `AI system deployment in industrial environment. Security assessment opportunity. ${news.title}`,
      details: `Industrial AI creates unique attack vectors: model poisoning, adversarial inputs, data exfiltration. ${this.capabilityConfig.differentiators[0]}`,
      confidence: 0.75,
      impactScore: 8,
      relevantSectors: targetSector ? [targetSector] : ['manufacturing'],
      relevantCapabilities: ['Industrial AI Security', 'AI Governance'],
      suggestedActions: [
        this.createAction(
          'Propose Industrial AI Security Assessment',
          'AI in OT creates new attack vectors needing assessment',
          'short-term',
          'OT Practice'
        ),
        this.createAction(
          'Develop AI governance framework for client',
          'Industrial AI needs governance beyond IT AI policies',
          'medium-term',
          'AI Practice'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
    })
  }
  
  private analyzeAiGovernance(text: string, textLower: string, news: any): AgentInsight | null {
    const governanceSignals = [
      'ai governance', 'ai risk', 'responsible ai', 'ai ethics',
      'ai policy', 'ai regulation', 'ai compliance', 'ai audit',
    ]
    
    const industrialSignals = [
      'industrial', 'manufacturing', 'operational', 'critical infrastructure',
      'safety-critical', 'high-risk', 'autonomous',
    ]
    
    const hasGovernance = governanceSignals.some(s => textLower.includes(s))
    const hasIndustrial = industrialSignals.some(s => textLower.includes(s))
    
    if (!hasGovernance || !hasIndustrial) return null
    
    return this.createInsight({
      insightType: 'capability-gap',
      title: 'Industrial AI Governance Need',
      summary: `AI governance requirements in industrial/critical infrastructure context. ${news.title}`,
      confidence: 0.7,
      impactScore: 7,
      relevantCapabilities: ['Industrial AI Security', 'AI Governance', 'Risk Advisory'],
      suggestedActions: [
        this.createAction(
          'Offer Industrial AI Governance framework',
          'Industrial AI governance is distinct from IT AI governance',
          'short-term',
          'AI Practice'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
    })
  }
  
  private analyzeAutonomousOps(text: string, textLower: string, news: any): AgentInsight | null {
    const autonomousSignals = [
      'autonomous operation', 'autonomous control', 'lights-out',
      'unmanned operation', 'fully automated', 'self-driving',
      'autonomous system', 'autonomous vehicle', 'robotic',
    ]
    
    const hasAutonomous = autonomousSignals.some(s => textLower.includes(s))
    if (!hasAutonomous) return null
    
    // Check for industrial context
    const industrialSignals = [
      'factory', 'plant', 'manufacturing', 'warehouse', 'facility',
      'mining', 'industrial', 'production',
    ]
    const hasIndustrial = industrialSignals.some(s => textLower.includes(s))
    
    if (!hasIndustrial) return null
    
    return this.createInsight({
      insightType: 'signal',
      title: 'Autonomous Industrial Operations',
      summary: `Autonomous operations deployment - high-value security opportunity. Physical consequences of AI failure. ${news.title}`,
      confidence: 0.8,
      impactScore: 9,
      relevantCapabilities: ['Industrial AI Security', 'Process Safety', 'OT Security'],
      suggestedActions: [
        this.createAction(
          'Pursue autonomous systems security engagement',
          'Autonomous industrial systems have highest security stakes',
          'immediate',
          'BD Team'
        ),
        this.createAction(
          'Develop adversarial testing program',
          'Test AI systems for failure modes and adversarial inputs',
          'short-term',
          'OT Practice'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
    })
  }
}

export const industrialAiAgent = new IndustrialAiAgent()
