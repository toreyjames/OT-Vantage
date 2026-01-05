'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { PolicyUpdate, OpportunitySignal, SystemStatus } from '@/lib/services/types'

// Colors
const COLORS = {
  bg: '#0a0a0a',
  bgCard: '#141414',
  border: '#262626',
  text: '#fafafa',
  textMuted: '#a1a1aa',
  accent: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  purple: '#8b5cf6',
}

// Policy labels
const POLICY_LABELS: Record<string, { label: string; color: string }> = {
  'eo-14179-ai-leadership': { label: 'AI Leadership', color: '#22c55e' },
  'genesis-mission': { label: 'Genesis', color: '#8b5cf6' },
  'stargate-project': { label: 'Stargate', color: '#f59e0b' },
  'chips-sovereignty': { label: 'CHIPS', color: '#3b82f6' },
  'energy-dominance': { label: 'Energy', color: '#06b6d4' },
  'nuclear-restart': { label: 'Nuclear', color: '#ec4899' },
  'ai-action-plan': { label: 'AI Action Plan', color: '#84cc16' },
  'eo-14365-national-ai-framework': { label: 'AI Framework', color: '#a855f7' },
}

export default function MonitorPage() {
  const [policyUpdates, setPolicyUpdates] = useState<PolicyUpdate[]>([])
  const [opportunities, setOpportunities] = useState<OpportunitySignal[]>([])
  const [insights, setInsights] = useState<string[]>([])
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/feeds?type=all')
      const data = await response.json()
      
      if (data.success) {
        setPolicyUpdates(data.data.policyUpdates || [])
        setOpportunities(data.data.opportunitySignals || [])
        setInsights(data.data.insights || [])
        setStatus(data.data.status)
        setLastRefresh(new Date())
        setError(null)
      } else {
        setError(data.error || 'Failed to fetch data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!autoRefresh) return
    
    const interval = setInterval(fetchData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [autoRefresh, fetchData])

  const formatTimeAgo = (date: Date | string) => {
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const formatCurrency = (value?: number) => {
    if (!value) return 'N/A'
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}B`
    return `$${value}M`
  }

  return (
    <main style={styles.main}>
      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navBrand}>
          <div style={styles.brandIcon}>⚡</div>
          <span style={styles.brandText}>Build Clock</span>
        </div>
        <div style={styles.navLinks}>
          <Link href="/radar" style={styles.navLink}>Radar</Link>
          <Link href="/scoreboard" style={styles.navLink}>Scoreboard</Link>
          <Link href="/monitor" style={{ ...styles.navLink, ...styles.navLinkActive }}>Monitor</Link>
        </div>
      </nav>

      <div style={styles.container}>
        {/* BLUF Statement */}
        <div style={styles.blufSection}>
          <h1 style={styles.blufTitle}>Always-On Intelligence</h1>
          <p style={styles.blufStatement}>
            Continuously scanning Federal Register, White House announcements, agency news, and market signals 
            to detect policy changes and investment opportunities aligned to the AI Manhattan Project thesis.
          </p>
          <div style={styles.blufPurpose}>
            <span style={styles.blufPurposeItem}>🎯 <strong>Purpose:</strong> Never miss a policy shift or opportunity</span>
            <span style={styles.blufPurposeItem}>⚡ <strong>Speed:</strong> Real-time detection, 5-minute refresh cycles</span>
            <span style={styles.blufPurposeItem}>🤖 <strong>AI-Powered:</strong> Auto-classifies relevance to CHIPS, Stargate, Nuclear, Energy policies</span>
          </div>
        </div>

        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerTop}>
            <div>
              <h1 style={styles.title}>🔴 Live Monitor</h1>
              <p style={styles.subtitle}>Real-time policy & opportunity tracking</p>
            </div>
            <div style={styles.headerControls}>
              <button 
                style={styles.refreshBtn}
                onClick={fetchData}
                disabled={loading}
              >
                {loading ? '⟳ Refreshing...' : '⟳ Refresh Now'}
              </button>
              <button 
                style={{
                  ...styles.autoRefreshBtn,
                  backgroundColor: autoRefresh ? COLORS.accent : COLORS.bgCard
                }}
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? '● Auto-Refresh ON' : '○ Auto-Refresh OFF'}
              </button>
            </div>
          </div>
          
          {lastRefresh && (
            <div style={styles.lastRefresh}>
              Last updated: {lastRefresh.toLocaleTimeString()} ({formatTimeAgo(lastRefresh)})
            </div>
          )}
        </header>

        {/* Status Cards */}
        {status && (
          <div style={styles.statusGrid}>
            <div style={styles.statusCard}>
              <div style={styles.statusValue}>{status.policiesMonitored}</div>
              <div style={styles.statusLabel}>Policy Updates</div>
            </div>
            <div style={styles.statusCard}>
              <div style={{...styles.statusValue, color: COLORS.warning}}>{status.opportunitiesDiscovered}</div>
              <div style={styles.statusLabel}>Opportunities Found</div>
            </div>
            <div style={styles.statusCard}>
              <div style={{...styles.statusValue, color: COLORS.danger}}>{status.pendingReview}</div>
              <div style={styles.statusLabel}>Pending Review</div>
            </div>
            <div style={styles.statusCard}>
              <div style={{...styles.statusValue, color: COLORS.info}}>{status.feedsActive}</div>
              <div style={styles.statusLabel}>Active Feeds</div>
            </div>
          </div>
        )}

        {/* AI Insights */}
        {insights.length > 0 && (
          <div style={styles.insightsSection}>
            <h2 style={styles.sectionTitle}>🤖 AI Insights</h2>
            <div style={styles.insightsList}>
              {insights.map((insight, i) => (
                <div key={i} style={styles.insightItem}>{insight}</div>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div style={styles.errorBox}>
            ⚠️ Error: {error}
          </div>
        )}

        {/* Two Column Layout */}
        <div style={styles.columns}>
          {/* Policy Updates */}
          <div style={styles.column}>
            <h2 style={styles.sectionTitle}>📜 Policy Updates</h2>
            <div style={styles.feedList}>
              {policyUpdates.length === 0 && !loading && (
                <div style={styles.emptyState}>No policy updates found</div>
              )}
              {policyUpdates.map((update) => (
                <div key={update.id} style={styles.feedItem}>
                  <div style={styles.feedHeader}>
                    <span style={styles.feedSource}>{update.source}</span>
                    <span style={styles.feedTime}>{formatTimeAgo(update.publishedAt)}</span>
                  </div>
                  <h3 style={styles.feedTitle}>{update.title}</h3>
                  <p style={styles.feedSummary}>{update.summary}</p>
                  <div style={styles.feedPolicies}>
                    {update.relevantPolicies.map((policy) => (
                      <span 
                        key={policy} 
                        style={{
                          ...styles.policyBadge,
                          backgroundColor: POLICY_LABELS[policy]?.color + '20',
                          color: POLICY_LABELS[policy]?.color
                        }}
                      >
                        {POLICY_LABELS[policy]?.label || policy}
                      </span>
                    ))}
                  </div>
                  <div style={styles.feedMeta}>
                    <span style={styles.impactScore}>
                      Impact: {update.impactScore}/10
                    </span>
                    <a href={update.sourceUrl} target="_blank" rel="noopener" style={styles.feedLink}>
                      View Source →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Opportunity Signals */}
          <div style={styles.column}>
            <h2 style={styles.sectionTitle}>🎯 Opportunity Signals</h2>
            <div style={styles.feedList}>
              {opportunities.length === 0 && !loading && (
                <div style={styles.emptyState}>No opportunity signals found</div>
              )}
              {opportunities.map((opp) => (
                <div key={opp.id} style={styles.feedItem}>
                  <div style={styles.feedHeader}>
                    <span style={styles.feedSource}>{opp.source}</span>
                    <span style={{
                      ...styles.confidenceBadge,
                      backgroundColor: opp.confidenceScore >= 0.8 ? COLORS.accent : 
                                       opp.confidenceScore >= 0.6 ? COLORS.warning : COLORS.textMuted
                    }}>
                      {Math.round(opp.confidenceScore * 100)}% match
                    </span>
                  </div>
                  <h3 style={styles.feedTitle}>
                    {opp.company && <span style={styles.companyName}>{opp.company}: </span>}
                    {opp.title}
                  </h3>
                  <p style={styles.feedSummary}>{opp.summary}</p>
                  <div style={styles.oppDetails}>
                    {opp.estimatedValue && (
                      <span style={styles.oppValue}>{formatCurrency(opp.estimatedValue)}</span>
                    )}
                    {opp.location && (
                      <span style={styles.oppLocation}>📍 {opp.location.state}</span>
                    )}
                    <span style={styles.oppSector}>{opp.sector}</span>
                  </div>
                  <div style={styles.feedPolicies}>
                    {opp.relevantPolicies.map((policy) => (
                      <span 
                        key={policy} 
                        style={{
                          ...styles.policyBadge,
                          backgroundColor: POLICY_LABELS[policy]?.color + '20',
                          color: POLICY_LABELS[policy]?.color
                        }}
                      >
                        {POLICY_LABELS[policy]?.label || policy}
                      </span>
                    ))}
                  </div>
                  <div style={styles.feedMeta}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: opp.status === 'new' ? COLORS.warning : COLORS.accent
                    }}>
                      {opp.status}
                    </span>
                    <a href={opp.sourceUrl} target="_blank" rel="noopener" style={styles.feedLink}>
                      View Source →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feed Sources */}
        <div style={styles.feedSources}>
          <h2 style={styles.sectionTitle}>📡 Feed Sources</h2>
          <div style={styles.sourcesList}>
            <div style={styles.sourceItem}>
              <span style={{...styles.sourceStatus, backgroundColor: COLORS.accent}}>●</span>
              Federal Register API
            </div>
            <div style={styles.sourceItem}>
              <span style={{...styles.sourceStatus, backgroundColor: COLORS.accent}}>●</span>
              White House RSS
            </div>
            <div style={styles.sourceItem}>
              <span style={{...styles.sourceStatus, backgroundColor: COLORS.accent}}>●</span>
              Dept. of Energy News
            </div>
            <div style={styles.sourceItem}>
              <span style={{...styles.sourceStatus, backgroundColor: COLORS.accent}}>●</span>
              Dept. of Commerce News
            </div>
            <div style={styles.sourceItem}>
              <span style={{...styles.sourceStatus, backgroundColor: COLORS.accent}}>●</span>
              Google News (Filtered)
            </div>
            <div style={styles.sourceItem}>
              <span style={{...styles.sourceStatus, backgroundColor: COLORS.textMuted}}>○</span>
              SEC EDGAR (Coming Soon)
            </div>
            <div style={styles.sourceItem}>
              <span style={{...styles.sourceStatus, backgroundColor: COLORS.textMuted}}>○</span>
              SAM.gov Contracts (Coming Soon)
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: '100vh',
    backgroundColor: COLORS.bg,
    color: COLORS.text,
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  blufSection: {
    marginBottom: '2rem',
    padding: '2rem',
    background: `linear-gradient(135deg, ${COLORS.danger}15 0%, ${COLORS.bgCard} 100%)`,
    border: `1px solid ${COLORS.danger}40`,
    borderRadius: '16px',
    textAlign: 'center',
  },
  blufTitle: {
    fontSize: '2.5rem',
    fontWeight: 900,
    marginBottom: '0.75rem',
    background: `linear-gradient(135deg, ${COLORS.text} 0%, ${COLORS.danger} 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  blufStatement: {
    fontSize: '1.125rem',
    color: COLORS.textMuted,
    maxWidth: '900px',
    margin: '0 auto 1.5rem',
    lineHeight: 1.6,
  },
  blufPurpose: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '1.5rem',
  },
  blufPurposeItem: {
    fontSize: '0.875rem',
    color: COLORS.text,
    padding: '0.5rem 1rem',
    backgroundColor: COLORS.bg,
    borderRadius: '8px',
    border: `1px solid ${COLORS.border}`,
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    borderBottom: `1px solid ${COLORS.border}`,
    position: 'sticky',
    top: 0,
    backgroundColor: COLORS.bg,
    zIndex: 100,
  },
  navBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  brandIcon: {
    fontSize: '1.5rem',
  },
  brandText: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: COLORS.accent,
  },
  navLinks: {
    display: 'flex',
    gap: '1rem',
  },
  navLink: {
    padding: '0.5rem 1rem',
    color: COLORS.textMuted,
    textDecoration: 'none',
    borderRadius: '8px',
    transition: 'all 0.2s',
  },
  navLinkActive: {
    backgroundColor: COLORS.danger,
    color: COLORS.text,
  },
  container: {
    maxWidth: '1600px',
    margin: '0 auto',
    padding: '2rem',
  },
  header: {
    marginBottom: '2rem',
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 800,
    marginBottom: '0.25rem',
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: '1rem',
  },
  headerControls: {
    display: 'flex',
    gap: '0.75rem',
  },
  refreshBtn: {
    padding: '0.75rem 1.25rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    color: COLORS.text,
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  autoRefreshBtn: {
    padding: '0.75rem 1.25rem',
    border: 'none',
    borderRadius: '8px',
    color: COLORS.bg,
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 600,
  },
  lastRefresh: {
    marginTop: '0.75rem',
    fontSize: '0.8125rem',
    color: COLORS.textMuted,
  },
  statusGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statusCard: {
    padding: '1.25rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
    textAlign: 'center',
  },
  statusValue: {
    fontSize: '2rem',
    fontWeight: 800,
    color: COLORS.accent,
    fontFamily: "'JetBrains Mono', monospace",
  },
  statusLabel: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
    marginTop: '0.25rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  insightsSection: {
    marginBottom: '2rem',
    padding: '1.5rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
  },
  sectionTitle: {
    fontSize: '1.125rem',
    fontWeight: 700,
    marginBottom: '1rem',
  },
  insightsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  insightItem: {
    padding: '0.75rem 1rem',
    backgroundColor: COLORS.bg,
    borderRadius: '8px',
    fontSize: '0.9375rem',
  },
  errorBox: {
    padding: '1rem',
    backgroundColor: COLORS.danger + '20',
    border: `1px solid ${COLORS.danger}`,
    borderRadius: '8px',
    color: COLORS.danger,
    marginBottom: '2rem',
  },
  columns: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '2rem',
    marginBottom: '2rem',
  },
  column: {
    minWidth: 0,
  },
  feedList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    maxHeight: '600px',
    overflowY: 'auto',
  },
  emptyState: {
    padding: '2rem',
    textAlign: 'center',
    color: COLORS.textMuted,
    backgroundColor: COLORS.bgCard,
    borderRadius: '12px',
  },
  feedItem: {
    padding: '1.25rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
  },
  feedHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  feedSource: {
    fontSize: '0.6875rem',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  feedTime: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
  },
  feedTitle: {
    fontSize: '0.9375rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
    lineHeight: 1.4,
  },
  companyName: {
    color: COLORS.accent,
  },
  feedSummary: {
    fontSize: '0.8125rem',
    color: COLORS.textMuted,
    lineHeight: 1.5,
    marginBottom: '0.75rem',
  },
  feedPolicies: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.375rem',
    marginBottom: '0.75rem',
  },
  policyBadge: {
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: 600,
  },
  feedMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  impactScore: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
  },
  feedLink: {
    fontSize: '0.75rem',
    color: COLORS.accent,
    textDecoration: 'none',
  },
  confidenceBadge: {
    padding: '0.125rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: 600,
    color: COLORS.bg,
  },
  oppDetails: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '0.5rem',
    flexWrap: 'wrap',
  },
  oppValue: {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: COLORS.accent,
    fontFamily: "'JetBrains Mono', monospace",
  },
  oppLocation: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
  },
  oppSector: {
    fontSize: '0.6875rem',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  statusBadge: {
    padding: '0.125rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: 600,
    color: COLORS.bg,
    textTransform: 'uppercase',
  },
  feedSources: {
    padding: '1.5rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
  },
  sourcesList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  sourceItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    color: COLORS.textMuted,
  },
  sourceStatus: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    display: 'inline-block',
  },
}

