'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import {
  opportunities,
  TRUMP_POLICIES,
  SECTOR_MAPPING,
  calculateSectorPipeline,
  type Opportunity,
  type TrumpPolicyAlignment,
} from '../../lib/data/opportunities'

// ─── Theme ──────────────────────────────────────────────────────────────────
const C = {
  bg: '#0a0f14',
  card: '#0d1117',
  border: '#21262d',
  text: '#e6edf3',
  muted: '#7d8590',
  accent: '#7ee787',
  warn: '#d29922',
  danger: '#f85149',
  blue: '#58a6ff',
  purple: '#a371f7',
}

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmt = (m: number) => (m >= 1000 ? '$' + (m / 1000).toFixed(1) + 'B' : '$' + m + 'M')

const policyLabel = (id: TrumpPolicyAlignment) =>
  TRUMP_POLICIES.find((p) => p.id === id)?.shortName || id

const policyColor = (id: TrumpPolicyAlignment) => {
  const map: Record<string, string> = {
    'stargate-initiative': '#f59e0b',
    'eo-14179-ai-leadership': '#ef4444',
    'genesis-mission': '#22c55e',
    'eo-14365-ai-framework': '#ef4444',
    'winning-race-action-plan': '#3b82f6',
    'chips-sovereignty': '#8b5cf6',
    'energy-dominance': '#f97316',
    'nuclear-restart': '#06b6d4',
  }
  return map[id] || C.muted
}

const stageLabel = (s?: Opportunity['procurementStage']) => {
  if (!s) return 'Unknown'
  const m: Record<string, string> = {
    monitoring: 'Monitoring', 'pre-rfp': 'Pre-RFP', 'rfp-open': 'RFP Open',
    'proposal-submitted': 'Proposal Submitted', evaluation: 'Under Evaluation',
    awarded: 'Awarded', lost: 'Lost', construction: 'In Construction',
  }
  return m[s] || s
}

const svcLabel = (s: string) => {
  const m: Record<string, string> = {
    'ot-strategy': 'OT Strategy', 'smart-factory': 'Smart Factory',
    'supply-chain': 'Supply Chain', erp: 'ERP', workforce: 'Workforce',
    sustainability: 'Sustainability', tax: 'Tax',
  }
  return m[s] || s
}

const priorityBorder = (p: Opportunity['priority']) => {
  if (p === 'hot') return `3px solid ${C.danger}`
  if (p === 'warm') return `3px solid ${C.warn}`
  return `3px solid transparent`
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function RadarPage() {
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'list' | 'timeline'>('list')
  const [selected, setSelected] = useState<Opportunity | null>(null)

  // Synced from the map iframe's filters
  const [mapSector, setMapSector] = useState('all')
  const [mapPriority, setMapPriority] = useState('all')
  const [mapState, setMapState] = useState<string | null>(null)

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type !== 'ov-map-filter') return
      setMapSector(e.data.sector ?? 'all')
      setMapPriority(e.data.priority ?? 'all')
      setMapState(e.data.state ?? null)
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  const hasMapFilter = mapSector !== 'all' || mapPriority !== 'all' || !!mapState

  // Filtered opportunities (map filters + search)
  const filtered = useMemo(() => {
    let f = [...opportunities]
    if (mapSector !== 'all') f = f.filter((o) => o.sector === mapSector)
    if (mapPriority !== 'all') f = f.filter((o) => o.priority === mapPriority)
    if (mapState) f = f.filter((o) => o.location.state === mapState)
    if (search) {
      const q = search.toLowerCase()
      f = f.filter(
        (o) =>
          o.company.toLowerCase().includes(q) ||
          o.project.toLowerCase().includes(q) ||
          o.sector.toLowerCase().includes(q) ||
          o.location.state.toLowerCase().includes(q) ||
          o.location.city?.toLowerCase().includes(q),
      )
    }
    return f.sort((a, b) => b.investmentSize - a.investmentSize)
  }, [search, mapSector, mapPriority, mapState])

  // Timeline also respects filters
  const timeline = useMemo(() => {
    const byDate: Record<string, Opportunity[]> = {}
    filtered.forEach((o) => {
      if (!o.nextMilestone?.date) return
      const key = new Date(o.nextMilestone.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      ;(byDate[key] ||= []).push(o)
    })
    return Object.entries(byDate).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
  }, [filtered])

  // Sector breakdown (compact)
  const sectors = useMemo(() => calculateSectorPipeline(opportunities), [])

  // Pipeline stages
  const STAGES: { key: NonNullable<Opportunity['procurementStage']>; label: string; color: string }[] = [
    { key: 'monitoring', label: 'Monitoring', color: '#64748b' },
    { key: 'pre-rfp', label: 'Pre-RFP', color: '#8b5cf6' },
    { key: 'rfp-open', label: 'RFP Open', color: '#3b82f6' },
    { key: 'proposal-submitted', label: 'Submitted', color: '#06b6d4' },
    { key: 'evaluation', label: 'Evaluation', color: '#d29922' },
    { key: 'awarded', label: 'Awarded', color: '#7ee787' },
    { key: 'construction', label: 'Construction', color: '#22c55e' },
  ]

  const pipelineStages = useMemo(() => {
    return STAGES.map((stage) => {
      const opps = opportunities.filter((o) => o.procurementStage === stage.key)
      const value = opps.reduce((s, o) => s + o.investmentSize, 0)
      return { ...stage, count: opps.length, value, opps }
    })
  }, [])

  // Dynamic stats (reflect filters)
  const filteredPipeline = useMemo(() => filtered.reduce((s, o) => s + o.investmentSize, 0), [filtered])
  const filteredPolicyCount = useMemo(() => filtered.filter((o) => o.trumpPolicyAlignment?.length).length, [filtered])

  // Filter label for the banner
  const filterParts: string[] = []
  if (mapSector !== 'all') filterParts.push(mapSector.replace(/-/g, ' '))
  if (mapPriority !== 'all') filterParts.push(mapPriority)
  if (mapState) filterParts.push(mapState)

  // ── render ──
  return (
    <main style={S.main}>
      {/* ── Brand line (dynamic stats) ─────────────────────────────── */}
      <header style={S.brand}>
        <div style={S.brandLeft}>
          <span style={{ fontSize: '1.1rem' }}>⏱</span>
          <span style={S.brandName}>OT Vantage</span>
          <span style={S.brandTag}>Pipeline Intelligence</span>
        </div>
        <div style={S.brandStats}>
          <span><strong>{filtered.length}</strong> opportunities</span>
          <span style={S.dot}>·</span>
          <span><strong>{fmt(filteredPipeline)}</strong> pipeline</span>
          <span style={S.dot}>·</span>
          <span><strong>{filteredPolicyCount}</strong> policy-aligned</span>
        </div>
      </header>

      {/* ── Sector strip (compact) ─────────────────────────────────── */}
      <div style={S.sectorStrip} className="ov-sector-strip">
        {sectors.map((s) => (
          <div key={s.sector} style={S.sectorPill}>
            <span style={{ ...S.sectorDot, backgroundColor: s.color }} />
            <span style={S.sectorPillName}>{s.sector}</span>
            <span style={S.sectorPillVal}>${s.pipeline}B</span>
            <span style={S.sectorPillCount}>{s.projects}</span>
          </div>
        ))}
      </div>

      {/* ── Top row: Map (40%) + Jupiter tracker (60%) ──────────── */}
      <div style={S.topRow} className="ov-top-row">
        {/* Map */}
        <section style={S.mapPanel}>
          <div style={S.panelHead}>
            <h2 style={S.panelTitle}>Map</h2>
            <Link href="/map" style={S.fullLink}>Full screen →</Link>
          </div>
          <div style={S.mapFrame}>
            <iframe title="OT Vantage map" src="/map?embed=1" style={S.iframe} />
          </div>
        </section>

        {/* Jupiter tracker */}
        <section style={S.trackerPanel}>
          <div style={S.panelHead}>
            <h2 style={S.panelTitle}>Jupiter Tracker</h2>
            <div style={S.viewToggle}>
              <button style={view === 'list' ? S.tabActive : S.tab} onClick={() => setView('list')}>List</button>
              <button style={view === 'timeline' ? S.tabActive : S.tab} onClick={() => setView('timeline')}>Timeline</button>
            </div>
          </div>

          {/* Active filter indicator */}
          {hasMapFilter && (
            <div style={S.filterBanner}>
              <span>
                Filtered by map: {filterParts.join(' · ')}
              </span>
              <span style={{ color: C.muted, marginLeft: '0.25rem' }}>
                ({filtered.length} of {opportunities.length})
              </span>
            </div>
          )}

          {/* Search */}
          <div style={S.searchWrap}>
            <input
              placeholder="Search opportunities…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={S.searchInput}
            />
            {search && (
              <span style={S.searchCount}>
                {filtered.length} / {opportunities.length}
              </span>
            )}
          </div>

          {/* Scrollable content */}
          <div style={S.trackerScroll}>
            {/* Detail panel (when selected, list view) */}
            {selected && view === 'list' && (
              <Detail opp={selected} onClose={() => setSelected(null)} />
            )}

            {/* Empty state */}
            {filtered.length === 0 ? (
              <div style={S.emptyState}>
                No opportunities match the current filters.
                {hasMapFilter && <span> Try resetting the map filters.</span>}
              </div>
            ) : view === 'list' ? (
              <div style={S.grid}>
                {filtered.map((o) => (
                  <OppCard
                    key={o.id}
                    opp={o}
                    active={selected?.id === o.id}
                    onClick={() => setSelected(selected?.id === o.id ? null : o)}
                  />
                ))}
              </div>
            ) : (
              <div style={S.timelineWrap}>
                {timeline.length === 0 ? (
                  <div style={S.emptyState}>No milestones scheduled for the current filter.</div>
                ) : (
                  timeline.map(([month, opps]) => (
                    <div key={month} style={S.tlMonth}>
                      <div style={S.tlMonthLabel}>{month}</div>
                      {opps.map((o) => (
                        <div key={o.id}>
                          <button
                            style={{
                              ...S.tlEvent,
                              ...(selected?.id === o.id ? S.tlEventActive : {}),
                            }}
                            onClick={() => setSelected(selected?.id === o.id ? null : o)}
                          >
                            <span style={S.tlDate}>{new Date(o.nextMilestone!.date).getDate()}</span>
                            <span style={{ flex: 1 }}>
                              <span style={S.tlCompany}>{o.company}</span>
                              <span style={S.tlMilestone}>{o.nextMilestone?.label}</span>
                            </span>
                            <span style={S.tlVal}>{fmt(o.investmentSize)}</span>
                          </button>
                          {selected?.id === o.id && (
                            <Detail opp={o} onClose={() => setSelected(null)} inline />
                          )}
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ── Pipeline Tracker (Salesforce-style stage funnel) ────────── */}
      <section style={S.pipeSection}>
        <h2 style={S.sectionHeading}>Pipeline Tracker</h2>

        {/* Stage bar */}
        <div style={S.stageBar} className="ov-stage-bar">
          {pipelineStages.map((st) => {
            const pct = opportunities.length ? (st.count / opportunities.length) * 100 : 0
            return (
              <div
                key={st.key}
                style={{ ...S.stageSegment, flex: Math.max(pct, 4) }}
                title={`${st.label}: ${st.count} opps — ${fmt(st.value)}`}
              >
                <div style={{ ...S.stageSegmentFill, backgroundColor: st.color }} />
              </div>
            )
          })}
        </div>

        {/* Stage cards */}
        <div style={S.stageGrid} className="ov-stage-grid">
          {pipelineStages.map((st) => (
            <div key={st.key} style={S.stageCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.375rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: st.color, flexShrink: 0 }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: C.text }}>{st.label}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={S.stageCount}>{st.count}</span>
                <span style={S.stageValue}>{fmt(st.value)}</span>
              </div>
              {st.opps.length > 0 && (
                <div style={S.stageOpps}>
                  {st.opps.slice(0, 3).map((o) => (
                    <div key={o.id} style={S.stageOpp}>
                      <span style={S.stageOppName}>{o.company}</span>
                      <span style={S.stageOppVal}>{fmt(o.investmentSize)}</span>
                    </div>
                  ))}
                  {st.opps.length > 3 && (
                    <div style={{ fontSize: '0.625rem', color: C.muted, marginTop: '0.125rem' }}>
                      +{st.opps.length - 3} more
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function OppCard({ opp, active, onClick }: { opp: Opportunity; active: boolean; onClick: () => void }) {
  return (
    <button
      style={{
        ...S.card,
        ...(active ? S.cardActive : {}),
        textAlign: 'left' as const,
        borderLeft: priorityBorder(opp.priority),
      }}
      onClick={onClick}
    >
      <div style={S.cardHead}>
        <span style={S.cardCompany}>{opp.company}</span>
        <span style={S.cardVal}>{fmt(opp.investmentSize)}</span>
      </div>
      <div style={S.cardProject}>{opp.project}</div>
      <div style={S.cardMeta}>
        <span style={{ textTransform: 'capitalize' as const }}>{opp.sector}</span>
        <span>{opp.location.city ? `${opp.location.city}, ` : ''}{opp.location.state}</span>
      </div>
      {opp.trumpPolicyAlignment?.length > 0 && (
        <div style={S.cardPolicies}>
          {opp.trumpPolicyAlignment.slice(0, 2).map((id, i) => (
            <span key={i} style={{ ...S.badge, backgroundColor: policyColor(id) + '22', color: policyColor(id) }}>
              {policyLabel(id)}
            </span>
          ))}
          {opp.trumpPolicyAlignment.length > 2 && (
            <span style={{ fontSize: '0.6875rem', color: C.muted }}>+{opp.trumpPolicyAlignment.length - 2}</span>
          )}
        </div>
      )}
    </button>
  )
}

function Detail({ opp, onClose, inline }: { opp: Opportunity; onClose: () => void; inline?: boolean }) {
  return (
    <div style={inline ? S.inlineDetail : S.detail}>
      <button style={S.closeBtn} onClick={onClose}>✕</button>
      <div style={S.detailHead}>
        <span style={S.detailCompany}>{opp.company}</span>
        <span style={S.detailVal}>{fmt(opp.investmentSize)}</span>
      </div>
      <div style={S.detailProject}>{opp.project}</div>
      <div style={S.detailMeta}>
        <span>{opp.sector}</span><span>·</span>
        <span>{opp.location.city ? `${opp.location.city}, ` : ''}{opp.location.state}</span>
      </div>

      {opp.trumpPolicyAlignment?.length > 0 && (
        <div style={S.detailPolicies}>
          {opp.trumpPolicyAlignment.map((id, i) => (
            <span key={i} style={{ ...S.badge, backgroundColor: policyColor(id) + '22', color: policyColor(id) }}>
              {policyLabel(id)}
            </span>
          ))}
        </div>
      )}

      {(opp.rfpStatus || opp.procurementStage) && (
        <div style={S.procBlock}>
          <div style={S.procLabel}>Procurement</div>
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '0.375rem' }}>
            <span style={S.procBadge}>{stageLabel(opp.procurementStage)}</span>
            {opp.rfpStatus && (
              <span style={{
                ...S.procBadge,
                color: opp.rfpStatus === 'open' ? '#22c55e' : opp.rfpStatus === 'expected' ? '#f59e0b' : C.muted,
              }}>
                RFP: {opp.rfpStatus.toUpperCase()}
              </span>
            )}
            {opp.expectedDecision && <span style={S.procBadge}>Decision: {opp.expectedDecision}</span>}
            {opp.rfpUrl && (
              <a href={opp.rfpUrl} target="_blank" rel="noopener noreferrer" style={S.rfpLink}>View RFP →</a>
            )}
          </div>
        </div>
      )}

      {opp.civilizationalImpact && (
        <div style={S.impactBlock}>
          <div style={S.impactLabel}>Civilizational Impact</div>
          <div style={{ fontSize: '0.8125rem', color: C.muted, lineHeight: 1.5 }}>{opp.civilizationalImpact}</div>
        </div>
      )}

      {opp.services?.length > 0 && (
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ fontSize: '0.6875rem', color: C.muted, fontWeight: 600, marginBottom: '0.375rem', textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>Services</div>
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '0.375rem' }}>
            {opp.services.map((s, i) => (
              <span key={i} style={S.svcTag}>{svcLabel(s)}</span>
            ))}
          </div>
        </div>
      )}

      {opp.nextMilestone && (
        <div style={S.milestone}>
          <span>📅 {opp.nextMilestone.label}</span>
          <span style={{ color: C.muted, marginLeft: '0.5rem' }}>
            {new Date(opp.nextMilestone.date).toLocaleDateString()}
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  main: {
    minHeight: '100vh',
    backgroundColor: C.bg,
    color: C.text,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    padding: '0 1.5rem 3rem',
  },

  // Brand strip
  brand: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.875rem 0',
    borderBottom: `1px solid ${C.border}`,
    marginBottom: '0.75rem',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  brandLeft: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  brandName: {
    fontSize: '1.125rem',
    fontWeight: 800,
    background: `linear-gradient(135deg, ${C.text} 0%, ${C.accent} 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  brandTag: { fontSize: '0.75rem', color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase' },
  brandStats: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: C.muted },
  dot: { opacity: 0.4 },

  // Sector strip (compact horizontal)
  sectorStrip: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem',
    overflowX: 'auto',
    paddingBottom: '0.25rem',
  },
  sectorPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.3rem 0.625rem',
    backgroundColor: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: '20px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  sectorDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  sectorPillName: { fontSize: '0.6875rem', fontWeight: 600, color: C.text },
  sectorPillVal: { fontSize: '0.6875rem', fontWeight: 700, color: C.accent, fontFamily: "'JetBrains Mono', monospace" },
  sectorPillCount: { fontSize: '0.625rem', color: C.muted },

  // Top row (40/60 split)
  topRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 3fr',
    gap: '1.25rem',
    marginBottom: '1.5rem',
    minHeight: 'min(72vh, 780px)',
  },

  // Map panel
  mapPanel: { display: 'flex', flexDirection: 'column', minWidth: 0 },
  panelHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  panelTitle: { margin: 0, fontSize: '1rem', fontWeight: 700, color: C.accent },
  fullLink: { color: C.blue, fontSize: '0.8rem', textDecoration: 'none', fontWeight: 600 },
  mapFrame: {
    flex: 1,
    minHeight: 0,
    borderRadius: '10px',
    overflow: 'hidden',
    border: `1px solid ${C.border}`,
    backgroundColor: C.card,
  },
  iframe: { width: '100%', height: '100%', border: 'none', display: 'block' },

  // Tracker panel
  trackerPanel: { display: 'flex', flexDirection: 'column', minWidth: 0 },
  viewToggle: { display: 'flex', gap: '0.375rem' },
  tab: {
    padding: '0.3rem 0.75rem',
    backgroundColor: 'transparent',
    border: `1px solid ${C.border}`,
    borderRadius: '6px',
    color: C.muted,
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  tabActive: {
    padding: '0.3rem 0.75rem',
    backgroundColor: C.accent,
    border: `1px solid ${C.accent}`,
    borderRadius: '6px',
    color: C.bg,
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
  },

  // Filter banner
  filterBanner: {
    padding: '0.375rem 0.625rem',
    marginBottom: '0.5rem',
    backgroundColor: C.blue + '18',
    border: `1px solid ${C.blue}44`,
    borderRadius: '6px',
    fontSize: '0.75rem',
    color: C.blue,
    fontWeight: 500,
    textTransform: 'capitalize' as const,
  },

  // Search
  searchWrap: { position: 'relative', marginBottom: '0.625rem' },
  searchInput: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    backgroundColor: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: '8px',
    color: C.text,
    fontSize: '0.8125rem',
    outline: 'none',
  },
  searchCount: { position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.6875rem', color: C.muted },

  // Scrollable tracker body
  trackerScroll: { flex: 1, minHeight: 0, overflowY: 'auto' },

  // Empty state
  emptyState: {
    padding: '2rem',
    textAlign: 'center',
    color: C.muted,
    fontSize: '0.875rem',
    fontStyle: 'italic',
  },

  // Card grid
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.625rem' },

  // Opportunity card
  card: {
    padding: '1rem',
    backgroundColor: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'border-color 0.15s',
    width: '100%',
    color: C.text,
  },
  cardActive: { borderColor: C.accent, backgroundColor: C.accent + '11' },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.375rem' },
  cardCompany: { fontSize: '0.9375rem', fontWeight: 600, color: C.text },
  cardVal: { fontSize: '0.9375rem', fontWeight: 700, color: C.accent, fontFamily: "'JetBrains Mono', monospace" },
  cardProject: { fontSize: '0.8125rem', color: C.muted, marginBottom: '0.375rem', lineHeight: 1.4 },
  cardMeta: { display: 'flex', gap: '0.625rem', fontSize: '0.6875rem', color: C.muted, marginBottom: '0.5rem' },
  cardPolicies: { display: 'flex', flexWrap: 'wrap', gap: '0.3rem' },
  badge: { padding: '0.1rem 0.45rem', borderRadius: '4px', fontSize: '0.625rem', fontWeight: 600 },

  // Detail panel
  detail: {
    position: 'relative',
    padding: '1.25rem',
    backgroundColor: C.card,
    border: `1px solid ${C.accent}`,
    borderRadius: '10px',
    marginBottom: '0.75rem',
  },
  inlineDetail: {
    position: 'relative',
    padding: '1rem',
    backgroundColor: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: '8px',
    marginBottom: '0.5rem',
    marginTop: '0.25rem',
  },
  closeBtn: { position: 'absolute', top: '0.75rem', right: '0.75rem', padding: '0.15rem 0.4rem', backgroundColor: 'transparent', border: 'none', color: C.muted, fontSize: '0.875rem', cursor: 'pointer' },
  detailHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.375rem' },
  detailCompany: { fontSize: '1.125rem', fontWeight: 700, color: C.text },
  detailVal: { fontSize: '1.25rem', fontWeight: 700, color: C.accent, fontFamily: "'JetBrains Mono', monospace" },
  detailProject: { fontSize: '0.9375rem', color: C.muted, marginBottom: '0.5rem' },
  detailMeta: { display: 'flex', gap: '0.5rem', fontSize: '0.8125rem', color: C.muted, marginBottom: '0.75rem' },
  detailPolicies: { display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.75rem' },

  // Procurement
  procBlock: { padding: '0.75rem', backgroundColor: C.bg, borderRadius: '8px', border: `1px solid ${C.border}`, marginBottom: '0.75rem' },
  procLabel: { fontSize: '0.6875rem', fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' },
  procBadge: { padding: '0.15rem 0.5rem', backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: '4px', fontSize: '0.6875rem', color: C.text },
  rfpLink: { fontSize: '0.6875rem', color: C.blue, textDecoration: 'none', fontWeight: 600 },

  impactBlock: { marginTop: '0.75rem' },
  impactLabel: { fontSize: '0.6875rem', fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' },

  svcTag: { padding: '0.15rem 0.5rem', backgroundColor: C.accent + '18', color: C.accent, borderRadius: '4px', fontSize: '0.6875rem', fontWeight: 500 },

  milestone: { marginTop: '0.75rem', fontSize: '0.8125rem', color: C.text },

  // Timeline
  timelineWrap: {},
  tlMonth: { marginBottom: '1rem' },
  tlMonthLabel: { fontSize: '0.75rem', fontWeight: 700, color: C.accent, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.375rem' },
  tlEvent: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    width: '100%',
    padding: '0.5rem 0.625rem',
    backgroundColor: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: '8px',
    color: C.text,
    fontSize: '0.8125rem',
    cursor: 'pointer',
    marginBottom: '0.25rem',
    textAlign: 'left' as const,
  },
  tlEventActive: { borderColor: C.accent, backgroundColor: C.accent + '11' },
  tlDate: { fontWeight: 700, fontSize: '1rem', color: C.accent, minWidth: '1.75rem', textAlign: 'center' },
  tlCompany: { fontWeight: 600, display: 'block' },
  tlMilestone: { fontSize: '0.75rem', color: C.muted, display: 'block' },
  tlVal: { fontWeight: 700, color: C.accent, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8125rem' },

  // Section heading
  sectionHeading: { fontSize: '1rem', fontWeight: 700, color: C.accent, margin: '0 0 0.75rem' },

  // Pipeline tracker
  pipeSection: { marginBottom: '2rem' },
  stageBar: {
    display: 'flex',
    gap: 2,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: '0.75rem',
  },
  stageSegment: { position: 'relative', minWidth: 4 },
  stageSegmentFill: { width: '100%', height: '100%', borderRadius: 2, opacity: 0.85 },
  stageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '0.625rem',
  },
  stageCard: {
    padding: '0.75rem',
    backgroundColor: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: '8px',
  },
  stageCount: { fontSize: '1.5rem', fontWeight: 700, color: C.text, fontFamily: "'JetBrains Mono', monospace" },
  stageValue: { fontSize: '0.8125rem', fontWeight: 600, color: C.accent, fontFamily: "'JetBrains Mono', monospace" },
  stageOpps: { marginTop: '0.5rem', borderTop: `1px solid ${C.border}`, paddingTop: '0.375rem' },
  stageOpp: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.125rem 0' },
  stageOppName: { fontSize: '0.6875rem', color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' },
  stageOppVal: { fontSize: '0.6875rem', fontWeight: 600, color: C.accent, fontFamily: "'JetBrains Mono', monospace" },
}
