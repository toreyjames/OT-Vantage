'use client'

import Link from 'next/link'
import AppNav from '../components/AppNav'
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
  heart: '#ef4444',
  brain: '#3b82f6',
  foundation: '#f59e0b',
}

// ============================================================================
// THE AI MANHATTAN PROJECT — WHY IT MATTERS
// ============================================================================

// THE HEART: Civilizational problems AI will solve
const THE_HEART = {
  title: 'The Heart',
  subtitle: 'Civilizational Problems AI Will Solve',
  icon: '❤️',
  color: COLORS.heart,
  problems: [
    {
      name: 'Cancer',
      stat: '10M deaths/year',
      aiPromise: 'AI detecting cancer years before symptoms. Pattern recognition across millions of cases.',
    },
    {
      name: 'Heart Disease',
      stat: '18M deaths/year',
      aiPromise: 'Real-time AI stroke/heart attack detection from scans. Minutes = brain cells saved.',
    },
    {
      name: 'Aging',
      stat: 'Universal',
      aiPromise: 'AI-driven cellular reprogramming. If it works, it changes everything.',
    },
    {
      name: 'Drug Discovery',
      stat: '$2.6B per drug',
      aiPromise: 'AI cutting drug development from 10 years to 2. AlphaFold already solved protein folding.',
    },
  ],
}

// THE BRAIN: AI Infrastructure requirements
const THE_BRAIN = {
  title: 'The Brain',
  subtitle: 'AI Infrastructure Requirements',
  icon: '🧠',
  color: COLORS.brain,
  requirements: [
    {
      name: 'Data Centers',
      need: '50-100+ GW by 2030',
      current: '~30 GW deployed',
      gap: '60-70%',
      note: 'Stargate alone: $500B planned investment',
    },
    {
      name: 'AI Chips',
      need: 'Domestic production',
      current: '90%+ from Taiwan',
      gap: 'Critical',
      note: 'TSMC single point of failure. CHIPS Act: $280B',
    },
    {
      name: 'Power (Nuclear)',
      need: '100+ GW clean baseload',
      current: '~95 GW (aging fleet)',
      gap: 'Growing',
      note: 'SMRs, reactor restarts, new builds all needed',
    },
    {
      name: 'Memory (HBM)',
      need: 'Domestic packaging',
      current: '0% domestic',
      gap: '100%',
      note: 'SK Hynix Indiana is first attempt',
    },
  ],
}

// THE FOUNDATION: Prerequisites that must exist first
const THE_FOUNDATION = {
  title: 'The Foundation',
  subtitle: 'Prerequisites That Must Exist First',
  icon: '🏗️',
  color: COLORS.foundation,
  gaps: [
    {
      category: 'Rare Earths',
      problem: '90%+ refining capacity in China',
      consequence: 'No magnets → No EVs, wind turbines, or defense systems',
    },
    {
      category: 'Grid Infrastructure',
      problem: '10+ year permitting for transmission',
      consequence: 'Can\'t deliver power to new data centers',
    },
    {
      category: 'Nuclear Fuel (HALEU)',
      problem: 'Only Russia produces commercial HALEU',
      consequence: 'Advanced reactors can\'t operate',
    },
    {
      category: 'Skilled Labor',
      problem: 'China: 4.7M engineers/year. US: 200K/year',
      consequence: 'AI/automation is the only path to competitiveness',
    },
  ],
}

// THE URGENCY: Why this must happen now
const THE_URGENCY = {
  title: 'The Urgency',
  subtitle: 'Why This Must Happen Now',
  points: [
    {
      stat: '2027',
      label: 'China\'s stated goal for AI superiority',
      color: COLORS.danger,
    },
    {
      stat: '90%',
      label: 'Advanced chips made in Taiwan (geopolitical risk)',
      color: COLORS.danger,
    },
    {
      stat: '$770B+',
      label: 'Industrial pipeline we\'re tracking',
      color: COLORS.accent,
    },
    {
      stat: '24/7',
      label: 'Real-time policy & news monitoring',
      color: COLORS.blue,
    },
  ],
}

// Calculate pipeline stats from real data
const calculatePipelineStats = () => {
  const totalTracked = opportunities.reduce((sum, o) => sum + o.investmentSize, 0)
  const totalCount = opportunities.length
  const policyAligned = opportunities.filter(o => o.trumpPolicyAlignment && o.trumpPolicyAlignment.length > 0)
  const policyPipeline = policyAligned.reduce((sum, o) => sum + o.investmentSize, 0)
  
  return {
    totalTracked,
    totalCount,
    policyPipeline,
    policyAlignedCount: policyAligned.length,
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function AboutPage() {
  const stats = calculatePipelineStats()
  
  const formatCurrency = (millions: number) => {
    if (millions >= 1000) return '$' + (millions / 1000).toFixed(0) + 'B'
    return '$' + millions + 'M'
  }

  return (
    <main style={styles.main}>
      <AppNav />

      <div style={styles.container}>
        {/* HERO SECTION */}
        <header style={styles.header}>
          <p style={styles.eyebrow}>WHAT THIS IS</p>
          <h1 style={styles.title}>AI Manhattan Project</h1>
          <p style={styles.heroSubhead}>Industrial rebuild pipeline tracking</p>
          <p style={styles.subtitle}>
            A real-time intelligence dashboard tracking the industrial infrastructure 
            required for US AI leadership — and the policy initiatives driving it.
          </p>
        </header>

        {/* THE CORE THESIS */}
        <div style={styles.thesisBox}>
          <div style={styles.thesisQuote}>
            "AI is the Manhattan Project of our time — the strategic technology that determines national security, economic dominance, and geopolitical power."
          </div>
          <div style={styles.thesisSubtext}>
            <strong>Semiconductors are the uranium enrichment of AI.</strong> Without domestic capability → no strategic autonomy.
          </div>
        </div>

        {/* WHAT WE TRACK */}
        <div style={styles.whatWeTrack}>
          <h2 style={styles.sectionTitle}>What We Track</h2>
          <div style={styles.trackingGrid}>
            <div style={styles.trackingCard}>
              <div style={styles.trackingIcon}>🏭</div>
              <h3 style={styles.trackingTitle}>Industrial Projects</h3>
              <p style={styles.trackingDesc}>
                Semiconductor fabs, data centers, nuclear plants, battery factories, 
                critical minerals, and grid infrastructure.
              </p>
              <div style={styles.trackingStat}>
                <span style={styles.trackingNumber}>{stats.totalCount}</span>
                <span style={styles.trackingLabel}>opportunities</span>
              </div>
            </div>
            <div style={styles.trackingCard}>
              <div style={styles.trackingIcon}>📜</div>
              <h3 style={styles.trackingTitle}>Policy Alignment</h3>
              <p style={styles.trackingDesc}>
                EO 14179 (AI Leadership), CHIPS Act, Stargate, Genesis Mission, 
                Nuclear Restart, Energy Dominance.
              </p>
              <div style={styles.trackingStat}>
                <span style={styles.trackingNumber}>{stats.policyAlignedCount}</span>
                <span style={styles.trackingLabel}>policy-aligned</span>
              </div>
            </div>
            <div style={styles.trackingCard}>
              <div style={styles.trackingIcon}>💰</div>
              <h3 style={styles.trackingTitle}>Investment Pipeline</h3>
              <p style={styles.trackingDesc}>
                Real capital flowing into AI infrastructure — tracked by company, 
                location, sector, and milestone.
              </p>
              <div style={styles.trackingStat}>
                <span style={styles.trackingNumber}>{formatCurrency(stats.totalTracked)}</span>
                <span style={styles.trackingLabel}>total pipeline</span>
              </div>
            </div>
          </div>
        </div>

        {/* REAL-TIME INTELLIGENCE */}
        <div style={styles.intelligenceSection}>
          <h2 style={styles.sectionTitle}>📡 Always-On Intelligence</h2>
          <p style={{textAlign: 'center', color: COLORS.textMuted, marginBottom: '1.5rem', maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto'}}>
            The Radar automatically discovers new opportunities as they're announced — 
            no manual monitoring required.
          </p>
          <div style={styles.intelligenceGrid}>
            <div style={styles.intelligenceCard}>
              <div style={styles.intelligenceIcon}>🏛️</div>
              <h4 style={styles.intelligenceTitle}>Federal Register</h4>
              <p style={styles.intelligenceDesc}>
                Executive orders, final rules, proposed regulations — real-time from federalregister.gov API
              </p>
            </div>
            <div style={styles.intelligenceCard}>
              <div style={styles.intelligenceIcon}>📰</div>
              <h4 style={styles.intelligenceTitle}>News Feeds</h4>
              <p style={styles.intelligenceDesc}>
                Investment announcements scanned from major news sources via Google News RSS
              </p>
            </div>
            <div style={styles.intelligenceCard}>
              <div style={styles.intelligenceIcon}>🤖</div>
              <h4 style={styles.intelligenceTitle}>Auto-Classification</h4>
              <p style={styles.intelligenceDesc}>
                Keyword extraction for sector, investment amount, location, and policy alignment
              </p>
            </div>
            <div style={styles.intelligenceCard}>
              <div style={styles.intelligenceIcon}>⚡</div>
              <h4 style={styles.intelligenceTitle}>One-Click Promote</h4>
              <p style={styles.intelligenceDesc}>
                Discovered signals can be instantly added to the tracked pipeline
              </p>
            </div>
          </div>
        </div>

        {/* THREE PILLARS GRID */}
        <div style={styles.pillarsSection}>
          <h2 style={styles.sectionTitle}>Why This Matters</h2>
          <div style={styles.pillarsGrid}>
            
            {/* THE HEART */}
            <div style={{...styles.pillarCard, borderColor: THE_HEART.color + '44'}}>
              <div style={styles.pillarHeader}>
                <span style={{...styles.pillarIcon, backgroundColor: THE_HEART.color + '22', color: THE_HEART.color}}>
                  {THE_HEART.icon}
                </span>
                <div>
                  <h2 style={{...styles.pillarTitle, color: THE_HEART.color}}>{THE_HEART.title}</h2>
                  <p style={styles.pillarSubtitle}>{THE_HEART.subtitle}</p>
                </div>
              </div>
              <div style={styles.pillarContent}>
                {THE_HEART.problems.map((problem, i) => (
                  <div key={i} style={styles.problemItem}>
                    <div style={styles.problemHeader}>
                      <span style={styles.problemName}>{problem.name}</span>
                      <span style={{...styles.problemStat, color: THE_HEART.color}}>{problem.stat}</span>
                    </div>
                    <p style={styles.problemPromise}>{problem.aiPromise}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* THE BRAIN */}
            <div style={{...styles.pillarCard, borderColor: THE_BRAIN.color + '44'}}>
              <div style={styles.pillarHeader}>
                <span style={{...styles.pillarIcon, backgroundColor: THE_BRAIN.color + '22', color: THE_BRAIN.color}}>
                  {THE_BRAIN.icon}
                </span>
                <div>
                  <h2 style={{...styles.pillarTitle, color: THE_BRAIN.color}}>{THE_BRAIN.title}</h2>
                  <p style={styles.pillarSubtitle}>{THE_BRAIN.subtitle}</p>
                </div>
              </div>
              <div style={styles.pillarContent}>
                {THE_BRAIN.requirements.map((req, i) => (
                  <div key={i} style={styles.requirementItem}>
                    <div style={styles.requirementHeader}>
                      <span style={styles.requirementName}>{req.name}</span>
                      <span style={{
                        ...styles.requirementGap,
                        color: req.gap === 'Critical' || req.gap === '100%' ? COLORS.danger : COLORS.warning
                      }}>
                        Gap: {req.gap}
                      </span>
                    </div>
                    <div style={styles.requirementStats}>
                      <span>Need: {req.need}</span>
                      <span>Have: {req.current}</span>
                    </div>
                    <p style={styles.requirementNote}>{req.note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* THE FOUNDATION */}
            <div style={{...styles.pillarCard, borderColor: THE_FOUNDATION.color + '44'}}>
              <div style={styles.pillarHeader}>
                <span style={{...styles.pillarIcon, backgroundColor: THE_FOUNDATION.color + '22', color: THE_FOUNDATION.color}}>
                  {THE_FOUNDATION.icon}
                </span>
                <div>
                  <h2 style={{...styles.pillarTitle, color: THE_FOUNDATION.color}}>{THE_FOUNDATION.title}</h2>
                  <p style={styles.pillarSubtitle}>{THE_FOUNDATION.subtitle}</p>
                </div>
              </div>
              <div style={styles.pillarContent}>
                {THE_FOUNDATION.gaps.map((gap, i) => (
                  <div key={i} style={styles.gapItem}>
                    <div style={styles.gapCategory}>{gap.category}</div>
                    <div style={styles.gapProblem}>{gap.problem}</div>
                    <div style={styles.gapConsequence}>→ {gap.consequence}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* THE URGENCY */}
        <div style={styles.urgencySection}>
          <h2 style={styles.sectionTitle}>⏰ Why Now</h2>
          <div style={styles.urgencyGrid}>
            {THE_URGENCY.points.map((point, i) => (
              <div key={i} style={styles.urgencyCard}>
                <div style={{...styles.urgencyStat, color: point.color}}>{point.stat}</div>
                <div style={styles.urgencyLabel}>{point.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM LINE */}
        <div style={styles.bottomLine}>
          <div style={styles.bottomLineText}>
            <strong>The Bottom Line:</strong> AI/automation is not "nice to have" — it is <span style={{color: COLORS.accent}}>strategic necessity</span>. 
            To compete with $6/hour labor using $30/hour labor, we need 5x productivity — achievable only through AI.
          </div>
          <Link href="/radar" style={styles.ctaButton}>
            View the Radar →
          </Link>
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
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '8.75rem 2rem 3rem',
  },
  header: {
    marginBottom: '2.5rem',
    textAlign: 'center',
  },
  eyebrow: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: COLORS.accent,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    marginBottom: '0.75rem',
  },
  title: {
    fontSize: '3rem',
    fontWeight: 800,
    margin: 0,
    marginBottom: '0.5rem',
  },
  heroSubhead: {
    fontSize: '1.5rem',
    fontWeight: 500,
    color: COLORS.accent,
    marginBottom: '1rem',
  },
  subtitle: {
    fontSize: '1.25rem',
    color: COLORS.textMuted,
    maxWidth: '700px',
    margin: '0 auto',
    lineHeight: 1.6,
  },
  
  // Thesis Box
  thesisBox: {
    padding: '2rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '16px',
    marginBottom: '3rem',
    textAlign: 'center',
  },
  thesisQuote: {
    fontSize: '1.375rem',
    fontStyle: 'italic',
    color: COLORS.text,
    marginBottom: '1rem',
    lineHeight: 1.5,
  },
  thesisSubtext: {
    fontSize: '1rem',
    color: COLORS.textMuted,
  },
  
  // Section Title
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    marginBottom: '1.5rem',
    textAlign: 'center',
  },
  
  // What We Track
  whatWeTrack: {
    marginBottom: '3rem',
  },
  trackingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  trackingCard: {
    padding: '1.5rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
    textAlign: 'center',
  },
  trackingIcon: {
    fontSize: '2rem',
    marginBottom: '0.75rem',
  },
  trackingTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
  },
  trackingDesc: {
    fontSize: '0.875rem',
    color: COLORS.textMuted,
    lineHeight: 1.5,
    marginBottom: '1rem',
  },
  trackingStat: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  trackingNumber: {
    fontSize: '2rem',
    fontWeight: 800,
    color: COLORS.accent,
    fontFamily: "'JetBrains Mono', monospace",
  },
  trackingLabel: {
    fontSize: '0.8125rem',
    color: COLORS.textMuted,
  },
  
  // Intelligence Section
  intelligenceSection: {
    marginBottom: '3rem',
  },
  intelligenceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
  },
  intelligenceCard: {
    padding: '1.25rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
    textAlign: 'center',
  },
  intelligenceIcon: {
    fontSize: '1.75rem',
    marginBottom: '0.5rem',
  },
  intelligenceTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
    color: COLORS.text,
  },
  intelligenceDesc: {
    fontSize: '0.8125rem',
    color: COLORS.textMuted,
    lineHeight: 1.4,
    margin: 0,
  },
  
  // Pillars Section
  pillarsSection: {
    marginBottom: '3rem',
  },
  pillarsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
    gap: '1.5rem',
  },
  pillarCard: {
    backgroundColor: COLORS.bgCard,
    border: '1px solid',
    borderRadius: '16px',
    padding: '1.5rem',
    overflow: 'hidden',
  },
  pillarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.25rem',
    paddingBottom: '1rem',
    borderBottom: `1px solid ${COLORS.border}`,
  },
  pillarIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    flexShrink: 0,
  },
  pillarTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    margin: 0,
    marginBottom: '0.25rem',
  },
  pillarSubtitle: {
    fontSize: '0.8125rem',
    color: COLORS.textMuted,
    margin: 0,
  },
  pillarContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  
  // Heart - Problems
  problemItem: {
    padding: '0.75rem',
    backgroundColor: COLORS.bg,
    borderRadius: '8px',
  },
  problemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.25rem',
  },
  problemName: {
    fontWeight: 600,
    fontSize: '0.9375rem',
  },
  problemStat: {
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  problemPromise: {
    fontSize: '0.8125rem',
    color: COLORS.textMuted,
    margin: 0,
    lineHeight: 1.4,
  },
  
  // Brain - Requirements
  requirementItem: {
    padding: '0.75rem',
    backgroundColor: COLORS.bg,
    borderRadius: '8px',
  },
  requirementHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.375rem',
  },
  requirementName: {
    fontWeight: 600,
    fontSize: '0.9375rem',
  },
  requirementGap: {
    fontSize: '0.6875rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  requirementStats: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    color: COLORS.textMuted,
    marginBottom: '0.375rem',
  },
  requirementNote: {
    fontSize: '0.6875rem',
    color: COLORS.textMuted,
    margin: 0,
    fontStyle: 'italic',
  },
  
  // Foundation - Gaps
  gapItem: {
    padding: '0.75rem',
    backgroundColor: COLORS.bg,
    borderRadius: '8px',
  },
  gapCategory: {
    fontWeight: 600,
    fontSize: '0.9375rem',
    marginBottom: '0.25rem',
  },
  gapProblem: {
    fontSize: '0.8125rem',
    color: COLORS.danger,
    marginBottom: '0.25rem',
  },
  gapConsequence: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
  },
  
  // Urgency Section
  urgencySection: {
    marginBottom: '3rem',
  },
  urgencyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  urgencyCard: {
    padding: '1.25rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '12px',
    textAlign: 'center',
  },
  urgencyStat: {
    fontSize: '2rem',
    fontWeight: 800,
    fontFamily: "'JetBrains Mono', monospace",
  },
  urgencyLabel: {
    fontSize: '0.8125rem',
    color: COLORS.textMuted,
    marginTop: '0.25rem',
  },
  
  // Bottom Line
  bottomLine: {
    padding: '2rem',
    backgroundColor: COLORS.accent + '11',
    border: `1px solid ${COLORS.accent}33`,
    borderRadius: '12px',
    textAlign: 'center',
  },
  bottomLineText: {
    fontSize: '1.125rem',
    lineHeight: 1.6,
    marginBottom: '1.5rem',
  },
  ctaButton: {
    display: 'inline-block',
    padding: '0.875rem 2rem',
    backgroundColor: COLORS.accent,
    color: COLORS.bg,
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '1rem',
    borderRadius: '8px',
    transition: 'all 0.2s',
  },
}

