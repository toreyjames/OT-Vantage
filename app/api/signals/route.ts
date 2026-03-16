// Signals API
// Manage discovered opportunity signals

import { NextResponse } from 'next/server'
import { 
  loadSignals, 
  addSignals, 
  reviewSignal,
  promoteSignal,
  type StoredSignal 
} from '@/lib/store'

export const dynamic = 'force-dynamic'

// GET - List all signals
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'pending' | 'reviewed' | 'dismissed' | 'promoted' | 'all'
    
    let signals = loadSignals()
    
    // Filter by status
    if (status === 'pending') {
      signals = signals.filter(s => !s.reviewed && !s.dismissed)
    } else if (status === 'reviewed') {
      signals = signals.filter(s => s.reviewed && !s.dismissed)
    } else if (status === 'dismissed') {
      signals = signals.filter(s => s.dismissed)
    } else if (status === 'promoted') {
      signals = signals.filter(s => s.promotedToOpportunityId)
    }
    
    return NextResponse.json({
      success: true,
      data: {
        signals,
        counts: {
          total: loadSignals().length,
          pending: loadSignals().filter(s => !s.reviewed && !s.dismissed).length,
          reviewed: loadSignals().filter(s => s.reviewed && !s.dismissed).length,
          dismissed: loadSignals().filter(s => s.dismissed).length,
          promoted: loadSignals().filter(s => s.promotedToOpportunityId).length,
        }
      }
    })
  } catch (error) {
    console.error('Failed to load signals:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST - Add new signals (from live feed)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { signals } = body
    
    if (!Array.isArray(signals)) {
      return NextResponse.json({
        success: false,
        error: 'Signals must be an array'
      }, { status: 400 })
    }
    
    const added = addSignals(signals)
    
    return NextResponse.json({
      success: true,
      data: {
        added,
        message: `Added ${added} new signals`
      }
    })
  } catch (error) {
    console.error('Failed to add signals:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT - Review or promote a signal
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, action } = body // action: 'review' | 'dismiss' | 'promote'
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Signal ID is required'
      }, { status: 400 })
    }
    
    if (action === 'promote') {
      const opportunity = promoteSignal(id)
      
      if (!opportunity) {
        return NextResponse.json({
          success: false,
          error: 'Signal not found'
        }, { status: 404 })
      }
      
      return NextResponse.json({
        success: true,
        data: {
          opportunity,
          message: 'Signal promoted to opportunity'
        }
      })
    } else if (action === 'dismiss') {
      const signal = reviewSignal(id, true)
      
      if (!signal) {
        return NextResponse.json({
          success: false,
          error: 'Signal not found'
        }, { status: 404 })
      }
      
      return NextResponse.json({
        success: true,
        data: {
          signal,
          message: 'Signal dismissed'
        }
      })
    } else {
      // Default: mark as reviewed
      const signal = reviewSignal(id, false)
      
      if (!signal) {
        return NextResponse.json({
          success: false,
          error: 'Signal not found'
        }, { status: 404 })
      }
      
      return NextResponse.json({
        success: true,
        data: {
          signal,
          message: 'Signal marked as reviewed'
        }
      })
    }
  } catch (error) {
    console.error('Failed to update signal:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}


