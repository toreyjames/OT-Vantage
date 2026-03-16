/**
 * API Route: /api/agents/insights
 * 
 * Manages agent insights:
 * - GET: Get insights with filtering and pagination
 * - PATCH: Update insight status
 */

import { NextResponse } from 'next/server'
import { agentCoordinator } from '@/lib/agents'
import { InsightFilter, InsightSortOptions, AgentId, AgentType, InsightType, InsightPriority } from '@/lib/agents/types'

// GET /api/agents/insights - Get insights
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Build filter from query params
    const filter: InsightFilter = {}
    
    // Agent IDs (comma-separated)
    const agentIds = searchParams.get('agentIds')
    if (agentIds) {
      filter.agentIds = agentIds.split(',') as AgentId[]
    }
    
    // Agent types (comma-separated)
    const agentTypes = searchParams.get('agentTypes')
    if (agentTypes) {
      filter.agentTypes = agentTypes.split(',') as AgentType[]
    }
    
    // Insight types (comma-separated)
    const insightTypes = searchParams.get('insightTypes')
    if (insightTypes) {
      filter.insightTypes = insightTypes.split(',') as InsightType[]
    }
    
    // Priorities (comma-separated)
    const priorities = searchParams.get('priorities')
    if (priorities) {
      filter.priorities = priorities.split(',') as InsightPriority[]
    }
    
    // Statuses (comma-separated)
    const statuses = searchParams.get('statuses')
    if (statuses) {
      filter.statuses = statuses.split(',') as any[]
    }
    
    // Sectors (comma-separated)
    const sectors = searchParams.get('sectors')
    if (sectors) {
      filter.sectors = sectors.split(',')
    }
    
    // Min confidence
    const minConfidence = searchParams.get('minConfidence')
    if (minConfidence) {
      filter.minConfidence = parseFloat(minConfidence)
    }
    
    // Search query
    const search = searchParams.get('search')
    if (search) {
      filter.searchQuery = search
    }
    
    // Date range
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    if (startDate && endDate) {
      filter.dateRange = {
        start: new Date(startDate),
        end: new Date(endDate),
      }
    }
    
    // Build sort options
    const sortField = searchParams.get('sortField') as InsightSortOptions['field'] | null
    const sortDirection = searchParams.get('sortDirection') as InsightSortOptions['direction'] | null
    
    const sort: InsightSortOptions | undefined = sortField ? {
      field: sortField,
      direction: sortDirection || 'desc',
    } : { field: 'discoveredAt', direction: 'desc' }
    
    // Limit
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    
    // Get insights
    const insights = agentCoordinator.getInsights(filter, sort, limit)
    const totalCount = agentCoordinator.getInsightCount()
    
    return NextResponse.json({
      success: true,
      data: {
        insights,
        count: insights.length,
        totalCount,
        filter,
      },
    })
  } catch (error) {
    console.error('Failed to get insights:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get insights' },
      { status: 500 }
    )
  }
}

// PATCH /api/agents/insights - Update insight status
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { insightId, status, notes } = body
    
    if (!insightId || !status) {
      return NextResponse.json(
        { success: false, error: 'insightId and status are required' },
        { status: 400 }
      )
    }
    
    const validStatuses = ['new', 'reviewed', 'actioned', 'dismissed', 'expired']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }
    
    const updated = agentCoordinator.updateInsightStatus(insightId, status, notes)
    
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Insight not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: updated,
    })
  } catch (error) {
    console.error('Failed to update insight:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update insight' },
      { status: 500 }
    )
  }
}
