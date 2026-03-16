/**
 * Life Sciences / Pharma Sector Agent
 *
 * Monitors life sciences and pharmaceutical manufacturing including:
 * - New biomanufacturing / pharma facility construction
 * - GxP / OT convergence and validation requirements
 * - FDA facility actions and cGMP compliance
 * - Cell & gene therapy manufacturing build-outs
 * - EPA permits for pharma facilities (via OT Radar)
 * - SEC CapEx disclosures from pharma companies (via OT Radar)
 */

import { BaseSectorAgent, SectorConfig } from './base-sector-agent'
import { AgentDataContext } from '../base-agent'
import { AgentInsight } from '../types'

const LIFE_SCIENCES_CONFIG: SectorConfig = {
  id: 'life-sciences-agent',
  name: 'Life Sciences & Pharma',
  description: 'Monitors pharmaceutical and biomanufacturing facility expansion, GxP/OT convergence, and FDA regulatory signals',

  keywords: [
    'pharmaceutical', 'pharma', 'biomanufacturing', 'biotech', 'biopharma',
    'GxP', 'cGMP', 'GMP', 'good manufacturing practice',
    'cleanroom', 'batch process', 'drug manufacturing',
    'cell therapy', 'gene therapy', 'mRNA', 'biologics',
    'API manufacturing', 'active pharmaceutical ingredient',
    'fill finish', 'lyophilization', 'aseptic', 'sterile manufacturing',
    'FDA', 'EMA', 'drug approval', 'facility inspection',
    'serialization', 'track and trace', 'pharma 4.0',
    'continuous manufacturing', 'process analytical technology', 'PAT',
  ],

  keyPlayers: [
    'Pfizer', 'Johnson & Johnson', 'J&J', 'Moderna', 'AbbVie', 'Merck',
    'Eli Lilly', 'Novo Nordisk', 'Roche', 'AstraZeneca', 'GSK',
    'Bristol-Myers Squibb', 'BMS', 'Amgen', 'Gilead', 'Regeneron',
    'Sanofi', 'Novartis', 'Takeda', 'Biogen',
    'Samsung Biologics', 'WuXi Biologics', 'Lonza', 'Catalent',
    'Thermo Fisher', 'Charles River', 'Fujifilm Diosynth',
    'National Resilience', 'Resilience',
  ],

  policies: [
    'FDA', 'cGMP', 'BARDA', 'pandemic preparedness',
    'drug supply chain', 'onshoring pharma', 'domestic manufacturing',
    'Biosecure Act', 'BIOSECURE', 'drug shortage',
    'advanced manufacturing', 'process analytical technology',
    'ICH Q12', 'ICH Q13', 'continuous manufacturing',
  ],

  serviceOpportunities: [
    'OT Strategy', 'OT Asset Canonization', 'Commissioning Security',
    'GxP Compliance', 'Batch Process Security', 'SCADA Security',
    'Cleanroom OT', 'Serialization', 'Digital Twin',
    'Supply Chain Security', 'Workforce Planning',
  ],

  searchQueries: [
    'pharmaceutical facility expansion construction',
    'biomanufacturing plant investment',
    'pharma factory new facility OT',
    'FDA facility inspection warning',
    'GxP automation cybersecurity',
    'pharma OT cybersecurity',
    'cleanroom automation security',
    'cell gene therapy manufacturing facility',
    'Eli Lilly manufacturing expansion',
    'Novo Nordisk facility investment',
    'Moderna mRNA manufacturing',
    'pharma onshoring domestic production',
    'Biosecure Act manufacturing',
    'continuous manufacturing pharmaceutical',
    'pharma digital transformation',
  ],

  highValueSignals: [
    'new manufacturing facility', 'biomanufacturing campus',
    'fill finish facility', 'API production', 'sterile manufacturing',
    'GxP validation', 'FDA warning letter', 'consent decree',
    'cell therapy manufacturing', 'gene therapy production',
    'mRNA facility', 'vaccine manufacturing',
    'BARDA contract', 'pandemic preparedness',
    'drug shortage', 'onshoring', 'reshoring pharma',
    'pharma 4.0', 'continuous manufacturing',
  ],
}

export class LifeSciencesSectorAgent extends BaseSectorAgent {
  constructor() {
    super(LIFE_SCIENCES_CONFIG)
  }

  protected async analyzeSectorSpecific(data: AgentDataContext): Promise<AgentInsight[]> {
    const insights: AgentInsight[] = []

    for (const news of data.newsItems) {
      const text = `${news.title} ${news.description}`
      const textLower = text.toLowerCase()

      const facilityInsight = this.analyzeNewFacility(text, textLower, news)
      if (facilityInsight) insights.push(facilityInsight)

      const fdaInsight = this.analyzeFdaAction(text, textLower, news)
      if (fdaInsight) insights.push(fdaInsight)

      const gxpInsight = this.analyzeGxpConvergence(text, textLower, news)
      if (gxpInsight) insights.push(gxpInsight)

      const onshoringInsight = this.analyzeOnshoring(text, textLower, news)
      if (onshoringInsight) insights.push(onshoringInsight)
    }

    // Analyze structured signals from OT Radar (EPA permits, SEC filings)
    for (const signal of data.radarSignals) {
      if (signal.sector !== 'life-sciences' && signal.sector !== 'pharma') continue

      if (signal.signalType === 'facility-permit') {
        insights.push(this.createInsight({
          insightType: 'signal',
          title: `Pharma Facility Permit: ${signal.entity}`,
          summary: `EPA/state permit filed for pharma facility: ${signal.description}. New OT environment being built.`,
          confidence: 0.85,
          impactScore: 8,
          relevantSectors: ['life-sciences'],
          relevantCapabilities: [
            'OT Asset Canonization', 'Commissioning Security',
            'GxP Compliance', 'Cleanroom OT',
          ],
          suggestedActions: [
            this.createAction(
              `Engage ${signal.entity} for commissioning OT services`,
              'New facility permit = early-stage engagement opportunity',
              'immediate',
              'BD Team'
            ),
          ],
          sources: [{ url: signal.url, title: signal.description, source: signal.source }],
        }))
      }

      if (signal.signalType === 'capex-disclosure' && signal.value && signal.value >= 100) {
        insights.push(this.createInsight({
          insightType: 'investment',
          title: `Pharma CapEx: ${signal.entity} ($${signal.value >= 1000 ? (signal.value / 1000).toFixed(1) + 'B' : signal.value + 'M'})`,
          summary: `SEC filing reveals manufacturing capital expenditure: ${signal.description}`,
          confidence: 0.8,
          impactScore: Math.min(10, 6 + Math.floor(Math.log10(signal.value))),
          relevantSectors: ['life-sciences'],
          relevantCapabilities: this.sectorConfig.serviceOpportunities,
          suggestedActions: [
            this.createAction(
              `Research ${signal.entity} CapEx plans for OT scope`,
              'Large pharma CapEx = new OT environments and modernization',
              'short-term',
              'BD Team'
            ),
          ],
          sources: [{ url: signal.url, title: signal.description, source: signal.source }],
          investmentData: {
            investmentType: 'corporate-investment',
            amount: signal.value,
            recipient: signal.entity,
            serviceOpportunity: this.sectorConfig.serviceOpportunities,
          },
        }))
      }
    }

    return insights
  }

  private analyzeNewFacility(text: string, textLower: string, news: any): AgentInsight | null {
    const facilitySignals = [
      'new facility', 'new plant', 'new campus', 'manufacturing site',
      'biomanufacturing facility', 'production facility',
      'fill finish', 'api production', 'sterile manufacturing',
      'cell therapy manufacturing', 'gene therapy facility',
      'mrna facility', 'vaccine plant', 'biologics facility',
    ]

    const constructionSignals = [
      'construction', 'breaks ground', 'groundbreaking', 'building',
      'expansion', 'investment', 'billion', 'million',
    ]

    const hasFacility = facilitySignals.some(s => textLower.includes(s))
    const hasConstruction = constructionSignals.some(s => textLower.includes(s))

    if (!hasFacility || !hasConstruction) return null

    const investmentAmount = this.extractInvestmentAmount(text)
    const company = this.sectorConfig.keyPlayers.find(p => textLower.includes(p.toLowerCase()))

    return this.createInsight({
      insightType: 'signal',
      title: `Pharma Facility: ${company || 'New Build'}`,
      summary: `Life sciences manufacturing facility construction/expansion. Day-1 OT and GxP commissioning opportunity. ${news.title}`,
      confidence: 0.85,
      impactScore: investmentAmount && investmentAmount >= 500 ? 9 : 8,
      relevantSectors: ['life-sciences'],
      relevantCapabilities: [
        'OT Asset Canonization', 'Commissioning Security',
        'GxP Compliance', 'Cleanroom OT', 'EPC Governance',
      ],
      suggestedActions: [
        this.createAction(
          `Pursue ${company || 'pharma'} facility for OT commissioning services`,
          'New pharma facilities need GxP-compliant OT from day one',
          'immediate',
          'BD Team'
        ),
        this.createAction(
          'Develop GxP-OT commissioning offering for life sciences',
          'Pharma has unique validation requirements for OT',
          'short-term',
          'OT Practice'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
      investmentData: investmentAmount ? {
        investmentType: 'expansion',
        amount: investmentAmount,
        recipient: company,
        serviceOpportunity: ['GxP Compliance', 'Commissioning Security', 'OT Asset Canonization'],
      } : undefined,
    })
  }

  private analyzeFdaAction(text: string, textLower: string, news: any): AgentInsight | null {
    const fdaSignals = [
      'fda warning letter', 'fda inspection', 'consent decree',
      'fda 483', '483 observation', 'cgmp violation',
      'manufacturing deficiency', 'quality issue',
    ]

    if (!fdaSignals.some(s => textLower.includes(s))) return null

    const company = this.sectorConfig.keyPlayers.find(p => textLower.includes(p.toLowerCase()))

    return this.createInsight({
      insightType: 'capability-gap',
      title: `Pharma FDA Action: ${company || 'Manufacturing Compliance'}`,
      summary: `FDA enforcement or inspection signal. Companies under scrutiny need OT visibility and compliance remediation. ${news.title}`,
      confidence: 0.8,
      impactScore: 8,
      relevantSectors: ['life-sciences'],
      relevantPolicies: ['FDA', 'cGMP'],
      relevantCapabilities: [
        'OT Asset Canonization', 'GxP Compliance',
        'Batch Process Security', 'SCADA Security',
      ],
      suggestedActions: [
        this.createAction(
          `Offer OT compliance remediation to ${company || 'affected company'}`,
          'FDA actions drive urgent OT assessment and remediation needs',
          'immediate',
          'BD Team'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
    })
  }

  private analyzeGxpConvergence(text: string, textLower: string, news: any): AgentInsight | null {
    const gxpSignals = [
      'gxp', 'cgmp', 'good manufacturing practice', 'validation',
      'qualification', 'csv', 'computer system validation',
      'pharma 4.0', 'process analytical technology', 'pat',
    ]

    const otSignals = [
      'ot', 'operational technology', 'scada', 'dcs', 'plc',
      'automation', 'industrial control', 'batch control',
      'manufacturing execution', 'mes', 'historian',
    ]

    const hasGxp = gxpSignals.some(s => textLower.includes(s))
    const hasOt = otSignals.some(s => textLower.includes(s))

    if (!hasGxp || !hasOt) return null

    return this.createInsight({
      insightType: 'capability-gap',
      title: 'Pharma: GxP/OT Convergence Signal',
      summary: `GxP and OT convergence activity detected. Unique Deloitte differentiator at this intersection. ${news.title}`,
      confidence: 0.8,
      impactScore: 8,
      relevantSectors: ['life-sciences'],
      relevantCapabilities: [
        'GxP Compliance', 'OT Asset Canonization',
        'Batch Process Security', 'Industrial AI Security',
      ],
      suggestedActions: [
        this.createAction(
          'Develop GxP-OT convergence advisory offering',
          'Few firms can credibly advise on both GxP validation and OT security',
          'short-term',
          'OT Practice'
        ),
        this.createAction(
          'Create thought leadership on Pharma 4.0 OT security',
          'Position Deloitte at the GxP/OT intersection',
          'short-term',
          'Marketing'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
    })
  }

  private analyzeOnshoring(text: string, textLower: string, news: any): AgentInsight | null {
    const onshoringSignals = [
      'onshoring', 'reshoring', 'domestic manufacturing', 'domestic production',
      'biosecure act', 'biosecure', 'supply chain resilience',
      'drug shortage', 'api onshoring', 'domestic api',
    ]

    const pharmaContext = [
      'pharma', 'drug', 'medication', 'biologic', 'api',
      'active pharmaceutical', 'vaccine', 'biosimilar',
    ]

    const hasOnshoring = onshoringSignals.some(s => textLower.includes(s))
    const hasPharma = pharmaContext.some(s => textLower.includes(s))

    if (!hasOnshoring || !hasPharma) return null

    const investmentAmount = this.extractInvestmentAmount(text)

    return this.createInsight({
      insightType: 'signal',
      title: 'Pharma: Domestic Manufacturing / Onshoring',
      summary: `Pharma onshoring/reshoring activity. New domestic facilities need OT from scratch. ${news.title}`,
      confidence: 0.75,
      impactScore: investmentAmount && investmentAmount >= 500 ? 9 : 7,
      relevantSectors: ['life-sciences'],
      relevantPolicies: ['Biosecure Act', 'drug supply chain', 'onshoring pharma'],
      relevantCapabilities: [
        'OT Asset Canonization', 'Commissioning Security',
        'GxP Compliance', 'Supply Chain Security', 'EPC Governance',
      ],
      suggestedActions: [
        this.createAction(
          'Track pharma onshoring wave for greenfield OT opportunities',
          'Onshored pharma plants built from scratch = full OT engagement',
          'short-term',
          'BD Team'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
      investmentData: investmentAmount ? {
        investmentType: 'expansion',
        amount: investmentAmount,
        serviceOpportunity: ['OT Asset Canonization', 'Commissioning Security', 'GxP Compliance'],
      } : undefined,
    })
  }
}

export const lifeSciencesSectorAgent = new LifeSciencesSectorAgent()
