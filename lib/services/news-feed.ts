/**
 * SMART DISCOVERY News Feed Integration
 * EVENT-BASED: Searches for events (funding, partnerships, approvals) not just companies
 * Extracts company names from results and flags unknown companies as NEW DISCOVERIES
 */

import { opportunities } from '@/lib/data/opportunities'

export interface NewsItem {
  id: string
  title: string
  description: string
  url: string
  source: string
  publishedAt: string
  relevanceScore: number
  extractedData: {
    company?: string
    investmentAmount?: string
    location?: string
    sector?: string
  }
  // NEW: Discovery fields
  extractedCompanyNames: string[]
  isNewDiscovery: boolean
  discoverySource?: string
}

// ============================================================================
// EVENT-BASED DISCOVERY QUERIES
// Search for EVENTS to find unknown companies, not just track known ones
// ============================================================================

const EVENT_DISCOVERY_QUERIES: Record<string, string[]> = {
  nuclear: [
    'nuclear startup raises funding',
    'nuclear company Series A B C funding',
    'SMR company DOE approval',
    'nuclear power partnership announced',
    'advanced reactor company investment',
    'nuclear energy startup secures',
    'fission company funding round',
    'nuclear license NRC approval',
  ],
  fusion: [
    'fusion startup funding round',
    'fusion company partnership',
    'fusion breakthrough announcement',
    'fusion energy investment million billion',
    'fusion reactor company raises',
    'fusion startup Series funding',
  ],
  semiconductor: [
    'chip company investment billion',
    'semiconductor startup funding',
    'fab company breaks ground',
    'chip maker announces factory',
    'semiconductor firm raises',
    'foundry company expansion',
  ],
  'data-center': [
    'data center company investment',
    'hyperscale operator announces',
    'cloud infrastructure company funding',
    'data center developer breaks ground',
    'AI infrastructure company raises',
  ],
  'ev-battery': [
    'battery startup funding round',
    'EV battery company investment',
    'gigafactory company announces',
    'battery manufacturer raises',
    'cell production company funding',
  ],
  'critical-minerals': [
    'rare earth company funding',
    'lithium mining company investment',
    'critical minerals startup raises',
    'mineral processing company announces',
  ],
  defense: [
    'defense manufacturing modernization',
    'GE Aerospace facility expansion',
    'Navy shipyard modernization',
    'defense contractor factory investment',
    'military depot OT modernization',
    'AUKUS submarine production',
    'defense industrial base cybersecurity',
    'Lockheed Martin production expansion',
    'Northrop Grumman facility announcement',
    'munitions plant expansion',
  ],
  'life-sciences': [
    'pharmaceutical facility construction',
    'biomanufacturing plant investment',
    'pharma factory expansion',
    'cell therapy manufacturing facility',
    'gene therapy production site',
    'Eli Lilly manufacturing expansion',
    'Novo Nordisk facility investment',
    'Moderna mRNA manufacturing plant',
    'pharma onshoring domestic production',
    'FDA facility inspection warning',
  ],
  // Cross-sector high-signal queries
  partnerships: [
    'Meta nuclear power partnership',
    'Google nuclear energy deal',
    'Microsoft power purchase agreement',
    'Amazon data center nuclear',
    'tech giant energy partnership',
    'Big Tech nuclear deal announced',
    'AI company energy partnership',
  ],
  policy: [
    'DOE loan guarantee awarded',
    'CHIPS Act funding announced',
    'Trump administration energy investment',
    'federal funding clean energy',
    'NRC license approved',
    'state incentive energy company',
  ],
  // Mega-deal & press-release catch-all queries
  'mega-deals': [
    'billion dollar factory construction United States',
    'billion dollar manufacturing plant announcement',
    'billion dollar data center investment',
    'megaproject breaks ground construction',
    'largest investment in US history',
    'Project Matador nuclear AI campus',
    'Project Horizon data center construction',
    'Project Ruby data center campus',
    'Project Stargate AI infrastructure',
    'gigawatt data center campus construction',
    '$50 billion US investment',
    '$100 billion megafab semiconductor',
    'AstraZeneca US manufacturing investment',
    'Eli Lilly manufacturing plant construction',
    'Novo Nordisk US expansion',
    'Johnson Johnson cell therapy facility',
    'pharmaceutical factory construction US 2026',
    'defense manufacturing expansion missile production',
    'aluminum smelter construction US',
    'Vantage Data Centers Frontier campus',
    'CoreWeave data center campus',
  ],
}

/**
 * Get all event-based discovery queries
 */
function getEventDiscoveryQueries(): string[] {
  const queries: string[] = []
  for (const sectorQueries of Object.values(EVENT_DISCOVERY_QUERIES)) {
    queries.push(...sectorQueries)
  }
  return queries
}

// ============================================================================
// COMPANY NAME EXTRACTION
// Extract potential company names from news text
// ============================================================================

// Common company suffixes
const COMPANY_SUFFIXES = [
  'Inc', 'Inc.', 'Corp', 'Corp.', 'Corporation', 'LLC', 'Ltd', 'Ltd.',
  'Energy', 'Power', 'Systems', 'Technologies', 'Tech', 'Nuclear', 'Fusion',
  'Industries', 'Group', 'Holdings', 'Partners', 'Ventures', 'Labs', 'Co', 'Co.'
]

// Action words that often precede company names in news
const ACTION_WORDS = [
  'announces', 'announced', 'reveals', 'revealed', 'unveils', 'unveiled',
  'raises', 'raised', 'secures', 'secured', 'receives', 'received',
  'signs', 'signed', 'partners', 'partnered', 'acquires', 'acquired',
  'invests', 'invested', 'commits', 'committed', 'launches', 'launched',
  'breaks ground', 'broke ground', 'begins', 'began', 'starts', 'started',
  'expands', 'expanded', 'opens', 'opened', 'builds', 'building'
]

/**
 * Extract potential company names from text
 * Uses multiple strategies to find company names
 */
export function extractCompanyNames(text: string): string[] {
  const companies = new Set<string>()
  const originalText = text // Keep original case for extraction
  
  // Strategy 1: Find capitalized word sequences (2-4 words)
  const capitalizedPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})\b/g
  let match
  while ((match = capitalizedPattern.exec(originalText)) !== null) {
    const candidate = match[1]
    // Check if it looks like a company name
    if (COMPANY_SUFFIXES.some(suffix => candidate.endsWith(suffix)) ||
        candidate.length > 3) {
      companies.add(candidate)
    }
  }
  
  // Strategy 2: Look for patterns like "Company X announces/raises/etc"
  for (const action of ACTION_WORDS) {
    // Pattern: Company Name + action word
    const beforePattern = new RegExp(`([A-Z][A-Za-z]+(?:\\s+[A-Z][A-Za-z]+){0,3})\\s+${action}`, 'g')
    while ((match = beforePattern.exec(originalText)) !== null) {
      const candidate = match[1].trim()
      if (candidate.length > 2 && !isCommonWord(candidate)) {
        companies.add(candidate)
      }
    }
  }
  
  // Strategy 3: Look for company suffixes
  for (const suffix of COMPANY_SUFFIXES) {
    const suffixPattern = new RegExp(`([A-Z][A-Za-z]+(?:\\s+[A-Z][A-Za-z]+){0,2})\\s+${suffix}\\b`, 'g')
    while ((match = suffixPattern.exec(originalText)) !== null) {
      const candidate = `${match[1]} ${suffix}`.trim()
      companies.add(candidate)
    }
  }
  
  // Strategy 4: Known patterns for specific formats
  // e.g., "XYZ Corp" or "ABC Inc"
  const corpPattern = /\b([A-Z][A-Za-z]*(?:\s+[A-Z][A-Za-z]*)?)\s+(Corp|Inc|LLC|Ltd|Energy|Power|Nuclear|Fusion)\b/g
  while ((match = corpPattern.exec(originalText)) !== null) {
    companies.add(`${match[1]} ${match[2]}`)
  }
  
  // Filter out common false positives
  const filtered = Array.from(companies).filter(name => {
    const lower = name.toLowerCase()
    return !isCommonWord(name) && 
           name.length > 2 &&
           !lower.startsWith('the ') &&
           !lower.startsWith('a ') &&
           name.split(' ').length <= 4
  })
  
  return filtered
}

/**
 * Check if a word is a common word (not a company name)
 */
function isCommonWord(word: string): boolean {
  const commonWords = new Set([
    'The', 'This', 'That', 'These', 'Those', 'Some', 'Many', 'Several',
    'New', 'First', 'Last', 'Next', 'Other', 'Another', 'Each', 'Every',
    'United', 'States', 'America', 'American', 'National', 'Federal',
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 
    'August', 'September', 'October', 'November', 'December',
    'Wall Street', 'White House', 'New York', 'Los Angeles', 'San Francisco',
    'According', 'Reuters', 'Bloomberg', 'Associated Press', 'AP News',
    'Source', 'Report', 'News', 'Update', 'Breaking'
  ])
  return commonWords.has(word) || commonWords.has(word.split(' ')[0])
}

// ============================================================================
// KNOWN COMPANIES DATABASE
// ============================================================================

/**
 * Extract all unique company names from the opportunities database
 */
function getTrackedCompanies(): string[] {
  const companies = new Set<string>()
  for (const opp of opportunities) {
    if (opp.company) {
      companies.add(opp.company)
    }
  }
  return Array.from(companies)
}

/**
 * Get tracked companies as lowercase set for fast lookup
 */
function getTrackedCompaniesLower(): Set<string> {
  const companies = new Set<string>()
  for (const opp of opportunities) {
    if (opp.company) {
      companies.add(opp.company.toLowerCase())
    }
  }
  return companies
}

// Build company-to-sector map from opportunities database
function buildCompanySectorMap(): Map<string, string> {
  const map = new Map<string, string>()
  for (const opp of opportunities) {
    if (opp.company && opp.sector) {
      map.set(opp.company.toLowerCase(), opp.sector)
    }
  }
  return map
}

const COMPANY_SECTOR_MAP = buildCompanySectorMap()

// ============================================================================
// SECTOR DETECTION
// ============================================================================

const SECTOR_KEYWORDS: Record<string, string[]> = {
  'semiconductor': [
    'semiconductor', 'chip', 'fab', 'foundry', 'wafer', 'chipmaker',
    'TSMC', 'Intel', 'Samsung', 'Micron', 'GlobalFoundries', 'Texas Instruments',
    'Nvidia', 'AMD', 'Qualcomm', 'Broadcom', 'SK Hynix'
  ],
  'data-center': [
    'data center', 'hyperscale', 'cloud', 'colocation', 'server farm',
    'AWS', 'Azure', 'Google Cloud', 'Meta', 'Oracle', 'Equinix', 'Digital Realty',
    'Vantage Data Centers', 'CoreWeave', 'Atlas Development', 'Project Horizon',
    'Project Ruby', 'Frontier campus', 'liquid cooling', 'GPU cloud'
  ],
  'ev-battery': [
    'battery', 'EV', 'electric vehicle', 'gigafactory', 'lithium-ion', 'cell production',
    'Tesla', 'Panasonic', 'LG Energy', 'CATL', 'SK On', 'Samsung SDI', 'Rivian', 'Lucid'
  ],
  'nuclear': [
    'nuclear', 'reactor', 'SMR', 'uranium', 'atomic', 'fission', 'nuclear power',
    'Oklo', 'NuScale', 'TerraPower', 'X-energy', 'Kairos Power', 'Terrestrial Energy',
    'Lightbridge', 'BWXT', 'Westinghouse', 'GE Hitachi', 'Holtec'
  ],
  'fusion': [
    'fusion', 'fusion energy', 'fusion reactor', 'plasma', 'tokamak', 'stellarator',
    'Helion', 'Commonwealth Fusion', 'TAE Technologies', 'General Fusion', 'Zap Energy',
    'Type One Energy', 'Tokamak Energy', 'First Light Fusion', 'Marvel Fusion'
  ],
  'clean-energy': [
    'solar', 'wind', 'renewable', 'hydrogen', 'grid', 'transmission', 'geothermal',
    'offshore wind', 'green hydrogen', 'clean energy'
  ],
  'critical-minerals': [
    'rare earth', 'lithium', 'cobalt', 'nickel', 'gallium', 'germanium', 'mining', 'refining',
    'graphite', 'manganese', 'vanadium', 'critical mineral'
  ],
  'metals': [
    'aluminum smelter', 'steel mill', 'Century Aluminum', 'Nucor', 'US Steel',
    'steel production', 'aluminum production', 'metals manufacturing', 'smelter construction'
  ],
  'defense': [
    'defense', 'aerospace', 'military', 'DoD', 'shipyard', 'munitions', 'depot',
    'GE Aerospace', 'Lockheed Martin', 'Northrop Grumman', 'RTX', 'Raytheon',
    'L3Harris', 'BAE Systems', 'General Dynamics', 'Huntington Ingalls',
    'AUKUS', 'CMMC', 'F-35', 'submarine', 'Navy', 'defense industrial base'
  ],
  'life-sciences': [
    'pharmaceutical', 'pharma', 'biomanufacturing', 'biotech', 'GxP', 'cGMP',
    'Pfizer', 'Moderna', 'Eli Lilly', 'Novo Nordisk', 'Merck', 'AbbVie',
    'Johnson & Johnson', 'Amgen', 'Roche', 'AstraZeneca', 'Sanofi', 'GSK',
    'FDA', 'cleanroom', 'cell therapy', 'gene therapy', 'biologics',
    'GLP-1', 'Wegovy', 'Ozempic', 'weight loss drug', 'injectable medicine',
    'fill finish', 'drug substance manufacturing', 'oncology manufacturing'
  ],
}

// Patterns to extract investment amounts
const INVESTMENT_PATTERNS = [
  /\$(\d+(?:\.\d+)?)\s*(billion|B\b)/i,
  /\$(\d+(?:\.\d+)?)\s*(million|M\b)/i,
  /(\d+(?:\.\d+)?)\s*billion\s*dollar/i,
  /(\d+(?:\.\d+)?)\s*million\s*dollar/i,
]

// Location patterns
const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming'
]

/**
 * Extract structured data from news text
 */
function extractData(title: string, description: string): NewsItem['extractedData'] {
  const text = `${title} ${description}`.toLowerCase()
  const result: NewsItem['extractedData'] = {}
  
  // Try to match company from our database first
  for (const [companyLower, sector] of COMPANY_SECTOR_MAP.entries()) {
    if (text.includes(companyLower)) {
      result.company = companyLower
      result.sector = sector
      break
    }
  }
  
  // Extract investment amount
  for (const pattern of INVESTMENT_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      const amount = parseFloat(match[1])
      const unit = match[2].toLowerCase()
      if (unit.startsWith('b')) {
        result.investmentAmount = `$${amount}B`
      } else {
        result.investmentAmount = `$${amount}M`
      }
      break
    }
  }
  
  // Extract location (US state)
  for (const state of US_STATES) {
    if (text.includes(state.toLowerCase())) {
      result.location = state
      break
    }
  }
  
  // Extract sector if not already set from company match
  if (!result.sector) {
    for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
      if (keywords.some(kw => text.includes(kw.toLowerCase()))) {
        result.sector = sector
        break
      }
    }
  }
  
  return result
}

/**
 * Check if ANY extracted company is new (not in our database)
 */
function checkForNewDiscovery(extractedNames: string[], trackedLower: Set<string>): boolean {
  for (const name of extractedNames) {
    if (!trackedLower.has(name.toLowerCase())) {
      return true // Found a company we don't track!
    }
  }
  return false
}

/**
 * Calculate relevance score for a news item
 */
function calculateRelevance(title: string, description: string, isNewDiscovery: boolean): number {
  const text = `${title} ${description}`.toLowerCase()
  let score = 0
  
  // NEW DISCOVERY BOOST - This is what we're looking for!
  if (isNewDiscovery) {
    score += 40
  }
  
  // Check for investment amounts (strong signal)
  if (INVESTMENT_PATTERNS.some(p => p.test(text))) {
    score += 30
  }
  
  // Boost if mentions a tracked company
  const trackedLower = getTrackedCompaniesLower()
  for (const company of trackedLower) {
    if (text.includes(company)) {
      score += 25
      break
    }
  }
  
  // Check for sector keywords
  for (const keywords of Object.values(SECTOR_KEYWORDS)) {
    const matches = keywords.filter(kw => text.includes(kw.toLowerCase()))
    score += matches.length * 8
  }
  
  // Check for US location
  if (US_STATES.some(s => text.includes(s.toLowerCase()))) {
    score += 15
  }
  
  // Partnership & deal announcements (HIGHEST value)
  const partnershipTerms = ['partnership', 'deal', 'agreement', 'signs', 'announces', 'invests', 'acquires', 'backs', 'commits']
  if (partnershipTerms.some(t => text.includes(t))) {
    score += 25
  }
  
  // Fusion keyword (breakthrough tech - always relevant)
  if (text.includes('fusion')) {
    score += 30
  }
  
  // Big Tech + Energy (MASSIVE signal - Meta+Oklo type news)
  const bigTech = ['meta', 'facebook', 'google', 'microsoft', 'amazon', 'apple', 'openai', 'anthropic']
  const energyTerms = ['nuclear', 'energy', 'power', 'fusion', 'reactor', 'data center']
  if (bigTech.some(t => text.includes(t)) && energyTerms.some(e => text.includes(e))) {
    score += 50
  }
  
  // Trump/policy related investments
  if ((text.includes('trump') || text.includes('administration') || text.includes('white house')) && 
      (text.includes('invest') || text.includes('fund') || text.includes('energy') || text.includes('deal'))) {
    score += 30
  }
  
  // Breaking news signals
  const breakingTerms = ['breaking', 'just announced', 'announces', 'unveils', 'reveals', 'confirms']
  if (breakingTerms.some(t => text.includes(t))) {
    score += 20
  }
  
  // High-value terms
  const highValueTerms = ['billion', 'gigafactory', 'megafab', 'construction', 'groundbreaking', 'first-ever', 'historic']
  if (highValueTerms.some(t => text.includes(t))) {
    score += 20
  }
  
  return score
}

/**
 * Fetch news from Google News RSS (no API key needed)
 */
async function fetchGoogleNewsRSS(query: string): Promise<NewsItem[]> {
  const encodedQuery = encodeURIComponent(query)
  const rssUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=en-US&gl=US&ceid=US:en`
  
  const trackedLower = getTrackedCompaniesLower()
  
  try {
    const response = await fetch(rssUrl, {
      next: { revalidate: 900 }, // Cache for 15 minutes
    })
    
    if (!response.ok) {
      console.error('Google News RSS error:', response.status)
      return []
    }
    
    const xml = await response.text()
    
    const items: NewsItem[] = []
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let match
    
    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1]
      
      const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/)
      const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/)
      const descMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/)
      const dateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/)
      const sourceMatch = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/)
      
      if (titleMatch && linkMatch) {
        const title = titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim()
        const description = descMatch ? descMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]*>/g, '').trim() : ''
        
        // Extract company names from the news
        const fullText = `${title} ${description}`
        const extractedCompanyNames = extractCompanyNames(fullText)
        
        // Check if this is a NEW discovery
        const isNewDiscovery = extractedCompanyNames.length > 0 && 
                               checkForNewDiscovery(extractedCompanyNames, trackedLower)
        
        const relevanceScore = calculateRelevance(title, description, isNewDiscovery)
        
        // Lower threshold to catch more discoveries
        if (relevanceScore >= 15) {
          items.push({
            id: `news-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title,
            description,
            url: linkMatch[1].trim(),
            source: sourceMatch ? sourceMatch[1].trim() : 'Google News',
            publishedAt: dateMatch ? new Date(dateMatch[1].trim()).toISOString() : new Date().toISOString(),
            relevanceScore,
            extractedData: extractData(title, description),
            extractedCompanyNames,
            isNewDiscovery,
            discoverySource: query,
          })
        }
      }
    }
    
    return items
  } catch (error) {
    console.error('Failed to fetch Google News RSS:', error)
    return []
  }
}

/**
 * Generate queries that prioritize EVENT discovery over company tracking
 */
function generateSmartDiscoveryQueries(): string[] {
  const queries: string[] = []
  
  // 1. EVENT-BASED DISCOVERY QUERIES (primary - find unknown companies)
  queries.push(...getEventDiscoveryQueries())
  
  // 2. Priority company searches (secondary - track important known companies)
  const priorityCompanies = [
    // Nuclear / fusion
    'Oklo', 'Helion', 'Commonwealth Fusion', 'NuScale', 'TerraPower', 'Kairos Power', 'X-energy',
    // Semiconductors
    'TSMC', 'Intel', 'Micron', 'Samsung', 'GlobalFoundries',
    // Big Tech (data centers + AI infrastructure)
    'Microsoft', 'Google', 'Amazon', 'Meta', 'Oracle', 'CoreWeave', 'Vantage Data Centers',
    // Pharma / biotech
    'AstraZeneca', 'Eli Lilly', 'Novo Nordisk', 'Johnson & Johnson', 'Moderna', 'Pfizer',
    // Defense
    'RTX', 'Raytheon', 'L3Harris', 'Northrop Grumman', 'Lockheed Martin', 'General Dynamics',
    // EV / battery
    'Tesla', 'Ford', 'Toyota', 'Rivian', 'LG Energy Solution',
    // Critical materials
    'MP Materials', 'Albemarle', 'Century Aluminum', 'Redwood Materials',
  ]
  for (const company of priorityCompanies) {
    queries.push(`${company} announcement news`)
  }
  
  // 3. Time-rotated company sampling (cover all tracked companies over time)
  const trackedCompanies = getTrackedCompanies()
  const hour = new Date().getHours()
  const chunkSize = Math.ceil(trackedCompanies.length / 24)
  const startIdx = (hour * chunkSize) % trackedCompanies.length
  const sampledCompanies = trackedCompanies.slice(startIdx, startIdx + 10)
  
  for (const company of sampledCompanies) {
    queries.push(`${company} news`)
  }
  
  return queries
}

// ============================================================================
// PRESS RELEASE RSS FEEDS (secondary sources — catches pharma, defense, mega-deals)
// ============================================================================
const PRESS_RELEASE_FEEDS = [
  // PR Newswire — manufacturing, energy, pharma
  'https://www.prnewswire.com/rss/news-releases-list.rss',
  // GlobeNewsWire — corporate announcements
  'https://www.globenewswire.com/RssFeed/subjectcode/25-Manufacturing/feedTitle/GlobeNewswire%20-%20Manufacturing',
  // Business Wire — investment & deal announcements
  'https://feed.businesswire.com/rss/home/?rss=G1QFDERJXkJeGVpSWg==',
]

async function fetchPressReleaseFeeds(): Promise<NewsItem[]> {
  const trackedLower = getTrackedCompaniesLower()
  const allItems: NewsItem[] = []

  const results = await Promise.allSettled(
    PRESS_RELEASE_FEEDS.map(async (feedUrl) => {
      try {
        const res = await fetch(feedUrl, { next: { revalidate: 1800 } })
        if (!res.ok) return []
        const xml = await res.text()

        const items: NewsItem[] = []
        const itemRegex = /<item>([\s\S]*?)<\/item>/g
        let match
        while ((match = itemRegex.exec(xml)) !== null) {
          const itemXml = match[1]
          const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/)
          const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/)
          const descMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/)
          const dateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/)

          if (!titleMatch || !linkMatch) continue
          const title = titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim()
          const description = descMatch ? descMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]*>/g, '').trim() : ''
          const fullText = `${title} ${description}`

          const extractedCompanyNames = extractCompanyNames(fullText)
          const isNewDiscovery = extractedCompanyNames.length > 0 && checkForNewDiscovery(extractedCompanyNames, trackedLower)
          const relevanceScore = calculateRelevance(title, description, isNewDiscovery)

          if (relevanceScore >= 15) {
            items.push({
              id: `pr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              title,
              description,
              url: linkMatch[1].trim(),
              source: feedUrl.includes('prnewswire') ? 'PR Newswire' : feedUrl.includes('globenewswire') ? 'GlobeNewsWire' : 'Business Wire',
              publishedAt: dateMatch ? new Date(dateMatch[1].trim()).toISOString() : new Date().toISOString(),
              relevanceScore,
              extractedData: extractData(title, description),
              extractedCompanyNames,
              isNewDiscovery,
              discoverySource: 'press-release-feed',
            })
          }
        }
        return items
      } catch {
        return []
      }
    }),
  )

  for (const result of results) {
    if (result.status === 'fulfilled') allItems.push(...result.value)
  }
  return allItems
}

/**
 * Fetch news using SMART DISCOVERY
 * Prioritizes EVENT-based queries to find unknown companies
 * Also pulls from press release feeds for pharma/defense/mega-deal coverage
 */
export async function fetchRelevantNews(customQueries?: string[]): Promise<NewsItem[]> {
  const allItems: NewsItem[] = []
  const seenUrls = new Set<string>()
  
  // Generate smart discovery queries or use custom ones
  const queries = customQueries || generateSmartDiscoveryQueries()
  
  // Limit concurrent requests but cover more ground
  const queryBatches: string[][] = []
  const batchSize = 10
  for (let i = 0; i < queries.length; i += batchSize) {
    queryBatches.push(queries.slice(i, i + batchSize))
  }
  
  // Process first 8 batches (80 queries) for broader coverage
  const activeBatches = queryBatches.slice(0, 8)

  // Run Google News + press release feeds in parallel
  const [pressReleaseItems, ...batchResults] = await Promise.all([
    fetchPressReleaseFeeds(),
    ...activeBatches.map((batch) =>
      Promise.all(batch.map((q) => fetchGoogleNewsRSS(q))),
    ),
  ])

  // Merge press release items
  for (const item of pressReleaseItems) {
    if (!seenUrls.has(item.url)) {
      seenUrls.add(item.url)
      allItems.push(item)
    }
  }

  // Merge Google News batches
  for (const batchResult of batchResults) {
    for (const items of batchResult) {
      for (const item of items) {
        if (!seenUrls.has(item.url)) {
          seenUrls.add(item.url)
          allItems.push(item)
        }
      }
    }
  }
  
  // Sort by relevance score (highest first) - NEW DISCOVERIES will rank higher
  return allItems.sort((a, b) => b.relevanceScore - a.relevanceScore)
}

/**
 * Get statistics about what's being tracked
 */
export function getTrackingStats() {
  const companies = getTrackedCompanies()
  const queries = generateSmartDiscoveryQueries()
  const eventQueries = getEventDiscoveryQueries()
  
  return {
    trackedCompanies: companies.length,
    activeQueries: queries.length,
    eventDiscoveryQueries: eventQueries.length,
    companySample: companies.slice(0, 10),
    querySample: queries.slice(0, 10),
  }
}

/**
 * Export tracked companies for other services
 */
export { getTrackedCompanies, getTrackedCompaniesLower }

/**
 * Convert news item to opportunity signal format
 */
export function newsToSignal(news: NewsItem): {
  id: string
  type: 'opportunity'
  title: string
  summary: string
  source: string
  url: string
  discoveredAt: string
  confidence: number
  extractedData: NewsItem['extractedData']
  extractedCompanyNames: string[]
  isNewDiscovery: boolean
  discoverySource?: string
} {
  return {
    id: news.id,
    type: 'opportunity',
    title: news.title,
    summary: news.description.slice(0, 200) + (news.description.length > 200 ? '...' : ''),
    source: news.source,
    url: news.url,
    discoveredAt: news.publishedAt,
    confidence: Math.min(100, news.relevanceScore),
    extractedData: news.extractedData,
    extractedCompanyNames: news.extractedCompanyNames,
    isNewDiscovery: news.isNewDiscovery,
    discoverySource: news.discoverySource,
  }
}
