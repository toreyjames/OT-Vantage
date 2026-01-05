/**
 * Opportunity Discovery Service
 * Discovers new investment opportunities from news and announcements
 */

import { fetchRelevantNews, newsToSignal, NewsItem } from './news-feed'

export interface OpportunitySignal {
  id: string
  type: 'opportunity'
  title: string
  summary: string
  source: string
  url: string
  discoveredAt: string
  confidence: number
  extractedData: {
    company?: string
    investmentAmount?: string
    location?: string
    sector?: string
  }
  suggestedSector?: string
  suggestedPolicyAlignment?: string[]
  status: 'new' | 'reviewing' | 'promoted' | 'dismissed'
}

// Map extracted sector to our sector codes
function mapSector(extractedSector?: string): string | undefined {
  if (!extractedSector) return undefined
  
  const sectorMap: Record<string, string> = {
    'semiconductor': 'semiconductor',
    'data-center': 'data-center',
    'ev-battery': 'ev-battery',
    'nuclear': 'nuclear',
    'clean-energy': 'clean-energy',
    'critical-minerals': 'critical-minerals',
  }
  
  return sectorMap[extractedSector]
}

// Suggest policy alignment based on sector and keywords
function suggestPolicyAlignment(sector?: string, title?: string): string[] {
  const alignment: string[] = []
  const titleLower = (title || '').toLowerCase()
  
  if (sector === 'semiconductor' || titleLower.includes('chip') || titleLower.includes('fab')) {
    alignment.push('chips-sovereignty')
    alignment.push('eo-14179-ai-leadership')
  }
  
  if (sector === 'data-center' || titleLower.includes('data center') || titleLower.includes('ai')) {
    alignment.push('eo-14179-ai-leadership')
    alignment.push('winning-race-action-plan')
  }
  
  if (sector === 'nuclear' || titleLower.includes('nuclear') || titleLower.includes('reactor')) {
    alignment.push('nuclear-restart')
    alignment.push('genesis-mission')
  }
  
  if (sector === 'ev-battery' || titleLower.includes('battery') || titleLower.includes('ev')) {
    alignment.push('energy-dominance')
  }
  
  if (sector === 'critical-minerals' || titleLower.includes('rare earth') || titleLower.includes('lithium')) {
    alignment.push('chips-sovereignty')
  }
  
  if (sector === 'clean-energy' || titleLower.includes('hydrogen') || titleLower.includes('solar')) {
    alignment.push('energy-dominance')
  }
  
  return Array.from(new Set(alignment))
}

/**
 * Discover new opportunities from news feeds
 * This fetches REAL data from Google News RSS
 */
export async function discoverOpportunities(): Promise<OpportunitySignal[]> {
  try {
    // Fetch relevant news
    const newsItems = await fetchRelevantNews([
      'semiconductor factory investment billion',
      'data center construction billion',
      'battery plant investment America',
      'nuclear plant restart',
      'rare earth processing US',
    ])
    
    // Transform to opportunity signals
    const signals: OpportunitySignal[] = newsItems.map(news => {
      const baseSignal = newsToSignal(news)
      const sector = mapSector(news.extractedData.sector)
      
      return {
        ...baseSignal,
        suggestedSector: sector,
        suggestedPolicyAlignment: suggestPolicyAlignment(sector, news.title),
        status: 'new' as const,
      }
    })
    
    return signals
  } catch (error) {
    console.error('Opportunity discovery failed:', error)
    return []
  }
}

// For backwards compatibility
export { discoverOpportunities as fetchOpportunitySignals }
