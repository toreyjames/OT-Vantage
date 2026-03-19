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
      blocker: 'Needs: GPU compute, federated health data, clinical integration',
    },
    {
      name: 'Heart Disease',
      stat: '18M deaths/year',
      aiPromise: 'Real-time AI stroke/heart attack detection from scans. Minutes = brain cells saved.',
      blocker: 'Needs: Hospital network integration, edge compute, 5G',
    },
    {
      name: 'Aging',
      stat: 'Universal',
      aiPromise: 'AI-driven cellular reprogramming. If it works, it changes everything.',
      blocker: 'Needs: Massive GPU clusters, biological data platforms',
    },
    {
      name: 'Drug Discovery',
      stat: '$2.6B per drug',
      aiPromise: 'AI cutting drug development from 10 years to 2. AlphaFold already solved protein folding.',
      blocker: 'Needs: Compute, protein databases, pharma partnerships',
    },
    {
      name: 'Climate',
      stat: '1.5°C threshold',
      aiPromise: 'AI optimizing energy grids, predicting weather patterns, discovering new materials.',
      blocker: 'Needs: Sensor networks, grid integration, massive compute',
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
      solution: 'Must automate to offset 5x labor cost disadvantage',
    },
    {
      category: 'Grid Infrastructure',
      problem: '10+ year permitting for transmission',
      consequence: 'Can\'t deliver power to new data centers',
      solution: 'Need 47,000+ miles of new transmission by 2035',
    },
    {
      category: 'Nuclear Fuel (HALEU)',
      problem: 'Only Russia produces commercial HALEU',
      consequence: 'Advanced reactors can\'t operate',
      solution: 'Centrus scale-up, DOE programs critical',
    },
    {
      category: 'Water',
      problem: 'Data centers need massive cooling',
      consequence: 'Water-stressed regions can\'t host AI infrastructure',
      solution: 'Alternative cooling tech, coastal siting',
    },
    {
      category: 'Skilled Labor',
      problem: 'China: 4.7M engineers/year. US: 200K/year',
      consequence: 'Can\'t staff facilities at scale',
      solution: 'AI/automation is the only path to competitiveness',
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
      stat: '3-5x',
      label: 'US labor cost disadvantage ($30/hr vs $6/hr)',
      color: COLORS.warning,
    },
    {
      stat: '90%',
      label: 'Advanced chips made in Taiwan (geopolitical risk)',
      color: COLORS.danger,
    },
    {
      stat: '$500B+',
      label: 'Already committed to Stargate alone',
      color: COLORS.accent,
    },
  ],
}

// Calculate pipeline stats from real data
const calculatePipelineStats = () => {
  // Total tracked pipeline (all opportunities)
  const totalTracked = opportunities.reduce((sum, o) => sum + o.investmentSize, 0)
  const totalCount = opportunities.length
  
  // Policy-aligned pipeline (subset with policy tags)
  const policyAligned = opportunities.filter(o => o.trumpPolicyAlignment && o.trumpPolicyAlignment.length > 0)
  const policyPipeline = policyAligned.reduce((sum, o) => sum + o.investmentSize, 0)
  
  const byPolicy = {
    stargate: opportunities.filter(o => o.trumpPolicyAlignment?.includes('stargate-initiative')),
    chips: opportunities.filter(o => o.trumpPolicyAlignment?.includes('chips-sovereignty')),
    nuclear: opportunities.filter(o => o.trumpPolicyAlignment?.includes('nuclear-restart')),
    energy: opportunities.filter(o => o.trumpPolicyAlignment?.includes('energy-dominance')),
    genesis: opportunities.filter(o => o.trumpPolicyAlignment?.includes('genesis-mission')),
    aiLeadership: opportunities.filter(o => o.trumpPolicyAlignment?.includes('eo-14179-ai-leadership')),
  }
  
  return {
    totalTracked,
    totalCount,
    policyPipeline,
    policyAlignedCount: policyAligned.length,
    stargateValue: byPolicy.stargate.reduce((sum, o) => sum + o.investmentSize, 0),
    stargateCount: byPolicy.stargate.length,
    chipsValue: byPolicy.chips.reduce((sum, o) => sum + o.investmentSize, 0),
    chipsCount: byPolicy.chips.length,
    nuclearValue: byPolicy.nuclear.reduce((sum, o) => sum + o.investmentSize, 0),
    nuclearCount: byPolicy.nuclear.length,
    genesisValue: byPolicy.genesis.reduce((sum, o) => sum + o.investmentSize, 0),
    genesisCount: byPolicy.genesis.length,
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function ScoreboardPage() {
  const stats = calculatePipelineStats()
  
  const formatCurrency = (millions: number) => {
    if (millions >= 1000) return '$' + (millions / 1000).toFixed(0) + 'B'
    return '$' + millions + 'M'
  }

  return (
    <main style={styles.main}>
      <AppNav />

      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>AI Manhattan Project</h1>
            <p style={styles.subtitle}>
              Why this matters • What's missing • Why now
            </p>
          </div>
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

        {/* THREE PILLARS GRID */}
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
              {THE_HEART.problems.slice(0, 4).map((problem, i) => (
                <div key={i} style={styles.problemItem}>
                  <div style={styles.problemHeader}>
                    <span style={styles.problemName}>{problem.name}</span>
                    <span style={{...styles.problemStat, color: THE_HEART.color}}>{problem.stat}</span>
                  </div>
                  <p style={styles.problemPromise}>{problem.aiPromise}</p>
                  <p style={styles.problemBlocker}>⚠️ {problem.blocker}</p>
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
              {THE_FOUNDATION.gaps.slice(0, 4).map((gap, i) => (
                <div key={i} style={styles.gapItem}>
                  <div style={styles.gapCategory}>{gap.category}</div>
                  <div style={styles.gapProblem}>{gap.problem}</div>
                  <div style={styles.gapConsequence}>→ {gap.consequence}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* THE URGENCY */}
        <div style={styles.urgencySection}>
          <h2 style={styles.urgencyTitle}>⏰ The Urgency: Why This Must Happen Now</h2>
          <div style={styles.urgencyGrid}>
            {THE_URGENCY.points.map((point, i) => (
              <div key={i} style={styles.urgencyCard}>
                <div style={{...styles.urgencyStat, color: point.color}}>{point.stat}</div>
                <div style={styles.urgencyLabel}>{point.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* PIPELINE TRACKING */}
        <div style={styles.pipelineSection}>
          <h2 style={styles.pipelineTitle}>📊 Pipeline: Tracking Progress</h2>
          <p style={styles.pipelineSubtitle}>Industrial projects we're tracking aligned to US policy</p>
          
          {/* Main totals */}
          <div style={styles.pipelineTotals}>
            <div style={styles.pipelineTotalCard}>
              <div style={styles.pipelineTotalStat}>{formatCurrency(stats.totalTracked)}</div>
              <div style={styles.pipelineTotalLabel}>Total Tracked</div>
              <div style={styles.pipelineTotalCount}>{stats.totalCount} opportunities</div>
            </div>
            <div style={styles.pipelineTotalCard}>
              <div style={{...styles.pipelineTotalStat, color: COLORS.accent}}>{formatCurrency(stats.policyPipeline)}</div>
              <div style={styles.pipelineTotalLabel}>Policy-Aligned</div>
              <div style={styles.pipelineTotalCount}>{stats.policyAlignedCount} opportunities</div>
            </div>
          </div>
          
          {/* Breakdown by policy */}
          <div style={styles.pipelineBreakdown}>
            <div style={styles.pipelineBreakdownTitle}>By Policy Initiative:</div>
            <div style={styles.pipelineGrid}>
              <div style={styles.pipelineCard}>
                <div style={{...styles.pipelineStat, color: '#f59e0b'}}>{formatCurrency(stats.stargateValue)}</div>
                <div style={styles.pipelineLabel}>Stargate/AI Infra</div>
                <div style={styles.pipelineCount}>{stats.stargateCount} projects</div>
              </div>
              <div style={styles.pipelineCard}>
                <div style={{...styles.pipelineStat, color: '#8b5cf6'}}>{formatCurrency(stats.chipsValue)}</div>
                <div style={styles.pipelineLabel}>CHIPS Sovereignty</div>
                <div style={styles.pipelineCount}>{stats.chipsCount} projects</div>
              </div>
              <div style={styles.pipelineCard}>
                <div style={{...styles.pipelineStat, color: '#22c55e'}}>{formatCurrency(stats.genesisValue)}</div>
                <div style={styles.pipelineLabel}>Genesis Mission</div>
                <div style={styles.pipelineCount}>{stats.genesisCount} projects</div>
              </div>
              <div style={styles.pipelineCard}>
                <div style={{...styles.pipelineStat, color: '#06b6d4'}}>{formatCurrency(stats.nuclearValue)}</div>
                <div style={styles.pipelineLabel}>Nuclear Restart</div>
                <div style={styles.pipelineCount}>{stats.nuclearCount} projects</div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM LINE */}
        <div style={styles.bottomLine}>
          <div style={styles.bottomLineText}>
            <strong>The Bottom Line:</strong> AI/automation is not "nice to have" — it is <span style={{color: COLORS.accent}}>strategic necessity</span>. 
            To compete with $6/hour labor using $30/hour labor, we need 5x productivity — achievable only through AI.
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
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '8.75rem 2rem 3rem',
  },
  header: {
    marginBottom: '2rem',
    textAlign: 'center',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 800,
    margin: 0,
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1.125rem',
    color: COLORS.textMuted,
  },
  
  // Thesis Box
  thesisBox: {
    padding: '1.5rem 2rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '16px',
    marginBottom: '2rem',
    textAlign: 'center',
  },
  thesisQuote: {
    fontSize: '1.25rem',
    fontStyle: 'italic',
    color: COLORS.text,
    marginBottom: '0.75rem',
    lineHeight: 1.5,
  },
  thesisSubtext: {
    fontSize: '0.9375rem',
    color: COLORS.textMuted,
  },
  
  // Pillars Grid
  pillarsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
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
    gap: '1rem',
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
    marginBottom: '0.375rem',
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
    margin: '0 0 0.375rem 0',
    lineHeight: 1.4,
  },
  problemBlocker: {
    fontSize: '0.6875rem',
    color: COLORS.warning,
    margin: 0,
    opacity: 0.9,
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
    marginBottom: '2rem',
  },
  urgencyTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    marginBottom: '1rem',
    textAlign: 'center',
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
  
  // Pipeline Section
  pipelineSection: {
    marginBottom: '2rem',
  },
  pipelineTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    marginBottom: '0.25rem',
    textAlign: 'center',
  },
  pipelineSubtitle: {
    fontSize: '0.875rem',
    color: COLORS.textMuted,
    marginBottom: '1.5rem',
    textAlign: 'center',
  },
  pipelineTotals: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1.5rem',
    marginBottom: '1.5rem',
  },
  pipelineTotalCard: {
    padding: '1.5rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '16px',
    textAlign: 'center',
  },
  pipelineTotalStat: {
    fontSize: '2.5rem',
    fontWeight: 800,
    color: COLORS.text,
    fontFamily: "'JetBrains Mono', monospace",
  },
  pipelineTotalLabel: {
    fontSize: '1rem',
    fontWeight: 600,
    color: COLORS.textMuted,
    marginTop: '0.5rem',
  },
  pipelineTotalCount: {
    fontSize: '0.875rem',
    color: COLORS.textMuted,
    marginTop: '0.25rem',
  },
  pipelineBreakdown: {
    padding: '1rem',
    backgroundColor: COLORS.bg,
    borderRadius: '12px',
  },
  pipelineBreakdownTitle: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '1rem',
    textAlign: 'center',
  },
  pipelineGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '0.75rem',
  },
  pipelineCard: {
    padding: '1rem',
    backgroundColor: COLORS.bgCard,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '10px',
    textAlign: 'center',
  },
  pipelineStat: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: COLORS.accent,
    fontFamily: "'JetBrains Mono', monospace",
  },
  pipelineLabel: {
    fontSize: '0.75rem',
    color: COLORS.textMuted,
    marginTop: '0.25rem',
  },
  pipelineCount: {
    fontSize: '0.6875rem',
    color: COLORS.textMuted,
    marginTop: '0.125rem',
  },
  
  // Bottom Line
  bottomLine: {
    padding: '1.5rem 2rem',
    backgroundColor: COLORS.accent + '11',
    border: `1px solid ${COLORS.accent}33`,
    borderRadius: '12px',
    textAlign: 'center',
  },
  bottomLineText: {
    fontSize: '1rem',
    lineHeight: 1.6,
  },
}
