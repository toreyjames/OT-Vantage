'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import AppNav from '../components/AppNav'

// ============================================================================
// TYPES
// ============================================================================

interface AgentStatus {
  agentId: string
  status: 'idle' | 'running' | 'error' | 'disabled'
  lastRun?: string
  lastRunDurationMs?: number
  lastError?: string
  insightsFoundLastRun: number
  healthScore: number
}

interface AgentInsight {
  id: string
  agentId: string
  agentType: 'strategic' | 'sector' | 'capability'
  insightType: 'white-space' | 'investment' | 'action' | 'signal' | 'competitive' | 'policy' | 'capability-gap'
  title: string
  summary: string
  confidence: number
  priority: 'critical' | 'high' | 'medium' | 'low'
  impactScore: number
  relevantSectors: string[]
  relevantCapabilities: string[]
  suggestedActions: { action: string; urgency: string }[]
  sources: { url: string; title: string }[]
  discoveredAt: string
  status: string
  investmentData?: {
    amount?: number
    investmentType?: string
    recipient?: string
  }
  whiteSpaceData?: {
    competitorPresence?: string
    windowOfOpportunity?: string
  }
}

interface AgentMetrics {
  totalAgents: number
  activeAgents: number
  totalInsights: number
  insightsByType: Record<string, number>
  insightsByPriority: Record<string, number>
  averageConfidence: number
  actionedRate: number
  lastFullScan?: string
}

interface AgentAlert {
  id: string
  insightId: string
  type: string
  title: string
  message: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  createdAt: string
  acknowledged: boolean
}

// ============================================================================
// COLORS & THEME (matching OT Vantage)
// ============================================================================

const COLORS = {
  bg: '#0a0f14',
  bgCard: '#0d1117',
  border: '#21262d',
  text: '#e6edf3',
  textMuted: '#7d8590',
  accent: '#7ee787',
  accentDim: '#238636',
  warning: '#d29922',
  danger: '#f85149',
  blue: '#58a6ff',
  purple: '#a371f7',
  cyan: '#39c5cf',
}

const PRIORITY_COLORS: Record<string, string> = {
  critical: COLORS.danger,
  high: COLORS.warning,
  medium: COLORS.blue,
  low: COLORS.textMuted,
}

const INSIGHT_TYPE_COLORS: Record<string, string> = {
  'white-space': COLORS.accent,
  investment: COLORS.blue,
  action: COLORS.purple,
  signal: COLORS.cyan,
  policy: COLORS.warning,
  'capability-gap': COLORS.danger,
  competitive: COLORS.warning,
}

const AGENT_TYPE_LABELS: Record<string, string> = {
  strategic: 'Strategic',
  sector: 'Sector',
  capability: 'Capability',
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentStatus[]>([])
  const [insights, setInsights] = useState<AgentInsight[]>([])
  const [alerts, setAlerts] = useState<AgentAlert[]>([])
  const [metrics, setMetrics] = useState<AgentMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [selectedInsightType, setSelectedInsightType] = useState<string>('all')
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null)

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      const [agentsRes, insightsRes, alertsRes] = await Promise.all([
        fetch('/api/agents'),
        fetch('/api/agents/insights?limit=100'),
        fetch('/api/agents/alerts?unacknowledged=true'),
      ])

      if (agentsRes.ok) {
        const data = await agentsRes.json()
        setAgents(data.data.agents || [])
        setMetrics(data.data.metrics || null)
      }

      if (insightsRes.ok) {
        const data = await insightsRes.json()
        setInsights(data.data.insights || [])
      }

      if (alertsRes.ok) {
        const data = await alertsRes.json()
        setAlerts(data.data.alerts || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    // Refresh every 60 seconds
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [fetchData])

  // Run all agents
  const runAllAgents = async () => {
    setRunning(true)
    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runAll: true }),
      })

      if (res.ok) {
        // Refresh data after run
        await fetchData()
      }
    } catch (error) {
      console.error('Failed to run agents:', error)
    } finally {
      setRunning(false)
    }
  }

  // Acknowledge alert
  const acknowledgeAlert = async (alertId: string) => {
    try {
      await fetch('/api/agents/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId }),
      })
      setAlerts(alerts.filter(a => a.id !== alertId))
    } catch (error) {
      console.error('Failed to acknowledge alert:', error)
    }
  }

  // Filter insights
  const filteredInsights = insights.filter(insight => {
    if (selectedType !== 'all' && insight.agentType !== selectedType) return false
    if (selectedPriority !== 'all' && insight.priority !== selectedPriority) return false
    if (selectedInsightType !== 'all' && insight.insightType !== selectedInsightType) return false
    return true
  })

  // Calculate summary stats
  const criticalCount = insights.filter(i => i.priority === 'critical').length
  const highCount = insights.filter(i => i.priority === 'high').length
  const whiteSpaceCount = insights.filter(i => i.insightType === 'white-space').length
  const investmentTotal = insights
    .filter(i => i.investmentData?.amount)
    .reduce((sum, i) => sum + (i.investmentData?.amount || 0), 0)

  if (loading) {
    return (
      <main style={styles.main}>
        <AppNav />
        <div style={styles.container}>
          <div style={styles.loading}>Loading agent data...</div>
        </div>
      </main>
    )
  }

  return (
    <main style={styles.main}>
      <AppNav />

      <div style={styles.container}>
        {/* Header */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>
              <span style={{ color: COLORS.accent }}>Intelligence</span>
            </h1>
            <p style={styles.subtitle}>
              Build Clock — AI agents &amp; signals (OT Vantage layer)
            </p>
          </div>
          <div style={styles.headerActions}>
            <button
              onClick={runAllAgents}
              disabled={running}
              style={{
                ...styles.runButton,
                opacity: running ? 0.5 : 1,
              }}
            >
              {running ? 'Running...' : 'Run All Agents'}
            </button>
          </div>
        </header>

        {/* Alerts Banner */}
        {alerts.length > 0 && (
          <div style={styles.alertsBanner}>
            <div style={styles.alertsHeader}>
              <span style={styles.alertsIcon}>!</span>
              <span>{alerts.length} unacknowledged alert{alerts.length > 1 ? 's' : ''}</span>
            </div>
            <div style={styles.alertsList}>
              {alerts.slice(0, 3).map(alert => (
                <div key={alert.id} style={styles.alertItem}>
                  <span style={{ color: PRIORITY_COLORS[alert.priority] }}>
                    [{alert.priority.toUpperCase()}]
                  </span>
                  <span style={styles.alertTitle}>{alert.title}</span>
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    style={styles.alertAck}
                  >
                    Dismiss
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={{ ...styles.statValue, color: COLORS.accent }}>
              {metrics?.totalAgents || 0}
            </div>
            <div style={styles.statLabel}>Active Agents</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statValue, color: COLORS.blue }}>
              {metrics?.totalInsights || 0}
            </div>
            <div style={styles.statLabel}>Total Insights</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statValue, color: COLORS.danger }}>
              {criticalCount + highCount}
            </div>
            <div style={styles.statLabel}>High Priority</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statValue, color: COLORS.accent }}>
              {whiteSpaceCount}
            </div>
            <div style={styles.statLabel}>White Spaces</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statValue, color: COLORS.blue }}>
              ${investmentTotal >= 1000 ? (investmentTotal / 1000).toFixed(0) + 'B' : investmentTotal + 'M'}
            </div>
            <div style={styles.statLabel}>Investments Tracked</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statValue, color: COLORS.purple }}>
              {((metrics?.averageConfidence || 0) * 100).toFixed(0)}%
            </div>
            <div style={styles.statLabel}>Avg Confidence</div>
          </div>
        </div>

        {/* Agent Status Grid */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Agent Status</h2>
          <div style={styles.agentGrid}>
            {agents.map(agent => (
              <div
                key={agent.agentId}
                style={{
                  ...styles.agentCard,
                  borderLeftColor: agent.status === 'running' ? COLORS.accent :
                                   agent.status === 'error' ? COLORS.danger :
                                   agent.status === 'disabled' ? COLORS.textMuted : COLORS.blue,
                }}
              >
                <div style={styles.agentHeader}>
                  <span style={styles.agentName}>
                    {formatAgentName(agent.agentId)}
                  </span>
                  <span style={{
                    ...styles.agentStatus,
                    color: agent.status === 'running' ? COLORS.accent :
                           agent.status === 'error' ? COLORS.danger :
                           agent.status === 'disabled' ? COLORS.textMuted : COLORS.blue,
                  }}>
                    {agent.status}
                  </span>
                </div>
                <div style={styles.agentMeta}>
                  <span>Health: {agent.healthScore}%</span>
                  <span>Last: {agent.insightsFoundLastRun} insights</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Filters */}
        <section style={styles.section}>
          <div style={styles.filters}>
            <div style={styles.filterGroup}>
              <span style={styles.filterLabel}>Agent Type:</span>
              {['all', 'strategic', 'sector', 'capability'].map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  style={{
                    ...styles.filterBtn,
                    ...(selectedType === type ? styles.filterBtnActive : {}),
                  }}
                >
                  {type === 'all' ? 'All' : AGENT_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
            <div style={styles.filterGroup}>
              <span style={styles.filterLabel}>Priority:</span>
              {['all', 'critical', 'high', 'medium', 'low'].map(priority => (
                <button
                  key={priority}
                  onClick={() => setSelectedPriority(priority)}
                  style={{
                    ...styles.filterBtn,
                    ...(selectedPriority === priority ? styles.filterBtnActive : {}),
                    ...(selectedPriority === priority && priority !== 'all' ? {
                      backgroundColor: PRIORITY_COLORS[priority] + '22',
                      borderColor: PRIORITY_COLORS[priority],
                      color: PRIORITY_COLORS[priority],
                    } : {}),
                  }}
                >
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </button>
              ))}
            </div>
            <div style={styles.filterGroup}>
              <span style={styles.filterLabel}>Type:</span>
              {['all', 'white-space', 'investment', 'action', 'signal', 'policy'].map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedInsightType(type)}
                  style={{
                    ...styles.filterBtn,
                    ...(selectedInsightType === type ? styles.filterBtnActive : {}),
                    ...(selectedInsightType === type && type !== 'all' ? {
                      backgroundColor: (INSIGHT_TYPE_COLORS[type] || COLORS.accent) + '22',
                      borderColor: INSIGHT_TYPE_COLORS[type] || COLORS.accent,
                      color: INSIGHT_TYPE_COLORS[type] || COLORS.accent,
                    } : {}),
                  }}
                >
                  {type === 'all' ? 'All' : formatInsightType(type)}
                </button>
              ))}
            </div>
            <div style={styles.filterCount}>
              {filteredInsights.length} insights
            </div>
          </div>
        </section>

        {/* Insights Feed */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Insights Feed</h2>
          <div style={styles.insightsFeed}>
            {filteredInsights.length === 0 ? (
              <div style={styles.emptyState}>
                No insights match your filters. Try running the agents or adjusting filters.
              </div>
            ) : (
              filteredInsights.map(insight => (
                <div
                  key={insight.id}
                  style={{
                    ...styles.insightCard,
                    borderLeftColor: PRIORITY_COLORS[insight.priority],
                  }}
                  onClick={() => setExpandedInsight(
                    expandedInsight === insight.id ? null : insight.id
                  )}
                >
                  <div style={styles.insightHeader}>
                    <div style={styles.insightTags}>
                      <span style={{
                        ...styles.insightTag,
                        backgroundColor: PRIORITY_COLORS[insight.priority] + '22',
                        color: PRIORITY_COLORS[insight.priority],
                      }}>
                        {insight.priority}
                      </span>
                      <span style={{
                        ...styles.insightTag,
                        backgroundColor: (INSIGHT_TYPE_COLORS[insight.insightType] || COLORS.accent) + '22',
                        color: INSIGHT_TYPE_COLORS[insight.insightType] || COLORS.accent,
                      }}>
                        {formatInsightType(insight.insightType)}
                      </span>
                      <span style={styles.insightTagMuted}>
                        {formatAgentName(insight.agentId)}
                      </span>
                    </div>
                    <div style={styles.insightMeta}>
                      <span>Confidence: {(insight.confidence * 100).toFixed(0)}%</span>
                      <span>Impact: {insight.impactScore}/10</span>
                    </div>
                  </div>
                  
                  <h3 style={styles.insightTitle}>{insight.title}</h3>
                  <p style={styles.insightSummary}>{insight.summary}</p>
                  
                  {insight.relevantSectors.length > 0 && (
                    <div style={styles.insightSectors}>
                      {insight.relevantSectors.map(sector => (
                        <span key={sector} style={styles.sectorTag}>{sector}</span>
                      ))}
                    </div>
                  )}
                  
                  {expandedInsight === insight.id && (
                    <div style={styles.expandedContent}>
                      {insight.suggestedActions.length > 0 && (
                        <div style={styles.actionsSection}>
                          <h4 style={styles.actionsTitle}>Suggested Actions</h4>
                          {insight.suggestedActions.map((action, idx) => (
                            <div key={idx} style={styles.actionItem}>
                              <span style={{
                                ...styles.urgencyBadge,
                                backgroundColor: action.urgency === 'immediate' ? COLORS.danger + '22' :
                                                action.urgency === 'short-term' ? COLORS.warning + '22' : COLORS.blue + '22',
                                color: action.urgency === 'immediate' ? COLORS.danger :
                                       action.urgency === 'short-term' ? COLORS.warning : COLORS.blue,
                              }}>
                                {action.urgency}
                              </span>
                              <span>{action.action}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {insight.investmentData && (
                        <div style={styles.dataSection}>
                          <h4 style={styles.dataSectionTitle}>Investment Data</h4>
                          {insight.investmentData.amount && (
                            <div>Amount: ${insight.investmentData.amount >= 1000 
                              ? (insight.investmentData.amount / 1000).toFixed(1) + 'B' 
                              : insight.investmentData.amount + 'M'}</div>
                          )}
                          {insight.investmentData.investmentType && (
                            <div>Type: {insight.investmentData.investmentType}</div>
                          )}
                          {insight.investmentData.recipient && (
                            <div>Recipient: {insight.investmentData.recipient}</div>
                          )}
                        </div>
                      )}
                      
                      {insight.whiteSpaceData && (
                        <div style={styles.dataSection}>
                          <h4 style={styles.dataSectionTitle}>White Space Data</h4>
                          {insight.whiteSpaceData.competitorPresence && (
                            <div>Competitor Presence: {insight.whiteSpaceData.competitorPresence}</div>
                          )}
                          {insight.whiteSpaceData.windowOfOpportunity && (
                            <div>Window: {insight.whiteSpaceData.windowOfOpportunity}</div>
                          )}
                        </div>
                      )}
                      
                      {insight.sources.length > 0 && (
                        <div style={styles.sourcesSection}>
                          <h4 style={styles.sourcesTitle}>Sources</h4>
                          {insight.sources.map((source, idx) => (
                            <a
                              key={idx}
                              href={source.url}
                              target="_blank"
                              rel="noreferrer"
                              style={styles.sourceLink}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {source.title} ↗
                            </a>
                          ))}
                        </div>
                      )}
                      
                      <div style={styles.insightFooter}>
                        Discovered: {new Date(insight.discoveredAt).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Footer */}
        <footer style={styles.footer}>
          Internal Use Only • Deloitte Consulting LLP • Strategic Subagent System
        </footer>
      </div>
    </main>
  )
}

// ============================================================================
// HELPERS
// ============================================================================

function formatAgentName(agentId: string): string {
  return agentId
    .replace(/-agent$/, '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatInsightType(type: string): string {
  return type
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// ============================================================================
// STYLES
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: '100vh',
    backgroundColor: COLORS.bg,
    color: COLORS.text,
    fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '8.75rem 2rem 2rem',
  },
  loading: {
    textAlign: 'center',
    padding: '4rem',
    color: COLORS.textMuted,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
    paddingBottom: '1.5rem',
    borderBottom: `1px solid ${COLORS.border}`,
  },
  title: {
    fontSize: '2rem',
    fontWeight: 800,
    margin: 0,
    lineHeight: 1.2,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: '0.9rem',
    marginTop: '0.5rem',
  },
  headerActions: {
    display: 'flex',
    gap: '1rem',
  },
  runButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: COLORS.accent,
    color: COLORS.bg,
    border: 'none',
    borderRadius: '6px',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontFamily: 'inherit',
  },
  alertsBanner: {
    backgroundColor: COLORS.danger + '15',
    border: `1px solid ${COLORS.danger}33`,
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1.5rem',
  },
  alertsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
    fontWeight: 600,
    color: COLORS.danger,
  },
  alertsIcon: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: COLORS.danger,
    color: COLORS.bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 700,
  },
  alertsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  alertItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.85rem',
  },
  alertTitle: {
    flex: 1,
    color: COLORS.text,
  },
  alertAck: {
    padding: '0.25rem 0.5rem',
    backgroundColor: 'transparent',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '4px',
    color: COLORS.textMuted,
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontFamily: 'inherit',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    padding: '1.25rem',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '1.75rem',
    fontWeight: 700,
    marginBottom: '0.25rem',
  },
  statLabel: {
    fontSize: '0.7rem',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  section: {
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    marginBottom: '1rem',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  agentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1rem',
  },
  agentCard: {
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderLeft: '3px solid',
    borderRadius: '6px',
    padding: '1rem',
  },
  agentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  agentName: {
    fontWeight: 600,
    fontSize: '0.85rem',
  },
  agentStatus: {
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  agentMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    color: COLORS.textMuted,
  },
  filters: {
    display: 'flex',
    gap: '2rem',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: '1rem',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  filterLabel: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  filterBtn: {
    padding: '0.4rem 0.8rem',
    fontSize: '0.75rem',
    backgroundColor: 'transparent',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '4px',
    color: COLORS.textMuted,
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
  },
  filterBtnActive: {
    backgroundColor: COLORS.accent + '22',
    borderColor: COLORS.accent,
    color: COLORS.accent,
  },
  filterCount: {
    fontSize: '0.85rem',
    color: COLORS.textMuted,
    marginLeft: 'auto',
  },
  insightsFeed: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    color: COLORS.textMuted,
    backgroundColor: COLORS.bgCard,
    borderRadius: '8px',
    border: `1px solid ${COLORS.border}`,
  },
  insightCard: {
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderLeft: '3px solid',
    borderRadius: '8px',
    padding: '1.25rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  insightHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.75rem',
  },
  insightTags: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  insightTag: {
    padding: '0.2rem 0.5rem',
    fontSize: '0.65rem',
    borderRadius: '4px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  insightTagMuted: {
    padding: '0.2rem 0.5rem',
    fontSize: '0.65rem',
    borderRadius: '4px',
    backgroundColor: COLORS.border,
    color: COLORS.textMuted,
  },
  insightMeta: {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.75rem',
    color: COLORS.textMuted,
  },
  insightTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    margin: '0 0 0.5rem 0',
  },
  insightSummary: {
    fontSize: '0.85rem',
    color: COLORS.textMuted,
    margin: 0,
    lineHeight: 1.5,
  },
  insightSectors: {
    display: 'flex',
    gap: '0.35rem',
    marginTop: '0.75rem',
    flexWrap: 'wrap',
  },
  sectorTag: {
    padding: '0.15rem 0.4rem',
    fontSize: '0.65rem',
    borderRadius: '3px',
    backgroundColor: COLORS.purple + '22',
    color: COLORS.purple,
  },
  expandedContent: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: `1px solid ${COLORS.border}`,
  },
  actionsSection: {
    marginBottom: '1rem',
  },
  actionsTitle: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '0.5rem',
  },
  actionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.5rem',
    fontSize: '0.85rem',
  },
  urgencyBadge: {
    padding: '0.15rem 0.4rem',
    fontSize: '0.6rem',
    borderRadius: '3px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: 600,
  },
  dataSection: {
    backgroundColor: COLORS.bg,
    padding: '0.75rem',
    borderRadius: '6px',
    marginBottom: '1rem',
    fontSize: '0.85rem',
  },
  dataSectionTitle: {
    fontSize: '0.7rem',
    fontWeight: 600,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '0.5rem',
  },
  sourcesSection: {
    marginTop: '1rem',
  },
  sourcesTitle: {
    fontSize: '0.7rem',
    fontWeight: 600,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '0.5rem',
  },
  sourceLink: {
    display: 'block',
    color: COLORS.blue,
    fontSize: '0.8rem',
    textDecoration: 'none',
    marginBottom: '0.25rem',
  },
  insightFooter: {
    marginTop: '1rem',
    fontSize: '0.7rem',
    color: COLORS.textMuted,
  },
  footer: {
    marginTop: '3rem',
    paddingTop: '1.5rem',
    borderTop: `1px solid ${COLORS.border}`,
    textAlign: 'center',
    fontSize: '0.75rem',
    color: COLORS.textMuted,
  },
}
