'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function Navbar() {
  const pathname = usePathname()
  const isPlay = pathname?.startsWith('/play')

  const gameLabel: Record<string, string> = {
    coinflip: 'COINFLIP',
    blackjack: 'BLACKJACK',
    dados: 'DICE',
    ruleta: 'ROULETTE',
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-3"
      style={{
        background: 'rgba(6,5,5,0.88)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--gold-border)',
      }}
    >
      <Link href="/" style={{ color: 'var(--gold-light)', textShadow: '0 0 16px rgba(201,147,58,0.5)', letterSpacing: '2px', textDecoration: 'none', fontFamily: '"Press Start 2P", monospace', fontSize: '13px' }}>
        CONWAY<span style={{ color: 'var(--gold)', animation: 'blink 1s step-end infinite' }}>_</span>
      </Link>

      {!isPlay && (
        <div className="hidden md:flex items-center gap-6">
          {['#who','#how','#games','#provably','#fees','#roadmap','#faq'].map(href => (
            <a key={href} href={href} style={{ color: 'var(--dim2)', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => ((e.target as HTMLElement).style.color = 'var(--gold)')}
              onMouseLeave={e => ((e.target as HTMLElement).style.color = 'var(--dim2)')}>
              {href.replace('#','')}
            </a>
          ))}
          <Link href="/leaderboard"
            style={{ color: 'var(--gold-dim)', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', textDecoration: 'none', transition: 'color 0.2s', fontFamily: 'monospace' }}
            onMouseEnter={e => ((e.target as HTMLElement).style.color = 'var(--gold)')}
            onMouseLeave={e => ((e.target as HTMLElement).style.color = 'var(--gold-dim)')}>
            🏆 LEADERBOARD
          </Link>
        </div>
      )}

      {isPlay && (
        <div className="flex gap-1">
          {['coinflip','blackjack','dados','ruleta'].map(slug => (
            <Link key={slug} href={`/play/${slug}`} style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '7px', letterSpacing: '1px', padding: '7px 11px', textDecoration: 'none', transition: 'all 0.2s', color: pathname === `/play/${slug}` ? 'var(--gold-light)' : 'var(--dim2)', borderBottom: pathname === `/play/${slug}` ? '1px solid var(--gold)' : '1px solid transparent' }}>
              {gameLabel[slug]}
            </Link>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <ConnectButton.Custom>
          {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
            const ready = mounted
            const connected = ready && account && chain
            return (
              <div {...(!ready && { 'aria-hidden': true, style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' } })}>
                {!connected ? (
                  <button onClick={openConnectModal}
                    style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '8px', background: 'transparent', border: '1px solid var(--gold-dim)', color: 'var(--gold-light)', padding: '10px 16px', cursor: 'pointer', letterSpacing: '1px', transition: 'all 0.2s' }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--gold)'; el.style.boxShadow = '0 0 14px rgba(201,147,58,0.2)'; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--gold-dim)'; el.style.boxShadow = 'none'; }}>
                    CONNECT WALLET
                  </button>
                ) : chain.unsupported ? (
                  <button onClick={openChainModal}
                    style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '8px', background: 'transparent', border: '1px solid #e74c3c', color: '#e74c3c', padding: '10px 16px', cursor: 'pointer', letterSpacing: '1px' }}>
                    WRONG NETWORK
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    {chain.hasIcon && chain.iconUrl && (
                      <button onClick={openChainModal} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
                        <div style={{ width: 18, height: 18, borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--gold-dim)' }}>
                          <img src={chain.iconUrl} alt={chain.name} style={{ width: '100%', height: '100%' }} />
                        </div>
                      </button>
                    )}
                    <button onClick={openAccountModal}
                      style={{ fontFamily: '"Share Tech Mono", monospace', fontSize: '11px', background: 'transparent', border: '1px solid var(--green)', color: 'var(--green)', padding: '8px 14px', cursor: 'pointer', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)', display: 'inline-block', flexShrink: 0 }} />
                      {account.displayName}
                    </button>
                  </div>
                )}
              </div>
            )
          }}
        </ConnectButton.Custom>

        {!isPlay && (
          <Link href="/play" style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '8px', background: 'linear-gradient(135deg,#3a2506,#6b4510,#3a2506)', border: '1px solid var(--gold)', color: 'var(--gold-light)', padding: '10px 16px', letterSpacing: '1px', textDecoration: 'none' }}>
            ▶ PLAY
          </Link>
        )}
      </div>
    </nav>
  )
}
