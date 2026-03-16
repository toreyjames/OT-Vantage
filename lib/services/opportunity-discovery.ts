/**
 * SMART Opportunity Discovery Service
 * Discovers NEW investment opportunities from news and announcements
 * Flags unknown companies as NEW DISCOVERIES for human review
 */

import { fetchRelevantNews, newsToSignal, NewsItem, getTrackingStats, getTrackedCompaniesLower } from './news-feed'

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
  // NEW DISCOVERY FIELDS
  isNewDiscovery: boolean
  extractedCompanyNames: string[]
  discoverySource?: string
  newCompanyName?: string // The specific unknown company found
}

export interface PendingDiscovery {
  id: string
  companyName: string
  sector: string | null
  newsItems: {
    id: string
    title: string
    url: string
    source: string
    publishedAt: string
  }[]
  firstSeen: string
  lastSeen: string
  mentionCount: number
  status: 'pending' | 'promoted' | 'dismissed'
  suggestedPolicyAlignment: string[]
}

// In-memory discovery queue (will be persisted to JSON)
let discoveryQueue: PendingDiscovery[] = []

// Map extracted sector to our sector codes
function mapSector(extractedSector?: string): string | undefined {
  if (!extractedSector) return undefined
  
  const sectorMap: Record<string, string> = {
    'semiconductor': 'semiconductor',
    'data-center': 'data-center',
    'ev-battery': 'ev-battery',
    'nuclear': 'nuclear',
    'fusion': 'nuclear',
    'clean-energy': 'clean-energy',
    'critical-minerals': 'critical-minerals',
    'defense': 'defense',
    'life-sciences': 'life-sciences',
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
  
  // Nuclear fission - comprehensive detection
  if (sector === 'nuclear' || titleLower.includes('nuclear') || titleLower.includes('reactor') || 
      titleLower.includes('oklo') || titleLower.includes('nuscale') || titleLower.includes('terrapower') ||
      titleLower.includes('x-energy') || titleLower.includes('kairos') || titleLower.includes('holtec') ||
      titleLower.includes('smr') || titleLower.includes('fission')) {
    alignment.push('nuclear-restart')
    alignment.push('genesis-mission')
  }
  
  // Fusion energy - all major players
  if (sector === 'fusion' || titleLower.includes('fusion') || 
      titleLower.includes('helion') || titleLower.includes('commonwealth fusion') || 
      titleLower.includes('tae technologies') || titleLower.includes('general fusion') ||
      titleLower.includes('zap energy') || titleLower.includes('tokamak')) {
    alignment.push('nuclear-restart')
    alignment.push('genesis-mission')
    alignment.push('energy-dominance')
  }
  
  // Tech + Energy partnerships (HUGE policy relevance - Stargate, etc.)
  if ((titleLower.includes('meta') || titleLower.includes('facebook') || 
       titleLower.includes('google') || titleLower.includes('microsoft') || 
       titleLower.includes('amazon') || titleLower.includes('openai') ||
       titleLower.includes('oracle') || titleLower.includes('softbank')) && 
      (titleLower.includes('nuclear') || titleLower.includes('energy') || 
       titleLower.includes('power') || titleLower.includes('data center'))) {
    alignment.push('eo-14179-ai-leadership')
    alignment.push('winning-race-action-plan')
    alignment.push('stargate-initiative')
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

  if (sector === 'defense' || titleLower.includes('defense') || titleLower.includes('aerospace') ||
      titleLower.includes('shipyard') || titleLower.includes('munitions') ||
      titleLower.includes('lockheed') || titleLower.includes('northrop') || titleLower.includes('ge aerospace')) {
    alignment.push('defense-industrial-base')
  }

  if (sector === 'life-sciences' || titleLower.includes('pharma') || titleLower.includes('biomanufacturing') ||
      titleLower.includes('drug manufacturing') || titleLower.includes('biosecure')) {
    alignment.push('domestic-manufacturing')
  }
  
  // CHIPS Act / semiconductor funding
  if (titleLower.includes('chips act') || titleLower.includes('chips funding')) {
    alignment.push('chips-sovereignty')
  }
  
  // DOE / government funding
  if (titleLower.includes('doe') || titleLower.includes('department of energy') || 
      titleLower.includes('loan guarantee') || titleLower.includes('federal funding')) {
    alignment.push('genesis-mission')
    alignment.push('energy-dominance')
  }
  
  return Array.from(new Set(alignment))
}

/**
 * Find the first unknown company name from extracted names
 */
function findNewCompanyName(extractedNames: string[], trackedLower: Set<string>): string | undefined {
  for (const name of extractedNames) {
    if (!trackedLower.has(name.toLowerCase())) {
      return name
    }
  }
  return undefined
}

/**
 * Add or update discovery in the queue
 */
function addToDiscoveryQueue(
  companyName: string,
  sector: string | null,
  newsItem: { id: string; title: string; url: string; source: string; publishedAt: string },
  policyAlignment: string[]
): void {
  const existing = discoveryQueue.find(d => 
    d.companyName.toLowerCase() === companyName.toLowerCase() && d.status === 'pending'
  )
  
  if (existing) {
    // Update existing discovery
    existing.lastSeen = new Date().toISOString()
    existing.mentionCount++
    if (!existing.newsItems.some(n => n.url === newsItem.url)) {
      existing.newsItems.push(newsItem)
    }
    // Merge policy alignments
    for (const policy of policyAlignment) {
      if (!existing.suggestedPolicyAlignment.includes(policy)) {
        existing.suggestedPolicyAlignment.push(policy)
      }
    }
  } else {
    // Create new discovery
    discoveryQueue.push({
      id: `discovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      companyName,
      sector,
      newsItems: [newsItem],
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      mentionCount: 1,
      status: 'pending',
      suggestedPolicyAlignment: policyAlignment,
    })
  }
}

/**
 * Discover new opportunities from news feeds
 * SMART: Uses event-based searches and flags unknown companies
 */
export async function discoverOpportunities(): Promise<OpportunitySignal[]> {
  try {
    // Fetch relevant news using SMART DISCOVERY
    const newsItems = await fetchRelevantNews()
    const trackedLower = getTrackedCompaniesLower()
    
    // Log stats for debugging
    const stats = getTrackingStats()
    console.log(`[OpportunityDiscovery] Tracking ${stats.trackedCompanies} companies, ${stats.eventDiscoveryQueries} event queries, ${stats.activeQueries} total queries`)
    
    // Transform to opportunity signals
    const signals: OpportunitySignal[] = newsItems.map(news => {
      const baseSignal = newsToSignal(news)
      const sector = mapSector(news.extractedData.sector)
      const newCompanyName = news.isNewDiscovery 
        ? findNewCompanyName(news.extractedCompanyNames, trackedLower)
        : undefined
      
      const policyAlignment = suggestPolicyAlignment(sector, news.title)
      
      // Add to discovery queue if it's a new company
      if (newCompanyName && news.isNewDiscovery) {
        addToDiscoveryQueue(
          newCompanyName,
          sector || null,
          {
            id: news.id,
            title: news.title,
            url: news.url,
            source: news.source,
            publishedAt: news.publishedAt,
          },
          policyAlignment
        )
      }
      
      return {
        ...baseSignal,
        suggestedSector: sector,
        suggestedPolicyAlignment: policyAlignment,
        status: 'new' as const,
        isNewDiscovery: news.isNewDiscovery,
        extractedCompanyNames: news.extractedCompanyNames,
        discoverySource: news.discoverySource,
        newCompanyName,
      }
    })
    
    return signals
  } catch (error) {
    console.error('Opportunity discovery failed:', error)
    return []
  }
}

/**
 * Discover opportunities with custom search focus
 */
export async function discoverOpportunitiesWithFocus(focusQueries: string[]): Promise<OpportunitySignal[]> {
  try {
    const newsItems = await fetchRelevantNews(focusQueries)
    const trackedLower = getTrackedCompaniesLower()
    
    const signals: OpportunitySignal[] = newsItems.map(news => {
      const baseSignal = newsToSignal(news)
      const sector = mapSector(news.extractedData.sector)
      const newCompanyName = news.isNewDiscovery 
        ? findNewCompanyName(news.extractedCompanyNames, trackedLower)
        : undefined
      
      return {
        ...baseSignal,
        suggestedSector: sector,
        suggestedPolicyAlignment: suggestPolicyAlignment(sector, news.title),
        status: 'new' as const,
        isNewDiscovery: news.isNewDiscovery,
        extractedCompanyNames: news.extractedCompanyNames,
        discoverySource: news.discoverySource,
        newCompanyName,
      }
    })
    
    return signals
  } catch (error) {
    console.error('Focused opportunity discovery failed:', error)
    return []
  }
}

// ============================================================================
// DISCOVERY QUEUE MANAGEMENT
// ============================================================================

/**
 * Get all pending discoveries
 */
export function getPendingDiscoveries(): PendingDiscovery[] {
  return discoveryQueue.filter(d => d.status === 'pending')
}

/**
 * Get all discoveries (including promoted/dismissed)
 */
export function getAllDiscoveries(): PendingDiscovery[] {
  return discoveryQueue
}

/**
 * Promote a discovery (mark as tracked)
 */
export function promoteDiscovery(discoveryId: string): PendingDiscovery | null {
  const discovery = discoveryQueue.find(d => d.id === discoveryId)
  if (discovery) {
    discovery.status = 'promoted'
    return discovery
  }
  return null
}

/**
 * Dismiss a discovery
 */
export function dismissDiscovery(discoveryId: string): PendingDiscovery | null {
  const discovery = discoveryQueue.find(d => d.id === discoveryId)
  if (discovery) {
    discovery.status = 'dismissed'
    return discovery
  }
  return null
}

/**
 * Load discovery queue from data
 */
export function loadDiscoveryQueue(data: PendingDiscovery[]): void {
  discoveryQueue = data
}

/**
 * Get discovery queue for persistence
 */
export function getDiscoveryQueueData(): PendingDiscovery[] {
  return discoveryQueue
}

/**
 * Clear old dismissed discoveries (older than 7 days)
 */
export function cleanupDiscoveryQueue(): number {
  const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000)
  const before = discoveryQueue.length
  discoveryQueue = discoveryQueue.filter(d => 
    d.status !== 'dismissed' || new Date(d.lastSeen).getTime() > cutoff
  )
  return before - discoveryQueue.length
}

/**
 * Get discovery system stats
 */
export function getDiscoveryStats() {
  const tracking = getTrackingStats()
  return {
    ...tracking,
    pendingDiscoveries: discoveryQueue.filter(d => d.status === 'pending').length,
    promotedDiscoveries: discoveryQueue.filter(d => d.status === 'promoted').length,
    dismissedDiscoveries: discoveryQueue.filter(d => d.status === 'dismissed').length,
    totalDiscoveries: discoveryQueue.length,
  }
}

// For backwards compatibility
export { discoverOpportunities as fetchOpportunitySignals }
