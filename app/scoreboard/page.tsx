'use client'

import Link from 'next/link'
import { opportunities } from '../../lib/data/opportunities'

// ============================================================================
// COLORS & THEME
// ============================================================================
const COLORS = {
  bg: '#0a0f14',
  bgCard: '#0d1117',
  border: '#21262d',
  text: '#e6edf3',
  textMuted: '#7d8590',
  accent: '#7ee787',
  warning: '#d29922',
  danger: '#f85149',
  blue: '#58a6ff',
  purple: '#a371f7',
}

// ============================================================================
// NECESSARY FOR SUCCESS METRICS
// ============================================================================
const NFS_METRICS = {
  pipeline: {
    target: 150000, // $150M in millions
    current: 114000, // $114M
    label: 'AI Pipeline Value',
    targetLabel: 'Target: $150M qualified pipeline',
    gap: 36000, // $36M gap
    trend: '+24% MoM',
    trendPositive: true,
  },
  winRate: {
    target: 40, // 40%
    current: 34, // 34%
    label: 'GenAI Win Rate',
    targetLabel: 'Target: 40% conversion',
    vsTraditional: '+12%',
    competitiveWins: '7 of 9',
  },
  velocity: {
    target: 60, // 60 days
    current: 78, // 78 days
    label: 'Deal Velocity',
    targetLabel: 'Target: 60 days for $5M+ deals',
    bottleneck: 'Security Review',
    improvement: '↓ 12 days',
  },
  accounts: {
    target: 50,
    current: 41,
    label: 'AI-Ready Accounts',
    targetLabel: 'Target: 50 enterprise accounts engaged',
    multiAIDeals: 8,
    newThisQuarter: 6,
  },
}

// Calculate from actual opportunities data
const calculateMetrics = () => {
  const otCoreOpps = opportunities.filter(o => o.otRelevance === 'core')
  const activePursuit = opportunities.filter(o => 
    ['active-pursuit', 'teaming', 'incumbent'].includes(o.deloitteRelationship)
  )
  
  // Estimate weighted pipeline (using investment size as proxy)
  const weightedPipeline = opportunities.reduce((sum, o) => {
    // Rough probability estimate based on relationship
    let prob = 0.3
    if (o.deloitteRelationship === 'incumbent') prob = 0.9
    else if (o.deloitteRelationship === 'active-pursuit') prob = 0.6
    else if (o.deloitteRelationship === 'teaming') prob = 0.5
    else if (o.deloitteRelationship === 'known') prob = 0.4
    
    return sum + (o.investmentSize * prob)
  }, 0)

  return {
    otCoreCount: otCoreOpps.length,
    activePursuitCount: activePursuit.length,
    weightedPipeline,
  }
}

const calculated = calculateMetrics()

// ============================================================================
// PRIORITY ACTIONS
// ============================================================================
const PRIORITY_ACTIONS = [
  {
    priority: 'urgent',
    title: 'Insurance Giant — Contract Execution',
    description: '$7.1M Claims AI deal — redlines resolved, ready for signature',
    owner: 'Sarah Chen',
    due: 'Due Today',
  },
  {
    priority: 'high',
    title: 'Auto Manufacturer — Board Presentation',
    description: '$15M Autonomous Systems deal — need executive alignment',
    owner: 'Lisa Park',
    due: 'This Week',
  },
  {
    priority: 'high',
    title: 'Global Pharma — Regulatory Alignment',
    description: '$8.2M Drug Discovery AI — compliance blocker needs resolution',
    owner: 'Mike Rodriguez',
    due: 'This Week',
  },
  {
    priority: 'medium',
    title: 'Telecom Leader — Orals Prep',
    description: '$6.5M Network AI RFP — competitive presentation next week',
    owner: 'James Wilson',
    due: 'Next Week',
  },
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function ScoreboardPage() {
  const formatCurrency = (millions: number) => {
    if (millions >= 1000) return '$' + (millions / 1000).toFixed(1) + 'B'
    return '$' + millions + 'M'
  }

  const getProgressPercent = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  return (
    <main style={styles.main}>
      <nav style={styles.nav}>
        <div style={styles.navBrand}>
          <div style={styles.brandIcon}>⚡</div>
          <span style={styles.brandText}>Build Clock</span>
        </div>
        <div style={styles.navLinks}>
          <Link href="/radar" style={styles.navLink}>
            Radar
          </Link>
          <Link href="/scoreboard" style={{ ...styles.navLink, ...styles.navLinkActive }}>
            Scoreboard
          </Link>
        </div>
      </nav>

      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>Necessary for Success</h1>
            <p style={styles.subtitle}>
              AI Manhattan Project — tracking what matters
            </p>
          </div>
        </header>

        {/* NFS Metrics Grid */}
        <div style={styles.nfsGrid}>
          {/* Pipeline Value */}
          <div style={styles.nfsCard}>
            <div style={styles.nfsHeader}>
              <div style={{ ...styles.nfsIcon, backgroundColor: COLORS.accent + '22', color: COLORS.accent }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <div style={styles.nfsTitle}>
                <h3>{NFS_METRICS.pipeline.label}</h3>
                <span style={styles.nfsTarget}>{NFS_METRICS.pipeline.targetLabel}</span>
              </div>
            </div>
            <div style={styles.nfsProgress}>
              <div style={styles.progressBar}>
                <div style={{
                  ...styles.progressFill,
                  width: `${getProgressPercent(NFS_METRICS.pipeline.current, NFS_METRICS.pipeline.target)}%`,
                }} />
              </div>
              <div style={styles.progressStats}>
                <span style={styles.progressCurrent}>{formatCurrency(NFS_METRICS.pipeline.current)}</span>
                <span style={styles.progressPercent}>
                  {Math.round(getProgressPercent(NFS_METRICS.pipeline.current, NFS_METRICS.pipeline.target))}%
                </span>
              </div>
            </div>
            <div style={styles.nfsInsights}>
              <div style={styles.insight}>
                <span style={styles.insightLabel}>Gap to Target</span>
                <span style={{ ...styles.insightValue, color: COLORS.danger }}>
                  {formatCurrency(NFS_METRICS.pipeline.gap)}
                </span>
              </div>
              <div style={styles.insight}>
                <span style={styles.insightLabel}>Trend</span>
                <span style={{ ...styles.insightValue, color: COLORS.accent }}>
                  ↑ {NFS_METRICS.pipeline.trend}
                </span>
              </div>
            </div>
          </div>

          {/* Win Rate */}
          <div style={styles.nfsCard}>
            <div style={styles.nfsHeader}>
              <div style={{ ...styles.nfsIcon, backgroundColor: COLORS.purple + '22', color: COLORS.purple }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20V10M18 20V4M6 20v-4"/>
                </svg>
              </div>
              <div style={styles.nfsTitle}>
                <h3>{NFS_METRICS.winRate.label}</h3>
                <span style={styles.nfsTarget}>{NFS_METRICS.winRate.targetLabel}</span>
              </div>
            </div>
            <div style={styles.nfsProgress}>
              <div style={styles.progressBar}>
                <div style={{
                  ...styles.progressFill,
                  width: `${getProgressPercent(NFS_METRICS.winRate.current, NFS_METRICS.winRate.target)}%`,
                }} />
              </div>
              <div style={styles.progressStats}>
                <span style={styles.progressCurrent}>{NFS_METRICS.winRate.current}%</span>
                <span style={styles.progressPercent}>
                  {Math.round(getProgressPercent(NFS_METRICS.winRate.current, NFS_METRICS.winRate.target))}% to goal
                </span>
              </div>
            </div>
            <div style={styles.nfsInsights}>
              <div style={styles.insight}>
                <span style={styles.insightLabel}>vs. Traditional</span>
                <span style={{ ...styles.insightValue, color: COLORS.accent }}>
                  {NFS_METRICS.winRate.vsTraditional}
                </span>
              </div>
              <div style={styles.insight}>
                <span style={styles.insightLabel}>Competitive Wins</span>
                <span style={{ ...styles.insightValue, color: COLORS.accent }}>
                  {NFS_METRICS.winRate.competitiveWins}
                </span>
              </div>
            </div>
          </div>

          {/* Deal Velocity */}
          <div style={styles.nfsCard}>
            <div style={styles.nfsHeader}>
              <div style={{ ...styles.nfsIcon, backgroundColor: COLORS.warning + '22', color: COLORS.warning }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <div style={styles.nfsTitle}>
                <h3>{NFS_METRICS.velocity.label}</h3>
                <span style={styles.nfsTarget}>{NFS_METRICS.velocity.targetLabel}</span>
              </div>
            </div>
            <div style={styles.nfsProgress}>
              <div style={styles.progressBar}>
                <div style={{
                  ...styles.progressFill,
                  ...styles.progressFillWarning,
                  width: `${getProgressPercent(NFS_METRICS.velocity.target, NFS_METRICS.velocity.current) * 100}%`,
                }} />
              </div>
              <div style={styles.progressStats}>
                <span style={styles.progressCurrent}>{NFS_METRICS.velocity.current} days</span>
                <span style={styles.progressPercent}>
                  {Math.round(getProgressPercent(NFS_METRICS.velocity.target, NFS_METRICS.velocity.current) * 100)}% efficiency
                </span>
              </div>
            </div>
            <div style={styles.nfsInsights}>
              <div style={styles.insight}>
                <span style={styles.insightLabel}>Bottleneck</span>
                <span style={{ ...styles.insightValue, color: COLORS.danger }}>
                  {NFS_METRICS.velocity.bottleneck}
                </span>
              </div>
              <div style={styles.insight}>
                <span style={styles.insightLabel}>Improvement</span>
                <span style={{ ...styles.insightValue, color: COLORS.accent }}>
                  {NFS_METRICS.velocity.improvement}
                </span>
              </div>
            </div>
          </div>

          {/* AI-Ready Accounts */}
          <div style={styles.nfsCard}>
            <div style={styles.nfsHeader}>
              <div style={{ ...styles.nfsIcon, backgroundColor: COLORS.blue + '22', color: COLORS.blue }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div style={styles.nfsTitle}>
                <h3>{NFS_METRICS.accounts.label}</h3>
                <span style={styles.nfsTarget}>{NFS_METRICS.accounts.targetLabel}</span>
              </div>
            </div>
            <div style={styles.nfsProgress}>
              <div style={styles.progressBar}>
                <div style={{
                  ...styles.progressFill,
                  width: `${getProgressPercent(NFS_METRICS.accounts.current, NFS_METRICS.accounts.target)}%`,
                }} />
              </div>
              <div style={styles.progressStats}>
                <span style={styles.progressCurrent}>{NFS_METRICS.accounts.current}</span>
                <span style={styles.progressPercent}>
                  {Math.round(getProgressPercent(NFS_METRICS.accounts.current, NFS_METRICS.accounts.target))}% to goal
                </span>
              </div>
            </div>
            <div style={styles.nfsInsights}>
              <div style={styles.insight}>
                <span style={styles.insightLabel}>Multi-AI Deals</span>
                <span style={{ ...styles.insightValue, color: COLORS.accent }}>
                  {NFS_METRICS.accounts.multiAIDeals} accounts
                </span>
              </div>
              <div style={styles.insight}>
                <span style={styles.insightLabel}>New This Quarter</span>
                <span style={{ ...styles.insightValue, color: COLORS.accent }}>
                  +{NFS_METRICS.accounts.newThisQuarter}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Actions */}
        <div style={styles.actionsSection}>
          <h2 style={styles.actionsTitle}>Priority Actions</h2>
          <div style={styles.actionList}>
            {PRIORITY_ACTIONS.map((action, i) => (
              <div key={i} style={{
                ...styles.actionItem,
                ...(action.priority === 'urgent' ? styles.actionItemUrgent :
                    action.priority === 'high' ? styles.actionItemHigh :
                    styles.actionItemMedium),
              }}>
                <div style={{
                  ...styles.actionPriority,
                  ...(action.priority === 'urgent' ? styles.actionPriorityUrgent :
                      action.priority === 'high' ? styles.actionPriorityHigh :
                      styles.actionPriorityMedium),
                }}>
                  {action.priority.toUpperCase()}
                </div>
                <div style={styles.actionContent}>
                  <h4 style={styles.actionTitle}>{action.title}</h4>
                  <p style={styles.actionDescription}>{action.description}</p>
                </div>
                <div style={styles.actionMeta}>
                  <span style={styles.actionOwner}>{action.owner}</span>
                  <span style={styles.actionDue}>{action.due}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

// ============================================================================
// STYLES
// ============================================================================
const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: '100vh',
    backgroundColor: COLORS.bg,
    color: COLORS.text,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 2rem',
    backgroundColor: 'rgba(10, 15, 20, 0.9)',
    backdropFilter: 'blur(20px)',
    borderBottom: `1px solid ${COLORS.border}`,
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
    background: `linear-gradient(135deg, ${COLORS.text} 0%, ${COLORS.accent} 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  navLinks: {
    display: 'flex',
    gap: '0.5rem',
  },
  navLink: {
    padding: '0.5rem 1rem',
    color: COLORS.textMuted,
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: 500,
    borderRadius: '6px',
    transition: 'all 0.2s',
  },
  navLinkActive: {
    color: COLORS.accent,
    backgroundColor: COLORS.accent + '22',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '6rem 2rem 2rem',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 800,
    margin: 0,
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1rem',
    color: COLORS.textMuted,
  },
  nfsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1.5rem',
    marginBottom: '3rem',
  },
  nfsCard: {
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '16px',
    padding: '1.5rem',
    transition: 'all 0.2s',
  },
  nfsHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  nfsIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  nfsIcon svg: {
    width: '22px',
    height: '22px',
  },
  nfsTitle: {
    flex: 1,
  },
  nfsTitle h3: {
    fontSize: '1rem',
    fontWeight: 600,
    margin: 0,
    marginBottom: '0.25rem',
  },
  nfsTarget: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
  },
  nfsProgress: {
    marginBottom: '1.5rem',
  },
  progressBar: {
    height: '8px',
    backgroundColor: COLORS.bg,
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '0.5rem',
  },
  progressFill: {
    height: '100%',
    background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.accent})`,
    borderRadius: '4px',
    transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  progressFillWarning: {
    background: `linear-gradient(90deg, ${COLORS.warning}, #ffbe76)`,
  },
  progressStats: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressCurrent: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '1.5rem',
    fontWeight: 600,
    color: COLORS.text,
  },
  progressPercent: {
    fontSize: '0.8125rem',
    color: COLORS.textMuted,
  },
  nfsInsights: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    paddingTop: '1rem',
    borderTop: `1px solid ${COLORS.border}`,
  },
  insight: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  insightLabel: {
    fontSize: '0.6875rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: COLORS.textMuted,
  },
  insightValue: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: COLORS.text,
  },
  actionsSection: {
    marginTop: '2rem',
  },
  actionsTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    marginBottom: '1.5rem',
  },
  actionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  actionItem: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    gap: '1.5rem',
    alignItems: 'center',
    padding: '1.5rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
    transition: 'all 0.2s',
  },
  actionItemUrgent: {
    borderLeft: `3px solid ${COLORS.danger}`,
  },
  actionItemHigh: {
    borderLeft: `3px solid ${COLORS.warning}`,
  },
  actionItemMedium: {
    borderLeft: `3px solid ${COLORS.accent}`,
  },
  actionPriority: {
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.625rem',
    fontWeight: 600,
    letterSpacing: '0.05em',
  },
  actionPriorityUrgent: {
    backgroundColor: COLORS.danger + '22',
    color: COLORS.danger,
  },
  actionPriorityHigh: {
    backgroundColor: COLORS.warning + '22',
    color: COLORS.warning,
  },
  actionPriorityMedium: {
    backgroundColor: COLORS.accent + '22',
    color: COLORS.accent,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: '0.9375rem',
    fontWeight: 500,
    margin: 0,
    marginBottom: '0.25rem',
  },
  actionDescription: {
    fontSize: '0.8125rem',
    color: COLORS.textMuted,
    margin: 0,
  },
  actionMeta: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.25rem',
    textAlign: 'right',
  },
  actionOwner: {
    fontSize: '0.8125rem',
    color: COLORS.textMuted,
  },
  actionDue: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
  },
}
