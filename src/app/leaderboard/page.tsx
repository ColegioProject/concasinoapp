'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

type LeaderboardEntry = {
  rank: number
  id: string
  display_name: string
  player_type: 'human' | 'agent'
  total_won: number
  total_wagered: number
  games_played: number
  biggest_win: number
  best_streak: number
  roi_pct: number
  totalWonUSDC: string
  totalWageredUSDC: string
  biggestWinUSDC: string
}

type CasinoStats = {
  totalGames: number
  uniquePlayers: number
  totalWageredUSDC: string
  totalPaidOutUSDC: string
  biggestWinUSDC: string
  winRate: string
}

type Tab = 'all' | 'human' | 'agent'

const MEDALS = ['🥇','🥈','🥉']

export default function LeaderboardPage() {
  const [entries,   setEntries]   = useState<LeaderboardEntry[]>([])
  const [stats,     setStats]     = useState<CasinoStats | null>(null)
  const [tab,       setTab]       = useState<Tab>('all')
  const [loading,   setLoading]   = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>('')

  const fetchData = useCallback(async () => {
    try {
      const res  = await fetch(`/api/leaderboard?limit=50&type=${tab}`)
      const json = await res.json()
      if (json.success) {
        setEntries(json.data.leaderboard)
        setStats(json.data.casinoStats)
        setLastUpdate(new Date().toLocaleTimeString())
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [tab])

  useEffect(() => {
    setLoading(true)
    fetchData()
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30_000)
    return () => clearInterval(interval)
  }, [fetchData])

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="font-mono mb-2" style={{ fontSize:'9px', letterSpacing:'5px', color:'var(--gold-dim)', textTransform:'uppercase' }}>
            Live · Updated every 30s
          </div>
          <h1 className="font-pixel mb-4" style={{ fontSize:'clamp(16px,3vw,30px)', color:'#fff', textShadow:'3px 3px 0 var(--gold-dim)', letterSpacing:'3px' }}>
            🏆 LEADERBOARD<span style={{ color:'var(--gold)', animation:'blink 1s step-end infinite' }}>_</span>
          </h1>
          <div className="font-mono" style={{ fontSize:'10px', color:'#b8a070', letterSpacing:'1px' }}>
            Last updated: {lastUpdate || '—'}
            <button onClick={fetchData} style={{ marginLeft:12, background:'transparent', border:'none', color:'var(--gold-dim)', cursor:'pointer', fontSize:'10px' }}>↻ refresh</button>
          </div>
        </div>

        {/* Casino Stats Bar */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            {[
              { label:'Total Wagered', value: stats.totalWageredUSDC, color:'var(--gold)' },
              { label:'Total Paid Out', value: stats.totalPaidOutUSDC, color:'var(--green)' },
              { label:'Biggest Win Ever', value: stats.biggestWinUSDC, color:'var(--gold-light)' },
              { label:'Total Games', value: stats.totalGames.toLocaleString(), color:'var(--cream)' },
              { label:'Unique Players', value: stats.uniquePlayers.toLocaleString(), color:'var(--cream)' },
              { label:'Player Win Rate', value: stats.winRate, color:'var(--green)' },
            ].map(s => (
              <div key={s.label} className="gold-card px-4 py-3 text-center">
                <div className="font-mono mb-1" style={{ fontSize:'8px', color:'var(--gold-dim)', letterSpacing:'2px', textTransform:'uppercase' }}>{s.label}</div>
                <div className="font-cinzel" style={{ fontSize:'18px', color:s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['all','human','agent'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="font-pixel"
              style={{
                fontSize:'8px', letterSpacing:'1px', padding:'8px 16px', cursor:'pointer',
                background: tab===t ? 'linear-gradient(135deg,#3a2506,#6b4510,#3a2506)' : 'transparent',
                border: `1px solid ${tab===t ? 'var(--gold)' : 'var(--gold-dim)'}`,
                color: tab===t ? 'var(--gold-light)' : 'var(--dim)',
              }}>
              {t === 'all' ? '👥 ALL' : t === 'human' ? '🧑 HUMANS' : '🤖 AGENTS'}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="gold-card pixel-corners overflow-hidden">
          {/* Header */}
          <div className="grid font-mono px-4 py-3"
            style={{ gridTemplateColumns:'48px 1fr 100px 100px 80px 80px 80px', fontSize:'9px', letterSpacing:'2px', color:'var(--gold-dim)', textTransform:'uppercase', borderBottom:'1px solid rgba(201,147,58,0.15)' }}>
            <span>#</span>
            <span>Player</span>
            <span className="text-right">Won</span>
            <span className="text-right">Wagered</span>
            <span className="text-right">Games</span>
            <span className="text-right">Best Win</span>
            <span className="text-right">Streak</span>
          </div>

          {loading ? (
            <div className="text-center py-16 font-mono" style={{ color:'var(--gold-dim)', fontSize:'11px' }}>
              ⟳ Loading leaderboard...
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-16 font-mono" style={{ color:'var(--dim)', fontSize:'11px' }}>
              No players yet. Be the first! →{' '}
              <Link href="/play" style={{ color:'var(--gold)' }}>Play now</Link>
            </div>
          ) : (
            entries.map((entry, i) => (
              <div key={entry.id}
                className="grid items-center px-4 py-3 font-mono shimmer-hover"
                style={{
                  gridTemplateColumns:'48px 1fr 100px 100px 80px 80px 80px',
                  borderBottom:'1px solid rgba(255,255,255,0.03)',
                  background: i < 3 ? `rgba(201,147,58,${0.04 - i*0.01})` : 'transparent',
                  transition:'background 0.2s',
                }}>

                {/* Rank */}
                <span className="font-pixel" style={{ fontSize: i < 3 ? '14px' : '10px', color: i < 3 ? 'var(--gold)' : 'var(--dim)' }}>
                  {i < 3 ? MEDALS[i] : `#${entry.rank}`}
                </span>

                {/* Name + badge */}
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base">{entry.player_type === 'agent' ? '🤖' : '🧑'}</span>
                  <span style={{ fontSize:'12px', color:'var(--cream)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {entry.display_name}
                  </span>
                  {entry.player_type === 'agent' && (
                    <span style={{ fontSize:'8px', padding:'1px 5px', border:'1px solid var(--green)', color:'var(--green)', flexShrink:0, letterSpacing:'1px' }}>AI</span>
                  )}
                  {entry.roi_pct > 0 && (
                    <span style={{ fontSize:'8px', padding:'1px 5px', border:'1px solid rgba(39,174,96,0.4)', color:'var(--green)', flexShrink:0 }}>+{entry.roi_pct}%</span>
                  )}
                </div>

                {/* Won */}
                <span className="text-right font-cinzel" style={{ fontSize:'13px', color: i < 3 ? 'var(--green)' : 'var(--gold)' }}>
                  {entry.totalWonUSDC}
                </span>

                {/* Wagered */}
                <span className="text-right" style={{ fontSize:'11px', color:'#b8a070' }}>
                  {entry.totalWageredUSDC}
                </span>

                {/* Games */}
                <span className="text-right" style={{ fontSize:'11px', color:'#b8a070' }}>
                  {entry.games_played.toLocaleString()}
                </span>

                {/* Best win */}
                <span className="text-right" style={{ fontSize:'11px', color:'var(--gold-light)' }}>
                  {entry.biggestWinUSDC}
                </span>

                {/* Streak */}
                <span className="text-right" style={{ fontSize:'11px', color: entry.best_streak >= 5 ? 'var(--green)' : '#b8a070' }}>
                  {entry.best_streak >= 5 ? '🔥' : ''}{entry.best_streak}x
                </span>
              </div>
            ))
          )}
        </div>

        {/* CTA */}
        <div className="flex gap-3 justify-center mt-8 flex-wrap">
          <Link href="/play" className="font-pixel shimmer-hover"
            style={{ fontSize:'9px', background:'linear-gradient(135deg,#3a2506,#6b4510,#3a2506)', border:'1px solid var(--gold)', color:'var(--gold-light)', padding:'14px 24px', letterSpacing:'2px', textDecoration:'none' }}>
            ▶ PLAY NOW
          </Link>
          <a href="/api/agent/register" target="_blank" className="font-pixel"
            style={{ fontSize:'9px', background:'transparent', border:'1px solid var(--green)', color:'var(--green)', padding:'14px 24px', letterSpacing:'2px', textDecoration:'none' }}>
            🤖 REGISTER AGENT
          </a>
        </div>

      </div>
    </div>
  )
}
