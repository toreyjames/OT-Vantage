import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Assurance Twin - Genesis Assurance Layer',
  description: 'The truth layer that prevents AI from acting on fiction',
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



