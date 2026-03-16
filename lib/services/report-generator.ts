/**
 * Report Generator Service
 * 
 * Generates daily and weekly digest reports from agent insights:
 * - Daily digest: New insights from all agents
 * - Weekly briefing: Synthesized strategic view
 * - Export to markdown/HTML for distribution
 */

import { agentCoordinator } from '../agents'
import { AgentInsight, AgentReport, AgentMetrics, SuggestedAction } from '../agents/types'

// ============================================================================
// REPORT GENERATION
// ============================================================================

/**
 * Generate a daily digest report
 */
export async function generateDailyReport(): Promise<AgentReport> {
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  
  // Get insights from the last 24 hours
  const recentInsights = agentCoordinator.getInsights(
    { dateRange: { start: oneDayAgo, end: now } },
    { field: 'discoveredAt', direction: 'desc' }
  )
  
  const criticalInsights = recentInsights.filter(i => i.priority === 'critical')
  const highPriorityInsights = recentInsights.filter(i => i.priority === 'high')
  const whiteSpaces = recentInsights.filter(i => i.insightType === 'white-space')
  const investments = recentInsights.filter(i => i.insightType === 'investment')
  
  // Generate executive summary
  const executiveSummary = generateExecutiveSummary(recentInsights, 'daily')
  
  // Extract key findings
  const keyFindings = extractKeyFindings(recentInsights)
  
  // Extract top actions
  const topActions = extractTopActions(recentInsights)
  
  // Get metrics
  const metrics = agentCoordinator.getMetrics()
  
  return {
    type: 'daily',
    generatedAt: now,
    period: {
      start: oneDayAgo,
      end: now,
    },
    executiveSummary,
    keyFindings,
    criticalInsights,
    highPriorityInsights,
    newWhiteSpaces: whiteSpaces,
    majorInvestments: investments,
    topActions,
    metrics,
  }
}

/**
 * Generate a weekly briefing report
 */
export async function generateWeeklyReport(): Promise<AgentReport> {
  const now = new Date()
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  
  // Get insights from the last 7 days
  const recentInsights = agentCoordinator.getInsights(
    { dateRange: { start: oneWeekAgo, end: now } },
    { field: 'discoveredAt', direction: 'desc' }
  )
  
  const criticalInsights = recentInsights.filter(i => i.priority === 'critical')
  const highPriorityInsights = recentInsights.filter(i => i.priority === 'high')
  const whiteSpaces = recentInsights.filter(i => i.insightType === 'white-space')
  const investments = recentInsights.filter(i => i.insightType === 'investment')
  
  // Generate executive summary
  const executiveSummary = generateExecutiveSummary(recentInsights, 'weekly')
  
  // Extract key findings
  const keyFindings = extractKeyFindings(recentInsights, 10)
  
  // Extract top actions
  const topActions = extractTopActions(recentInsights, 10)
  
  // Get metrics
  const metrics = agentCoordinator.getMetrics()
  
  return {
    type: 'weekly',
    generatedAt: now,
    period: {
      start: oneWeekAgo,
      end: now,
    },
    executiveSummary,
    keyFindings,
    criticalInsights: criticalInsights.slice(0, 10),
    highPriorityInsights: highPriorityInsights.slice(0, 10),
    newWhiteSpaces: whiteSpaces.slice(0, 5),
    majorInvestments: investments.slice(0, 10),
    topActions,
    metrics,
  }
}

// ============================================================================
// REPORT FORMATTING
// ============================================================================

/**
 * Export report to Markdown format
 */
export function reportToMarkdown(report: AgentReport): string {
  const lines: string[] = []
  
  // Header
  lines.push(`# OT Vantage ${report.type === 'daily' ? 'Daily Digest' : 'Weekly Briefing'}`)
  lines.push('')
  lines.push(`**Generated:** ${report.generatedAt.toLocaleString()}`)
  lines.push(`**Period:** ${report.period.start.toLocaleDateString()} - ${report.period.end.toLocaleDateString()}`)
  lines.push('')
  
  // Executive Summary
  lines.push('## Executive Summary')
  lines.push('')
  lines.push(report.executiveSummary)
  lines.push('')
  
  // Key Findings
  lines.push('## Key Findings')
  lines.push('')
  for (const finding of report.keyFindings) {
    lines.push(`- ${finding}`)
  }
  lines.push('')
  
  // Critical Insights
  if (report.criticalInsights.length > 0) {
    lines.push('## Critical Insights')
    lines.push('')
    for (const insight of report.criticalInsights) {
      lines.push(`### ${insight.title}`)
      lines.push('')
      lines.push(insight.summary)
      lines.push('')
      lines.push(`- **Confidence:** ${(insight.confidence * 100).toFixed(0)}%`)
      lines.push(`- **Impact:** ${insight.impactScore}/10`)
      if (insight.relevantSectors.length > 0) {
        lines.push(`- **Sectors:** ${insight.relevantSectors.join(', ')}`)
      }
      lines.push('')
    }
  }
  
  // White Space Opportunities
  if (report.newWhiteSpaces.length > 0) {
    lines.push('## White Space Opportunities')
    lines.push('')
    for (const ws of report.newWhiteSpaces) {
      lines.push(`### ${ws.title}`)
      lines.push('')
      lines.push(ws.summary)
      if (ws.whiteSpaceData) {
        lines.push('')
        lines.push(`- **Competitor Presence:** ${ws.whiteSpaceData.competitorPresence}`)
        lines.push(`- **Window:** ${ws.whiteSpaceData.windowOfOpportunity}`)
      }
      lines.push('')
    }
  }
  
  // Major Investments
  if (report.majorInvestments.length > 0) {
    lines.push('## Major Investment Signals')
    lines.push('')
    for (const inv of report.majorInvestments) {
      const amount = inv.investmentData?.amount
      const amountStr = amount 
        ? `$${amount >= 1000 ? (amount / 1000).toFixed(1) + 'B' : amount + 'M'}`
        : 'Amount undisclosed'
      lines.push(`- **${inv.title}:** ${amountStr}`)
    }
    lines.push('')
  }
  
  // Top Actions
  lines.push('## Recommended Actions')
  lines.push('')
  for (let i = 0; i < report.topActions.length; i++) {
    const action = report.topActions[i]
    lines.push(`${i + 1}. **[${action.urgency.toUpperCase()}]** ${action.action}`)
    lines.push(`   - ${action.rationale}`)
  }
  lines.push('')
  
  // Metrics
  lines.push('## System Metrics')
  lines.push('')
  lines.push(`- **Total Insights:** ${report.metrics.totalInsights}`)
  lines.push(`- **Active Agents:** ${report.metrics.activeAgents}/${report.metrics.totalAgents}`)
  lines.push(`- **Average Confidence:** ${(report.metrics.averageConfidence * 100).toFixed(0)}%`)
  lines.push(`- **Actioned Rate:** ${(report.metrics.actionedRate * 100).toFixed(0)}%`)
  lines.push('')
  
  // Footer
  lines.push('---')
  lines.push('*Generated by OT Vantage Strategic Subagent System*')
  lines.push('')
  lines.push('*Internal Use Only - Deloitte Consulting LLP*')
  
  return lines.join('\n')
}

/**
 * Export report to HTML format
 */
export function reportToHtml(report: AgentReport): string {
  const markdown = reportToMarkdown(report)
  
  // Simple markdown to HTML conversion
  let html = markdown
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^\*\*(.+?)\*\*/gm, '<strong>$1</strong>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/^---$/gm, '<hr>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
  
  // Wrap in HTML document
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OT Vantage ${report.type === 'daily' ? 'Daily Digest' : 'Weekly Briefing'}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      line-height: 1.6;
      color: #1a1a1a;
    }
    h1 { color: #1a1a1a; border-bottom: 2px solid #7ee787; padding-bottom: 0.5rem; }
    h2 { color: #333; margin-top: 2rem; }
    h3 { color: #555; }
    li { margin-bottom: 0.5rem; }
    hr { margin: 2rem 0; border: none; border-top: 1px solid #ddd; }
    em { color: #666; }
    strong { color: #1a1a1a; }
  </style>
</head>
<body>
  ${html}
</body>
</html>`
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateExecutiveSummary(insights: AgentInsight[], period: 'daily' | 'weekly'): string {
  const totalInsights = insights.length
  const criticalCount = insights.filter(i => i.priority === 'critical').length
  const highCount = insights.filter(i => i.priority === 'high').length
  const whiteSpaceCount = insights.filter(i => i.insightType === 'white-space').length
  
  const totalInvestment = insights
    .filter(i => i.investmentData?.amount)
    .reduce((sum, i) => sum + (i.investmentData?.amount || 0), 0)
  
  const investmentStr = totalInvestment >= 1000
    ? `$${(totalInvestment / 1000).toFixed(1)}B`
    : `$${totalInvestment}M`
  
  // Get top sectors
  const sectorCounts = new Map<string, number>()
  for (const insight of insights) {
    for (const sector of insight.relevantSectors) {
      sectorCounts.set(sector, (sectorCounts.get(sector) || 0) + 1)
    }
  }
  const topSectors = Array.from(sectorCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([sector]) => sector)
  
  const periodLabel = period === 'daily' ? '24 hours' : 'week'
  
  let summary = `Over the past ${periodLabel}, the Strategic Subagent System identified **${totalInsights} insights** across the Build Economy sectors.`
  
  if (criticalCount > 0 || highCount > 0) {
    summary += ` **${criticalCount + highCount} high-priority items** require attention`
    if (criticalCount > 0) {
      summary += ` (${criticalCount} critical)`
    }
    summary += '.'
  }
  
  if (whiteSpaceCount > 0) {
    summary += ` ${whiteSpaceCount} white space opportunities were identified where competitors are not active.`
  }
  
  if (totalInvestment > 0) {
    summary += ` Investment tracking detected ${investmentStr} in capital flows.`
  }
  
  if (topSectors.length > 0) {
    summary += ` Most active sectors: ${topSectors.join(', ')}.`
  }
  
  return summary
}

function extractKeyFindings(insights: AgentInsight[], maxFindings: number = 5): string[] {
  const findings: string[] = []
  
  // Group by type for diverse findings
  const byType = new Map<string, AgentInsight[]>()
  for (const insight of insights) {
    const existing = byType.get(insight.insightType) || []
    existing.push(insight)
    byType.set(insight.insightType, existing)
  }
  
  // Extract top finding from each type
  for (const [type, typeInsights] of byType) {
    const topInsight = typeInsights
      .sort((a, b) => b.impactScore - a.impactScore)[0]
    
    if (topInsight) {
      let finding = topInsight.title
      
      // Add context based on type
      if (type === 'white-space' && topInsight.whiteSpaceData) {
        finding += ` (${topInsight.whiteSpaceData.competitorPresence} competitor presence)`
      } else if (type === 'investment' && topInsight.investmentData?.amount) {
        const amount = topInsight.investmentData.amount
        finding += ` ($${amount >= 1000 ? (amount / 1000).toFixed(1) + 'B' : amount + 'M'})`
      }
      
      findings.push(finding)
    }
    
    if (findings.length >= maxFindings) break
  }
  
  // If we need more, add high-impact insights
  if (findings.length < maxFindings) {
    const highImpact = insights
      .filter(i => !findings.some(f => f.includes(i.title)))
      .sort((a, b) => b.impactScore - a.impactScore)
    
    for (const insight of highImpact) {
      if (findings.length >= maxFindings) break
      findings.push(insight.title)
    }
  }
  
  return findings
}

function extractTopActions(insights: AgentInsight[], maxActions: number = 5): SuggestedAction[] {
  const allActions: SuggestedAction[] = []
  
  for (const insight of insights) {
    for (const action of insight.suggestedActions) {
      allActions.push(action)
    }
  }
  
  // Deduplicate and prioritize by urgency
  const urgencyOrder = { immediate: 0, 'short-term': 1, 'medium-term': 2, 'long-term': 3 }
  
  const seen = new Set<string>()
  const unique: SuggestedAction[] = []
  
  // Sort by urgency
  allActions.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency])
  
  for (const action of allActions) {
    const key = action.action.toLowerCase().slice(0, 50)
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(action)
    }
    if (unique.length >= maxActions) break
  }
  
  return unique
}

// ============================================================================
// API ROUTE HELPERS
// ============================================================================

/**
 * Generate report for API response
 */
export async function generateReport(type: 'daily' | 'weekly'): Promise<{
  report: AgentReport
  markdown: string
  html: string
}> {
  const report = type === 'daily' 
    ? await generateDailyReport()
    : await generateWeeklyReport()
  
  return {
    report,
    markdown: reportToMarkdown(report),
    html: reportToHtml(report),
  }
}
