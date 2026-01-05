// Real-time feeds API
// Fetches live policy updates and opportunity signals, saves to unified store

import { NextResponse } from 'next/server'
import { checkPolicyFeeds } from '@/lib/services/policy-monitor'
import { discoverOpportunities } from '@/lib/services/opportunity-discovery'
import { generateInsights } from '@/lib/services/ai-classifier'
import { SystemStatus } from '@/lib/services/types'
import { addSignals, addPolicyUpdates, getStoreStats, loadSignals } from '@/lib/store'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'all'
  const save = searchParams.get('save') !== 'false' // Default to saving
  
  try {
    const startTime = Date.now()
    
    let policyUpdates: any[] = []
    let opportunitySignals: any[] = []
    
    // Fetch based on type
    if (type === 'all' || type === 'policy') {
      policyUpdates = await checkPolicyFeeds()
    }
    
    if (type === 'all' || type === 'opportunities') {
      opportunitySignals = await discoverOpportunities()
    }
    
    // Save to unified store
    let savedSignals = 0
    let savedUpdates = 0
    
    if (save) {
      if (opportunitySignals.length > 0) {
        savedSignals = addSignals(opportunitySignals)
      }
      if (policyUpdates.length > 0) {
        savedUpdates = addPolicyUpdates(policyUpdates)
      }
    }
    
    // Generate AI insights
    const insights = generateInsights(policyUpdates, opportunitySignals)
    
    // Get store stats
    const storeStats = getStoreStats()
    const pendingSignals = loadSignals().filter(s => !s.reviewed && !s.dismissed)
    
    // Build status
    const status: SystemStatus = {
      lastSync: new Date(),
      policiesMonitored: policyUpdates.length,
      opportunitiesDiscovered: opportunitySignals.length,
      pendingReview: pendingSignals.length,
      feedsActive: 7,
      feedsError: 0,
      aiClassifierStatus: 'active'
    }
    
    const responseTime = Date.now() - startTime
    
    return NextResponse.json({
      success: true,
      data: {
        policyUpdates: policyUpdates.slice(0, 50),
        opportunitySignals: opportunitySignals.slice(0, 50),
        insights,
        status,
        store: {
          savedSignals,
          savedUpdates,
          stats: storeStats,
        }
      },
      meta: {
        responseTimeMs: responseTime,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Feed fetch error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    }, { status: 500 })
  }
}

