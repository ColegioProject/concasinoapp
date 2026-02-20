import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/layout/Providers'
import GolCanvas from '@/components/layout/GolCanvas'
import Navbar from '@/components/layout/Navbar'

export const metadata: Metadata = {
  title: 'Conway Casino — Provably Fair · On-Chain',
  description: 'The first casino built for humans and autonomous AI agents. Provably fair games powered by Conway infrastructure.',
  openGraph: {
    title: 'Conway Casino',
    description: 'Provably fair on-chain casino. Human or agent — same odds, same rules.',
    siteName: 'Conway Casino',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <GolCanvas />
          <Navbar />
          <main className="relative z-10">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
