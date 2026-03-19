'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const COLORS = {
  border: '#21262d',
  text: '#e6edf3',
  textMuted: '#7d8590',
  accent: '#7ee787',
}

const LINKS = [
  { href: '/radar', label: 'Command' },
  { href: '/opportunities', label: 'Pipeline' },
  { href: '/map', label: 'Map' },
  { href: '/agents', label: 'Intelligence' },
  { href: '/scoreboard', label: 'Scoreboard' },
  { href: '/monitor', label: 'Monitor' },
  { href: '/about', label: 'About' },
] as const

export default function AppNav() {
  const pathname = usePathname()

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1.5rem',
        backgroundColor: 'rgba(10, 15, 20, 0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${COLORS.border}`,
      }}
    >
      <Link href="/radar" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.35rem' }}>⏱</span>
            <span
              style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                background: `linear-gradient(135deg, ${COLORS.text} 0%, ${COLORS.accent} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Build Clock
            </span>
          </div>
          <div
            style={{
              fontSize: '0.65rem',
              color: COLORS.textMuted,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              paddingLeft: '2rem',
            }}
          >
            Scan · Qualify · Track · Close
          </div>
          <div style={{ fontSize: '0.6rem', color: '#58a6ff', paddingLeft: '2rem' }}>
            OT Vantage intelligence layer
          </div>
        </div>
      </Link>
      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {LINKS.map(({ href, label }) => {
          const active = pathname === href || (href !== '/radar' && pathname?.startsWith(href + '/'))
          const isRadar = href === '/radar'
          const activePath = isRadar ? pathname === '/radar' || pathname === '/' : active
          return (
            <Link
              key={href}
              href={href}
              style={{
                padding: '0.45rem 0.85rem',
                color: activePath ? COLORS.accent : COLORS.textMuted,
                textDecoration: 'none',
                fontSize: '0.8125rem',
                fontWeight: 500,
                borderRadius: '6px',
                backgroundColor: activePath ? COLORS.accent + '22' : 'transparent',
                border: activePath ? `1px solid ${COLORS.accent}44` : '1px solid transparent',
              }}
            >
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
