/**
 * Investment Tracker Agent
 * 
 * Tracks capital flows and funding announcements:
 * - Venture funding rounds (Series A, B, C, etc.)
 * - Government grants (DOE, CHIPS Act, IRA credits)
 * - Corporate investments and expansions
 * - M&A activity
 * - IPOs and public market moves
 */

import { BaseAgent, AgentDataContext, DELOITTE_CAPABILITIES } from '../base-agent'
import { AgentInsight, InvestmentData, InsightPriority } from '../types'

// ============================================================================
// INVESTMENT KEYWORDS & PATTERNS
// ============================================================================

const INVESTMENT_TYPES = {
  funding: {
    keywords: ['funding', 'raises', 'raised', 'Series A', 'Series B', 'Series C', 'Series D', 'seed round', 'venture', 'investment round'],
    type: 'funding-round' as const,
  },
  government: {
    keywords: ['DOE', 'Department of Energy', 'CHIPS Act', 'CHIPS funding', 'IRA credit', 'Inflation Reduction Act', 'loan guarantee', 'federal grant', 'government funding'],
    type: 'government-grant' as const,
  },
  chipsAct: {
    keywords: ['CHIPS Act', 'CHIPS and Science', 'semiconductor funding', 'fab incentive', 'chip manufacturing grant'],
    type: 'chips-act' as const,
  },
  iraCredit: {
    keywords: ['IRA credit', 'Inflation Reduction Act', 'clean energy credit', 'production tax credit', '45X credit', '48E credit'],
    type: 'ira-credit' as const,
  },
  doeLoan: {
    keywords: ['DOE loan', 'LPO', 'Loan Programs Office', 'conditional commitment', 'loan guarantee'],
    type: 'doe-loan' as const,
  },
  corporate: {
    keywords: ['invests', 'investment', 'commits', 'committed', 'backs', 'strategic investment', 'corporate venture'],
    type: 'corporate-investment' as const,
  },
  expansion: {
    keywords: ['expansion', 'expands', 'breaks ground', 'groundbreaking', 'new facility', 'new plant', 'new factory', 'construction begins'],
    type: 'expansion' as const,
  },
  acquisition: {
    keywords: ['acquires', 'acquisition', 'merger', 'merges', 'buyout', 'purchased', 'deal to buy'],
    type: 'acquisition' as const,
  },
  ipo: {
    keywords: ['IPO', 'initial public offering', 'goes public', 'SPAC', 'direct listing'],
    type: 'ipo' as const,
  },
}

// High-value investor/sources to track
const KEY_INVESTORS = [
  // Government
  'DOE', 'Department of Energy', 'LPO', 'CHIPS Program Office',
  // Tech giants
  'Microsoft', 'Google', 'Amazon', 'Meta', 'Apple', 'Oracle', 'OpenAI',
  // Major VCs
  'Breakthrough Energy', 'a16z', 'Andreessen Horowitz', 'Sequoia', 'Kleiner Perkins',
  'Tiger Global', 'SoftBank', 'Khosla Ventures', 'DCVC', 'Lowercarbon Capital',
  // Strategic investors
  'Chevron', 'BP', 'Shell', 'ExxonMobil', 'NextEra', 'Duke Energy',
  'Southern Company', 'Dominion', 'Constellation', 'Vistra',
]

// Sectors with high service potential
const HIGH_SERVICE_SECTORS = {
  'nuclear': ['OT Strategy', 'Commissioning Security', 'EPC Governance', 'Asset Canonization'],
  'semiconductor': ['Smart Factory', 'Supply Chain', 'ERP', 'OT Strategy'],
  'data center': ['OT Strategy', 'AI Security', 'Sustainability', 'Power Strategy'],
  'battery': ['Smart Factory', 'Supply Chain', 'OT Strategy', 'Sustainability'],
  'clean energy': ['Grid Integration', 'OT Strategy', 'Sustainability'],
  'critical minerals': ['Supply Chain', 'OT Strategy', 'Regulatory Compliance'],
}

export class InvestmentTrackerAgent extends BaseAgent {
  constructor() {
    super({
      id: 'investment-tracker',
      name: 'Investment Tracker',
      type: 'strategic',
      description: 'Tracks capital flows, funding announcements, and investment signals across Build Economy sectors',
      keywords: [
        ...INVESTMENT_TYPES.funding.keywords,
        ...INVESTMENT_TYPES.government.keywords,
        ...INVESTMENT_TYPES.expansion.keywords,
        ...KEY_INVESTORS,
      ],
      runIntervalMinutes: 60,
      minConfidenceThreshold: 0.5,
      maxInsightsPerRun: 20,
    })
  }
  
  getKeywords(): string[] {
    return this.config.keywords
  }
  
  getSearchQueries(): string[] {
    return [
      // Funding queries
      'nuclear startup funding round 2026',
      'fusion company raises million billion',
      'semiconductor company funding announcement',
      'data center investment billion',
      'battery company Series funding',
      'clean energy startup raises',
      
      // Government funding queries
      'DOE loan guarantee announcement',
      'CHIPS Act funding awarded',
      'IRA tax credit nuclear',
      'federal funding clean energy',
      'Department of Energy conditional commitment',
      
      // Expansion queries
      'breaks ground factory plant',
      'new facility construction announcement',
      'expansion investment billion million',
      'gigafactory groundbreaking',
      
      // M&A queries
      'acquisition energy technology',
      'merger nuclear semiconductor',
      
      // Corporate investment
      'Microsoft nuclear investment',
      'Google data center power',
      'Amazon energy partnership',
      'Meta nuclear deal',
      'Big Tech energy investment',
    ]
  }
  
  async analyze(data: AgentDataContext): Promise<AgentInsight[]> {
    const insights: AgentInsight[] = []
    
    for (const news of data.newsItems) {
      const text = `${news.title} ${news.description}`
      
      // Detect investment type
      const investmentType = this.detectInvestmentType(text)
      if (!investmentType) continue
      
      // Extract investment details
      const amount = this.extractInvestmentAmount(text)
      const investor = this.extractInvestor(text)
      const recipient = this.extractRecipient(text, news)
      const sector = this.detectSector(text)
      
      // Skip if no significant details found
      if (!amount && !investor && !recipient) continue
      
      // Calculate confidence and impact
      const confidence = this.calculateConfidence(amount, investor, investmentType)
      const impactScore = this.calculateImpactScore(amount, investmentType, sector)
      
      // Determine service opportunities
      const serviceOpportunities = this.identifyServiceOpportunities(sector, investmentType, amount)
      const estimatedServiceValue = this.estimateServiceValue(amount, investmentType)
      
      insights.push(this.createInsight({
        insightType: 'investment',
        title: this.generateTitle(investmentType, recipient, amount),
        summary: this.generateSummary(investmentType, investor, recipient, amount, sector),
        details: text.slice(0, 500),
        confidence,
        impactScore,
        relevantSectors: sector ? [sector] : [],
        relevantCapabilities: serviceOpportunities,
        suggestedActions: this.generateActions(investmentType, recipient, amount, serviceOpportunities),
        sources: [this.createSource(news.url, news.title, news.source)],
        investmentData: {
          investmentType,
          amount,
          investor: investor || undefined,
          recipient: recipient || undefined,
          sourceOfCapital: this.determineCapitalSource(investmentType, investor),
          destination: recipient || undefined,
          serviceOpportunity: serviceOpportunities,
          estimatedServiceValue,
        },
      }))
    }
    
    // Aggregate investment trends
    const trendInsights = this.analyzeTrends(insights)
    
    return [...insights, ...trendInsights]
      .sort((a, b) => {
        // Sort by impact and amount
        const aAmount = a.investmentData?.amount || 0
        const bAmount = b.investmentData?.amount || 0
        return (b.impactScore * 1000 + bAmount) - (a.impactScore * 1000 + aAmount)
      })
  }
  
  // ============================================================================
  // DETECTION METHODS
  // ============================================================================
  
  private detectInvestmentType(text: string): InvestmentData['investmentType'] | null {
    const textLower = text.toLowerCase()
    
    // Check each investment type
    for (const [_, config] of Object.entries(INVESTMENT_TYPES)) {
      if (config.keywords.some(kw => textLower.includes(kw.toLowerCase()))) {
        return config.type
      }
    }
    
    return null
  }
  
  private extractInvestor(text: string): string | null {
    // Check for known investors
    for (const investor of KEY_INVESTORS) {
      if (text.includes(investor)) {
        return investor
      }
    }
    
    // Pattern matching for "X invests" or "led by X"
    const patterns = [
      /led by ([A-Z][A-Za-z\s&]+)/,
      /from ([A-Z][A-Za-z\s&]+(?:Ventures|Capital|Partners))/,
      /backed by ([A-Z][A-Za-z\s&]+)/,
    ]
    
    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) {
        return match[1].trim()
      }
    }
    
    return null
  }
  
  private extractRecipient(text: string, news: any): string | null {
    // First check if news already extracted a company
    if (news.extractedData?.company) {
      return news.extractedData.company
    }
    
    // Check extracted company names from news
    if (news.extractedCompanyNames?.length > 0) {
      // Filter out investors to find recipient
      const nonInvestors = news.extractedCompanyNames.filter((name: string) =>
        !KEY_INVESTORS.some(inv => name.toLowerCase().includes(inv.toLowerCase()))
      )
      if (nonInvestors.length > 0) {
        return nonInvestors[0]
      }
    }
    
    return null
  }
  
  private detectSector(text: string): string | null {
    const textLower = text.toLowerCase()
    
    const sectorKeywords: Record<string, string[]> = {
      'nuclear': ['nuclear', 'reactor', 'fission', 'SMR', 'advanced reactor'],
      'fusion': ['fusion', 'fusion energy', 'plasma'],
      'semiconductor': ['semiconductor', 'chip', 'fab', 'foundry', 'wafer'],
      'data center': ['data center', 'hyperscale', 'AI infrastructure', 'compute'],
      'battery': ['battery', 'EV', 'gigafactory', 'cell production'],
      'clean energy': ['solar', 'wind', 'renewable', 'hydrogen', 'clean energy'],
      'critical minerals': ['rare earth', 'lithium', 'critical mineral', 'mining'],
    }
    
    for (const [sector, keywords] of Object.entries(sectorKeywords)) {
      if (keywords.some(kw => textLower.includes(kw))) {
        return sector
      }
    }
    
    return null
  }
  
  // ============================================================================
  // CALCULATION METHODS
  // ============================================================================
  
  private calculateConfidence(
    amount: number | undefined,
    investor: string | null,
    type: InvestmentData['investmentType']
  ): number {
    let confidence = 0.5
    
    // Amount increases confidence
    if (amount) {
      if (amount >= 1000) confidence += 0.25 // $1B+
      else if (amount >= 100) confidence += 0.15 // $100M+
      else confidence += 0.1
    }
    
    // Known investor increases confidence
    if (investor && KEY_INVESTORS.includes(investor)) {
      confidence += 0.15
    }
    
    // Government funding is highly reliable
    if (['government-grant', 'chips-act', 'ira-credit', 'doe-loan'].includes(type)) {
      confidence += 0.1
    }
    
    return Math.min(0.95, confidence)
  }
  
  private calculateImpactScore(
    amount: number | undefined,
    type: InvestmentData['investmentType'],
    sector: string | null
  ): number {
    let score = 5
    
    // Amount impact
    if (amount) {
      if (amount >= 10000) score += 4 // $10B+
      else if (amount >= 1000) score += 3 // $1B+
      else if (amount >= 500) score += 2 // $500M+
      else if (amount >= 100) score += 1 // $100M+
    }
    
    // Type impact
    const highImpactTypes = ['chips-act', 'doe-loan', 'expansion']
    if (highImpactTypes.includes(type)) {
      score += 1
    }
    
    // Sector impact
    const highImpactSectors = ['nuclear', 'fusion', 'semiconductor']
    if (sector && highImpactSectors.includes(sector)) {
      score += 1
    }
    
    return Math.min(10, score)
  }
  
  private identifyServiceOpportunities(
    sector: string | null,
    type: InvestmentData['investmentType'],
    amount: number | undefined
  ): string[] {
    const services = new Set<string>()
    
    // Sector-based services
    if (sector && HIGH_SERVICE_SECTORS[sector as keyof typeof HIGH_SERVICE_SECTORS]) {
      HIGH_SERVICE_SECTORS[sector as keyof typeof HIGH_SERVICE_SECTORS].forEach(s => services.add(s))
    }
    
    // Type-based services
    if (type === 'expansion') {
      services.add('Commissioning Security')
      services.add('EPC Governance')
      services.add('Asset Canonization')
    }
    
    if (type === 'chips-act') {
      services.add('CHIPS Compliance')
      services.add('Smart Factory')
      services.add('Supply Chain')
    }
    
    if (type === 'ira-credit' || type === 'doe-loan') {
      services.add('Tax Incentives')
      services.add('Regulatory Compliance')
    }
    
    // Large investments need more services
    if (amount && amount >= 500) {
      services.add('Program Management')
      services.add('Workforce Planning')
    }
    
    return Array.from(services)
  }
  
  private estimateServiceValue(
    amount: number | undefined,
    type: InvestmentData['investmentType']
  ): number | undefined {
    if (!amount) return undefined
    
    // Rough estimate: consulting opportunity is typically 0.5-2% of investment
    let percentage = 0.01 // 1% baseline
    
    // Adjust by type
    if (type === 'expansion') percentage = 0.015 // More services needed
    if (type === 'chips-act') percentage = 0.012 // Government compliance
    if (type === 'acquisition') percentage = 0.005 // Less services typically
    
    return Math.round(amount * percentage)
  }
  
  private determineCapitalSource(
    type: InvestmentData['investmentType'],
    investor: string | null
  ): string {
    if (['government-grant', 'chips-act', 'ira-credit', 'doe-loan'].includes(type)) {
      return 'Federal Government'
    }
    
    if (investor) {
      if (['Microsoft', 'Google', 'Amazon', 'Meta', 'Apple', 'Oracle'].includes(investor)) {
        return 'Big Tech Strategic'
      }
      if (investor.includes('Ventures') || investor.includes('Capital')) {
        return 'Venture Capital'
      }
    }
    
    if (type === 'corporate-investment') return 'Corporate'
    if (type === 'funding-round') return 'Private Investment'
    if (type === 'ipo') return 'Public Markets'
    
    return 'Unknown'
  }
  
  // ============================================================================
  // CONTENT GENERATION
  // ============================================================================
  
  private generateTitle(
    type: InvestmentData['investmentType'],
    recipient: string | null,
    amount: number | undefined
  ): string {
    const amountStr = amount ? `$${amount >= 1000 ? (amount / 1000).toFixed(1) + 'B' : amount + 'M'}` : ''
    const recipientStr = recipient ? ` for ${recipient}` : ''
    
    const typeLabels: Record<string, string> = {
      'funding-round': 'Funding Round',
      'government-grant': 'Government Grant',
      'chips-act': 'CHIPS Act Funding',
      'ira-credit': 'IRA Credit',
      'doe-loan': 'DOE Loan',
      'corporate-investment': 'Corporate Investment',
      'expansion': 'Expansion Investment',
      'acquisition': 'Acquisition',
      'ipo': 'IPO',
    }
    
    return `${typeLabels[type]}${recipientStr}: ${amountStr}`.trim()
  }
  
  private generateSummary(
    type: InvestmentData['investmentType'],
    investor: string | null,
    recipient: string | null,
    amount: number | undefined,
    sector: string | null
  ): string {
    const parts: string[] = []
    
    if (recipient) parts.push(`${recipient}`)
    
    const amountStr = amount ? `$${amount >= 1000 ? (amount / 1000).toFixed(1) + 'B' : amount + 'M'}` : 'undisclosed amount'
    
    if (type === 'funding-round') {
      parts.push(`raised ${amountStr}`)
      if (investor) parts.push(`led by ${investor}`)
    } else if (type === 'expansion') {
      parts.push(`announced ${amountStr} expansion`)
    } else if (['chips-act', 'doe-loan', 'government-grant'].includes(type)) {
      parts.push(`received ${amountStr} in government funding`)
    } else {
      parts.push(`secured ${amountStr} investment`)
    }
    
    if (sector) parts.push(`in the ${sector} sector`)
    
    return parts.join(' ') + '.'
  }
  
  private generateActions(
    type: InvestmentData['investmentType'],
    recipient: string | null,
    amount: number | undefined,
    services: string[]
  ): AgentInsight['suggestedActions'] {
    const actions: AgentInsight['suggestedActions'] = []
    
    // Primary action based on type
    if (type === 'expansion') {
      actions.push(this.createAction(
        `Pursue commissioning/construction engagement with ${recipient || 'recipient'}`,
        'New facility = greenfield OT opportunity',
        'immediate',
        'BD Team'
      ))
    } else if (['chips-act', 'doe-loan'].includes(type)) {
      actions.push(this.createAction(
        `Reach out for compliance and program management services`,
        'Government funding has reporting and compliance requirements',
        'short-term',
        'BD Team'
      ))
    } else if (type === 'funding-round' && amount && amount >= 100) {
      actions.push(this.createAction(
        `Track ${recipient || 'company'} for future facility announcements`,
        'Large funding rounds often precede expansion',
        'medium-term',
        'BD Team'
      ))
    }
    
    // Service-specific actions
    if (services.includes('Smart Factory') || services.includes('OT Strategy')) {
      actions.push(this.createAction(
        'Propose OT Strategy engagement',
        'New investment = opportunity for digital transformation',
        'short-term',
        'OT Practice'
      ))
    }
    
    return actions.slice(0, 3) // Max 3 actions
  }
  
  // ============================================================================
  // TREND ANALYSIS
  // ============================================================================
  
  private analyzeTrends(insights: AgentInsight[]): AgentInsight[] {
    const trendInsights: AgentInsight[] = []
    
    // Aggregate by sector
    const sectorTotals = new Map<string, { count: number; total: number }>()
    
    for (const insight of insights) {
      if (insight.investmentData?.amount && insight.relevantSectors.length > 0) {
        const sector = insight.relevantSectors[0]
        const current = sectorTotals.get(sector) || { count: 0, total: 0 }
        current.count++
        current.total += insight.investmentData.amount
        sectorTotals.set(sector, current)
      }
    }
    
    // Generate trend insights for sectors with multiple investments
    for (const [sector, data] of sectorTotals) {
      if (data.count >= 2 && data.total >= 500) {
        trendInsights.push(this.createInsight({
          insightType: 'signal',
          title: `Investment Wave: ${sector.charAt(0).toUpperCase() + sector.slice(1)}`,
          summary: `${data.count} investments totaling $${data.total >= 1000 ? (data.total / 1000).toFixed(1) + 'B' : data.total + 'M'} detected in ${sector} sector. Strong capital flow indicates growing opportunity.`,
          confidence: 0.8,
          impactScore: Math.min(10, 6 + Math.floor(data.count / 2)),
          relevantSectors: [sector],
          suggestedActions: [
            this.createAction(
              `Prioritize ${sector} sector in BD activities`,
              'Multiple investments signal active market',
              'immediate',
              'BD Team'
            ),
          ],
          sources: [],
        }))
      }
    }
    
    return trendInsights
  }
}

// Export singleton instance
export const investmentTracker = new InvestmentTrackerAgent()
