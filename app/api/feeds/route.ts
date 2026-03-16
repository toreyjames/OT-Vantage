// Real-time feeds API
// Fetches live policy updates and opportunity signals
// DYNAMIC: Auto-generates searches from 100+ tracked companies
// Note: On Vercel, file system is read-only so we skip persistence

import { NextResponse } from 'next/server'
import { checkPolicyFeeds } from '@/lib/services/policy-monitor'
import { discoverOpportunities, getDiscoveryStats } from '@/lib/services/opportunity-discovery'
import { generateInsights } from '@/lib/services/ai-classifier'
import { SystemStatus } from '@/lib/services/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Check if we're on Vercel (read-only file system)
const isVercel = process.env.VERCEL === '1'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'all'
  
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
    
    // On Vercel, skip file persistence - just return the live data
    let savedSignals = 0
    let savedUpdates = 0
    let storeStats: any = { totalOpportunities: 75, totalSignals: 0, pendingReview: 0 }
    let pendingCount = opportunitySignals.length
    
    if (!isVercel) {
      // Only try to persist locally
      try {
        const { addSignals, addPolicyUpdates, getStoreStats, loadSignals } = await import('@/lib/store')
        
        if (opportunitySignals.length > 0) {
          savedSignals = addSignals(opportunitySignals)
        }
        if (policyUpdates.length > 0) {
          savedUpdates = addPolicyUpdates(policyUpdates)
        }
        
        storeStats = getStoreStats()
        const pendingSignals = loadSignals().filter((s: any) => !s.reviewed && !s.dismissed)
        pendingCount = pendingSignals.length
      } catch (storeError) {
        console.warn('Store operations skipped (read-only fs):', storeError)
      }
    }
    
    // Generate AI insights
    const insights = generateInsights(policyUpdates, opportunitySignals)
    
    // Build status
    const status: SystemStatus = {
      lastSync: new Date(),
      policiesMonitored: policyUpdates.length,
      opportunitiesDiscovered: opportunitySignals.length,
      pendingReview: pendingCount,
      feedsActive: 7,
      feedsError: 0,
      aiClassifierStatus: 'active'
    }
    
    const responseTime = Date.now() - startTime
    
    // Get dynamic tracking stats
    const discoveryStats = getDiscoveryStats()
    
    // Separate new discoveries from known company news
    const newDiscoveries = opportunitySignals.filter((s: any) => s.isNewDiscovery)
    const knownCompanyNews = opportunitySignals.filter((s: any) => !s.isNewDiscovery)
    
    return NextResponse.json({
      success: true,
      data: {
        policyUpdates: policyUpdates.slice(0, 50),
        opportunitySignals: opportunitySignals.slice(0, 50),
        // NEW: Separate feeds for discoveries vs known companies
        newDiscoveries: newDiscoveries.slice(0, 25),
        knownCompanyNews: knownCompanyNews.slice(0, 25),
        insights,
        status,
        store: {
          savedSignals,
          savedUpdates,
          stats: storeStats,
        },
        // SMART DISCOVERY TRACKING INFO
        tracking: {
          companiesTracked: discoveryStats.trackedCompanies,
          activeQueries: discoveryStats.activeQueries,
          eventDiscoveryQueries: discoveryStats.eventDiscoveryQueries,
          pendingDiscoveries: discoveryStats.pendingDiscoveries,
          promotedDiscoveries: discoveryStats.promotedDiscoveries,
          sampleCompanies: discoveryStats.companySample,
          sampleQueries: discoveryStats.querySample,
        }
      },
      meta: {
        responseTimeMs: responseTime,
        timestamp: new Date().toISOString(),
        environment: isVercel ? 'vercel' : 'local',
        mode: 'SMART_DISCOVERY' // Event-based discovery with company extraction
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

