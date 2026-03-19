import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Build Clock | Deloitte — OT Vantage',
  description:
    'Deloitte-facing command center: scan, qualify, track, and close industrial OT opportunities. Pipeline, geography, live intelligence (OT Vantage).',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}


