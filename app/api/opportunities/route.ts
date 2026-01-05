// Opportunities API
// CRUD operations for the unified opportunity store

import { NextResponse } from 'next/server'
import { 
  loadOpportunities, 
  addOpportunity, 
  updateOpportunity, 
  deleteOpportunity,
  initializeStore,
  getStoreStats,
  type StoredOpportunity 
} from '@/lib/store'

export const dynamic = 'force-dynamic'

// GET - List all opportunities
export async function GET(request: Request) {
  try {
    // Initialize store if needed
    await initializeStore()
    
    const { searchParams } = new URL(request.url)
    const source = searchParams.get('source') // 'static' | 'discovered' | 'all'
    const sector = searchParams.get('sector')
    const policy = searchParams.get('policy')
    
    let opportunities = loadOpportunities()
    
    // Filter by source
    if (source && source !== 'all') {
      opportunities = opportunities.filter(o => o.source === source)
    }
    
    // Filter by sector
    if (sector) {
      opportunities = opportunities.filter(o => o.sector === sector)
    }
    
    // Filter by policy alignment
    if (policy) {
      opportunities = opportunities.filter(o => 
        o.trumpPolicyAlignment?.includes(policy as any)
      )
    }
    
    const stats = getStoreStats()
    
    return NextResponse.json({
      success: true,
      data: {
        opportunities,
        stats,
      }
    })
  } catch (error) {
    console.error('Failed to load opportunities:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST - Add new opportunity
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const newOpportunity: StoredOpportunity = {
      ...body,
      id: body.id || `manual-${Date.now()}`,
      source: body.source || 'manual',
    }
    
    const saved = addOpportunity(newOpportunity)
    
    return NextResponse.json({
      success: true,
      data: saved
    })
  } catch (error) {
    console.error('Failed to add opportunity:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT - Update opportunity
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID is required'
      }, { status: 400 })
    }
    
    const updated = updateOpportunity(id, updates)
    
    if (!updated) {
      return NextResponse.json({
        success: false,
        error: 'Opportunity not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: updated
    })
  } catch (error) {
    console.error('Failed to update opportunity:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE - Remove opportunity
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID is required'
      }, { status: 400 })
    }
    
    const deleted = deleteOpportunity(id)
    
    if (!deleted) {
      return NextResponse.json({
        success: false,
        error: 'Opportunity not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Opportunity deleted'
    })
  } catch (error) {
    console.error('Failed to delete opportunity:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

