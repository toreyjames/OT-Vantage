/**
 * Federal Register API Integration
 * Fetches real executive orders, rules, and notices from federalregister.gov
 * API docs: https://www.federalregister.gov/developers/documentation/api/v1
 */

export interface FederalRegisterDocument {
  document_number: string
  title: string
  type: 'RULE' | 'PRORULE' | 'NOTICE' | 'PRESDOCU' | 'CORRECT'
  abstract: string | null
  publication_date: string
  signing_date: string | null
  president: string | null
  executive_order_number: string | null
  agencies: Array<{ name: string; id: number }>
  topics: string[]
  html_url: string
  pdf_url: string
  raw_text_url: string
}

export interface FederalRegisterResponse {
  count: number
  results: FederalRegisterDocument[]
  next_page_url: string | null
}

// Keywords that indicate AI Manhattan-relevant policy
const RELEVANT_KEYWORDS = [
  // AI & Technology
  'artificial intelligence', 'AI', 'machine learning', 'semiconductor', 'chips',
  'data center', 'computing', 'quantum', 'advanced manufacturing',
  
  // Energy & Power
  'nuclear', 'energy', 'grid', 'transmission', 'power', 'electricity',
  'hydrogen', 'clean energy', 'renewable',
  
  // Critical Minerals
  'critical mineral', 'rare earth', 'lithium', 'battery', 'supply chain',
  'gallium', 'germanium', 'cobalt',
  
  // Infrastructure
  'infrastructure', 'manufacturing', 'industrial', 'domestic production',
  
  // Policy
  'national security', 'defense production', 'CHIPS', 'IRA', 'IIJA',
  'executive order', 'emergency', 'strategic',
]

// Agencies that are most relevant
const RELEVANT_AGENCIES = [
  'Department of Energy',
  'Department of Commerce',
  'Department of Defense',
  'Environmental Protection Agency',
  'Nuclear Regulatory Commission',
  'Federal Energy Regulatory Commission',
  'Executive Office of the President',
  'Office of Science and Technology Policy',
]

/**
 * Check if a document is relevant to AI Manhattan thesis
 */
export function isRelevantDocument(doc: FederalRegisterDocument): { relevant: boolean; score: number; matchedKeywords: string[] } {
  const searchText = `${doc.title} ${doc.abstract || ''}`.toLowerCase()
  const matchedKeywords: string[] = []
  
  // Check keywords
  for (const keyword of RELEVANT_KEYWORDS) {
    if (searchText.includes(keyword.toLowerCase())) {
      matchedKeywords.push(keyword)
    }
  }
  
  // Check agencies
  const relevantAgency = doc.agencies.some(a => 
    RELEVANT_AGENCIES.some(ra => a.name.includes(ra))
  )
  
  // Presidential documents (EOs) get bonus
  const isPresidential = doc.type === 'PRESDOCU'
  
  // Calculate score
  let score = matchedKeywords.length * 10
  if (relevantAgency) score += 20
  if (isPresidential) score += 30
  if (doc.executive_order_number) score += 40
  
  return {
    relevant: score >= 20 || matchedKeywords.length >= 2,
    score,
    matchedKeywords,
  }
}

/**
 * Fetch recent documents from Federal Register
 */
export async function fetchFederalRegisterDocs(options: {
  daysBack?: number
  types?: string[]
  perPage?: number
} = {}): Promise<FederalRegisterDocument[]> {
  const { daysBack = 30, types = ['RULE', 'PRORULE', 'NOTICE', 'PRESDOCU'], perPage = 100 } = options
  
  // Calculate date range
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - daysBack)
  
  const formatDate = (d: Date) => d.toISOString().split('T')[0]
  
  const params = new URLSearchParams({
    'conditions[publication_date][gte]': formatDate(startDate),
    'conditions[publication_date][lte]': formatDate(endDate),
    'conditions[type][]': types.join(','),
    'per_page': perPage.toString(),
    'order': 'newest',
    'fields[]': [
      'document_number',
      'title', 
      'type',
      'abstract',
      'publication_date',
      'signing_date',
      'president',
      'executive_order_number',
      'agencies',
      'topics',
      'html_url',
      'pdf_url',
      'raw_text_url',
    ].join(','),
  })
  
  try {
    const response = await fetch(
      `https://www.federalregister.gov/api/v1/documents.json?${params}`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    )
    
    if (!response.ok) {
      console.error('Federal Register API error:', response.status, response.statusText)
      return []
    }
    
    const data: FederalRegisterResponse = await response.json()
    return data.results
  } catch (error) {
    console.error('Failed to fetch Federal Register:', error)
    return []
  }
}

/**
 * Fetch and filter relevant policy updates
 */
export async function fetchRelevantPolicyUpdates(daysBack = 14): Promise<Array<{
  id: string
  title: string
  type: string
  date: string
  source: string
  url: string
  relevanceScore: number
  matchedKeywords: string[]
  isExecutiveOrder: boolean
  agencies: string[]
}>> {
  const docs = await fetchFederalRegisterDocs({ daysBack })
  
  const relevant = docs
    .map(doc => {
      const { relevant, score, matchedKeywords } = isRelevantDocument(doc)
      return { doc, relevant, score, matchedKeywords }
    })
    .filter(({ relevant }) => relevant)
    .sort((a, b) => b.score - a.score)
    .map(({ doc, score, matchedKeywords }) => ({
      id: doc.document_number,
      title: doc.title,
      type: doc.type === 'PRESDOCU' ? 'Executive Order' : 
            doc.type === 'RULE' ? 'Final Rule' :
            doc.type === 'PRORULE' ? 'Proposed Rule' : 'Notice',
      date: doc.publication_date,
      source: 'Federal Register',
      url: doc.html_url,
      relevanceScore: score,
      matchedKeywords,
      isExecutiveOrder: !!doc.executive_order_number,
      agencies: doc.agencies.map(a => a.name),
    }))
  
  return relevant
}


