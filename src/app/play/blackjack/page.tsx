'use client'
export const dynamic = 'force-dynamic'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'

type Card = { value: string; suit: string }
type GameState = { gameId:string; outcome:'win'|'lose'|'push'; payout:number; profit:number; resultData:{ playerCards:Card[]; dealerCards:Card[]; playerTotal:number; dealerTotal:number; outcome:string }; seed:string; vmId:string }

const SUIT_COLOR: Record<string,string> = { '♠':'#fff','♣':'#fff','♥':'#e74c3c','♦':'#e74c3c' }
const CHIPS = [100, 500, 2500, 10000]

function CardUI({ card }: { card: Card }) {
  return (
    <div style={{ width:44, height:62, background:'#fff', borderRadius:4, border:'1px solid #ddd', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.4)' }}>
      <span style={{ fontSize:14, fontWeight:'bold', color:SUIT_COLOR[card.suit]||'#111' }}>{card.value}</span>
      <span style={{ fontSize:16 }}>{card.suit}</span>
    </div>
  )
}

function BlackjackInner() {
  const params      = useSearchParams()
  const { address } = useAccount()
  const [bet,     setBet]    = useState(Number(params.get('bet')) || 500)
  const [game,    setGame]   = useState<GameState | null>(null)
  const [loading, setLoading] = useState(false)
  const [flash,   setFlash]  = useState<'win'|'lose'|null>(null)

  async function play() {
    if (!address) return
    setLoading(true); setGame(null); setFlash(null)
    try {
      const res  = await fetch('/api/games/blackjack', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ bet, walletAddress: address }) })
      const json = await res.json()
      if (!json.success) { alert(json.error); return }
      setGame(json.data)
      setFlash(json.data.outcome==='win' ? 'win' : json.data.outcome==='lose' ? 'lose' : null)
      setTimeout(() => setFlash(null), 1200)
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6" style={{ background: flash==='win'?'rgba(39,174,96,0.04)':flash==='lose'?'rgba(231,76,60,0.04)':'transparent', transition:'background 0.4s' }}>
      <div className="max-w-lg mx-auto">
        <Link href="/play" className="font-mono" style={{ fontSize:'10px', color:'var(--gold-dim)', textDecoration:'none', letterSpacing:'2px', display:'inline-block', marginBottom:24 }}>← LOBBY</Link>
        <div className="gold-card pixel-corners">
          <div style={{ height:3, background:'linear-gradient(90deg,transparent,var(--gold),transparent)' }} />
          <div className="p-8">
            <h1 className="font-pixel mb-1" style={{ fontSize:'16px', color:'#fff', textShadow:'3px 3px 0 var(--gold-dim)', letterSpacing:'3px' }}>🃏 BLACKJACK</h1>
            <p className="font-mono mb-6" style={{ fontSize:'10px', color:'#b8a070', letterSpacing:'1px' }}>0.5% house edge · 3:2 blackjack · Standard rules</p>
            <div className="mb-6 p-4" style={{ border:'1px solid rgba(201,147,58,0.15)', background:'rgba(0,0,0,0.2)' }}>
              <div className="font-mono mb-3" style={{ fontSize:'9px', color:'var(--gold-dim)', letterSpacing:'2px' }}>DEALER {game?`(${game.resultData.dealerTotal})`:''}</div>
              <div className="flex gap-2">{game ? game.resultData.dealerCards.map((c,i) => <CardUI key={i} card={c} />) : <div style={{ width:44, height:62, background:'rgba(201,147,58,0.1)', borderRadius:4, border:'1px dashed var(--gold-dim)' }} />}</div>
            </div>
            <div className="mb-6 p-4" style={{ border:'1px solid rgba(201,147,58,0.15)', background:'rgba(0,0,0,0.2)' }}>
              <div className="font-mono mb-3" style={{ fontSize:'9px', color:'var(--gold-dim)', letterSpacing:'2px' }}>YOU {game?`(${game.resultData.playerTotal})`:''}</div>
              <div className="flex gap-2">{game ? game.resultData.playerCards.map((c,i) => <CardUI key={i} card={c} />) : <div style={{ width:44, height:62, background:'rgba(201,147,58,0.1)', borderRadius:4, border:'1px dashed var(--gold-dim)' }} />}</div>
            </div>
            {game && (
              <div className="mb-5 p-4 text-center" style={{ border:`1px solid ${game.outcome==='win'?'var(--green)':game.outcome==='push'?'var(--gold-dim)':'rgba(231,76,60,0.4)'}`, background: game.outcome==='win'?'rgba(39,174,96,0.05)':'rgba(0,0,0,0.1)' }}>
                <div className="font-pixel mb-1" style={{ fontSize:'16px', color: game.outcome==='win'?'var(--green)':game.outcome==='push'?'var(--gold)':'#e74c3c' }}>
                  {game.outcome==='win' ? (game.resultData.outcome==='blackjack'?'♠ BLACKJACK!':'✓ WIN!') : game.outcome==='push'?'— PUSH':'✗ BUST / LOSE'}
                </div>
                <div className="font-mono" style={{ fontSize:'12px', color:'#c8b896' }}>
                  {game.outcome==='win' ? <span style={{ color:'var(--green)' }}>+${(game.payout/100).toFixed(2)}</span> : game.outcome==='push'?'Bet returned':<span style={{ color:'#e74c3c' }}>-${(bet/100).toFixed(2)}</span>}
                </div>
              </div>
            )}
            <div className="flex gap-2 mb-5 flex-wrap">
              {CHIPS.map(c => <button key={c} onClick={() => setBet(c)} className="font-pixel" style={{ fontSize:'8px', padding:'8px 12px', cursor:'pointer', transition:'all 0.15s', background: bet===c?'linear-gradient(135deg,#3a2506,#6b4510,#3a2506)':'transparent', border:`1px solid ${bet===c?'var(--gold)':'var(--gold-dim)'}`, color: bet===c?'var(--gold-light)':'var(--dim)' }}>${(c/100).toFixed(c<100?2:0)}</button>)}
            </div>
            {!address ? (
              <div className="text-center"><p className="font-mono mb-4" style={{ fontSize:'11px', color:'#b8a070' }}>Connect wallet to play</p><ConnectButton /></div>
            ) : (
              <button onClick={play} disabled={loading} className="w-full font-pixel shimmer-hover" style={{ fontSize:'11px', padding:'16px', cursor:loading?'wait':'pointer', letterSpacing:'2px', background:loading?'#2a1e08':'linear-gradient(135deg,#3a2506,#7a5012,#3a2506)', border:`1px solid ${loading?'var(--gold-dim)':'var(--gold)'}`, color:loading?'var(--gold-dim)':'var(--gold-light)', opacity:loading?0.7:1 }}>
                {loading ? '⟳ DEALING...' : `▶ DEAL $${(bet/100).toFixed(2)}`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BlackjackPage() {
  return <Suspense fallback={<div className="min-h-screen pt-24 flex items-center justify-center font-mono" style={{ color:'var(--gold-dim)' }}>Loading...</div>}><BlackjackInner /></Suspense>
}
