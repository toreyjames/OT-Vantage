// Discovery Queue API
// Manage pending company discoveries - list, promote, dismiss

import { NextResponse } from 'next/server'
import { 
  getPendingDiscoveries, 
  getAllDiscoveries,
  promoteDiscovery, 
  dismissDiscovery,
  getDiscoveryStats,
  loadDiscoveryQueue,
  getDiscoveryQueueData,
  cleanupDiscoveryQueue,
  PendingDiscovery
} from '@/lib/services/opportunity-discovery'
import * as fs from 'fs'
import * as path from 'path'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Check if we're on Vercel (read-only file system)
const isVercel = process.env.VERCEL === '1'

// Path to discovery queue file
const QUEUE_FILE = path.join(process.cwd(), 'data', 'discovery-queue.json')

/**
 * Load discovery queue from file (local only)
 */
function loadQueueFromFile(): void {
  if (isVercel) return
  
  try {
    if (fs.existsSync(QUEUE_FILE)) {
      const data = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf-8'))
      if (data.discoveries && Array.isArray(data.discoveries)) {
        loadDiscoveryQueue(data.discoveries)
      }
    }
  } catch (error) {
    console.error('Failed to load discovery queue:', error)
  }
}

/**
 * Save discovery queue to file (local only)
 */
function saveQueueToFile(): void {
  if (isVercel) return
  
  try {
    const data = {
      discoveries: getDiscoveryQueueData(),
      lastUpdated: new Date().toISOString(),
      metadata: {
        description: 'Pending company discoveries for human review',
        version: '1.0'
      }
    }
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Failed to save discovery queue:', error)
  }
}

// Initialize queue on module load
loadQueueFromFile()

/**
 * GET /api/discoveries
 * List discoveries with optional status filter
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') // 'pending', 'promoted', 'dismissed', or 'all'
  
  try {
    // Reload from file to get latest
    loadQueueFromFile()
    
    let discoveries: PendingDiscovery[]
    
    if (status === 'all') {
      discoveries = getAllDiscoveries()
    } else if (status === 'pending' || !status) {
      discoveries = getPendingDiscoveries()
    } else {
      discoveries = getAllDiscoveries().filter(d => d.status === status)
    }
    
    const stats = getDiscoveryStats()
    
    return NextResponse.json({
      success: true,
      data: {
        discoveries,
        stats,
      },
      meta: {
        timestamp: new Date().toISOString(),
        environment: isVercel ? 'vercel' : 'local',
        persistenceEnabled: !isVercel,
      }
    })
  } catch (error) {
    console.error('Discovery API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

/**
 * POST /api/discoveries
 * Actions: promote, dismiss, cleanup
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, discoveryId } = body
    
    // Reload from file to get latest
    loadQueueFromFile()
    
    let result: PendingDiscovery | null = null
    let message = ''
    
    switch (action) {
      case 'promote':
        if (!discoveryId) {
          return NextResponse.json({
            success: false,
            error: 'discoveryId is required for promote action',
          }, { status: 400 })
        }
        result = promoteDiscovery(discoveryId)
        message = result 
          ? `Promoted "${result.companyName}" - add to tracking`
          : 'Discovery not found'
        break
        
      case 'dismiss':
        if (!discoveryId) {
          return NextResponse.json({
            success: false,
            error: 'discoveryId is required for dismiss action',
          }, { status: 400 })
        }
        result = dismissDiscovery(discoveryId)
        message = result 
          ? `Dismissed "${result.companyName}"`
          : 'Discovery not found'
        break
        
      case 'cleanup':
        const removed = cleanupDiscoveryQueue()
        message = `Cleaned up ${removed} old dismissed discoveries`
        break
        
      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}. Valid actions: promote, dismiss, cleanup`,
        }, { status: 400 })
    }
    
    // Save changes to file
    saveQueueToFile()
    
    const stats = getDiscoveryStats()
    
    return NextResponse.json({
      success: true,
      data: {
        action,
        result,
        message,
        stats,
      },
      meta: {
        timestamp: new Date().toISOString(),
        persistenceEnabled: !isVercel,
      }
    })
  } catch (error) {
    console.error('Discovery API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
