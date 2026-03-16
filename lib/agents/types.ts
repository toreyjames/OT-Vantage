/**
 * Strategic Subagent System - Type Definitions
 * 
 * Multi-layered autonomous agent system that hunts for:
 * - White space opportunities (where competitors aren't playing)
 * - Investment flows and capital movements
 * - Actionable recommendations
 */

// ============================================================================
// AGENT TYPES
// ============================================================================

export type AgentType = 'strategic' | 'sector' | 'capability'

export type StrategicAgentId = 
  | 'white-space-hunter'
  | 'investment-tracker'
  | 'action-recommender'

export type SectorAgentId =
  | 'nuclear-agent'
  | 'semiconductor-agent'
  | 'data-center-agent'
  | 'energy-agent'
  | 'critical-minerals-agent'
  | 'defense-agent'
  | 'life-sciences-agent'

export type CapabilityAgentId =
  | 'ot-canonization-agent'
  | 'commissioning-agent'
  | 'industrial-ai-agent'
  | 'epc-governance-agent'
  | 'build-intelligence-agent'

export type AgentId = StrategicAgentId | SectorAgentId | CapabilityAgentId

// ============================================================================
// INSIGHT TYPES
// ============================================================================

export type InsightType = 
  | 'white-space'      // Uncontested opportunity area
  | 'investment'       // Capital flow / funding signal
  | 'action'           // Recommended action item
  | 'signal'           // Market signal / early indicator
  | 'competitive'      // Competitor movement
  | 'policy'           // Policy-driven opportunity
  | 'capability-gap'   // Gap in our capabilities

export type InsightPriority = 'critical' | 'high' | 'medium' | 'low'

export interface InsightSource {
  url: string
  title: string
  publishedAt?: string
  source?: string // e.g., 'Reuters', 'Federal Register', 'SEC'
}

export interface SuggestedAction {
  action: string
  rationale: string
  urgency: 'immediate' | 'short-term' | 'medium-term' | 'long-term'
  owner?: string // Suggested owner (e.g., 'BD Team', 'OT Practice')
}

export interface AgentInsight {
  id: string
  agentId: AgentId
  agentType: AgentType
  insightType: InsightType
  
  // Core content
  title: string
  summary: string
  details?: string
  
  // Scoring
  confidence: number // 0-1
  priority: InsightPriority
  impactScore: number // 1-10
  
  // Relationships
  relevantOpportunities: string[] // IDs of related opportunities
  relevantSectors: string[]
  relevantPolicies: string[]
  relevantCapabilities: string[] // Which of our capabilities this relates to
  
  // Actions
  suggestedActions: SuggestedAction[]
  
  // Provenance
  sources: InsightSource[]
  discoveredAt: Date
  expiresAt?: Date // Some insights have a shelf life
  
  // State
  status: 'new' | 'reviewed' | 'actioned' | 'dismissed' | 'expired'
  reviewedAt?: Date
  reviewedBy?: string
  notes?: string
  
  // White space specific
  whiteSpaceData?: WhiteSpaceData
  
  // Investment specific
  investmentData?: InvestmentData
}

// ============================================================================
// WHITE SPACE ANALYSIS
// ============================================================================

export interface WhiteSpaceData {
  // Where competitors aren't playing
  competitorPresence: 'none' | 'minimal' | 'moderate' | 'heavy'
  competitorsList: string[]
  
  // Market characteristics
  marketMaturity: 'emerging' | 'growing' | 'mature' | 'declining'
  estimatedMarketSize?: number // in millions
  growthRate?: number // percentage
  
  // Entry assessment
  entryBarriers: 'low' | 'medium' | 'high'
  requiredCapabilities: string[]
  
  // Geography
  geographicFocus?: string[] // States or regions
  
  // Timing
  windowOfOpportunity: 'closing-fast' | 'open' | 'wide-open'
}

// ============================================================================
// INVESTMENT TRACKING
// ============================================================================

export interface InvestmentData {
  investmentType: 
    | 'funding-round'
    | 'government-grant'
    | 'chips-act'
    | 'ira-credit'
    | 'doe-loan'
    | 'corporate-investment'
    | 'acquisition'
    | 'ipo'
    | 'expansion'
  
  amount?: number // in millions
  investor?: string
  recipient?: string
  
  // For tracking flows
  sourceOfCapital?: string // e.g., 'DOE', 'Private Equity', 'Strategic'
  destination?: string // Company or project
  
  // Relevance
  serviceOpportunity: string[] // What services might be needed
  estimatedServiceValue?: number // Potential Deloitte revenue
}

// ============================================================================
// AGENT CONFIGURATION
// ============================================================================

export interface AgentConfig {
  id: AgentId
  name: string
  type: AgentType
  description: string
  
  // Execution settings
  enabled: boolean
  runIntervalMinutes: number
  lastRun?: Date
  nextRun?: Date
  
  // Focus areas
  keywords: string[]
  sectors?: string[]
  policyAreas?: string[]
  
  // Thresholds
  minConfidenceThreshold: number // Only report insights above this
  maxInsightsPerRun: number
  
  // Metrics
  totalInsightsGenerated: number
  insightsActioned: number
  successRate: number
}

// ============================================================================
// AGENT STATUS & METRICS
// ============================================================================

export interface AgentStatus {
  agentId: AgentId
  status: 'idle' | 'running' | 'error' | 'disabled'
  lastRun?: Date
  lastRunDurationMs?: number
  lastError?: string
  insightsFoundLastRun: number
  healthScore: number // 0-100
}

export interface AgentMetrics {
  totalAgents: number
  activeAgents: number
  totalInsights: number
  insightsByType: Record<InsightType, number>
  insightsByPriority: Record<InsightPriority, number>
  insightsByAgent: Record<AgentId, number>
  averageConfidence: number
  actionedRate: number
  lastFullScan?: Date
}

// ============================================================================
// AGENT RUN RESULTS
// ============================================================================

export interface AgentRunResult {
  agentId: AgentId
  startedAt: Date
  completedAt: Date
  durationMs: number
  success: boolean
  error?: string
  insightsGenerated: AgentInsight[]
  itemsProcessed: number
  duplicatesSkipped: number
}

export interface CoordinatorRunResult {
  startedAt: Date
  completedAt: Date
  totalDurationMs: number
  agentResults: AgentRunResult[]
  totalInsightsGenerated: number
  newHighPriorityCount: number
  errors: { agentId: AgentId; error: string }[]
}

// ============================================================================
// REPORT TYPES
// ============================================================================

export interface AgentReport {
  type: 'daily' | 'weekly' | 'ad-hoc'
  generatedAt: Date
  period: {
    start: Date
    end: Date
  }
  
  // Summary
  executiveSummary: string
  keyFindings: string[]
  
  // Insights
  criticalInsights: AgentInsight[]
  highPriorityInsights: AgentInsight[]
  newWhiteSpaces: AgentInsight[]
  majorInvestments: AgentInsight[]
  
  // Recommendations
  topActions: SuggestedAction[]
  
  // Metrics
  metrics: AgentMetrics
}

// ============================================================================
// ALERT TYPES
// ============================================================================

export interface AgentAlert {
  id: string
  insightId: string
  type: 'critical-insight' | 'opportunity-match' | 'competitor-move' | 'policy-change'
  title: string
  message: string
  priority: InsightPriority
  createdAt: Date
  acknowledged: boolean
  acknowledgedAt?: Date
  linkTo?: string // URL or page path to view more
}

// ============================================================================
// FILTER & QUERY TYPES
// ============================================================================

export interface InsightFilter {
  agentIds?: AgentId[]
  agentTypes?: AgentType[]
  insightTypes?: InsightType[]
  priorities?: InsightPriority[]
  statuses?: AgentInsight['status'][]
  sectors?: string[]
  minConfidence?: number
  dateRange?: {
    start: Date
    end: Date
  }
  searchQuery?: string
}

export interface InsightSortOptions {
  field: 'discoveredAt' | 'confidence' | 'priority' | 'impactScore'
  direction: 'asc' | 'desc'
}
