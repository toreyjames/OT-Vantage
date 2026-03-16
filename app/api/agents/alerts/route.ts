/**
 * API Route: /api/agents/alerts
 * 
 * Manages agent alerts:
 * - GET: Get alerts (all or unacknowledged)
 * - PATCH: Acknowledge alerts
 */

import { NextResponse } from 'next/server'
import { agentCoordinator } from '@/lib/agents'

// GET /api/agents/alerts - Get alerts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const unacknowledgedOnly = searchParams.get('unacknowledged') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    
    const alerts = unacknowledgedOnly 
      ? agentCoordinator.getUnacknowledgedAlerts()
      : agentCoordinator.getAllAlerts(limit)
    
    return NextResponse.json({
      success: true,
      data: {
        alerts,
        count: alerts.length,
        unacknowledgedCount: agentCoordinator.getAlertCount(),
      },
    })
  } catch (error) {
    console.error('Failed to get alerts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get alerts' },
      { status: 500 }
    )
  }
}

// PATCH /api/agents/alerts - Acknowledge alerts
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { alertId, acknowledgeAll } = body
    
    if (acknowledgeAll) {
      const count = agentCoordinator.acknowledgeAllAlerts()
      return NextResponse.json({
        success: true,
        data: {
          acknowledged: count,
        },
      })
    }
    
    if (!alertId) {
      return NextResponse.json(
        { success: false, error: 'alertId or acknowledgeAll is required' },
        { status: 400 }
      )
    }
    
    const alert = agentCoordinator.acknowledgeAlert(alertId)
    
    if (!alert) {
      return NextResponse.json(
        { success: false, error: 'Alert not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: alert,
    })
  } catch (error) {
    console.error('Failed to acknowledge alert:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to acknowledge alert' },
      { status: 500 }
    )
  }
}
