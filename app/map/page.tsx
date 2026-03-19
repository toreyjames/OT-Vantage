'use client'

import { useState, useMemo, useEffect, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import AppNav from '../components/AppNav'
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps'
import { opportunities, SECTOR_MAPPING, type Opportunity } from '../../lib/data/opportunities'
import type { OTRadarSignal } from '../../lib/types/ot-radar-signal'

// US TopoJSON
const geoUrl = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'

// State coordinates for marker placement
const STATE_COORDS: Record<string, [number, number]> = {
  AL: [-86.9023, 32.3182],
  AK: [-153.4937, 64.2008],
  AZ: [-111.0937, 34.0489],
  AR: [-92.3731, 34.7465],
  CA: [-119.4179, 36.7783],
  CO: [-105.3111, 39.0598],
  CT: [-72.7554, 41.6032],
  DE: [-75.5277, 38.9108],
  FL: [-81.5158, 27.6648],
  GA: [-83.6431, 32.1574],
  HI: [-155.5828, 19.8968],
  ID: [-114.7420, 44.0682],
  IL: [-89.3985, 40.6331],
  IN: [-86.1349, 40.2672],
  IA: [-93.0977, 41.8780],
  KS: [-98.4842, 39.0119],
  KY: [-84.2700, 37.8393],
  LA: [-92.1450, 30.9843],
  ME: [-69.4455, 45.2538],
  MD: [-76.6413, 39.0458],
  MA: [-71.3824, 42.4072],
  MI: [-84.5361, 44.3148],
  MN: [-94.6859, 46.7296],
  MS: [-89.3985, 32.3547],
  MO: [-91.8318, 37.9643],
  MT: [-110.3626, 46.8797],
  NE: [-99.9018, 41.4925],
  NV: [-116.4194, 38.8026],
  NH: [-71.5724, 43.1939],
  NJ: [-74.4057, 40.0583],
  NM: [-105.8701, 34.5199],
  NY: [-75.4999, 43.2994],
  NC: [-79.0193, 35.7596],
  ND: [-101.0020, 47.5515],
  OH: [-82.9071, 40.4173],
  OK: [-97.0929, 35.0078],
  OR: [-120.5542, 43.8041],
  PA: [-77.1945, 41.2033],
  RI: [-71.4774, 41.5801],
  SC: [-81.1637, 33.8361],
  SD: [-99.9018, 43.9695],
  TN: [-86.5804, 35.5175],
  TX: [-99.9018, 31.9686],
  UT: [-111.0937, 39.3210],
  VT: [-72.5778, 44.5588],
  VA: [-78.6569, 37.4316],
  WA: [-120.7401, 47.7511],
  WV: [-80.4549, 38.5976],
  WI: [-89.6165, 43.7844],
  WY: [-107.2903, 43.0760],
  DC: [-77.0369, 38.9072],
}

// City offset adjustments for multiple projects in same state
const getCityOffset = (city: string | undefined, index: number): [number, number] => {
  // Add slight offset to prevent marker overlap
  const angle = (index * 137.5) * (Math.PI / 180) // Golden angle for even distribution
  const radius = 0.5 + (index * 0.3)
  return [Math.cos(angle) * radius, Math.sin(angle) * radius]
}

// Get sector color
const getSectorColor = (sector: Opportunity['sector']): string => {
  const mapping = SECTOR_MAPPING[sector]
  return mapping?.color || '#64748b'
}

// Format currency
const formatCurrency = (millions: number) => {
  if (millions >= 1000) return '$' + (millions / 1000).toFixed(1) + 'B'
  return '$' + millions + 'M'
}

// COLORS
const COLORS = {
  bg: '#030712',
  bgCard: '#0f172a',
  border: '#1e293b',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  accent: '#22d3ee',
}

const HEATMAP_STOPS: [number, number, number][] = [
  [13, 42, 48],     // dark teal — lowest investment
  [6, 95, 70],      // #065f46 — low
  [4, 120, 87],     // emerald — low-mid
  [16, 185, 129],   // #10b981 — mid
  [34, 197, 94],    // #22c55e — mid-high
  [74, 222, 128],   // #4ade80 — high
  [134, 239, 172],  // #86efac — very high
]

function interpolateHeatColor(t: number): string {
  const clamped = Math.max(0, Math.min(1, t))
  const segCount = HEATMAP_STOPS.length - 1
  const segment = Math.min(Math.floor(clamped * segCount), segCount - 1)
  const segT = (clamped * segCount) - segment
  const [r1, g1, b1] = HEATMAP_STOPS[segment]
  const [r2, g2, b2] = HEATMAP_STOPS[segment + 1]
  const r = Math.round(r1 + (r2 - r1) * segT)
  const g = Math.round(g1 + (g2 - g1) * segT)
  const b = Math.round(b1 + (b2 - b1) * segT)
  return `rgb(${r},${g},${b})`
}

function brighten(color: string, amount: number): string {
  const match = color.match(/rgb\((\d+),(\d+),(\d+)\)/)
  if (!match) return '#1e293b'
  const r = Math.min(255, Math.round(parseInt(match[1]) + (255 - parseInt(match[1])) * amount))
  const g = Math.min(255, Math.round(parseInt(match[2]) + (255 - parseInt(match[2])) * amount))
  const b = Math.min(255, Math.round(parseInt(match[3]) + (255 - parseInt(match[3])) * amount))
  return `rgb(${r},${g},${b})`
}

const STATE_NAME_TO_CODE: Record<string, string> = {
  'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
  'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
  'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
  'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
  'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
  'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
  'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV',
  'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
  'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK',
  'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT',
  'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV',
  'wisconsin': 'WI', 'wyoming': 'WY', 'district of columbia': 'DC',
}

function resolveStateCode(location: string | undefined): string | null {
  if (!location) return null
  const parts = location.split(',').map(p => p.trim())
  for (const part of parts) {
    const upper = part.toUpperCase()
    if (STATE_COORDS[upper]) return upper
    const lower = part.toLowerCase()
    if (STATE_NAME_TO_CODE[lower]) return STATE_NAME_TO_CODE[lower]
  }
  return null
}

const RADAR_SECTOR_COLOR: Record<string, string> = {
  defense: '#ef4444',
  aerospace: '#f97316',
  'life-sciences': '#a855f7',
  pharma: '#d946ef',
  nuclear: '#06b6d4',
  semiconductor: '#8b5cf6',
  'data-center': '#3b82f6',
  energy: '#22c55e',
  'critical-minerals': '#f59e0b',
  'ev-battery': '#84cc16',
  infrastructure: '#64748b',
}

function MapPageInner() {
  const searchParams = useSearchParams()
  const embed = searchParams.get('embed') === '1'

  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null)
  const [hoveredOpp, setHoveredOpp] = useState<Opportunity | null>(null)
  const [selectedRadarSignal, setSelectedRadarSignal] = useState<OTRadarSignal | null>(null)
  const [radarSignals, setRadarSignals] = useState<OTRadarSignal[]>([])
  const [radarStatus, setRadarStatus] = useState<string>('loading')
  const [sectorFilter, setSectorFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  // Broadcast filter changes to parent (radar page) when embedded
  useEffect(() => {
    if (!embed) return
    try {
      window.parent.postMessage(
        { type: 'ov-map-filter', sector: sectorFilter, priority: priorityFilter },
        '*',
      )
    } catch { /* cross-origin guard */ }
  }, [sectorFilter, priorityFilter, embed])
  const [showRadarLayer, setShowRadarLayer] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [center, setCenter] = useState<[number, number]>([-96, 38])

  const fetchRadar = useCallback(async () => {
    try {
      const res = await fetch('/api/radar/signals?limit=100')
      const data = await res.json()
      if (data.success) {
        setRadarSignals(data.signals || [])
        setRadarStatus(data.radarStatus || 'unknown')
      }
    } catch {
      setRadarStatus('error')
    }
  }, [])

  useEffect(() => {
    fetchRadar()
    const interval = setInterval(fetchRadar, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchRadar])

  const mappableRadarSignals = useMemo(() => {
    if (!showRadarLayer) return []
    return radarSignals
      .map(s => ({ signal: s, stateCode: resolveStateCode(s.location) }))
      .filter((r): r is { signal: OTRadarSignal; stateCode: string } => r.stateCode !== null)
  }, [radarSignals, showRadarLayer])

  // Filter opportunities
  const filteredOpps = useMemo(() => {
    return opportunities.filter(opp => {
      if (sectorFilter !== 'all' && opp.sector !== sectorFilter) return false
      if (priorityFilter !== 'all' && opp.priority !== priorityFilter) return false
      // Only show US-based with valid coordinates
      if (!opp.location?.state || opp.location.state === 'US') return false
      if (!STATE_COORDS[opp.location.state]) return false
      return true
    })
  }, [sectorFilter, priorityFilter])

  // Group by state for offset calculation
  const stateGroups = useMemo(() => {
    const groups: Record<string, Opportunity[]> = {}
    filteredOpps.forEach(opp => {
      const state = opp.location.state
      if (!groups[state]) groups[state] = []
      groups[state].push(opp)
    })
    return groups
  }, [filteredOpps])

  // Aggregate investment by state for choropleth
  const { investmentByState, maxStateInvestment, minNonZeroInvestment } = useMemo(() => {
    const byState: Record<string, number> = {}
    filteredOpps.forEach(opp => {
      const st = opp.location.state
      byState[st] = (byState[st] || 0) + opp.investmentSize
    })
    const values = Object.values(byState).filter(v => v > 0)
    return {
      investmentByState: byState,
      maxStateInvestment: values.length > 0 ? Math.max(...values) : 0,
      minNonZeroInvestment: values.length > 0 ? Math.min(...values) : 0,
    }
  }, [filteredOpps])

  const getStateFill = useCallback((geoName: string): string => {
    const code = STATE_NAME_TO_CODE[geoName.toLowerCase()]
    if (!code || !investmentByState[code] || maxStateInvestment === 0) return COLORS.bgCard
    const val = investmentByState[code]
    // Log scale so moderate-investment states still show color
    const t = Math.log(1 + val) / Math.log(1 + maxStateInvestment)
    return interpolateHeatColor(t)
  }, [investmentByState, maxStateInvestment])

  // Get marker position with offset
  const getMarkerPosition = (opp: Opportunity): [number, number] => {
    const baseCoords = STATE_COORDS[opp.location.state]
    if (!baseCoords) return [-96, 38]
    
    const stateOpps = stateGroups[opp.location.state] || []
    const index = stateOpps.findIndex(o => o.id === opp.id)
    const offset = getCityOffset(opp.location.city, index)
    
    return [baseCoords[0] + offset[0], baseCoords[1] + offset[1]]
  }

  // Calculate totals
  const totalInvestment = filteredOpps.reduce((sum, opp) => sum + opp.investmentSize, 0)
  const totalJobs = filteredOpps.reduce((sum, opp) => sum + (opp.jobs || 0), 0)

  // Get unique sectors for filter
  const sectors = useMemo(() => {
    const s = new Set(opportunities.map(o => o.sector))
    return Array.from(s).sort()
  }, [])

  const mainMapHeight = embed ? 'calc(100vh - 52px)' : 'calc(100vh - 200px)'

  return (
    <div style={{
      minHeight: embed ? '100vh' : '100vh',
      paddingTop: embed ? 0 : 0,
      backgroundColor: COLORS.bg,
      color: COLORS.text,
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {!embed && <AppNav />}
      <div style={{ paddingTop: embed ? 0 : '7.5rem' }}>
      {/* Header */}
      {!embed && (
      <header style={{
        padding: '0 2rem 1rem',
        borderBottom: `1px solid ${COLORS.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/radar" style={{ color: COLORS.textMuted, textDecoration: 'none', fontSize: '0.875rem' }}>
            ← Command center
          </Link>
          <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 600 }}>
            🗺️ Geographic pipeline
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.875rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: COLORS.accent, display: 'inline-block', boxShadow: `0 0 6px ${COLORS.accent}` }} />
            <span style={{ color: COLORS.accent, fontWeight: 600 }}>{filteredOpps.length}</span>
            <span style={{ color: COLORS.textMuted, fontSize: '0.75rem' }}>Projects</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px #22c55e' }} />
            <span style={{ color: '#22c55e', fontWeight: 600 }}>{formatCurrency(totalInvestment)}</span>
            <span style={{ color: COLORS.textMuted, fontSize: '0.75rem' }}>Pipeline</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block', boxShadow: '0 0 6px #f59e0b' }} />
            <span style={{ color: '#f59e0b', fontWeight: 600 }}>{totalJobs.toLocaleString()}</span>
            <span style={{ color: COLORS.textMuted, fontSize: '0.75rem' }}>Jobs</span>
          </div>
          <button
            onClick={() => setShowRadarLayer(!showRadarLayer)}
            style={{
              padding: '0.375rem 0.75rem',
              backgroundColor: showRadarLayer ? 'rgba(88,166,255,0.15)' : 'transparent',
              border: `1px solid ${showRadarLayer ? '#58a6ff' : COLORS.border}`,
              borderRadius: '6px',
              color: showRadarLayer ? '#58a6ff' : COLORS.textMuted,
              fontSize: '0.75rem',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            📡 Radar {radarStatus === 'connected' ? `(${mappableRadarSignals.length})` : `(${radarStatus})`}
          </button>
        </div>
      </header>
      )}

      {/* Filters */}
      <div style={{
        padding: embed ? '0.5rem 0.75rem' : '1rem 2rem',
        borderBottom: `1px solid ${COLORS.border}`,
        display: 'flex',
        gap: embed ? '0.75rem' : '1.5rem',
        alignItems: 'center',
        flexWrap: 'wrap',
        backgroundColor: embed ? 'rgba(15, 23, 42, 0.95)' : undefined,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ color: COLORS.textMuted, fontSize: '0.875rem' }}>Sector:</label>
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            style={{
              backgroundColor: COLORS.bgCard,
              color: COLORS.text,
              border: `1px solid ${COLORS.border}`,
              borderRadius: '6px',
              padding: '0.5rem',
              fontSize: '0.875rem',
            }}
          >
            <option value="all">All Sectors</option>
            {sectors.map(s => (
              <option key={s} value={s}>{SECTOR_MAPPING[s]?.displayName || s}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ color: COLORS.textMuted, fontSize: '0.875rem' }}>Priority:</label>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{
              backgroundColor: COLORS.bgCard,
              color: COLORS.text,
              border: `1px solid ${COLORS.border}`,
              borderRadius: '6px',
              padding: '0.5rem',
              fontSize: '0.875rem',
            }}
          >
            <option value="all">All Priorities</option>
            <option value="hot">🔥 Hot</option>
            <option value="warm">🟡 Warm</option>
            <option value="tracking">📋 Tracking</option>
          </select>
        </div>

        {/* Legend */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginLeft: 'auto',
          flexWrap: 'wrap',
        }}>
          {Object.entries(SECTOR_MAPPING).slice(0, 8).map(([key, val]) => (
            <div 
              key={key} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.25rem',
                fontSize: '0.75rem',
                color: COLORS.textMuted,
              }}
            >
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: val.color,
              }} />
              {val.displayName}
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div style={{ display: 'flex', height: mainMapHeight }}>
        {/* Map */}
        <div style={{ flex: 1, position: 'relative' }}>
          <ComposableMap
            projection="geoAlbersUsa"
            style={{ width: '100%', height: '100%' }}
          >
            <ZoomableGroup
              zoom={zoom}
              center={center}
              onMoveEnd={({ coordinates, zoom: z }) => {
                setCenter(coordinates as [number, number])
                setZoom(z)
              }}
            >
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const fillColor = getStateFill(geo.properties.name || '')
                    const code = STATE_NAME_TO_CODE[(geo.properties.name || '').toLowerCase()]
                    const hasInvestment = code && investmentByState[code] && investmentByState[code] > 0
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={fillColor}
                        stroke={hasInvestment ? 'rgba(16, 185, 129, 0.4)' : COLORS.border}
                        strokeWidth={hasInvestment ? 0.8 : 0.3}
                        style={{
                          default: { outline: 'none' },
                          hover: {
                            fill: brighten(fillColor, 0.25),
                            stroke: hasInvestment ? 'rgba(74, 222, 128, 0.7)' : '#334155',
                            strokeWidth: hasInvestment ? 1.2 : 0.6,
                            outline: 'none',
                          },
                          pressed: { outline: 'none' },
                        }}
                      />
                    )
                  })
                }
              </Geographies>

              {/* Project Markers */}
              {filteredOpps.map((opp) => {
                const coords = getMarkerPosition(opp)
                const isSelected = selectedOpp?.id === opp.id
                const isHovered = hoveredOpp?.id === opp.id
                const markerSize = Math.max(7, Math.min(22, Math.sqrt(opp.investmentSize / 40)))
                const sectorColor = getSectorColor(opp.sector)

                return (
                  <Marker
                    key={opp.id}
                    coordinates={coords}
                    onClick={() => { setSelectedRadarSignal(null); setSelectedOpp(isSelected ? null : opp) }}
                    onMouseEnter={() => setHoveredOpp(opp)}
                    onMouseLeave={() => setHoveredOpp(null)}
                    style={{ default: { cursor: 'pointer' }, hover: { cursor: 'pointer' }, pressed: { cursor: 'pointer' } }}
                  >
                    {/* Outer glow for all markers */}
                    <circle
                      r={markerSize + 6}
                      fill={sectorColor}
                      opacity={isSelected || isHovered ? 0.25 : 0.1}
                    />
                    {/* Pulse animation for hot items */}
                    {opp.priority === 'hot' && (
                      <circle
                        r={markerSize + 10}
                        fill={sectorColor}
                        opacity={0.3}
                        style={{
                          animation: 'pulse 2s ease-in-out infinite',
                        }}
                      />
                    )}
                    {/* Main marker */}
                    <circle
                      r={markerSize}
                      fill={sectorColor}
                      stroke={isSelected || isHovered ? '#fff' : 'rgba(255,255,255,0.5)'}
                      strokeWidth={isSelected || isHovered ? 2.5 : 1}
                      opacity={isSelected || isHovered ? 1 : 0.9}
                    />
                    {/* Inner highlight for depth */}
                    <circle
                      r={markerSize * 0.4}
                      fill="rgba(255,255,255,0.3)"
                      cx={-markerSize * 0.15}
                      cy={-markerSize * 0.15}
                    />
                    {/* Investment size label for large projects */}
                    {opp.investmentSize >= 3000 && zoom >= 1 && (
                      <text
                        textAnchor="middle"
                        y={markerSize + 14}
                        style={{
                          fontSize: '9px',
                          fill: '#e2e8f0',
                          fontWeight: 600,
                          textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                        }}
                      >
                        {formatCurrency(opp.investmentSize)}
                      </text>
                    )}
                  </Marker>
                )
              })}
              {/* Radar Signal Markers */}
              {mappableRadarSignals.map(({ signal, stateCode }, idx) => {
                const baseCoords = STATE_COORDS[stateCode]
                if (!baseCoords) return null
                const angle = ((idx + filteredOpps.length) * 137.5) * (Math.PI / 180)
                const radius = 0.8
                const coords: [number, number] = [
                  baseCoords[0] + Math.cos(angle) * radius,
                  baseCoords[1] + Math.sin(angle) * radius,
                ]
                const isSelected = selectedRadarSignal?.id === signal.id
                const color = RADAR_SECTOR_COLOR[signal.sector] || '#58a6ff'

                return (
                  <Marker
                    key={`radar-${signal.id || idx}`}
                    coordinates={coords}
                    onClick={() => {
                      setSelectedOpp(null)
                      setSelectedRadarSignal(isSelected ? null : signal)
                    }}
                    style={{ default: { cursor: 'pointer' }, hover: { cursor: 'pointer' }, pressed: { cursor: 'pointer' } }}
                  >
                    <polygon
                      points="0,-8 6,4 -6,4"
                      fill={color}
                      stroke={isSelected ? '#fff' : 'rgba(255,255,255,0.4)'}
                      strokeWidth={isSelected ? 2 : 0.5}
                      opacity={isSelected ? 1 : 0.8}
                    />
                  </Marker>
                )
              })}
            </ZoomableGroup>
          </ComposableMap>

          {/* Zoom controls */}
          <div style={{
            position: 'absolute',
            bottom: '1rem',
            right: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}>
            <button
              onClick={() => setZoom(Math.min(zoom * 1.5, 8))}
              style={{
                width: '36px',
                height: '36px',
                backgroundColor: COLORS.bgCard,
                border: `1px solid ${COLORS.border}`,
                borderRadius: '6px',
                color: COLORS.text,
                cursor: 'pointer',
                fontSize: '1.25rem',
              }}
            >
              +
            </button>
            <button
              onClick={() => setZoom(Math.max(zoom / 1.5, 1))}
              style={{
                width: '36px',
                height: '36px',
                backgroundColor: COLORS.bgCard,
                border: `1px solid ${COLORS.border}`,
                borderRadius: '6px',
                color: COLORS.text,
                cursor: 'pointer',
                fontSize: '1.25rem',
              }}
            >
              −
            </button>
            <button
              onClick={() => { setZoom(1); setCenter([-96, 38]) }}
              style={{
                width: '36px',
                height: '36px',
                backgroundColor: COLORS.bgCard,
                border: `1px solid ${COLORS.border}`,
                borderRadius: '6px',
                color: COLORS.text,
                cursor: 'pointer',
                fontSize: '0.75rem',
              }}
            >
              ⟲
            </button>
          </div>

          {/* Choropleth legend */}
          {maxStateInvestment > 0 && (
            <div style={{
              position: 'absolute',
              bottom: '1rem',
              left: '1rem',
              backgroundColor: 'rgba(3, 7, 18, 0.92)',
              border: `1px solid rgba(16, 185, 129, 0.2)`,
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              backdropFilter: 'blur(8px)',
            }}>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Investment by State
              </div>
              <div style={{
                width: '160px',
                height: '12px',
                borderRadius: '6px',
                background: `linear-gradient(to right, ${HEATMAP_STOPS.map((s, i) => `rgb(${s.join(',')}) ${(i / (HEATMAP_STOPS.length - 1) * 100).toFixed(0)}%`).join(', ')})`,
                boxShadow: '0 0 12px rgba(16, 185, 129, 0.15)',
              }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', marginTop: '0.375rem' }}>
                <span style={{ color: '#6ee7b7' }}>{formatCurrency(minNonZeroInvestment)}</span>
                <span style={{ color: '#86efac', fontWeight: 600 }}>{formatCurrency(maxStateInvestment)}</span>
              </div>
              <div style={{ fontSize: '0.6rem', color: '#64748b', marginTop: '0.375rem' }}>
                {Object.keys(investmentByState).length} states with active projects
              </div>
            </div>
          )}

          {/* Hover tooltip */}
          {hoveredOpp && !selectedOpp && (
            <div style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              backgroundColor: COLORS.bgCard,
              border: `1px solid ${COLORS.border}`,
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              maxWidth: '300px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}>
              <div style={{ 
                fontSize: '0.875rem', 
                fontWeight: 600,
                marginBottom: '0.25rem',
              }}>
                {hoveredOpp.company}
              </div>
              <div style={{ 
                fontSize: '0.75rem', 
                color: COLORS.textMuted,
                marginBottom: '0.5rem',
              }}>
                {hoveredOpp.project}
              </div>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
                <span style={{ color: '#22c55e' }}>{formatCurrency(hoveredOpp.investmentSize)}</span>
                <span style={{ color: getSectorColor(hoveredOpp.sector) }}>
                  {SECTOR_MAPPING[hoveredOpp.sector]?.displayName}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Radar Signal Detail Panel */}
        {selectedRadarSignal && !selectedOpp && (
          <div style={{
            width: '400px',
            backgroundColor: COLORS.bgCard,
            borderLeft: `1px solid ${COLORS.border}`,
            padding: '1.5rem',
            overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <div style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#58a6ff22',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  color: '#58a6ff',
                  marginBottom: '0.5rem',
                }}>
                  📡 OT Radar Signal
                </div>
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{selectedRadarSignal.entity}</h2>
              </div>
              <button
                onClick={() => setSelectedRadarSignal(null)}
                style={{ background: 'none', border: 'none', color: COLORS.textMuted, cursor: 'pointer', fontSize: '1.5rem', padding: 0 }}
              >
                ×
              </button>
            </div>

            <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', lineHeight: 1.5, color: COLORS.text }}>
              {selectedRadarSignal.description}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '1rem', backgroundColor: COLORS.bg, borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: COLORS.textMuted }}>Source</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, textTransform: 'capitalize' }}>{selectedRadarSignal.source}</div>
              </div>
              <div style={{ padding: '1rem', backgroundColor: COLORS.bg, borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: COLORS.textMuted }}>OT Relevance</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#58a6ff' }}>
                  {Math.round((selectedRadarSignal.otRelevanceScore || 0) * 100)}%
                </div>
              </div>
            </div>

            {selectedRadarSignal.location && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.875rem', color: COLORS.textMuted, marginBottom: '0.5rem' }}>Location</h3>
                <p style={{ margin: 0 }}>📍 {selectedRadarSignal.location}</p>
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.875rem', color: COLORS.textMuted, marginBottom: '0.5rem' }}>Signal Details</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ padding: '0.25rem 0.5rem', backgroundColor: COLORS.bg, borderRadius: '4px', fontSize: '0.75rem', color: COLORS.accent, textTransform: 'capitalize' }}>
                  {selectedRadarSignal.signalType?.replace(/-/g, ' ')}
                </span>
                <span style={{ padding: '0.25rem 0.5rem', backgroundColor: COLORS.bg, borderRadius: '4px', fontSize: '0.75rem', color: COLORS.textMuted, textTransform: 'capitalize' }}>
                  {selectedRadarSignal.sector}
                </span>
              </div>
            </div>

            {selectedRadarSignal.otKeywords && selectedRadarSignal.otKeywords.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.875rem', color: COLORS.textMuted, marginBottom: '0.5rem' }}>OT Keywords</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {selectedRadarSignal.otKeywords.map((kw, i) => (
                    <span key={i} style={{
                      padding: '0.25rem 0.5rem', backgroundColor: 'rgba(126, 231, 135, 0.1)',
                      borderRadius: '4px', fontSize: '0.75rem', color: '#7ee787',
                    }}>{kw}</span>
                  ))}
                </div>
              </div>
            )}

            {selectedRadarSignal.url && (
              <a
                href={selectedRadarSignal.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block', padding: '0.75rem', textAlign: 'center',
                  backgroundColor: '#58a6ff22', border: '1px solid #58a6ff44',
                  borderRadius: '8px', color: '#58a6ff', textDecoration: 'none',
                  fontSize: '0.875rem', fontWeight: 500,
                }}
              >
                View Source →
              </a>
            )}
          </div>
        )}

        {/* Opportunity Detail panel */}
        {selectedOpp && (
          <div style={{
            width: '400px',
            backgroundColor: COLORS.bgCard,
            borderLeft: `1px solid ${COLORS.border}`,
            padding: '1.5rem',
            overflowY: 'auto',
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: '1rem',
            }}>
              <div>
                <div style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.5rem',
                  backgroundColor: getSectorColor(selectedOpp.sector),
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  marginBottom: '0.5rem',
                }}>
                  {SECTOR_MAPPING[selectedOpp.sector]?.displayName}
                </div>
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{selectedOpp.company}</h2>
                <p style={{ margin: '0.25rem 0 0', color: COLORS.textMuted, fontSize: '0.875rem' }}>
                  {selectedOpp.project}
                </p>
              </div>
              <button
                onClick={() => setSelectedOpp(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: COLORS.textMuted,
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  padding: 0,
                }}
              >
                ×
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}>
              <div style={{
                padding: '1rem',
                backgroundColor: COLORS.bg,
                borderRadius: '8px',
              }}>
                <div style={{ fontSize: '0.75rem', color: COLORS.textMuted }}>Investment</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#22c55e' }}>
                  {formatCurrency(selectedOpp.investmentSize)}
                </div>
              </div>
              <div style={{
                padding: '1rem',
                backgroundColor: COLORS.bg,
                borderRadius: '8px',
              }}>
                <div style={{ fontSize: '0.75rem', color: COLORS.textMuted }}>Jobs</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#f59e0b' }}>
                  {selectedOpp.jobs?.toLocaleString() || 'TBD'}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.875rem', color: COLORS.textMuted, marginBottom: '0.5rem' }}>
                Location
              </h3>
              <p style={{ margin: 0 }}>
                📍 {selectedOpp.location.city ? `${selectedOpp.location.city}, ` : ''}{selectedOpp.location.state}
              </p>
            </div>

            {selectedOpp.trumpPolicyAlignment && selectedOpp.trumpPolicyAlignment.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.875rem', color: COLORS.textMuted, marginBottom: '0.5rem' }}>
                  Policy Alignment
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {selectedOpp.trumpPolicyAlignment.map(policy => (
                    <span
                      key={policy}
                      style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: COLORS.bg,
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        color: COLORS.accent,
                      }}
                    >
                      {policy}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedOpp.civilizationalImpact && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.875rem', color: COLORS.textMuted, marginBottom: '0.5rem' }}>
                  Strategic Impact
                </h3>
                <p style={{ 
                  margin: 0, 
                  fontSize: '0.875rem',
                  color: COLORS.text,
                  lineHeight: 1.5,
                }}>
                  {selectedOpp.civilizationalImpact}
                </p>
              </div>
            )}

            {selectedOpp.nextMilestone && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.875rem', color: COLORS.textMuted, marginBottom: '0.5rem' }}>
                  Next Milestone
                </h3>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>
                  📅 {selectedOpp.nextMilestone.date} — {selectedOpp.nextMilestone.label}
                </p>
              </div>
            )}

            <div style={{
              padding: '1rem',
              backgroundColor: selectedOpp.priority === 'hot' ? 'rgba(239, 68, 68, 0.1)' : COLORS.bg,
              borderRadius: '8px',
              border: selectedOpp.priority === 'hot' ? '1px solid rgba(239, 68, 68, 0.3)' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>
                  {selectedOpp.priority === 'hot' ? '🔥' : selectedOpp.priority === 'warm' ? '🟡' : '📋'}
                </span>
                <span style={{ fontWeight: 500 }}>
                  {selectedOpp.priority === 'hot' ? 'Hot Priority' : 
                   selectedOpp.priority === 'warm' ? 'Warm Priority' : 'Tracking'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      </div>

      {/* Animations */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.35; }
          50% { transform: scale(1.8); opacity: 0.05; }
        }
        .rsm-geography {
          transition: fill 0.3s ease, stroke 0.2s ease;
        }
      `}</style>
    </div>
  )
}

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            backgroundColor: '#030712',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          Loading map…
        </div>
      }
    >
      <MapPageInner />
    </Suspense>
  )
}
