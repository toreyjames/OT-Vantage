// Unified Data Store
// Central source of truth for all opportunities - static and discovered

import { Opportunity } from '../data/opportunities'
import { OpportunitySignal, PolicyUpdate } from '../services/types'
import fs from 'fs'
import path from 'path'

// Store file paths
const DATA_DIR = path.join(process.cwd(), 'data')
const OPPORTUNITIES_FILE = path.join(DATA_DIR, 'opportunities.json')
const SIGNALS_FILE = path.join(DATA_DIR, 'signals.json')
const POLICY_UPDATES_FILE = path.join(DATA_DIR, 'policy-updates.json')

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

// ============================================================================
// OPPORTUNITIES STORE
// ============================================================================

export interface StoredOpportunity extends Opportunity {
  source: 'static' | 'discovered' | 'manual'
  discoveredAt?: Date
  promotedAt?: Date
  signalId?: string // Link to original signal if promoted
}

// Load opportunities from file
export function loadOpportunities(): StoredOpportunity[] {
  ensureDataDir()
  
  if (!fs.existsSync(OPPORTUNITIES_FILE)) {
    return []
  }
  
  try {
    const data = fs.readFileSync(OPPORTUNITIES_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Failed to load opportunities:', error)
    return []
  }
}

// Save opportunities to file
export function saveOpportunities(opportunities: StoredOpportunity[]): void {
  ensureDataDir()
  fs.writeFileSync(OPPORTUNITIES_FILE, JSON.stringify(opportunities, null, 2))
}

// Add a new opportunity
export function addOpportunity(opportunity: StoredOpportunity): StoredOpportunity {
  const opportunities = loadOpportunities()
  opportunities.push(opportunity)
  saveOpportunities(opportunities)
  return opportunity
}

// Update an opportunity
export function updateOpportunity(id: string, updates: Partial<StoredOpportunity>): StoredOpportunity | null {
  const opportunities = loadOpportunities()
  const index = opportunities.findIndex(o => o.id === id)
  
  if (index === -1) return null
  
  opportunities[index] = { ...opportunities[index], ...updates }
  saveOpportunities(opportunities)
  return opportunities[index]
}

// Delete an opportunity
export function deleteOpportunity(id: string): boolean {
  const opportunities = loadOpportunities()
  const filtered = opportunities.filter(o => o.id !== id)
  
  if (filtered.length === opportunities.length) return false
  
  saveOpportunities(filtered)
  return true
}

// Get opportunity by ID
export function getOpportunity(id: string): StoredOpportunity | null {
  const opportunities = loadOpportunities()
  return opportunities.find(o => o.id === id) || null
}

// ============================================================================
// SIGNALS STORE (Discovered opportunities not yet in pipeline)
// ============================================================================

export interface StoredSignal extends OpportunitySignal {
  savedAt: Date
  reviewed: boolean
  dismissed: boolean
  promotedToOpportunityId?: string
}

// Load signals from file
export function loadSignals(): StoredSignal[] {
  ensureDataDir()
  
  if (!fs.existsSync(SIGNALS_FILE)) {
    return []
  }
  
  try {
    const data = fs.readFileSync(SIGNALS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Failed to load signals:', error)
    return []
  }
}

// Save signals to file
export function saveSignals(signals: StoredSignal[]): void {
  ensureDataDir()
  fs.writeFileSync(SIGNALS_FILE, JSON.stringify(signals, null, 2))
}

// Add new signals (deduplicates by title + company)
export function addSignals(newSignals: OpportunitySignal[]): number {
  const signals = loadSignals()
  let added = 0
  
  for (const signal of newSignals) {
    // Check for duplicates
    const exists = signals.some(s => 
      s.title === signal.title && s.company === signal.company
    )
    
    if (!exists) {
      signals.push({
        ...signal,
        savedAt: new Date(),
        reviewed: false,
        dismissed: false,
      })
      added++
    }
  }
  
  saveSignals(signals)
  return added
}

// Mark signal as reviewed
export function reviewSignal(id: string, dismissed: boolean = false): StoredSignal | null {
  const signals = loadSignals()
  const index = signals.findIndex(s => s.id === id)
  
  if (index === -1) return null
  
  signals[index].reviewed = true
  signals[index].dismissed = dismissed
  saveSignals(signals)
  return signals[index]
}

// Promote signal to opportunity
export function promoteSignal(signalId: string): StoredOpportunity | null {
  const signals = loadSignals()
  const signalIndex = signals.findIndex(s => s.id === signalId)
  
  if (signalIndex === -1) return null
  
  const signal = signals[signalIndex]
  
  // Create new opportunity from signal
  const newOpportunity: StoredOpportunity = {
    id: `discovered-${Date.now()}`,
    company: signal.company || 'Unknown',
    project: signal.title,
    sector: mapSector(signal.sector),
    investmentSize: signal.estimatedValue || 0,
    jobs: 0, // To be researched
    location: signal.location || { state: 'Unknown' },
    procurementStage: 'monitoring',
    rfpStatus: 'not-issued',
    policyDriver: (signal.relevantPolicies || []) as any,
    services: [],
    otRelevance: 'adjacent',
    nextMilestone: {
      date: new Date().toISOString().split('T')[0],
      label: 'Needs Research',
    },
    strategicQuality: {
      frontier: 'mature' as const,
      economicImpact: signal.confidenceScore >= 0.8 ? 'significant' as const : 'direct-only' as const,
      note: `Auto-classified from signal with ${Math.round(signal.confidenceScore * 100)}% confidence`,
    },
    priority: signal.confidenceScore >= 0.8 ? 'hot' : signal.confidenceScore >= 0.5 ? 'warm' : 'tracking',
    deloitteRelationship: 'none',
    lastUpdated: new Date().toISOString().split('T')[0],
    source: 'discovered',
    discoveredAt: new Date(signal.discoveredAt),
    promotedAt: new Date(),
    signalId: signal.id,
    trumpPolicyAlignment: signal.relevantPolicies as any[],
    civilizationalImpact: `Discovered via ${signal.source}: ${signal.summary}`,
  }
  
  // Add to opportunities
  addOpportunity(newOpportunity)
  
  // Mark signal as promoted
  signals[signalIndex].promotedToOpportunityId = newOpportunity.id
  signals[signalIndex].reviewed = true
  saveSignals(signals)
  
  return newOpportunity
}

// Map signal sector to opportunity sector
function mapSector(sector: string | undefined): Opportunity['sector'] {
  const mapping: Record<string, Opportunity['sector']> = {
    'semiconductors': 'semiconductors',
    'data-centers': 'data-centers',
    'energy': 'clean-energy',
    'nuclear': 'nuclear',
    'ai-infrastructure': 'data-centers',
    'clean-energy': 'clean-energy',
    'ev-battery': 'ev-battery',
    'critical-minerals': 'critical-minerals',
    'defense': 'defense',
  }
  return mapping[sector || ''] || 'data-centers'
}

// ============================================================================
// POLICY UPDATES STORE
// ============================================================================

export interface StoredPolicyUpdate extends PolicyUpdate {
  savedAt: Date
  acknowledged: boolean
}

// Load policy updates from file
export function loadPolicyUpdates(): StoredPolicyUpdate[] {
  ensureDataDir()
  
  if (!fs.existsSync(POLICY_UPDATES_FILE)) {
    return []
  }
  
  try {
    const data = fs.readFileSync(POLICY_UPDATES_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Failed to load policy updates:', error)
    return []
  }
}

// Save policy updates to file
export function savePolicyUpdates(updates: StoredPolicyUpdate[]): void {
  ensureDataDir()
  fs.writeFileSync(POLICY_UPDATES_FILE, JSON.stringify(updates, null, 2))
}

// Add new policy updates (deduplicates by ID)
export function addPolicyUpdates(newUpdates: PolicyUpdate[]): number {
  const updates = loadPolicyUpdates()
  let added = 0
  
  for (const update of newUpdates) {
    const exists = updates.some(u => u.id === update.id)
    
    if (!exists) {
      updates.push({
        ...update,
        savedAt: new Date(),
        acknowledged: false,
      })
      added++
    }
  }
  
  savePolicyUpdates(updates)
  return added
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Initialize store with static opportunities if empty
export async function initializeStore(): Promise<void> {
  ensureDataDir()
  
  const opportunities = loadOpportunities()
  
  if (opportunities.length === 0) {
    // Import static opportunities
    const { opportunities: staticOpps } = await import('../data/opportunities')
    
    const storedOpps: StoredOpportunity[] = staticOpps.map(opp => ({
      ...opp,
      source: 'static' as const,
    }))
    
    saveOpportunities(storedOpps)
    console.log(`Initialized store with ${storedOpps.length} static opportunities`)
  }
}

// ============================================================================
// STATS
// ============================================================================

export interface StoreStats {
  totalOpportunities: number
  staticOpportunities: number
  discoveredOpportunities: number
  pendingSignals: number
  dismissedSignals: number
  policyUpdates: number
  unacknowledgedUpdates: number
  totalPipeline: number
  lastSync: Date | null
}

export function getStoreStats(): StoreStats {
  const opportunities = loadOpportunities()
  const signals = loadSignals()
  const updates = loadPolicyUpdates()
  
  return {
    totalOpportunities: opportunities.length,
    staticOpportunities: opportunities.filter(o => o.source === 'static').length,
    discoveredOpportunities: opportunities.filter(o => o.source === 'discovered').length,
    pendingSignals: signals.filter(s => !s.reviewed && !s.dismissed).length,
    dismissedSignals: signals.filter(s => s.dismissed).length,
    policyUpdates: updates.length,
    unacknowledgedUpdates: updates.filter(u => !u.acknowledged).length,
    totalPipeline: opportunities.reduce((sum, o) => sum + o.investmentSize, 0),
    lastSync: signals.length > 0 ? new Date(Math.max(...signals.map(s => new Date(s.savedAt).getTime()))) : null,
  }
}

