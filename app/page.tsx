'use client'

import { useState, useMemo } from 'react'

// ============================================================================
// THE THESIS: Heart / Brain / Foundation
// ============================================================================
// The Heart: AI that solves problems (healthcare, education, manufacturing)
// The Brain: AI infrastructure (data centers, semiconductors, compute)
// The Foundation: Prerequisites that keep them working (rare earths, batteries, grid, fuel)

type Category = 'heart' | 'brain' | 'foundation'
type Priority = 'hot' | 'warm' | 'tracking'

interface Opportunity {
  id: string
  client: string
  project: string
  category: Category
  subcategory: string
  value: number // millions
  prerequisites: string[]
  deloitteServices: string[]
  nextMilestone?: { date: string; action: string }
  priority: Priority
  whyItMatters: string
  contacts?: string[]
}

// ============================================================================
// OPPORTUNITIES DATA — Tied to the Build Economy Thesis
// ============================================================================
const opportunities: Opportunity[] = [
  // === THE HEART === (AI that solves problems)
  {
    id: 'h1',
    client: 'Major Health System',
    project: 'AI Cancer Detection Platform',
    category: 'heart',
    subcategory: 'Healthcare AI',
    value: 45,
    prerequisites: ['Data Center Capacity', 'GPU Supply', 'Medical Data Pipeline'],
    deloitteServices: ['Industrial AI Security', 'AI/OT Integration', 'Data Governance'],
    nextMilestone: { date: '2026-01-15', action: 'Pilot deployment decision' },
    priority: 'hot',
    whyItMatters: 'AI that finds cancer before you feel sick. Requires secure AI infrastructure.',
    contacts: ['CTO', 'CISO'],
  },
  {
    id: 'h2',
    client: 'State Education Dept',
    project: 'Personalized Learning AI',
    category: 'heart',
    subcategory: 'Education AI',
    value: 28,
    prerequisites: ['Cloud Infrastructure', 'Data Privacy Framework', 'Teacher Training'],
    deloitteServices: ['AI Governance', 'Change Management', 'Workforce Training'],
    nextMilestone: { date: '2026-02-01', action: 'RFP release' },
    priority: 'warm',
    whyItMatters: 'AI that teaches every kid in a way they understand.',
    contacts: ['Superintendent', 'CIO'],
  },
  {
    id: 'h3',
    client: 'Pharma Giant',
    project: 'AI Drug Discovery Acceleration',
    category: 'heart',
    subcategory: 'Healthcare AI',
    value: 120,
    prerequisites: ['HPC Compute', 'Secure Data Sharing', 'Regulatory Framework'],
    deloitteServices: ['Industrial AI Security', 'Regulatory Compliance', 'Data Platform'],
    nextMilestone: { date: '2026-01-20', action: 'Partnership announcement' },
    priority: 'hot',
    whyItMatters: 'Discover new medicines faster. AI models need protection from IP theft.',
    contacts: ['Chief Scientific Officer', 'CIO'],
  },

  // === THE BRAIN === (AI Infrastructure)
  {
    id: 'b1',
    client: 'Microsoft',
    project: 'Wisconsin AI Data Center',
    category: 'brain',
    subcategory: 'Data Centers',
    value: 3300,
    prerequisites: ['Semiconductor Supply (GPUs)', 'Water Infrastructure', 'Grid Capacity', 'Cooling Systems'],
    deloitteServices: ['Commissioning-to-Operate OT Security', 'EPC Vendor Governance', 'OT Asset Canonization'],
    nextMilestone: { date: '2026-01-10', action: 'Phase 1 OT security RFP' },
    priority: 'hot',
    whyItMatters: 'The Brain that runs AI. Every AI miracle starts here. Needs secure OT from Day 1.',
    contacts: ['VP Infrastructure', 'CISO'],
  },
  {
    id: 'b2',
    client: 'Intel',
    project: 'Ohio Mega-Fab (AI Chips)',
    category: 'brain',
    subcategory: 'Semiconductors',
    value: 28000,
    prerequisites: ['Semiconductor Materials', 'Water & Power', 'Skilled Workforce', 'Equipment (ASML)'],
    deloitteServices: ['Smart Factory OT Security', 'Commissioning Security', 'Workforce Planning'],
    nextMilestone: { date: '2026-03-31', action: 'Major tool install / OT integration wave' },
    priority: 'hot',
    whyItMatters: 'AI chips made in America. CHIPS Act funded. Fab = 3,000 OT assets to secure.',
    contacts: ['VP Manufacturing', 'CIO'],
  },
  {
    id: 'b3',
    client: 'TSMC',
    project: 'Arizona Fab 2 (3nm AI Chips)',
    category: 'brain',
    subcategory: 'Semiconductors',
    value: 40000,
    prerequisites: ['Semiconductor Materials', 'Water Infrastructure', 'Rare Earth Magnets', 'Skilled Workforce'],
    deloitteServices: ['Commissioning-to-Operate OT Security', 'EPC Vendor Governance', 'Supply Chain Security'],
    nextMilestone: { date: '2026-02-15', action: 'Construction milestone review' },
    priority: 'hot',
    whyItMatters: 'Most advanced chips on U.S. soil. Enables AI sovereignty. $6.6B CHIPS funding.',
    contacts: ['Head of US Operations'],
  },
  {
    id: 'b4',
    client: 'Micron',
    project: 'Idaho HBM for AI',
    category: 'brain',
    subcategory: 'Semiconductors',
    value: 15000,
    prerequisites: ['Semiconductor Materials', 'Water & Power', 'Equipment Supply'],
    deloitteServices: ['Smart Factory Security', 'Supply Chain Resilience'],
    nextMilestone: { date: '2026-01-30', action: 'Expansion announcement' },
    priority: 'hot',
    whyItMatters: 'High-bandwidth memory for NVIDIA/AMD AI chips. Critical for AI compute.',
    contacts: ['CTO', 'VP Manufacturing'],
  },

  // === THE FOUNDATION === (Prerequisites that keep them working)
  {
    id: 'f1',
    client: 'MP Materials',
    project: 'Rare Earth Separation Expansion',
    category: 'foundation',
    subcategory: 'Rare Earths',
    value: 700,
    prerequisites: ['Mining Permits', 'Water Rights', 'Chemical Processing Equipment'],
    deloitteServices: ['OT Security for Chemical Processing', 'AI Process Optimization Security', 'Supply Chain'],
    nextMilestone: { date: '2026-01-25', action: 'Separation facility groundbreaking' },
    priority: 'hot',
    whyItMatters: 'No rare earth refining = no magnets = no EVs, wind turbines, or defense. China has 90%.',
    contacts: ['CEO', 'VP Operations'],
  },
  {
    id: 'f2',
    client: 'Centrus Energy',
    project: 'HALEU Fuel Production',
    category: 'foundation',
    subcategory: 'Nuclear Fuel',
    value: 500,
    prerequisites: ['NRC Licensing', 'Enrichment Equipment', 'Security Clearances'],
    deloitteServices: ['Nuclear OT Security', 'NRC Compliance', 'Industrial AI Security'],
    nextMilestone: { date: '2026-02-28', action: 'Production ramp decision' },
    priority: 'hot',
    whyItMatters: 'No HALEU = no advanced nuclear reactors. Russia has 90% of global supply.',
    contacts: ['VP Operations', 'Security Director'],
  },
  {
    id: 'f3',
    client: 'Ford / SK On',
    project: 'BlueOval Battery Processing',
    category: 'foundation',
    subcategory: 'Battery Materials',
    value: 5800,
    prerequisites: ['Lithium Supply', 'Nickel Processing', 'Cathode Materials', 'Grid Connection'],
    deloitteServices: ['OT Security for Chemical Processing', 'Commissioning Security', 'AI Quality Control Security'],
    nextMilestone: { date: '2026-01-20', action: 'Battery line commissioning' },
    priority: 'hot',
    whyItMatters: 'No battery materials = no EVs. China processes 70%+ of battery chemicals.',
    contacts: ['VP Battery Operations', 'Plant Manager'],
  },
  {
    id: 'f4',
    client: 'Grid Operator (PJM)',
    project: 'AI Grid Optimization Platform',
    category: 'foundation',
    subcategory: 'Grid Infrastructure',
    value: 180,
    prerequisites: ['Transmission Capacity', 'Substation Upgrades', 'Sensor Network'],
    deloitteServices: ['Grid OT Security', 'NERC CIP Compliance', 'Industrial AI Security'],
    nextMilestone: { date: '2026-02-10', action: 'AI pilot go-live' },
    priority: 'warm',
    whyItMatters: 'No grid capacity = no data centers = no AI. Grid is the ultimate bottleneck.',
    contacts: ['VP Operations', 'CISO'],
  },
  {
    id: 'f5',
    client: 'TerraPower',
    project: 'Natrium SMR (Wyoming)',
    category: 'foundation',
    subcategory: 'Nuclear',
    value: 4000,
    prerequisites: ['HALEU Fuel Supply', 'NRC Licensing', 'Component Manufacturing', 'Grid Connection'],
    deloitteServices: ['Nuclear OT Security', 'NRC Compliance', 'AI QA Documentation'],
    nextMilestone: { date: '2026-03-15', action: 'Construction permit decision' },
    priority: 'warm',
    whyItMatters: 'Advanced nuclear = 24/7 clean power for AI data centers. Needs HALEU first.',
    contacts: ['VP Engineering', 'Regulatory Affairs'],
  },
  {
    id: 'f6',
    client: 'Lynas Rare Earths',
    project: 'Texas Separation Facility',
    category: 'foundation',
    subcategory: 'Rare Earths',
    value: 500,
    prerequisites: ['Mining Supply (Australia)', 'Water Infrastructure', 'Chemical Processing'],
    deloitteServices: ['OT Security for Chemical Processing', 'Process Control Security', 'Supply Chain'],
    nextMilestone: { date: '2026-02-01', action: 'Phase 2 expansion decision' },
    priority: 'warm',
    whyItMatters: 'Only non-Chinese rare earth separation in the West. Critical for defense.',
    contacts: ['US Operations Head'],
  },
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
const formatValue = (millions: number) => {
  if (millions >= 1000) return '$' + (millions / 1000).toFixed(1) + 'B'
  return '$' + millions + 'M'
}

const getCategoryLabel = (cat: Category) => {
  switch (cat) {
    case 'heart': return 'The Heart'
    case 'brain': return 'The Brain'
    case 'foundation': return 'The Foundation'
  }
}

const getCategoryDescription = (cat: Category) => {
  switch (cat) {
    case 'heart': return 'AI that solves problems'
    case 'brain': return 'AI infrastructure'
    case 'foundation': return 'Prerequisites that keep them working'
  }
}

const getCategoryColor = (cat: Category) => {
  switch (cat) {
    case 'heart': return '#f472b6' // pink
    case 'brain': return '#60a5fa' // blue
    case 'foundation': return '#fbbf24' // amber
  }
}

const getPriorityColor = (p: Priority) => {
  switch (p) {
    case 'hot': return '#ef4444'
    case 'warm': return '#f59e0b'
    case 'tracking': return '#6b7280'
  }
}

const isThisWeek = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  return date >= now && date <= weekFromNow
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function BuildClockRadar() {
  const [filter, setFilter] = useState<'this-week' | 'hot' | 'all' | Category>('this-week')
  const [selected, setSelected] = useState<Opportunity | null>(null)

  const filtered = useMemo(() => {
    switch (filter) {
      case 'this-week':
        return opportunities.filter(o => o.nextMilestone && isThisWeek(o.nextMilestone.date))
      case 'hot':
        return opportunities.filter(o => o.priority === 'hot')
      case 'heart':
      case 'brain':
      case 'foundation':
        return opportunities.filter(o => o.category === filter)
      default:
        return opportunities
    }
  }, [filter])

  const stats = {
    thisWeek: opportunities.filter(o => o.nextMilestone && isThisWeek(o.nextMilestone.date)).length,
    hot: opportunities.filter(o => o.priority === 'hot').length,
    heart: opportunities.filter(o => o.category === 'heart').length,
    brain: opportunities.filter(o => o.category === 'brain').length,
    foundation: opportunities.filter(o => o.category === 'foundation').length,
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>🇺🇸 Build Clock</h1>
          <p style={styles.subtitle}>What do I need to focus on this week?</p>
        </div>
        <div style={styles.headerMeta}>
          <div style={styles.legend}>
            <span style={{ ...styles.legendItem, color: getCategoryColor('heart') }}>❤️ Heart</span>
            <span style={{ ...styles.legendItem, color: getCategoryColor('brain') }}>🧠 Brain</span>
            <span style={{ ...styles.legendItem, color: getCategoryColor('foundation') }}>🔧 Foundation</span>
          </div>
        </div>
      </header>

      {/* Thesis Banner */}
      <div style={styles.thesis}>
        <strong>The Heart</strong> solves problems. <strong>The Brain</strong> runs the AI. <strong>The Foundation</strong> keeps them working.
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <button 
          style={{ ...styles.filterBtn, ...(filter === 'this-week' ? styles.filterActive : {}) }}
          onClick={() => setFilter('this-week')}
        >
          This Week ({stats.thisWeek})
        </button>
        <button 
          style={{ ...styles.filterBtn, ...(filter === 'hot' ? styles.filterActive : {}) }}
          onClick={() => setFilter('hot')}
        >
          🔥 Hot ({stats.hot})
        </button>
        <button 
          style={{ ...styles.filterBtn, ...(filter === 'heart' ? { ...styles.filterActive, borderColor: getCategoryColor('heart') } : {}) }}
          onClick={() => setFilter('heart')}
        >
          ❤️ Heart ({stats.heart})
        </button>
        <button 
          style={{ ...styles.filterBtn, ...(filter === 'brain' ? { ...styles.filterActive, borderColor: getCategoryColor('brain') } : {}) }}
          onClick={() => setFilter('brain')}
        >
          🧠 Brain ({stats.brain})
        </button>
        <button 
          style={{ ...styles.filterBtn, ...(filter === 'foundation' ? { ...styles.filterActive, borderColor: getCategoryColor('foundation') } : {}) }}
          onClick={() => setFilter('foundation')}
        >
          🔧 Foundation ({stats.foundation})
        </button>
        <button 
          style={{ ...styles.filterBtn, ...(filter === 'all' ? styles.filterActive : {}) }}
          onClick={() => setFilter('all')}
        >
          All ({opportunities.length})
        </button>
      </div>

      {/* Main Grid */}
      <div style={styles.grid}>
        {/* Opportunity List */}
        <div style={styles.list}>
          {filtered.length === 0 ? (
            <div style={styles.empty}>No opportunities match this filter</div>
          ) : (
            filtered.map(opp => (
              <div
                key={opp.id}
                style={{
                  ...styles.card,
                  borderLeftColor: getCategoryColor(opp.category),
                  ...(selected?.id === opp.id ? styles.cardSelected : {}),
                }}
                onClick={() => setSelected(opp)}
              >
                {opp.nextMilestone && isThisWeek(opp.nextMilestone.date) && (
                  <div style={styles.thisWeekBadge}>THIS WEEK</div>
                )}
                <div style={styles.cardHeader}>
                  <div style={styles.cardClient}>{opp.client}</div>
                  <div style={{ ...styles.cardPriority, color: getPriorityColor(opp.priority) }}>
                    {opp.priority.toUpperCase()}
                  </div>
                </div>
                <div style={styles.cardProject}>{opp.project}</div>
                <div style={styles.cardMeta}>
                  <span style={{ color: getCategoryColor(opp.category) }}>{opp.subcategory}</span>
                  <span>•</span>
                  <span>{formatValue(opp.value)}</span>
                </div>
                {opp.prerequisites.length > 0 && (
                  <div style={styles.cardPrereqs}>
                    ⚠️ Needs: {opp.prerequisites.slice(0, 2).join(', ')}
                    {opp.prerequisites.length > 2 && ` +${opp.prerequisites.length - 2}`}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Detail Panel */}
        <div style={styles.detail}>
          {selected ? (
            <>
              <div style={styles.detailCategory}>
                <span style={{ color: getCategoryColor(selected.category) }}>
                  {getCategoryLabel(selected.category)}
                </span>
                <span style={styles.detailCategoryDesc}>
                  {getCategoryDescription(selected.category)}
                </span>
              </div>

              <h2 style={styles.detailClient}>{selected.client}</h2>
              <h3 style={styles.detailProject}>{selected.project}</h3>
              <div style={styles.detailValue}>{formatValue(selected.value)}</div>

              <div style={styles.detailSection}>
                <div style={styles.detailLabel}>Why It Matters</div>
                <div style={styles.detailText}>{selected.whyItMatters}</div>
              </div>

              {selected.nextMilestone && (
                <div style={styles.detailSection}>
                  <div style={styles.detailLabel}>Next Milestone</div>
                  <div style={styles.milestone}>
                    <div style={styles.milestoneDate}>
                      {new Date(selected.nextMilestone.date).toLocaleDateString('en-US', { 
                        month: 'short', day: 'numeric' 
                      })}
                    </div>
                    <div style={styles.milestoneAction}>{selected.nextMilestone.action}</div>
                  </div>
                </div>
              )}

              <div style={styles.detailSection}>
                <div style={styles.detailLabel}>⚠️ Prerequisites (What needs to happen first)</div>
                <div style={styles.prereqList}>
                  {selected.prerequisites.map((p, i) => (
                    <div key={i} style={styles.prereqItem}>→ {p}</div>
                  ))}
                </div>
              </div>

              <div style={styles.detailSection}>
                <div style={styles.detailLabel}>🎯 Deloitte Services</div>
                <div style={styles.serviceList}>
                  {selected.deloitteServices.map((s, i) => (
                    <span key={i} style={styles.serviceTag}>{s}</span>
                  ))}
                </div>
              </div>

              {selected.contacts && selected.contacts.length > 0 && (
                <div style={styles.detailSection}>
                  <div style={styles.detailLabel}>Key Contacts</div>
                  <div style={styles.detailText}>{selected.contacts.join(', ')}</div>
                </div>
              )}
            </>
          ) : (
            <div style={styles.emptyDetail}>
              <div style={styles.emptyIcon}>👈</div>
              <div>Select an opportunity to see details</div>
              <div style={styles.emptyHint}>
                Including prerequisites, services, and why it matters for the Build Economy
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// STYLES
// ============================================================================
const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    color: '#e5e5e5',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    padding: '1.5rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 700,
    margin: 0,
    marginBottom: '0.25rem',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#a3a3a3',
    margin: 0,
  },
  headerMeta: {
    textAlign: 'right',
  },
  legend: {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.75rem',
  },
  legendItem: {
    fontWeight: 500,
  },
  thesis: {
    padding: '0.75rem 1rem',
    backgroundColor: '#171717',
    borderRadius: '6px',
    marginBottom: '1.5rem',
    fontSize: '0.875rem',
    color: '#d4d4d4',
    borderLeft: '3px solid #3b82f6',
  },
  filters: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  filterBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#171717',
    border: '1px solid #262626',
    borderRadius: '6px',
    color: '#a3a3a3',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  filterActive: {
    backgroundColor: '#1f1f1f',
    borderColor: '#3b82f6',
    color: '#e5e5e5',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '1.5rem',
    alignItems: 'start',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    maxHeight: 'calc(100vh - 220px)',
    overflowY: 'auto',
  },
  empty: {
    padding: '3rem',
    textAlign: 'center',
    color: '#525252',
  },
  card: {
    padding: '1rem',
    backgroundColor: '#171717',
    borderRadius: '6px',
    borderLeft: '4px solid',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background-color 0.15s',
  },
  cardSelected: {
    backgroundColor: '#1f1f1f',
    outline: '1px solid #3b82f6',
  },
  thisWeekBadge: {
    position: 'absolute',
    top: '0.5rem',
    right: '0.5rem',
    padding: '0.125rem 0.5rem',
    backgroundColor: '#f59e0b',
    color: '#000',
    borderRadius: '4px',
    fontSize: '0.625rem',
    fontWeight: 700,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.25rem',
  },
  cardClient: {
    fontWeight: 600,
    fontSize: '0.9375rem',
  },
  cardPriority: {
    fontSize: '0.625rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
  },
  cardProject: {
    fontSize: '0.8125rem',
    color: '#a3a3a3',
    marginBottom: '0.5rem',
  },
  cardMeta: {
    display: 'flex',
    gap: '0.5rem',
    fontSize: '0.75rem',
    color: '#737373',
  },
  cardPrereqs: {
    marginTop: '0.5rem',
    fontSize: '0.75rem',
    color: '#f59e0b',
  },
  detail: {
    padding: '1.5rem',
    backgroundColor: '#171717',
    borderRadius: '8px',
    position: 'sticky',
    top: '1.5rem',
  },
  detailCategory: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
    fontSize: '0.875rem',
    fontWeight: 600,
  },
  detailCategoryDesc: {
    color: '#737373',
    fontWeight: 400,
  },
  detailClient: {
    fontSize: '1.25rem',
    fontWeight: 700,
    margin: 0,
    marginBottom: '0.25rem',
  },
  detailProject: {
    fontSize: '0.9375rem',
    color: '#a3a3a3',
    margin: 0,
    marginBottom: '0.75rem',
    fontWeight: 400,
  },
  detailValue: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#22c55e',
    marginBottom: '1.5rem',
    fontFamily: "'JetBrains Mono', monospace",
  },
  detailSection: {
    marginBottom: '1.25rem',
  },
  detailLabel: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#737373',
    marginBottom: '0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  detailText: {
    fontSize: '0.875rem',
    color: '#d4d4d4',
    lineHeight: 1.5,
  },
  milestone: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  milestoneDate: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#262626',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#f59e0b',
  },
  milestoneAction: {
    fontSize: '0.875rem',
    color: '#d4d4d4',
  },
  prereqList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  prereqItem: {
    fontSize: '0.875rem',
    color: '#fbbf24',
  },
  serviceList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  serviceTag: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#1e3a5f',
    borderRadius: '4px',
    fontSize: '0.75rem',
    color: '#60a5fa',
  },
  emptyDetail: {
    textAlign: 'center',
    color: '#525252',
    padding: '3rem 1rem',
  },
  emptyIcon: {
    fontSize: '2rem',
    marginBottom: '1rem',
  },
  emptyHint: {
    fontSize: '0.75rem',
    marginTop: '0.5rem',
    color: '#404040',
  },
}
