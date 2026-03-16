/**
 * Defense / Aerospace Sector Agent
 *
 * Monitors the defense industrial base including:
 * - Facility modernization (shipyards, depots, munitions plants)
 * - Aerospace production scaling (GE Aerospace, RTX, etc.)
 * - AUKUS / allied programs with US manufacturing
 * - DoD cybersecurity / CMMC mandates impacting OT
 * - SAM.gov RFPs and FPDS contract awards (via OT Radar)
 */

import { BaseSectorAgent, SectorConfig } from './base-sector-agent'
import { AgentDataContext } from '../base-agent'
import { AgentInsight } from '../types'

const DEFENSE_CONFIG: SectorConfig = {
  id: 'defense-agent',
  name: 'Defense & Aerospace',
  description: 'Monitors defense industrial base modernization, aerospace manufacturing, and DoD OT cyber requirements',

  keywords: [
    'defense', 'aerospace', 'military', 'DoD', 'Department of Defense',
    'AUKUS', 'shipyard', 'munitions', 'depot', 'arsenal',
    'defense industrial base', 'DIB', 'CMMC', 'defense production',
    'GE Aerospace', 'Lockheed Martin', 'Northrop Grumman', 'RTX', 'Raytheon',
    'L3Harris', 'BAE Systems', 'General Dynamics', 'Huntington Ingalls',
    'BWXT', 'Textron', 'Leidos', 'SAIC', 'Booz Allen',
    'F-35', 'Sentinel', 'ICBM', 'submarine', 'destroyer', 'carrier',
    'Navy', 'Army', 'Air Force', 'Space Force', 'DARPA', 'DLA',
  ],

  keyPlayers: [
    'GE Aerospace', 'Lockheed Martin', 'Northrop Grumman', 'RTX',
    'Raytheon', 'L3Harris', 'BAE Systems', 'General Dynamics',
    'Huntington Ingalls', 'BWXT', 'Textron', 'Boeing Defense',
    'Leidos', 'SAIC', 'Rolls-Royce Defense', 'Pratt & Whitney',
    'General Electric', 'Collins Aerospace', 'Aerojet Rocketdyne',
    'Curtiss-Wright', 'Mercury Systems',
  ],

  policies: [
    'AUKUS', 'CMMC', 'NDAA', 'National Defense Authorization Act',
    'defense production act', 'DPA', 'shipyard modernization',
    'submarine industrial base', 'munitions production',
    'defense spending', 'Pentagon budget', 'DARPA',
    'defense industrial base', 'DIB assessment',
  ],

  serviceOpportunities: [
    'OT Strategy', 'OT Asset Canonization', 'Commissioning Security',
    'EPC Governance', 'Industrial AI Security', 'CMMC Compliance',
    'Supply Chain Security', 'Workforce Planning', 'Digital Twin',
  ],

  searchQueries: [
    'defense manufacturing modernization OT',
    'GE Aerospace facility expansion production',
    'Navy shipyard modernization program',
    'AUKUS submarine production facility',
    'defense industrial base cybersecurity OT',
    'DoD CMMC OT requirements manufacturing',
    'Lockheed Martin production expansion',
    'Northrop Grumman facility investment',
    'RTX Raytheon factory modernization',
    'military depot modernization automation',
    'munitions plant expansion investment',
    'defense contractor facility construction',
    'L3Harris manufacturing expansion',
    'BAE Systems US production',
    'defense supply chain security',
  ],

  highValueSignals: [
    'shipyard modernization', 'depot modernization', 'production rate increase',
    'production line', 'manufacturing execution', 'CMMC Level 2',
    'defense critical infrastructure', 'AUKUS pillar',
    'submarine construction', 'munitions surge', 'arsenal modernization',
    'digital thread', 'model-based systems engineering',
    'defense OT', 'weapons system cybersecurity',
  ],
}

export class DefenseSectorAgent extends BaseSectorAgent {
  constructor() {
    super(DEFENSE_CONFIG)
  }

  protected async analyzeSectorSpecific(data: AgentDataContext): Promise<AgentInsight[]> {
    const insights: AgentInsight[] = []

    for (const news of data.newsItems) {
      const text = `${news.title} ${news.description}`
      const textLower = text.toLowerCase()

      const shipyardInsight = this.analyzeShipyardModernization(text, textLower, news)
      if (shipyardInsight) insights.push(shipyardInsight)

      const cmmcInsight = this.analyzeCmmcRequirement(text, textLower, news)
      if (cmmcInsight) insights.push(cmmcInsight)

      const productionInsight = this.analyzeProductionScaling(text, textLower, news)
      if (productionInsight) insights.push(productionInsight)

      const aukusInsight = this.analyzeAukusProgram(text, textLower, news)
      if (aukusInsight) insights.push(aukusInsight)
    }

    // Analyze structured signals from OT Radar (SAM.gov, FPDS, USASpending)
    for (const signal of data.radarSignals) {
      if (signal.sector !== 'defense' && signal.sector !== 'aerospace') continue

      if (signal.signalType === 'rfp') {
        insights.push(this.createInsight({
          insightType: 'signal',
          title: `Defense RFP: ${signal.entity}`,
          summary: `Active solicitation from ${signal.entity}: ${signal.description}`,
          confidence: 0.9,
          impactScore: 8,
          relevantSectors: ['defense'],
          relevantCapabilities: this.sectorConfig.serviceOpportunities,
          suggestedActions: [
            this.createAction(
              `Evaluate RFP from ${signal.entity} for pursuit`,
              'Active solicitation with defined timeline',
              'immediate',
              'BD Team'
            ),
          ],
          sources: [{ url: signal.url, title: signal.description, source: signal.source }],
        }))
      }

      if (signal.signalType === 'contract-award' && signal.value && signal.value >= 50) {
        insights.push(this.createInsight({
          insightType: 'investment',
          title: `Defense Contract: ${signal.entity} ($${signal.value >= 1000 ? (signal.value / 1000).toFixed(1) + 'B' : signal.value + 'M'})`,
          summary: `Contract awarded: ${signal.description}`,
          confidence: 0.85,
          impactScore: Math.min(10, 6 + Math.floor(Math.log10(signal.value))),
          relevantSectors: ['defense'],
          relevantCapabilities: this.sectorConfig.serviceOpportunities,
          suggestedActions: [
            this.createAction(
              `Follow up on ${signal.entity} contract win for sub-tier services`,
              'Large contract awards create downstream OT service needs',
              'short-term',
              'BD Team'
            ),
          ],
          sources: [{ url: signal.url, title: signal.description, source: signal.source }],
          investmentData: {
            investmentType: 'government-grant',
            amount: signal.value,
            recipient: signal.entity,
            serviceOpportunity: this.sectorConfig.serviceOpportunities,
          },
        }))
      }
    }

    return insights
  }

  private analyzeShipyardModernization(text: string, textLower: string, news: any): AgentInsight | null {
    const shipyardSignals = [
      'shipyard modernization', 'naval shipyard', 'ship repair',
      'dry dock', 'submarine maintenance', 'carrier overhaul',
      'huntington ingalls', 'bath iron works', 'general dynamics nassco',
      'norfolk naval shipyard', 'portsmouth naval shipyard',
      'pearl harbor naval shipyard', 'puget sound naval shipyard',
    ]

    if (!shipyardSignals.some(s => textLower.includes(s))) return null

    const investmentAmount = this.extractInvestmentAmount(text)

    return this.createInsight({
      insightType: 'signal',
      title: 'Defense: Shipyard / Naval Modernization',
      summary: `Naval industrial base modernization signal. Major OT commissioning and asset visibility opportunity. ${news.title}`,
      confidence: 0.85,
      impactScore: 9,
      relevantSectors: ['defense'],
      relevantPolicies: ['shipyard modernization', 'AUKUS', 'submarine industrial base'],
      relevantCapabilities: [
        'OT Asset Canonization', 'Commissioning Security',
        'EPC Governance', 'Industrial AI Security', 'Digital Twin',
      ],
      suggestedActions: [
        this.createAction(
          'Pursue shipyard OT modernization engagement',
          '$21B+ Navy program with massive OT scope',
          'immediate',
          'BD Team'
        ),
        this.createAction(
          'Develop naval OT asset baseline offering',
          'Shipyards have complex legacy OT requiring canonization',
          'short-term',
          'OT Practice'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
      investmentData: investmentAmount ? {
        investmentType: 'government-grant',
        amount: investmentAmount,
        serviceOpportunity: ['OT Asset Canonization', 'Commissioning Security'],
      } : undefined,
    })
  }

  private analyzeCmmcRequirement(text: string, textLower: string, news: any): AgentInsight | null {
    const cmmcSignals = [
      'cmmc', 'cybersecurity maturity model', 'dfars',
      'nist 800-171', 'nist 800-172', 'controlled unclassified',
      'defense contractor cybersecurity', 'dib cybersecurity',
    ]

    const otSignals = [
      'ot', 'operational technology', 'manufacturing', 'production',
      'scada', 'ics', 'industrial control', 'factory', 'plant',
    ]

    const hasCmmc = cmmcSignals.some(s => textLower.includes(s))
    const hasOt = otSignals.some(s => textLower.includes(s))

    if (!hasCmmc) return null

    return this.createInsight({
      insightType: hasOt ? 'capability-gap' : 'policy',
      title: `Defense: CMMC ${hasOt ? 'OT ' : ''}Compliance Signal`,
      summary: `CMMC/defense cybersecurity requirement impacting ${hasOt ? 'OT environments in ' : ''}the defense industrial base. ${news.title}`,
      confidence: hasOt ? 0.85 : 0.7,
      impactScore: hasOt ? 9 : 7,
      relevantSectors: ['defense'],
      relevantPolicies: ['CMMC', 'DFARS', 'NIST 800-171'],
      relevantCapabilities: [
        'OT Asset Canonization', 'CMMC Compliance',
        'Supply Chain Security', 'OT Strategy',
      ],
      suggestedActions: [
        this.createAction(
          'Develop CMMC-for-OT advisory offering',
          'Defense contractors need OT-specific CMMC guidance',
          'immediate',
          'OT Practice'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
    })
  }

  private analyzeProductionScaling(text: string, textLower: string, news: any): AgentInsight | null {
    const scalingSignals = [
      'production rate', 'production increase', 'ramp up', 'surge capacity',
      'production line', 'manufacturing expansion', 'factory expansion',
      'new production facility', 'second source', 'production capacity',
    ]

    const defenseContext = [
      'ge aerospace', 'lockheed', 'northrop', 'rtx', 'raytheon',
      'l3harris', 'bae', 'general dynamics', 'boeing defense',
      'f-35', 'f-15', 'sentinel', 'engine', 'missile', 'munition',
    ]

    const hasScaling = scalingSignals.some(s => textLower.includes(s))
    const hasDefense = defenseContext.some(s => textLower.includes(s))

    if (!hasScaling || !hasDefense) return null

    const investmentAmount = this.extractInvestmentAmount(text)
    const company = this.sectorConfig.keyPlayers.find(p => textLower.includes(p.toLowerCase()))

    return this.createInsight({
      insightType: 'signal',
      title: `Defense Production: ${company || 'Scaling Signal'}`,
      summary: `Defense production scaling activity. New or expanded OT environments. ${news.title}`,
      confidence: 0.8,
      impactScore: 8,
      relevantSectors: ['defense', 'aerospace'],
      relevantCapabilities: [
        'OT Asset Canonization', 'Commissioning Security',
        'Industrial AI Security', 'EPC Governance',
      ],
      suggestedActions: [
        this.createAction(
          `Pursue ${company || 'defense prime'} production line OT engagement`,
          'Production scaling creates new OT environments needing security',
          'immediate',
          'BD Team'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
      investmentData: investmentAmount ? {
        investmentType: 'expansion',
        amount: investmentAmount,
        recipient: company,
        serviceOpportunity: ['Commissioning Security', 'OT Asset Canonization'],
      } : undefined,
    })
  }

  private analyzeAukusProgram(text: string, textLower: string, news: any): AgentInsight | null {
    const aukusSignals = [
      'aukus', 'ssn-aukus', 'nuclear submarine australia',
      'submarine industrial base', 'aukus pillar',
    ]

    if (!aukusSignals.some(s => textLower.includes(s))) return null

    const investmentAmount = this.extractInvestmentAmount(text)

    return this.createInsight({
      insightType: 'signal',
      title: 'Defense: AUKUS Program Signal',
      summary: `AUKUS submarine program activity -- massive long-term OT infrastructure opportunity. ${news.title}`,
      confidence: 0.9,
      impactScore: 10,
      relevantSectors: ['defense'],
      relevantPolicies: ['AUKUS', 'submarine industrial base'],
      relevantCapabilities: [
        'OT Asset Canonization', 'Commissioning Security',
        'EPC Governance', 'Supply Chain Security', 'Digital Twin',
      ],
      suggestedActions: [
        this.createAction(
          'Position for AUKUS submarine OT/cyber scope',
          'Multi-decade program with enormous OT commissioning needs',
          'immediate',
          'BD Team'
        ),
        this.createAction(
          'Engage HII and General Dynamics EB on OT services',
          'Primary submarine builders will need OT partners',
          'short-term',
          'BD Team'
        ),
      ],
      sources: [this.createSource(news.url, news.title, news.source)],
      investmentData: investmentAmount ? {
        investmentType: 'government-grant',
        amount: investmentAmount,
        serviceOpportunity: ['OT Asset Canonization', 'Commissioning Security', 'EPC Governance'],
      } : undefined,
    })
  }
}

export const defenseSectorAgent = new DefenseSectorAgent()
