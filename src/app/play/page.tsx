'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const GAMES = [
  { slug:'coinflip',  name:'COINFLIP',  icon:'🪙', badge:'LIVE', edge:'2%',   payout:'2×',   desc:'Heads or tails. Purest wager.',   color:'var(--green)' },
  { slug:'blackjack', name:'BLACKJACK', icon:'🃏', badge:'HOT',  edge:'0.5%', payout:'3:2',  desc:'Best odds. Beat the dealer to 21.', color:'var(--gold)'  },
  { slug:'dados',     name:'DICE',      icon:'🎲', badge:'LIVE', edge:'1%',   payout:'98×',  desc:'Set your own risk.',               color:'var(--green)' },
  { slug:'ruleta',    name:'ROULETTE',  icon:'🎡', badge:'HOT',  edge:'2.7%', payout:'35:1', desc:'European. 37 numbers.',            color:'var(--gold)'  },
]

const CHIPS = [100, 500, 2500, 10000]

type Stats = {
  totalGames: number
  uniquePlayers: number
  totalWageredUSDC: string
  biggestWinUSDC: string
}

type RecentWin = {
  gameType: string
  payout: string
  playerType: string
}

export default function PlayLobby() {
  const [bet,     setBet]     = useState(500)
  const [stats,   setStats]   = useState<Stats | null>(null)
  const [recent,  setRecent]  = useState<RecentWin[]>([])
  const [tickerPos, setTickerPos] = useState(0)

  useEffect(() => {
    fetch('/api/leaderboard?limit=5')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setStats(d.data.casinoStats)
          setRecent(d.data.recentWins || [])
        }
      })
      .catch(() => {})
  }, [])

  // Ticker animation
  useEffect(() => {
    const iv = setInterval(() => setTickerPos(p => (p + 1) % 200), 40)
    return () => clearInterval(iv)
  }, [])

  const tickerItems = recent.length > 0
    ? recent.map(w => `${w.gameType.toUpperCase()} ${w.payout} WIN`)
    : ['COINFLIP $980 WIN','BLACKJACK $1,200 WIN','DICE $4,800 WIN','ROULETTE $3,500 WIN']

  const tickerStr = (tickerItems.join('   ·   ') + '   ·   ').repeat(3)

  return (
    <div className="min-h-screen pt-20 pb-16 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center py-10">
          <div className="font-mono mb-3" style={{ fontSize:'9px', letterSpacing:'5px', color:'var(--gold-dim)', textTransform:'uppercase' }}>
            Base Mainnet · USDC · Provably Fair
          </div>
          <h1 className="font-pixel mb-2" style={{ fontSize:'clamp(18px,3vw,32px)', color:'#fff', textShadow:'3px 3px 0 var(--gold-dim)', letterSpacing:'3px' }}>
            SELECT GAME
          </h1>
        </div>

        {/* Live stats bar */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { label:'Total Wagered', value: stats.totalWageredUSDC, color:'var(--gold)' },
              { label:'Total Games',   value: stats.totalGames.toLocaleString(), color:'var(--cream)' },
              { label:'Players',       value: stats.uniquePlayers.toLocaleString(), color:'var(--cream)' },
              { label:'Biggest Win',   value: stats.biggestWinUSDC, color:'var(--green)' },
            ].map(s => (
              <div key={s.label} className="gold-card text-center px-4 py-3">
                <div className="font-mono mb-1" style={{ fontSize:'8px', color:'var(--gold-dim)', letterSpacing:'2px', textTransform:'uppercase' }}>{s.label}</div>
                <div className="font-cinzel" style={{ fontSize:'17px', color:s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Recent wins ticker */}
        <div style={{ overflow:'hidden', borderTop:'1px solid rgba(201,147,58,0.1)', borderBottom:'1px solid rgba(201,147,58,0.1)', padding:'8px 0', marginBottom:'32px', position:'relative' }}>
          <div style={{ whiteSpace:'nowrap', transform:`translateX(-${tickerPos * 2}px)`, transition:'none', fontFamily:'monospace', fontSize:'10px', color:'var(--gold-dim)', letterSpacing:'2px' }}>
            {tickerStr}
          </div>
        </div>

        {/* Chip selector */}
        <div className="flex justify-center gap-3 mb-8 flex-wrap">
          <span className="font-mono" style={{ fontSize:'9px', color:'var(--gold-dim)', alignSelf:'center', letterSpacing:'2px', textTransform:'uppercase' }}>Bet:</span>
          {CHIPS.map(c => (
            <button key={c} onClick={() => setBet(c)}
              className="font-pixel"
              style={{
                fontSize:'8px', padding:'10px 16px', cursor:'pointer', transition:'all 0.2s', letterSpacing:'1px',
                background: bet===c ? 'linear-gradient(135deg,#3a2506,#6b4510,#3a2506)' : 'transparent',
                border: `1px solid ${bet===c ? 'var(--gold)' : 'var(--gold-dim)'}`,
                color: bet===c ? 'var(--gold-light)' : 'var(--dim)',
                transform: bet===c ? 'scale(1.05)' : 'scale(1)',
                boxShadow: bet===c ? '0 0 12px rgba(201,147,58,0.2)' : 'none',
              }}>
              ${(c/100).toFixed(c < 100 ? 2 : 0)}
            </button>
          ))}
        </div>

        {/* Game cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GAMES.map(game => (
            <Link key={game.slug} href={`/play/${game.slug}?bet=${bet}`}
              className="gold-card pixel-corners block shimmer-hover"
              style={{ textDecoration:'none', transition:'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(201,147,58,0.12)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}>

              {/* Top accent */}
              <div style={{ height:3, background:`linear-gradient(90deg, transparent, ${game.color}, transparent)` }} />

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize:'32px' }}>{game.icon}</span>
                    <div>
                      <h3 className="font-pixel" style={{ fontSize:'13px', color:'#fff', letterSpacing:'2px' }}>{game.name}</h3>
                      <p className="font-mono mt-1" style={{ fontSize:'11px', color:'#b8a070' }}>{game.desc}</p>
                    </div>
                  </div>
                  <span className="font-pixel" style={{ fontSize:'7px', padding:'4px 8px', border:`1px solid ${game.color}`, color:game.color, letterSpacing:'1px', flexShrink:0 }}>
                    {game.badge}
                  </span>
                </div>

                <div className="flex gap-4 mb-5">
                  <div>
                    <div className="font-mono" style={{ fontSize:'8px', color:'var(--gold-dim)', letterSpacing:'2px', textTransform:'uppercase' }}>House Edge</div>
                    <div className="font-cinzel" style={{ fontSize:'18px', color:'var(--gold)' }}>{game.edge}</div>
                  </div>
                  <div>
                    <div className="font-mono" style={{ fontSize:'8px', color:'var(--gold-dim)', letterSpacing:'2px', textTransform:'uppercase' }}>Max Payout</div>
                    <div className="font-cinzel" style={{ fontSize:'18px', color:'var(--cream)' }}>{game.payout}</div>
                  </div>
                  <div>
                    <div className="font-mono" style={{ fontSize:'8px', color:'var(--gold-dim)', letterSpacing:'2px', textTransform:'uppercase' }}>Your Bet</div>
                    <div className="font-cinzel" style={{ fontSize:'18px', color:game.color }}>${(bet/100).toFixed(2)}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-mono" style={{ fontSize:'10px', color:'var(--gold-dim)' }}>
                    ◆ Conway VM · Provably Fair
                  </span>
                  <span className="font-pixel" style={{ fontSize:'8px', color:game.color, letterSpacing:'1px' }}>
                    PLAY →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom links */}
        <div className="flex gap-4 justify-center mt-10 flex-wrap">
          <Link href="/leaderboard" className="font-pixel"
            style={{ fontSize:'8px', background:'transparent', border:'1px solid var(--gold-dim)', color:'var(--gold-dim)', padding:'10px 20px', letterSpacing:'1px', textDecoration:'none' }}>
            🏆 LEADERBOARD
          </Link>
          <a href="/api/agent/register" target="_blank" className="font-pixel"
            style={{ fontSize:'8px', background:'transparent', border:'1px solid var(--green)', color:'var(--green)', padding:'10px 20px', letterSpacing:'1px', textDecoration:'none' }}>
            🤖 AGENT API
          </a>
          <a href="/api/deposit" target="_blank" className="font-pixel"
            style={{ fontSize:'8px', background:'transparent', border:'1px solid var(--gold-dim)', color:'var(--gold-dim)', padding:'10px 20px', letterSpacing:'1px', textDecoration:'none' }}>
            + DEPOSIT USDC
          </a>
        </div>

      </div>
    </div>
  )
}
