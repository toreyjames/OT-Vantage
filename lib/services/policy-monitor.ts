/**
 * Policy Monitor Service
 * Fetches real policy updates from Federal Register and other sources
 */

import { fetchRelevantPolicyUpdates } from './federal-register'

export interface PolicyUpdate {
  id: string
  type: 'executive-order' | 'regulation' | 'guidance' | 'announcement' | 'legislation'
  title: string
  summary: string
  source: string
  url: string
  publishedAt: string
  agencies: string[]
  relevanceScore: number
  matchedKeywords: string[]
  policyAlignment: string[]
}

// Map Federal Register types to our types
function mapDocType(frType: string): PolicyUpdate['type'] {
  switch (frType) {
    case 'Executive Order':
      return 'executive-order'
    case 'Final Rule':
      return 'regulation'
    case 'Proposed Rule':
      return 'regulation'
    case 'Notice':
      return 'announcement'
    default:
      return 'announcement'
  }
}

// Determine policy alignment based on keywords and agencies
function determinePolicyAlignment(keywords: string[], agencies: string[]): string[] {
  const alignment: string[] = []
  const keywordsLower = keywords.map(k => k.toLowerCase())
  const agenciesLower = agencies.map(a => a.toLowerCase()).join(' ')
  
  // AI Leadership
  if (keywordsLower.some(k => ['artificial intelligence', 'ai', 'machine learning', 'computing'].includes(k))) {
    alignment.push('eo-14179-ai-leadership')
  }
  
  // CHIPS Sovereignty
  if (keywordsLower.some(k => ['semiconductor', 'chips', 'chip', 'foundry', 'fab'].includes(k))) {
    alignment.push('chips-sovereignty')
  }
  
  // Nuclear Restart
  if (keywordsLower.some(k => ['nuclear', 'reactor', 'atomic'].includes(k))) {
    alignment.push('nuclear-restart')
    alignment.push('genesis-mission')
  }
  
  // Energy Dominance
  if (keywordsLower.some(k => ['energy', 'power', 'grid', 'electricity', 'transmission'].includes(k))) {
    alignment.push('energy-dominance')
  }
  
  // Critical Minerals
  if (keywordsLower.some(k => ['critical mineral', 'rare earth', 'lithium', 'supply chain'].includes(k))) {
    alignment.push('chips-sovereignty')
  }
  
  // DOE involvement often means Genesis Mission relevant
  if (agenciesLower.includes('energy')) {
    if (!alignment.includes('energy-dominance')) {
      alignment.push('energy-dominance')
    }
  }
  
  // Commerce = often CHIPS related
  if (agenciesLower.includes('commerce')) {
    if (!alignment.includes('chips-sovereignty')) {
      alignment.push('chips-sovereignty')
    }
  }
  
  return Array.from(new Set(alignment)) // Dedupe
}

/**
 * Check policy feeds for updates
 * This fetches REAL data from the Federal Register API
 */
export async function checkPolicyFeeds(): Promise<PolicyUpdate[]> {
  try {
    // Fetch from Federal Register (last 14 days)
    const frUpdates = await fetchRelevantPolicyUpdates(14)
    
    // Transform to our format
    const policyUpdates: PolicyUpdate[] = frUpdates.map(doc => ({
      id: `fr-${doc.id}`,
      type: mapDocType(doc.type),
      title: doc.title,
      summary: doc.title, // Federal Register doesn't always have abstract in API
      source: doc.source,
      url: doc.url,
      publishedAt: new Date(doc.date).toISOString(),
      agencies: doc.agencies,
      relevanceScore: doc.relevanceScore,
      matchedKeywords: doc.matchedKeywords,
      policyAlignment: determinePolicyAlignment(doc.matchedKeywords, doc.agencies),
    }))
    
    // Sort by relevance
    return policyUpdates.sort((a, b) => b.relevanceScore - a.relevanceScore)
  } catch (error) {
    console.error('Policy feed check failed:', error)
    return []
  }
}

// For backwards compatibility
export { checkPolicyFeeds as fetchPolicyUpdates }
