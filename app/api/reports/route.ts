/**
 * API Route: /api/reports
 * 
 * Generates daily and weekly digest reports:
 * - GET: Generate and return a report
 */

import { NextResponse } from 'next/server'
import { generateReport } from '@/lib/services/report-generator'

// GET /api/reports - Generate a report
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as 'daily' | 'weekly' || 'daily'
    const format = searchParams.get('format') as 'json' | 'markdown' | 'html' || 'json'
    
    if (type !== 'daily' && type !== 'weekly') {
      return NextResponse.json(
        { success: false, error: 'Invalid report type. Must be "daily" or "weekly"' },
        { status: 400 }
      )
    }
    
    console.log(`[API] Generating ${type} report in ${format} format`)
    
    const { report, markdown, html } = await generateReport(type)
    
    // Return based on format
    if (format === 'markdown') {
      return new NextResponse(markdown, {
        headers: {
          'Content-Type': 'text/markdown',
          'Content-Disposition': `attachment; filename="ot-vantage-${type}-report.md"`,
        },
      })
    }
    
    if (format === 'html') {
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
        },
      })
    }
    
    // Default: JSON response
    return NextResponse.json({
      success: true,
      data: {
        report,
        markdown,
        // Don't include HTML in JSON response (too large)
      },
    })
  } catch (error) {
    console.error('Failed to generate report:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}
