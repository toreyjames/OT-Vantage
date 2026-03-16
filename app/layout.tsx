import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'OT Vantage | Deloitte',
  description: 'OT Opportunity Intelligence - Identifying cyber-physical pursuits across the build economy.',
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


