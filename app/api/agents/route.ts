/**
 * API Route: /api/agents
 * 
 * Manages agent execution and status:
 * - GET: Get all agent statuses and metrics
 * - POST: Run agents (all or specific)
 */

import { NextResponse } from 'next/server'
import { agentCoordinator } from '@/lib/agents'

// GET /api/agents - Get agent statuses and metrics
export async function GET() {
  try {
    const statuses = agentCoordinator.getAllAgentStatuses()
    const metrics = agentCoordinator.getMetrics()
    const lastRun = agentCoordinator.getLastRunResult()
    const alertCount = agentCoordinator.getAlertCount()
    
    return NextResponse.json({
      success: true,
      data: {
        agents: statuses,
        metrics,
        lastRun: lastRun ? {
          startedAt: lastRun.startedAt,
          completedAt: lastRun.completedAt,
          totalDurationMs: lastRun.totalDurationMs,
          totalInsightsGenerated: lastRun.totalInsightsGenerated,
          newHighPriorityCount: lastRun.newHighPriorityCount,
          errorCount: lastRun.errors.length,
        } : null,
        alertCount,
      },
    })
  } catch (error) {
    console.error('Failed to get agent statuses:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get agent statuses' },
      { status: 500 }
    )
  }
}

// POST /api/agents - Run agents
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { agentId, runAll = false } = body
    
    if (runAll || !agentId) {
      // Run all agents
      console.log('[API] Running all agents...')
      const result = await agentCoordinator.runAll()
      
      return NextResponse.json({
        success: true,
        data: {
          startedAt: result.startedAt,
          completedAt: result.completedAt,
          totalDurationMs: result.totalDurationMs,
          totalInsightsGenerated: result.totalInsightsGenerated,
          newHighPriorityCount: result.newHighPriorityCount,
          agentResults: result.agentResults.map(r => ({
            agentId: r.agentId,
            success: r.success,
            insightsCount: r.insightsGenerated.length,
            durationMs: r.durationMs,
            error: r.error,
          })),
          errors: result.errors,
        },
      })
    } else {
      // Run specific agent
      console.log(`[API] Running agent: ${agentId}`)
      const result = await agentCoordinator.runAgent(agentId)
      
      return NextResponse.json({
        success: true,
        data: {
          agentId: result.agentId,
          startedAt: result.startedAt,
          completedAt: result.completedAt,
          durationMs: result.durationMs,
          success: result.success,
          insightsCount: result.insightsGenerated.length,
          insights: result.insightsGenerated.slice(0, 10), // Return first 10
          error: result.error,
        },
      })
    }
  } catch (error) {
    console.error('Failed to run agents:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to run agents' },
      { status: 500 }
    )
  }
}

// PATCH /api/agents - Enable/disable agent
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { agentId, enabled } = body
    
    if (!agentId || typeof enabled !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'agentId and enabled are required' },
        { status: 400 }
      )
    }
    
    const success = agentCoordinator.setAgentEnabled(agentId, enabled)
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: {
        agentId,
        enabled,
      },
    })
  } catch (error) {
    console.error('Failed to update agent:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update agent' },
      { status: 500 }
    )
  }
}
