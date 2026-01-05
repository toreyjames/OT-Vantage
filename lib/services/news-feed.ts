/**
 * News Feed Integration
 * Fetches investment/infrastructure news from various sources
 */

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
}

// Search queries for relevant news
const SEARCH_QUERIES = [
  'semiconductor factory investment US',
  'data center construction announcement',
  'battery plant investment America',
  'nuclear power plant restart',
  'rare earth mining US',
  'EV battery gigafactory',
  'AI infrastructure investment',
  'CHIPS Act funding',
  'DOE loan guarantee',
  'critical minerals processing',
]

// Patterns to extract investment amounts
const INVESTMENT_PATTERNS = [
  /\$(\d+(?:\.\d+)?)\s*(billion|B\b)/i,
  /\$(\d+(?:\.\d+)?)\s*(million|M\b)/i,
  /(\d+(?:\.\d+)?)\s*billion\s*dollar/i,
  /(\d+(?:\.\d+)?)\s*million\s*dollar/i,
]

// Company name patterns (common in announcements)
const COMPANY_INDICATORS = [
  'announced', 'plans to', 'will invest', 'committed', 'building', 
  'constructing', 'expanding', 'investing'
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

// Sector keywords
const SECTOR_KEYWORDS: Record<string, string[]> = {
  'semiconductor': ['semiconductor', 'chip', 'fab', 'foundry', 'wafer', 'TSMC', 'Intel', 'Samsung', 'Micron', 'GlobalFoundries'],
  'data-center': ['data center', 'hyperscale', 'cloud', 'AWS', 'Azure', 'Google Cloud', 'Meta', 'Oracle'],
  'ev-battery': ['battery', 'EV', 'electric vehicle', 'gigafactory', 'lithium-ion', 'cell production'],
  'nuclear': ['nuclear', 'reactor', 'SMR', 'uranium', 'atomic'],
  'clean-energy': ['solar', 'wind', 'renewable', 'hydrogen', 'grid', 'transmission'],
  'critical-minerals': ['rare earth', 'lithium', 'cobalt', 'nickel', 'gallium', 'germanium', 'mining', 'refining'],
}

/**
 * Extract structured data from news text
 */
function extractData(title: string, description: string): NewsItem['extractedData'] {
  const text = `${title} ${description}`.toLowerCase()
  const result: NewsItem['extractedData'] = {}
  
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
  
  // Extract sector
  for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw.toLowerCase()))) {
      result.sector = sector
      break
    }
  }
  
  return result
}

/**
 * Calculate relevance score for a news item
 */
function calculateRelevance(title: string, description: string): number {
  const text = `${title} ${description}`.toLowerCase()
  let score = 0
  
  // Check for investment amounts (strong signal)
  if (INVESTMENT_PATTERNS.some(p => p.test(text))) {
    score += 30
  }
  
  // Check for sector keywords
  for (const keywords of Object.values(SECTOR_KEYWORDS)) {
    const matches = keywords.filter(kw => text.includes(kw.toLowerCase()))
    score += matches.length * 10
  }
  
  // Check for US location
  if (US_STATES.some(s => text.includes(s.toLowerCase()))) {
    score += 20
  }
  
  // Check for action words
  if (COMPANY_INDICATORS.some(w => text.includes(w))) {
    score += 15
  }
  
  // Bonus for specific high-value terms
  const highValueTerms = ['billion', 'gigafactory', 'megafab', 'construction', 'groundbreaking']
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
  
  try {
    const response = await fetch(rssUrl, {
      next: { revalidate: 1800 }, // Cache for 30 minutes
    })
    
    if (!response.ok) {
      console.error('Google News RSS error:', response.status)
      return []
    }
    
    const xml = await response.text()
    
    // Simple XML parsing for RSS
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
        const relevanceScore = calculateRelevance(title, description)
        
        // Only include if relevance score is high enough
        if (relevanceScore >= 30) {
          items.push({
            id: `news-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title,
            description,
            url: linkMatch[1].trim(),
            source: sourceMatch ? sourceMatch[1].trim() : 'Google News',
            publishedAt: dateMatch ? new Date(dateMatch[1].trim()).toISOString() : new Date().toISOString(),
            relevanceScore,
            extractedData: extractData(title, description),
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
 * Fetch news from multiple queries and deduplicate
 */
export async function fetchRelevantNews(queries: string[] = SEARCH_QUERIES.slice(0, 5)): Promise<NewsItem[]> {
  const allItems: NewsItem[] = []
  const seenUrls = new Set<string>()
  
  // Fetch from multiple queries in parallel
  const results = await Promise.all(
    queries.map(q => fetchGoogleNewsRSS(q))
  )
  
  for (const items of results) {
    for (const item of items) {
      // Deduplicate by URL
      if (!seenUrls.has(item.url)) {
        seenUrls.add(item.url)
        allItems.push(item)
      }
    }
  }
  
  // Sort by relevance score
  return allItems.sort((a, b) => b.relevanceScore - a.relevanceScore)
}

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
  }
}

