'use client'
import '@rainbow-me/rainbowkit/styles.css'
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { base } from 'wagmi/chains'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { ReactNode } from 'react'

const config = getDefaultConfig({
  appName: 'Conway Casino',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'conway-casino-dev',
  chains: [base],
  ssr: true,
})

const queryClient = new QueryClient()

// Custom RainbowKit theme matching Conway Casino aesthetic
const conwayTheme = darkTheme({
  accentColor: '#c9933a',
  accentColorForeground: '#1a1000',
  borderRadius: 'none',
  fontStack: 'system',
  overlayBlur: 'small',
})

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={conwayTheme} locale="en-US">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
