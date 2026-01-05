'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { opportunities, TRUMP_POLICIES, type Opportunity, type TrumpPolicyAlignment } from '../../lib/data/opportunities'
import type { PolicyUpdate, OpportunitySignal } from '../../lib/services/types'

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

// Get policy display info
const getPolicyLabel = (policyId: TrumpPolicyAlignment): string => {
  const policy = TRUMP_POLICIES.find(p => p.id === policyId)
  return policy?.shortName || policyId
}

const getPolicyColor = (policyId: TrumpPolicyAlignment): string => {
  switch (policyId) {
    case 'stargate-initiative': return '#f59e0b' // Gold - flagship
    case 'eo-14179-ai-leadership': return '#ef4444' // Red - executive action
    case 'genesis-mission': return '#22c55e' // Green - energy/clean
    case 'eo-14365-ai-framework': return '#ef4444' // Red - executive action
    case 'winning-race-action-plan': return '#3b82f6' // Blue - strategy
    case 'chips-sovereignty': return '#8b5cf6' // Purple - semiconductors
    case 'energy-dominance': return '#f97316' // Orange - energy
    case 'nuclear-restart': return '#06b6d4' // Cyan - nuclear
    default: return COLORS.textMuted
  }
}

// Filter opportunities by policy
const getOpportunitiesByPolicy = (opps: Opportunity[], policyId: TrumpPolicyAlignment) => {
  return opps.filter(opp => opp.trumpPolicyAlignment?.includes(policyId))
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
  const [activeView, setActiveView] = useState<'list' | 'timeline'>('list')
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null)
  
  // Live Intelligence State
  const [liveUpdates, setLiveUpdates] = useState<{
    policyUpdates: PolicyUpdate[]
    opportunitySignals: OpportunitySignal[]
    lastSync: Date | null
    loading: boolean
    pendingCount: number
    savedSignals: number
  }>({
    policyUpdates: [],
    opportunitySignals: [],
    lastSync: null,
    loading: true,
    pendingCount: 0,
    savedSignals: 0
  })
  const [showLivePanel, setShowLivePanel] = useState(true)
  const [promoting, setPromoting] = useState<string | null>(null)

  // Fetch live intelligence
  const fetchLiveIntelligence = useCallback(async () => {
    try {
      const response = await fetch('/api/feeds?type=all')
      const data = await response.json()
      if (data.success) {
        setLiveUpdates({
          policyUpdates: data.data.policyUpdates?.slice(0, 5) || [],
          opportunitySignals: data.data.opportunitySignals?.slice(0, 5) || [],
          lastSync: new Date(),
          loading: false,
          pendingCount: data.data.store?.stats?.pendingSignals || 0,
          savedSignals: data.data.store?.savedSignals || 0
        })
      }
    } catch (error) {
      console.error('Failed to fetch live intelligence:', error)
      setLiveUpdates(prev => ({ ...prev, loading: false }))
    }
  }, [])

  // Promote signal to pipeline
  const promoteSignal = async (signalId: string) => {
    setPromoting(signalId)
    try {
      const response = await fetch('/api/signals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: signalId, action: 'promote' })
      })
      const data = await response.json()
      if (data.success) {
        // Refresh the feed to update counts
        fetchLiveIntelligence()
      }
    } catch (error) {
      console.error('Failed to promote signal:', error)
    } finally {
      setPromoting(null)
    }
  }

  // Dismiss signal
  const dismissSignal = async (signalId: string) => {
    try {
      await fetch('/api/signals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: signalId, action: 'dismiss' })
      })
      fetchLiveIntelligence()
    } catch (error) {
      console.error('Failed to dismiss signal:', error)
    }
  }

  // Fetch on mount and every 5 minutes
  useEffect(() => {
    fetchLiveIntelligence()
    const interval = setInterval(fetchLiveIntelligence, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchLiveIntelligence])

  // Format time ago helper
  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    return `${Math.floor(diffMins / 60)}h ago`
  }

  // Filter opportunities based on partner mental model
  const filteredOpportunities = useMemo(() => {
    let filtered = [...opportunities]

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(o =>
        o.company.toLowerCase().includes(query) ||
        o.project.toLowerCase().includes(query) ||
        o.sector.toLowerCase().includes(query) ||
        o.location.state.toLowerCase().includes(query) ||
        o.location.city?.toLowerCase().includes(query)
      )
    }

    // Sort by investment size (biggest first)
    return filtered.sort((a, b) => b.investmentSize - a.investmentSize)
  }, [searchQuery])

  // Group opportunities by timeline (for timeline view)
  const timelineData = useMemo(() => {
    const byDate: Record<string, Opportunity[]> = {}
    
    opportunities.forEach(opp => {
      if (opp.nextMilestone?.date) {
        const monthYear = new Date(opp.nextMilestone.date).toLocaleDateString('en-US', { 
          month: 'short', 
          year: 'numeric' 
        })
        if (!byDate[monthYear]) byDate[monthYear] = []
        byDate[monthYear].push(opp)
      }
    })
    
    // Sort by date
    const sorted = Object.entries(byDate).sort((a, b) => {
      return new Date(a[0]).getTime() - new Date(b[0]).getTime()
    })
    
    return sorted
  }, [])

  // Calculate stats
  const stats = useMemo(() => {
    const totalPipeline = opportunities.reduce((sum, o) => sum + o.investmentSize, 0)
    const policyAligned = opportunities.filter(o => o.trumpPolicyAlignment && o.trumpPolicyAlignment.length > 0)

    return {
      totalCount: opportunities.length,
      totalPipeline,
      filteredCount: filteredOpportunities.length,
      policyAlignedCount: policyAligned.length,
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
          <Link href="/about" style={styles.navLink}>
            About
          </Link>
        </div>
      </nav>

      <div style={styles.container}>
        {/* Header */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>AI Manhattan Project</h1>
            <p style={styles.subtitle}>
              Industrial rebuild pipeline tracking
            </p>
          </div>
        </header>

        {/* Live Intelligence Panel */}
        <div style={styles.livePanel}>
          <div style={styles.livePanelHeader} onClick={() => setShowLivePanel(!showLivePanel)}>
            <div style={styles.livePanelTitle}>
              <span style={styles.liveDot}>●</span>
              <span>Live Intelligence</span>
              <span style={styles.liveStatus}>
                {liveUpdates.loading ? 'Scanning...' : 
                 liveUpdates.lastSync ? `Updated ${formatTimeAgo(liveUpdates.lastSync)}` : 'Offline'}
              </span>
              {liveUpdates.pendingCount > 0 && (
                <span style={styles.pendingBadge}>
                  {liveUpdates.pendingCount} pending review
                </span>
              )}
            </div>
            <div style={styles.livePanelStats}>
              <span style={styles.liveStat}>
                <strong>{liveUpdates.policyUpdates.length}</strong> policy updates
              </span>
              <span style={styles.liveStat}>
                <strong>{liveUpdates.opportunitySignals.length}</strong> new signals
              </span>
              {liveUpdates.savedSignals > 0 && (
                <span style={{...styles.liveStat, color: COLORS.accent}}>
                  +{liveUpdates.savedSignals} saved
                </span>
              )}
              <button 
                style={{...styles.liveToggle, marginRight: '8px'}}
                onClick={() => {
                  setLiveUpdates(prev => ({...prev, loading: true}))
                  fetchLiveIntelligence()
                }}
                disabled={liveUpdates.loading}
              >
                {liveUpdates.loading ? '⏳' : '🔄'} Refresh
              </button>
              <button 
                style={styles.liveToggle}
                onClick={() => setShowLivePanel(!showLivePanel)}
              >
                {showLivePanel ? '▲ Hide' : '▼ Show'}
              </button>
            </div>
          </div>
          
          {showLivePanel && !liveUpdates.loading && (
            <div style={styles.livePanelContent}>
              {/* Policy Updates */}
              <div style={styles.liveColumn}>
                <div style={styles.liveColumnTitle}>📜 Recent Policy Changes</div>
                {liveUpdates.policyUpdates.length === 0 ? (
                  <div style={styles.liveEmpty}>
                    {liveUpdates.loading ? 'Loading...' : 'No recent updates'}
                  </div>
                ) : (
                  liveUpdates.policyUpdates.slice(0, 3).map((update: any, i) => (
                    <a 
                      key={i} 
                      href={update.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{...styles.liveItem, textDecoration: 'none', cursor: 'pointer'}}
                    >
                      <div style={styles.liveItemTitle}>{update.title?.slice(0, 80)}{update.title?.length > 80 ? '...' : ''}</div>
                      <div style={styles.liveItemMeta}>
                        <span>{update.source || 'Federal Register'}</span>
                        <span>Score: {update.relevanceScore || update.impactScore || 0}</span>
                      </div>
                      {update.policyAlignment?.length > 0 && (
                        <div style={{display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap'}}>
                          {update.policyAlignment.slice(0, 2).map((p: string, j: number) => (
                            <span key={j} style={{
                              fontSize: '9px',
                              padding: '2px 6px',
                              backgroundColor: 'rgba(139, 92, 246, 0.2)',
                              color: '#a78bfa',
                              borderRadius: '4px',
                            }}>
                              {p.replace(/-/g, ' ').replace(/eo /i, 'EO ')}
                            </span>
                          ))}
                        </div>
                      )}
                    </a>
                  ))
                )}
              </div>
              
              {/* Opportunity Signals */}
              <div style={styles.liveColumn}>
                <div style={styles.liveColumnTitle}>🎯 New Opportunity Signals</div>
                {liveUpdates.opportunitySignals.length === 0 ? (
                  <div style={styles.liveEmpty}>
                    {liveUpdates.loading ? 'Scanning news feeds...' : 'No new signals found'}
                  </div>
                ) : (
                  liveUpdates.opportunitySignals.slice(0, 3).map((signal: any, i) => (
                    <div key={i} style={styles.liveItem}>
                      <a 
                        href={signal.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{textDecoration: 'none', color: 'inherit'}}
                      >
                        <div style={styles.liveItemTitle}>
                          {signal.extractedData?.company && (
                            <span style={{color: COLORS.accent}}>{signal.extractedData.company}: </span>
                          )}
                          {signal.title?.slice(0, 70)}{signal.title?.length > 70 ? '...' : ''}
                        </div>
                      </a>
                      <div style={styles.liveItemMeta}>
                        <span>{signal.extractedData?.sector || signal.suggestedSector || signal.source}</span>
                        {signal.extractedData?.investmentAmount && (
                          <span style={{color: COLORS.accent, fontWeight: 'bold'}}>
                            {signal.extractedData.investmentAmount}
                          </span>
                        )}
                        <span>{signal.confidence || Math.round((signal.confidenceScore || 0) * 100)}% match</span>
                      </div>
                      {signal.extractedData?.location && (
                        <div style={{fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '2px'}}>
                          📍 {signal.extractedData.location}
                        </div>
                      )}
                      <div style={styles.liveItemActions}>
                        <button 
                          style={styles.promoteBtn}
                          onClick={(e) => { e.stopPropagation(); promoteSignal(signal.id); }}
                          disabled={promoting === signal.id}
                        >
                          {promoting === signal.id ? '...' : '+ Add to Pipeline'}
                        </button>
                        <button 
                          style={styles.dismissBtn}
                          onClick={(e) => { e.stopPropagation(); dismissSignal(signal.id); }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* View Toggle & Stats */}
        <div style={styles.viewControls}>
          <div style={styles.viewToggle}>
            <button
              style={{
                ...styles.viewBtn,
                ...(activeView === 'list' ? styles.viewBtnActive : {}),
              }}
              onClick={() => setActiveView('list')}
            >
              📋 All Opportunities
            </button>
            <button
              style={{
                ...styles.viewBtn,
                ...(activeView === 'timeline' ? styles.viewBtnActive : {}),
              }}
              onClick={() => setActiveView('timeline')}
            >
              📅 Timeline
            </button>
          </div>
          <div style={styles.pipelineStats}>
            <span style={styles.statItem}>
              <strong>{stats.totalCount}</strong> opportunities
            </span>
            <span style={styles.statDivider}>•</span>
            <span style={styles.statItem}>
              <strong>${(stats.totalPipeline / 1000).toFixed(0)}B</strong> pipeline
            </span>
            <span style={styles.statDivider}>•</span>
            <span style={styles.statItem}>
              <strong>{stats.policyAlignedCount}</strong> policy-aligned
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div style={styles.searchContainer}>
          <div style={styles.searchBox}>
            <input
              type="text"
              placeholder="Search opportunities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
            <svg style={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
          </div>
          {searchQuery && (
            <div style={styles.searchResults}>
              Showing {filteredOpportunities.length} of {stats.totalCount} opportunities
            </div>
          )}
        </div>

        {/* Main Content */}
        <div style={styles.mainContent}>
          {/* Detail Panel - shows at TOP when opportunity selected (shared across views) */}
          {selectedOpp && (
            <div style={styles.detailPanel}>
              <button 
                style={styles.detailClose}
                onClick={() => setSelectedOpp(null)}
              >
                ✕
              </button>
              <div style={styles.detailHeader}>
                <div style={styles.detailCompany}>{selectedOpp.company}</div>
                <div style={styles.detailValue}>{formatCurrency(selectedOpp.investmentSize)}</div>
              </div>
              <div style={styles.detailProject}>{selectedOpp.project}</div>
              <div style={styles.detailMeta}>
                <span>{selectedOpp.sector}</span>
                <span>•</span>
                <span>{selectedOpp.location.city ? `${selectedOpp.location.city}, ` : ''}{selectedOpp.location.state}</span>
              </div>
              {selectedOpp.trumpPolicyAlignment && selectedOpp.trumpPolicyAlignment.length > 0 && (
                <div style={styles.detailPolicies}>
                  {selectedOpp.trumpPolicyAlignment.map((policyId, i) => (
                    <span 
                      key={i}
                      style={{
                        ...styles.detailPolicyBadge,
                        backgroundColor: getPolicyColor(policyId) + '22',
                        color: getPolicyColor(policyId),
                      }}
                    >
                      {getPolicyLabel(policyId)}
                    </span>
                  ))}
                </div>
              )}
              {selectedOpp.civilizationalImpact && (
                <div style={styles.detailImpact}>
                  <div style={styles.detailImpactLabel}>🌍 Civilizational Impact</div>
                  <div style={styles.detailImpactText}>{selectedOpp.civilizationalImpact}</div>
                </div>
              )}
              {selectedOpp.services && selectedOpp.services.length > 0 && (
                <div style={styles.detailServices}>
                  <div style={styles.detailServicesLabel}>Service Opportunities</div>
                  <div style={styles.detailServicesTags}>
                    {selectedOpp.services.map((service, i) => (
                      <span key={i} style={styles.detailServiceTag}>
                        {getServiceLabel(service)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {selectedOpp.nextMilestone && (
                <div style={styles.detailMilestone}>
                  <span style={styles.detailMilestoneIcon}>📅</span>
                  <span>{selectedOpp.nextMilestone.label}</span>
                  <span style={styles.detailMilestoneDate}>
                    {new Date(selectedOpp.nextMilestone.date).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          )}

          {activeView === 'list' ? (
            /* LIST VIEW */
            <div style={styles.listViewGrid}>
              {/* Opportunity Cards */}
              <div style={styles.opportunitiesGrid}>
                {filteredOpportunities.map((opp) => (
                  <button
                    key={opp.id}
                    style={{
                      ...styles.oppCard,
                      ...(selectedOpp?.id === opp.id ? styles.oppCardSelected : {}),
                      textAlign: 'left',
                    }}
                    onClick={() => setSelectedOpp(selectedOpp?.id === opp.id ? null : opp)}
                  >
                    <div style={styles.oppCardHeader}>
                      <div style={styles.oppCardCompany}>{opp.company}</div>
                      <div style={styles.oppCardValue}>{formatCurrency(opp.investmentSize)}</div>
                    </div>
                    <div style={styles.oppCardProject}>{opp.project}</div>
                    <div style={styles.oppCardMeta}>
                      <span style={styles.oppCardSector}>{opp.sector}</span>
                      <span style={styles.oppCardLocation}>
                        {opp.location.city ? `${opp.location.city}, ` : ''}{opp.location.state}
                      </span>
                    </div>
                    {opp.trumpPolicyAlignment && opp.trumpPolicyAlignment.length > 0 && (
                      <div style={styles.oppCardPolicies}>
                        {opp.trumpPolicyAlignment.slice(0, 2).map((policyId, i) => (
                          <span 
                            key={i}
                            style={{
                              ...styles.oppCardPolicyBadge,
                              backgroundColor: getPolicyColor(policyId) + '22',
                              color: getPolicyColor(policyId),
                            }}
                          >
                            {getPolicyLabel(policyId)}
                          </span>
                        ))}
                        {opp.trumpPolicyAlignment.length > 2 && (
                          <span style={styles.oppCardPolicyMore}>+{opp.trumpPolicyAlignment.length - 2}</span>
                        )}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* TIMELINE VIEW */
            <div style={styles.timelineView}>
              {timelineData.length === 0 ? (
                <div style={styles.emptyTimeline}>No milestones scheduled</div>
              ) : (
                timelineData.map(([monthYear, opps]) => (
                  <div key={monthYear} style={styles.timelineMonth}>
                    <div style={styles.timelineMonthHeader}>{monthYear}</div>
                    <div style={styles.timelineEvents}>
                      {opps.map((opp) => (
                        <button 
                          key={opp.id} 
                          style={{...styles.timelineEvent, textAlign: 'left'}}
                          onClick={() => setSelectedOpp(opp)}
                        >
                          <div style={styles.timelineEventDate}>
                            {new Date(opp.nextMilestone!.date).getDate()}
                          </div>
                          <div style={styles.timelineEventContent}>
                            <div style={styles.timelineEventCompany}>{opp.company}</div>
                            <div style={styles.timelineEventMilestone}>{opp.nextMilestone?.label}</div>
                            <div style={styles.timelineEventValue}>{formatCurrency(opp.investmentSize)}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
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
  
  // Live Intelligence Panel
  livePanel: {
    marginBottom: '1.5rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.danger}44`,
    borderRadius: '12px',
    overflow: 'hidden',
  },
  livePanelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.875rem 1.25rem',
    backgroundColor: `${COLORS.danger}11`,
    cursor: 'pointer',
    userSelect: 'none',
  },
  livePanelTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontWeight: 600,
    fontSize: '0.9375rem',
  },
  liveDot: {
    color: COLORS.danger,
    animation: 'pulse 2s infinite',
  },
  liveStatus: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
    fontWeight: 400,
  },
  livePanelStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  liveStat: {
    fontSize: '0.8125rem',
    color: COLORS.textMuted,
  },
  liveToggle: {
    padding: '0.25rem 0.75rem',
    backgroundColor: 'transparent',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '4px',
    color: COLORS.textMuted,
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  livePanelContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    padding: '1rem 1.25rem',
    borderTop: `1px solid ${COLORS.border}`,
  },
  liveColumn: {
    minWidth: 0,
  },
  liveColumnTitle: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.75rem',
  },
  liveEmpty: {
    fontSize: '0.8125rem',
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  liveItem: {
    padding: '0.625rem 0.75rem',
    backgroundColor: COLORS.bg,
    borderRadius: '6px',
    marginBottom: '0.5rem',
  },
  liveItemTitle: {
    fontSize: '0.8125rem',
    fontWeight: 500,
    lineHeight: 1.4,
    marginBottom: '0.25rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  liveItemMeta: {
    display: 'flex',
    gap: '0.75rem',
    fontSize: '0.6875rem',
    color: COLORS.textMuted,
  },
  liveItemActions: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  promoteBtn: {
    padding: '0.25rem 0.625rem',
    backgroundColor: COLORS.accent,
    border: 'none',
    borderRadius: '4px',
    color: COLORS.bg,
    fontSize: '0.6875rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  dismissBtn: {
    padding: '0.25rem 0.5rem',
    backgroundColor: 'transparent',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '4px',
    color: COLORS.textMuted,
    fontSize: '0.6875rem',
    cursor: 'pointer',
  },
  pendingBadge: {
    padding: '0.125rem 0.5rem',
    backgroundColor: COLORS.warning,
    borderRadius: '4px',
    color: COLORS.bg,
    fontSize: '0.6875rem',
    fontWeight: 600,
  },

  // View Controls
  viewControls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  viewToggle: {
    display: 'flex',
    gap: '0.5rem',
  },
  viewBtn: {
    padding: '0.625rem 1.25rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    color: COLORS.textMuted,
    fontSize: '0.9375rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  viewBtnActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
    color: COLORS.bg,
  },
  pipelineStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    color: COLORS.textMuted,
  },
  statItem: {
    color: COLORS.text,
  },
  statDivider: {
    opacity: 0.5,
  },

  // Search Container
  searchContainer: {
    marginBottom: '1.5rem',
  },
  searchResults: {
    marginTop: '0.5rem',
    fontSize: '0.8125rem',
    color: COLORS.textMuted,
  },

  // Main Content
  mainContent: {
    minHeight: '400px',
  },
  listViewGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  opportunitiesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1rem',
  },

  // Opportunity Card
  oppCard: {
    padding: '1.25rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  oppCardSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent + '11',
  },
  oppCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.5rem',
  },
  oppCardCompany: {
    fontSize: '1rem',
    fontWeight: 600,
    color: COLORS.text,
  },
  oppCardValue: {
    fontSize: '1rem',
    fontWeight: 700,
    color: COLORS.accent,
    fontFamily: "'JetBrains Mono', monospace",
  },
  oppCardProject: {
    fontSize: '0.875rem',
    color: COLORS.textMuted,
    marginBottom: '0.5rem',
    lineHeight: 1.4,
  },
  oppCardMeta: {
    display: 'flex',
    gap: '0.75rem',
    fontSize: '0.75rem',
    color: COLORS.textMuted,
    marginBottom: '0.75rem',
  },
  oppCardSector: {
    textTransform: 'capitalize',
  },
  oppCardLocation: {},
  oppCardPolicies: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.375rem',
  },
  oppCardPolicyBadge: {
    padding: '0.125rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: 600,
  },
  oppCardPolicyMore: {
    fontSize: '0.6875rem',
    color: COLORS.textMuted,
    alignSelf: 'center',
  },

  // Detail Panel (inline)
  detailPanel: {
    position: 'relative',
    padding: '1.5rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.accent}`,
    borderRadius: '12px',
    marginBottom: '1rem',
  },
  detailClose: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    padding: '0.25rem 0.5rem',
    backgroundColor: 'transparent',
    border: 'none',
    color: COLORS.textMuted,
    fontSize: '1rem',
    cursor: 'pointer',
  },
  detailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.5rem',
  },
  detailCompany: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: COLORS.text,
  },
  detailValue: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: COLORS.accent,
    fontFamily: "'JetBrains Mono', monospace",
  },
  detailProject: {
    fontSize: '1rem',
    color: COLORS.textMuted,
    marginBottom: '0.75rem',
  },
  detailMeta: {
    display: 'flex',
    gap: '0.5rem',
    fontSize: '0.875rem',
    color: COLORS.textMuted,
    marginBottom: '1rem',
  },
  detailPolicies: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  detailPolicyBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    fontWeight: 600,
  },
  detailImpact: {
    padding: '1rem',
    backgroundColor: COLORS.bg,
    borderRadius: '8px',
  },
  detailImpactLabel: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: COLORS.textMuted,
    marginBottom: '0.5rem',
  },
  detailImpactText: {
    fontSize: '0.875rem',
    color: COLORS.text,
    lineHeight: 1.5,
  },
  detailServices: {
    marginTop: '1rem',
  },
  detailServicesLabel: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: COLORS.textMuted,
    marginBottom: '0.5rem',
  },
  detailServicesTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  detailServiceTag: {
    padding: '0.25rem 0.75rem',
    backgroundColor: COLORS.bg,
    borderRadius: '6px',
    fontSize: '0.75rem',
    color: COLORS.text,
  },
  detailMilestone: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '1rem',
    padding: '0.75rem',
    backgroundColor: COLORS.bg,
    borderRadius: '8px',
    fontSize: '0.875rem',
    color: COLORS.text,
  },
  detailMilestoneIcon: {
    fontSize: '1rem',
  },
  detailMilestoneDate: {
    marginLeft: 'auto',
    color: COLORS.accent,
    fontWeight: 600,
  },

  // Timeline View
  timelineView: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  emptyTimeline: {
    padding: '3rem',
    textAlign: 'center',
    color: COLORS.textMuted,
  },
  timelineMonth: {
    borderLeft: `2px solid ${COLORS.border}`,
    paddingLeft: '1.5rem',
  },
  timelineMonthHeader: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: COLORS.text,
    marginBottom: '1rem',
    position: 'relative',
  },
  timelineEvents: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  timelineEvent: {
    display: 'flex',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  timelineEventDate: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent + '22',
    borderRadius: '8px',
    fontSize: '1.125rem',
    fontWeight: 700,
    color: COLORS.accent,
    flexShrink: 0,
  },
  timelineEventContent: {
    flex: 1,
    minWidth: 0,
  },
  timelineEventCompany: {
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: COLORS.text,
  },
  timelineEventMilestone: {
    fontSize: '0.8125rem',
    color: COLORS.textMuted,
  },
  timelineEventValue: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: COLORS.accent,
    fontFamily: "'JetBrains Mono', monospace",
    marginTop: '0.25rem',
  },

  filters: {
    display: 'none', // Hidden - keeping for potential future use
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
  filterBtnPrimary: {
    backgroundColor: '#f59e0b22',
    borderColor: '#f59e0b',
    color: '#f59e0b',
    fontWeight: 700,
  },
  policyBanner: {
    padding: '1rem 1.5rem',
    backgroundColor: '#f59e0b11',
    border: '1px solid #f59e0b33',
    borderRadius: '12px',
    marginBottom: '1.5rem',
  },
  policyBannerHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.25rem',
  },
  policyBannerIcon: {
    fontSize: '1.5rem',
  },
  policyBannerTitle: {
    fontSize: '1.125rem',
    fontWeight: 700,
    color: '#f59e0b',
  },
  policyBannerSubtitle: {
    fontSize: '0.875rem',
    color: COLORS.textMuted,
  },
  policySelector: {
    padding: '1rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    marginBottom: '1.5rem',
  },
  policySelectorLabel: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: COLORS.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: '0.75rem',
  },
  policyButtons: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
  },
  policyBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.375rem 0.75rem',
    backgroundColor: 'transparent',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '6px',
    color: COLORS.textMuted,
    fontFamily: 'inherit',
    fontSize: '0.75rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  policyBtnActive: {
    backgroundColor: COLORS.accent + '11',
    borderColor: COLORS.accent,
    color: COLORS.text,
  },
  policyCount: {
    fontSize: '0.6875rem',
    opacity: 0.7,
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
  policyAlignmentSection: {
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: '#f59e0b11',
    border: '1px solid #f59e0b33',
    borderRadius: '8px',
  },
  policyAlignmentHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  policyAlignmentIcon: {
    fontSize: '1.25rem',
  },
  policyAlignmentTitle: {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: '#f59e0b',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  policyAlignmentTags: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.375rem',
    marginBottom: '0.75rem',
  },
  policyAlignmentTag: {
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: 600,
    border: '1px solid',
  },
  civilizationalImpact: {
    marginTop: '0.75rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid #f59e0b22',
  },
  civilizationalLabel: {
    fontSize: '0.6875rem',
    fontWeight: 600,
    color: COLORS.textMuted,
    marginBottom: '0.25rem',
  },
  civilizationalText: {
    fontSize: '0.8125rem',
    color: COLORS.text,
    lineHeight: 1.5,
    fontStyle: 'italic',
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
  listItemPolicies: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.375rem',
    marginTop: '0.5rem',
  },
  listItemPolicyBadge: {
    padding: '0.125rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.5625rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.03em',
  },
  listItemPolicyMore: {
    padding: '0.125rem 0.375rem',
    color: COLORS.textMuted,
    fontSize: '0.5625rem',
  },
}
