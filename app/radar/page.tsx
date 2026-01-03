'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { opportunities, type Opportunity } from '../../lib/data/opportunities'

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
// PREREQUISITES MAPPING (based on sector dependencies research)
// ============================================================================
const getPrerequisites = (sector: Opportunity['sector'], project: string): string[] => {
  const prereqs: Record<string, string[]> = {
    'critical-minerals': [
      'Rare Earth Refining Capacity',
      'Separation Facilities',
      'Metal/Alloy Production',
    ],
    'data-centers': [
      'Semiconductor Supply',
      'Water Infrastructure',
      'Energy/Grid Capacity',
      'Cooling Systems',
    ],
    'semiconductors': [
      'Semiconductor Materials',
      'Lithography Equipment',
      'Water & Power Infrastructure',
    ],
    'ev-battery': [
      'Critical Minerals (Lithium, Cobalt, Nickel)',
      'Processing Facilities',
      'Battery Materials Production',
    ],
    'nuclear': [
      'HALEU Fuel Supply',
      'Component Manufacturing',
      'Grid Connection',
    ],
    'clean-energy': [
      'Grid Transmission Capacity',
      'Energy Storage',
      'Rare Earth Magnets (for wind)',
    ],
  }
  
  // Check project name for specific clues
  if (project.toLowerCase().includes('rare earth') || project.toLowerCase().includes('mining')) {
    return prereqs['critical-minerals'] || []
  }
  
  return prereqs[sector] || []
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
const formatCurrency = (millions: number) => {
  if (millions >= 1000) return '$' + (millions / 1000).toFixed(1) + 'B'
  return '$' + millions + 'M'
}

const getRelationshipColor = (rel: Opportunity['deloitteRelationship']) => {
  switch (rel) {
    case 'incumbent': return COLORS.accent
    case 'active-pursuit': return COLORS.blue
    case 'teaming': return COLORS.purple
    case 'known': return COLORS.warning
    default: return COLORS.textMuted
  }
}

const getRelationshipLabel = (rel: Opportunity['deloitteRelationship']) => {
  switch (rel) {
    case 'incumbent': return 'Incumbent'
    case 'active-pursuit': return 'Active Pursuit'
    case 'teaming': return 'Teaming'
    case 'known': return 'Known Contact'
    default: return 'No Relationship'
  }
}

const getPriorityColor = (priority: Opportunity['priority']) => {
  switch (priority) {
    case 'hot': return COLORS.danger
    case 'warm': return COLORS.warning
    default: return COLORS.textMuted
  }
}

const getServiceLabel = (service: string) => {
  const labels: Record<string, string> = {
    'ot-strategy': 'OT Strategy',
    'smart-factory': 'Smart Factory',
    'supply-chain': 'Supply Chain',
    'erp': 'ERP',
    'workforce': 'Workforce',
    'sustainability': 'Sustainability',
    'tax': 'Tax',
  }
  return labels[service] || service
}

// Calculate "This Week" focus - opportunities with milestones in next 7 days
const getThisWeekFocus = (opps: Opportunity[]) => {
  const now = Date.now()
  const weekFromNow = now + (7 * 24 * 60 * 60 * 1000)
  
  return opps.filter(opp => {
    if (!opp.nextMilestone?.date) return false
    const milestoneDate = new Date(opp.nextMilestone.date).getTime()
    return milestoneDate >= now && milestoneDate <= weekFromNow
  }).sort((a, b) => {
    const dateA = new Date(a.nextMilestone!.date).getTime()
    const dateB = new Date(b.nextMilestone!.date).getTime()
    return dateA - dateB
  })
}

// Calculate "Needs Attention" - hot priority or active procurement
const getNeedsAttention = (opps: Opportunity[]) => {
  return opps.filter(opp => 
    opp.priority === 'hot' || 
    ['pre-rfp', 'rfp-open', 'proposal-submitted'].includes(opp.procurementStage)
  ).sort((a, b) => {
    // Sort by priority first, then by investment size
    if (a.priority === 'hot' && b.priority !== 'hot') return -1
    if (b.priority === 'hot' && a.priority !== 'hot') return 1
    return b.investmentSize - a.investmentSize
  })
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function RadarPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<'this-week' | 'needs-attention' | 'all' | 'my-deals' | 'big-bets' | 'ot-core'>('this-week')
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null)

  // Filter opportunities based on partner mental model
  const filteredOpportunities = useMemo(() => {
    let filtered = [...opportunities]

    // Apply category filter
    switch (activeFilter) {
      case 'this-week':
        filtered = getThisWeekFocus(filtered)
        break
      case 'needs-attention':
        filtered = getNeedsAttention(filtered)
        break
      case 'my-deals':
        filtered = filtered.filter(o => 
          ['active-pursuit', 'teaming', 'incumbent'].includes(o.deloitteRelationship)
        )
        break
      case 'big-bets':
        filtered = filtered.filter(o => o.investmentSize >= 5000)
        break
      case 'ot-core':
        filtered = filtered.filter(o => o.otRelevance === 'core')
        break
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(o =>
        o.company.toLowerCase().includes(query) ||
        o.project.toLowerCase().includes(query) ||
        o.keyContacts?.some(c => c.toLowerCase().includes(query)) ||
        o.location.state.toLowerCase().includes(query) ||
        o.location.city?.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [activeFilter, searchQuery])

  // Calculate stats
  const stats = useMemo(() => {
    const opps = filteredOpportunities
    const totalPipeline = opps.reduce((sum, o) => sum + o.investmentSize, 0)
    const thisWeek = getThisWeekFocus(opportunities)
    const needsAttention = getNeedsAttention(opportunities)
    const otCore = opps.filter(o => o.otRelevance === 'core').length
    const activePursuit = opps.filter(o => 
      ['active-pursuit', 'teaming', 'incumbent'].includes(o.deloitteRelationship)
    ).length

    return {
      totalPipeline,
      thisWeekCount: thisWeek.length,
      needsAttentionCount: needsAttention.length,
      otCore,
      activePursuit,
      count: opps.length,
    }
  }, [filteredOpportunities])

  const prerequisites = selectedOpp ? getPrerequisites(selectedOpp.sector, selectedOpp.project) : []

  return (
    <main style={styles.main}>
      <nav style={styles.nav}>
        <div style={styles.navBrand}>
          <div style={styles.brandIcon}>⚡</div>
          <span style={styles.brandText}>Build Clock</span>
        </div>
        <div style={styles.navLinks}>
          <Link href="/radar" style={{ ...styles.navLink, ...styles.navLinkActive }}>
            Radar
          </Link>
          <Link href="/scoreboard" style={styles.navLink}>
            Scoreboard
          </Link>
        </div>
      </nav>

      <div style={styles.container}>
        {/* Header */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>What Do I Need to Focus on This Week?</h1>
            <p style={styles.subtitle}>
              AI Manhattan Project — Industrial rebuild pipeline tracking
            </p>
          </div>
        </header>

        {/* Quick Filters - Partner Mental Model */}
        <div style={styles.filters}>
          <button
            style={{
              ...styles.filterBtn,
              ...(activeFilter === 'this-week' ? styles.filterBtnActive : {}),
            }}
            onClick={() => setActiveFilter('this-week')}
          >
            This Week ({stats.thisWeekCount})
          </button>
          <button
            style={{
              ...styles.filterBtn,
              ...(activeFilter === 'needs-attention' ? styles.filterBtnActive : {}),
            }}
            onClick={() => setActiveFilter('needs-attention')}
          >
            Needs Attention ({stats.needsAttentionCount})
          </button>
          <button
            style={{
              ...styles.filterBtn,
              ...(activeFilter === 'my-deals' ? styles.filterBtnActive : {}),
            }}
            onClick={() => setActiveFilter('my-deals')}
          >
            My Deals ({stats.activePursuit})
          </button>
          <button
            style={{
              ...styles.filterBtn,
              ...(activeFilter === 'big-bets' ? styles.filterBtnActive : {}),
            }}
            onClick={() => setActiveFilter('big-bets')}
          >
            Big Bets ($5B+)
          </button>
          <button
            style={{
              ...styles.filterBtn,
              ...(activeFilter === 'ot-core' ? styles.filterBtnActive : {}),
            }}
            onClick={() => setActiveFilter('ot-core')}
          >
            OT Core ({stats.otCore})
          </button>
          <button
            style={{
              ...styles.filterBtn,
              ...(activeFilter === 'all' ? styles.filterBtnActive : {}),
            }}
            onClick={() => setActiveFilter('all')}
          >
            All Opportunities
          </button>
        </div>

        {/* Main Content Grid */}
        <div style={styles.grid}>
          {/* Left: Search & Stats */}
          <div style={styles.sidebar}>
            {/* Search */}
            <div style={styles.searchBox}>
              <input
                type="text"
                placeholder="Search client, project, or contact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
              <svg style={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </div>

            {/* Stats */}
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{formatCurrency(stats.totalPipeline)}</div>
                <div style={styles.statLabel}>Total Pipeline</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{stats.thisWeekCount}</div>
                <div style={styles.statLabel}>This Week</div>
              </div>
              <div style={{ ...styles.statCard, ...styles.statCardHighlight }}>
                <div style={{ ...styles.statValue, color: COLORS.accent }}>
                  {stats.needsAttentionCount}
                </div>
                <div style={styles.statLabel}>Needs Attention</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{stats.count}</div>
                <div style={styles.statLabel}>Opportunities</div>
              </div>
            </div>

            {/* Selected Opportunity Detail */}
            {selectedOpp ? (
              <div style={styles.detailPanel}>
                <div style={styles.detailHeader}>
                  <div>
                    <div style={styles.detailCompany}>{selectedOpp.company}</div>
                    <div style={styles.detailProject}>{selectedOpp.project}</div>
                  </div>
                  <div style={styles.detailValue}>
                    {formatCurrency(selectedOpp.investmentSize)}
                  </div>
                </div>

                {/* PREREQUISITES - Prominent Display */}
                {prerequisites.length > 0 && (
                  <div style={styles.prerequisitesSection}>
                    <div style={styles.prerequisitesHeader}>
                      <span style={styles.prerequisitesIcon}>🔗</span>
                      <span style={styles.prerequisitesTitle}>Prerequisites</span>
                    </div>
                    <div style={styles.prerequisitesNote}>
                      This opportunity depends on these being in place first:
                    </div>
                    <div style={styles.prerequisitesList}>
                      {prerequisites.map((prereq, i) => (
                        <div key={i} style={styles.prerequisiteItem}>
                          <span style={styles.prerequisiteBullet}>→</span>
                          <span style={styles.prerequisiteText}>{prereq}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={styles.detailSection}>
                  <div style={styles.detailLabel}>Deloitte Relationship</div>
                  <div style={{
                    ...styles.detailBadge,
                    backgroundColor: getRelationshipColor(selectedOpp.deloitteRelationship) + '22',
                    color: getRelationshipColor(selectedOpp.deloitteRelationship),
                  }}>
                    {getRelationshipLabel(selectedOpp.deloitteRelationship)}
                  </div>
                </div>

                {selectedOpp.keyContacts && selectedOpp.keyContacts.length > 0 && (
                  <div style={styles.detailSection}>
                    <div style={styles.detailLabel}>Key Contacts</div>
                    <div style={styles.detailList}>
                      {selectedOpp.keyContacts.map((contact, i) => (
                        <div key={i} style={styles.detailListItem}>{contact}</div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={styles.detailSection}>
                  <div style={styles.detailLabel}>Service Opportunities</div>
                  <div style={styles.detailTags}>
                    {selectedOpp.services.map((service, i) => (
                      <span key={i} style={styles.detailTag}>
                        {getServiceLabel(service)}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedOpp.otUseCases && selectedOpp.otUseCases.length > 0 && (
                  <div style={styles.detailSection}>
                    <div style={styles.detailLabel}>OT Use Cases</div>
                    <div style={styles.detailTags}>
                      {selectedOpp.otUseCases.map((useCase, i) => (
                        <span key={i} style={{ ...styles.detailTag, backgroundColor: COLORS.accent + '22', color: COLORS.accent }}>
                          {useCase}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={styles.detailSection}>
                  <div style={styles.detailLabel}>Procurement Stage</div>
                  <div style={styles.detailValueSmall}>
                    {selectedOpp.procurementStage.replace('-', ' ').toUpperCase()}
                  </div>
                </div>

                {selectedOpp.nextMilestone && (
                  <div style={styles.detailSection}>
                    <div style={styles.detailLabel}>Next Milestone</div>
                    <div style={styles.detailValueSmall}>
                      {selectedOpp.nextMilestone.label}
                    </div>
                    <div style={styles.detailMuted}>
                      {new Date(selectedOpp.nextMilestone.date).toLocaleDateString()}
                    </div>
                  </div>
                )}

                {selectedOpp.competitors && selectedOpp.competitors.length > 0 && (
                  <div style={styles.detailSection}>
                    <div style={styles.detailLabel}>Competitors</div>
                    <div style={styles.detailList}>
                      {selectedOpp.competitors.map((comp, i) => (
                        <div key={i} style={styles.detailListItem}>{comp}</div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={styles.detailActions}>
                  <button style={styles.detailBtn}>View Full Details</button>
                  <button style={{ ...styles.detailBtn, ...styles.detailBtnPrimary }}>
                    Take Action
                  </button>
                </div>
              </div>
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>👆</div>
                <p style={styles.emptyText}>
                  Click an opportunity to see Deloitte-specific details and prerequisites
                </p>
              </div>
            )}
          </div>

          {/* Right: Opportunity List */}
          <div style={styles.listContainer}>
            <div style={styles.listHeader}>
              <span>{filteredOpportunities.length} opportunities</span>
              <span style={styles.listHeaderMuted}>
                {activeFilter === 'this-week' ? 'Milestones this week' : 
                 activeFilter === 'needs-attention' ? 'Hot priority or active procurement' :
                 'Click to view details'}
              </span>
            </div>
            <div style={styles.list}>
              {filteredOpportunities.length === 0 ? (
                <div style={styles.emptyList}>
                  <div style={styles.emptyListIcon}>📅</div>
                  <div style={styles.emptyListText}>
                    No opportunities match this filter
                  </div>
                </div>
              ) : (
                filteredOpportunities.map((opp) => {
                  const oppPrereqs = getPrerequisites(opp.sector, opp.project)
                  const hasMilestoneThisWeek = opp.nextMilestone && 
                    new Date(opp.nextMilestone.date).getTime() <= Date.now() + (7 * 24 * 60 * 60 * 1000) &&
                    new Date(opp.nextMilestone.date).getTime() >= Date.now()
                  
                  return (
                    <div
                      key={opp.id}
                      style={{
                        ...styles.listItem,
                        ...(selectedOpp?.id === opp.id ? styles.listItemSelected : {}),
                        ...(hasMilestoneThisWeek ? styles.listItemThisWeek : {}),
                      }}
                      onClick={() => setSelectedOpp(opp)}
                    >
                      {hasMilestoneThisWeek && (
                        <div style={styles.thisWeekBadge}>THIS WEEK</div>
                      )}
                      <div style={styles.listItemHeader}>
                        <div style={styles.listItemCompany}>{opp.company}</div>
                        <div style={{
                          ...styles.listItemPriority,
                          color: getPriorityColor(opp.priority),
                        }}>
                          {opp.priority.toUpperCase()}
                        </div>
                      </div>
                      <div style={styles.listItemProject}>{opp.project}</div>
                      {oppPrereqs.length > 0 && (
                        <div style={styles.listItemPrereqs}>
                          <span style={styles.listItemPrereqsLabel}>Prerequisites:</span>
                          <span style={styles.listItemPrereqsText}>
                            {oppPrereqs.slice(0, 2).join(', ')}
                            {oppPrereqs.length > 2 && ` +${oppPrereqs.length - 2} more`}
                          </span>
                        </div>
                      )}
                      <div style={styles.listItemMeta}>
                        <span style={styles.listItemValue}>
                          {formatCurrency(opp.investmentSize)}
                        </span>
                        <span style={styles.listItemDot}>•</span>
                        <span style={{
                          ...styles.listItemRelationship,
                          color: getRelationshipColor(opp.deloitteRelationship),
                        }}>
                          {getRelationshipLabel(opp.deloitteRelationship)}
                        </span>
                        <span style={styles.listItemDot}>•</span>
                        <span style={styles.listItemLocation}>
                          {opp.location.city ? `${opp.location.city}, ` : ''}{opp.location.state}
                        </span>
                      </div>
                      {opp.nextMilestone && (
                        <div style={styles.listItemMilestone}>
                          <span style={styles.listItemMilestoneIcon}>📅</span>
                          <span style={styles.listItemMilestoneText}>
                            {opp.nextMilestone.label} • {new Date(opp.nextMilestone.date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {opp.otRelevance === 'core' && (
                        <div style={styles.listItemOt}>
                          <span style={styles.listItemOtBadge}>OT Core</span>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
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
    maxWidth: '1600px',
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
  filters: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  filterBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '20px',
    color: COLORS.textMuted,
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  filterBtnActive: {
    backgroundColor: COLORS.accent + '22',
    borderColor: COLORS.accent,
    color: COLORS.accent,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '380px 1fr',
    gap: '2rem',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  searchBox: {
    position: 'relative',
  },
  searchInput: {
    width: '100%',
    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    color: COLORS.text,
    fontFamily: 'inherit',
    fontSize: '0.875rem',
  },
  searchIcon: {
    position: 'absolute',
    left: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '18px',
    height: '18px',
    color: COLORS.textMuted,
    pointerEvents: 'none',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
  },
  statCard: {
    padding: '1rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
  },
  statCardHighlight: {
    backgroundColor: COLORS.accent + '11',
    borderColor: COLORS.accent + '33',
  },
  statValue: {
    fontSize: '1.25rem',
    fontWeight: 700,
    marginBottom: '0.25rem',
    fontFamily: "'JetBrains Mono', monospace",
  },
  statLabel: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  detailPanel: {
    flex: 1,
    padding: '1.5rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
    overflowY: 'auto',
    maxHeight: '600px',
  },
  detailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: `1px solid ${COLORS.border}`,
  },
  detailCompany: {
    fontSize: '1.25rem',
    fontWeight: 700,
    marginBottom: '0.25rem',
  },
  detailProject: {
    fontSize: '0.875rem',
    color: COLORS.textMuted,
  },
  detailValue: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: COLORS.accent,
    fontFamily: "'JetBrains Mono', monospace",
  },
  prerequisitesSection: {
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: COLORS.warning + '11',
    border: `1px solid ${COLORS.warning}33`,
    borderRadius: '8px',
  },
  prerequisitesHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  prerequisitesIcon: {
    fontSize: '1.25rem',
  },
  prerequisitesTitle: {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: COLORS.warning,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  prerequisitesNote: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
    marginBottom: '0.75rem',
    fontStyle: 'italic',
  },
  prerequisitesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  prerequisiteItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
    fontSize: '0.875rem',
    color: COLORS.text,
  },
  prerequisiteBullet: {
    color: COLORS.warning,
    fontWeight: 700,
  },
  prerequisiteText: {
    flex: 1,
  },
  detailSection: {
    marginBottom: '1.25rem',
  },
  detailLabel: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.5rem',
  },
  detailBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '4px',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  detailList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  detailListItem: {
    fontSize: '0.875rem',
    color: COLORS.text,
  },
  detailTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  detailTag: {
    padding: '0.25rem 0.5rem',
    backgroundColor: COLORS.bg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '4px',
    fontSize: '0.75rem',
    color: COLORS.textMuted,
  },
  detailValueSmall: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: COLORS.text,
  },
  detailMuted: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
    marginTop: '0.25rem',
  },
  detailActions: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '1.5rem',
    paddingTop: '1rem',
    borderTop: `1px solid ${COLORS.border}`,
  },
  detailBtn: {
    flex: 1,
    padding: '0.5rem 1rem',
    backgroundColor: 'transparent',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '6px',
    color: COLORS.textMuted,
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  detailBtnPrimary: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
    color: COLORS.bg,
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
    textAlign: 'center',
    color: COLORS.textMuted,
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  emptyText: {
    fontSize: '0.875rem',
  },
  listContainer: {
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
    overflow: 'hidden',
  },
  listHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    borderBottom: `1px solid ${COLORS.border}`,
    fontSize: '0.875rem',
    fontWeight: 600,
  },
  listHeaderMuted: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
    fontWeight: 400,
  },
  list: {
    maxHeight: 'calc(100vh - 300px)',
    overflowY: 'auto',
  },
  emptyList: {
    padding: '3rem',
    textAlign: 'center',
    color: COLORS.textMuted,
  },
  emptyListIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  emptyListText: {
    fontSize: '0.875rem',
  },
  listItem: {
    padding: '1rem 1.5rem',
    borderBottom: `1px solid ${COLORS.border}`,
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative',
  },
  listItemSelected: {
    backgroundColor: COLORS.accent + '11',
    borderLeft: `3px solid ${COLORS.accent}`,
  },
  listItemThisWeek: {
    backgroundColor: COLORS.warning + '11',
    borderLeft: `3px solid ${COLORS.warning}`,
  },
  thisWeekBadge: {
    position: 'absolute',
    top: '0.5rem',
    right: '0.5rem',
    padding: '0.125rem 0.5rem',
    backgroundColor: COLORS.warning,
    color: COLORS.bg,
    borderRadius: '4px',
    fontSize: '0.625rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  listItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  listItemCompany: {
    fontSize: '1rem',
    fontWeight: 600,
  },
  listItemPriority: {
    fontSize: '0.625rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
  },
  listItemProject: {
    fontSize: '0.875rem',
    color: COLORS.textMuted,
    marginBottom: '0.5rem',
  },
  listItemPrereqs: {
    fontSize: '0.75rem',
    color: COLORS.warning,
    marginBottom: '0.5rem',
    padding: '0.5rem',
    backgroundColor: COLORS.warning + '11',
    borderRadius: '4px',
  },
  listItemPrereqsLabel: {
    fontWeight: 600,
    marginRight: '0.25rem',
  },
  listItemPrereqsText: {
    color: COLORS.textMuted,
  },
  listItemMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.75rem',
    color: COLORS.textMuted,
  },
  listItemValue: {
    fontWeight: 600,
    color: COLORS.text,
    fontFamily: "'JetBrains Mono', monospace",
  },
  listItemRelationship: {
    fontWeight: 500,
  },
  listItemDot: {
    color: COLORS.border,
  },
  listItemLocation: {
    color: COLORS.textMuted,
  },
  listItemMilestone: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '0.5rem',
    fontSize: '0.75rem',
    color: COLORS.textMuted,
  },
  listItemMilestoneIcon: {
    fontSize: '0.875rem',
  },
  listItemMilestoneText: {
    color: COLORS.textMuted,
  },
  listItemOt: {
    marginTop: '0.5rem',
  },
  listItemOtBadge: {
    display: 'inline-block',
    padding: '0.125rem 0.5rem',
    backgroundColor: COLORS.accent + '22',
    color: COLORS.accent,
    borderRadius: '4px',
    fontSize: '0.625rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
}
