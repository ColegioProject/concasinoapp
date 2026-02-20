'use client'
export const dynamic = 'force-dynamic'
import { Suspense } from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'

type Result = {
  gameId: string; outcome: 'win'|'lose'; payout: number; profit: number
  isFreeroll: boolean; seed: string; seedHash: string; vmId: string
  resultData: { result: string; won: boolean }
}

const CHIPS = [100, 500, 2500, 10000]

function CoinflipInner() {
  const params        = useSearchParams()
  const { address }   = useAccount()
  const [choice,    setChoice]  = useState<'heads'|'tails'>('heads')
  const [bet,       setBet]     = useState(Number(params.get('bet')) || 500)
  const [result,    setResult]  = useState<Result | null>(null)
  const [loading,   setLoading] = useState(false)
  const [flipping,  setFlipping] = useState(false)
  const [flash,     setFlash]   = useState<'win'|'lose'|null>(null)
  const [history,   setHistory] = useState<Result[]>([])

  async function play() {
    if (!address) return
    setLoading(true); setFlipping(true); setResult(null); setFlash(null)
    try {
      const res  = await fetch('/api/games/coinflip', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ bet, choice, walletAddress: address }) })
      const json = await res.json()
      await new Promise(r => setTimeout(r, 1500))
      setFlipping(false)
      if (!json.success) { alert(json.error); return }
      setResult(json.data)
      setFlash(json.data.outcome === 'win' ? 'win' : 'lose')
      setHistory(h => [json.data, ...h].slice(0, 6))
      setTimeout(() => setFlash(null), 1200)
    } catch(e) { console.error(e) }
    finally { setLoading(false); setFlipping(false) }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6" style={{ background: flash==='win'?'rgba(39,174,96,0.04)':flash==='lose'?'rgba(231,76,60,0.04)':'transparent', transition:'background 0.4s' }}>
      <div className="max-w-lg mx-auto">
        <Link href="/play" className="font-mono" style={{ fontSize:'10px', color:'var(--gold-dim)', textDecoration:'none', letterSpacing:'2px', display:'inline-block', marginBottom:24 }}>← LOBBY</Link>
        <div className="gold-card pixel-corners">
          <div style={{ height:3, background:'linear-gradient(90deg,transparent,var(--green),transparent)' }} />
          <div className="p-8">
            <h1 className="font-pixel mb-1" style={{ fontSize:'16px', color:'#fff', textShadow:'3px 3px 0 var(--gold-dim)', letterSpacing:'3px' }}>🪙 COINFLIP</h1>
            <p className="font-mono mb-6" style={{ fontSize:'10px', color:'#b8a070', letterSpacing:'1px' }}>2% house edge · 2× payout · Conway VM</p>
            <div className="flex justify-center mb-8">
              <div style={{ width:96, height:96, borderRadius:'50%', border:'3px solid var(--gold)', background:'radial-gradient(circle at 35% 35%, var(--gold-light), var(--gold-dim))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:40, animation: flipping ? 'coinFlip 0.4s linear infinite' : 'none', boxShadow: result ? (result.outcome==='win' ? '0 0 40px rgba(39,174,96,0.5)' : '0 0 40px rgba(231,76,60,0.3)') : '0 0 20px rgba(201,147,58,0.3)', transition:'box-shadow 0.4s' }}>
                {flipping ? '🪙' : result ? (result.resultData.result==='heads' ? '👑' : '⚙️') : (choice==='heads' ? '👑' : '⚙️')}
              </div>
            </div>
            <div className="flex gap-3 mb-6">
              {(['heads','tails'] as const).map(c => (
                <button key={c} onClick={() => setChoice(c)} className="flex-1 font-pixel" style={{ fontSize:'9px', padding:'12px', cursor:'pointer', letterSpacing:'1px', transition:'all 0.2s', background: choice===c ? 'linear-gradient(135deg,#3a2506,#6b4510,#3a2506)' : 'transparent', border:`1px solid ${choice===c?'var(--gold)':'var(--gold-dim)'}`, color: choice===c?'var(--gold-light)':'var(--dim)' }}>
                  {c==='heads' ? '👑 HEADS' : '⚙️ TAILS'}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mb-6 flex-wrap">
              {CHIPS.map(c => (
                <button key={c} onClick={() => setBet(c)} className="font-pixel" style={{ fontSize:'8px', padding:'8px 12px', cursor:'pointer', transition:'all 0.15s', background: bet===c ? 'linear-gradient(135deg,#3a2506,#6b4510,#3a2506)' : 'transparent', border:`1px solid ${bet===c?'var(--gold)':'var(--gold-dim)'}`, color: bet===c?'var(--gold-light)':'var(--dim)' }}>
                  ${(c/100).toFixed(c<100?2:0)}
                </button>
              ))}
            </div>
            {!address ? (
              <div className="text-center"><p className="font-mono mb-4" style={{ fontSize:'11px', color:'#b8a070' }}>Connect wallet to play</p><ConnectButton /></div>
            ) : (
              <button onClick={play} disabled={loading} className="w-full font-pixel shimmer-hover" style={{ fontSize:'11px', padding:'16px', cursor:loading?'wait':'pointer', letterSpacing:'2px', background:loading?'#2a1e08':'linear-gradient(135deg,#3a2506,#7a5012,#3a2506)', border:`1px solid ${loading?'var(--gold-dim)':'var(--gold)'}`, color:loading?'var(--gold-dim)':'var(--gold-light)', opacity:loading?0.7:1 }}>
                {loading ? (flipping ? '⟳ FLIPPING...' : '...') : `▶ FLIP $${(bet/100).toFixed(2)}`}
              </button>
            )}
            {result && !loading && (
              <div className="mt-6 p-4 text-center" style={{ border:`1px solid ${result.outcome==='win'?'var(--green)':'rgba(231,76,60,0.4)'}`, background: result.outcome==='win'?'rgba(39,174,96,0.05)':'rgba(231,76,60,0.04)' }}>
                <div className="font-pixel mb-2" style={{ fontSize:'16px', color: result.outcome==='win'?'var(--green)':'#e74c3c' }}>{result.outcome==='win' ? '✓ WIN!' : '✗ LOSE'}</div>
                <div className="font-mono" style={{ fontSize:'11px', color:'#c8b896' }}>
                  Landed: <strong style={{ color:'var(--gold-light)' }}>{result.resultData.result.toUpperCase()}</strong>
                  {' · '}
                  {result.outcome==='win' ? <span style={{ color:'var(--green)' }}>+${(result.payout/100).toFixed(2)}</span> : <span style={{ color:'#e74c3c' }}>-${(bet/100).toFixed(2)}</span>}
                </div>
                <div className="font-mono mt-2" style={{ fontSize:'9px', color:'var(--gold-dim)' }}>VM: {result.vmId}</div>
              </div>
            )}
            {history.length > 0 && (
              <div className="mt-6">
                <div className="font-mono mb-2" style={{ fontSize:'9px', color:'var(--gold-dim)', letterSpacing:'2px' }}>RECENT</div>
                <div className="flex gap-2 flex-wrap">
                  {history.map((h,i) => (
                    <span key={i} className="font-pixel" style={{ fontSize:'7px', padding:'4px 8px', border:`1px solid ${h.outcome==='win'?'rgba(39,174,96,0.4)':'rgba(231,76,60,0.3)'}`, color: h.outcome==='win'?'var(--green)':'#e74c3c' }}>
                      {h.resultData.result==='heads'?'H':'T'} {h.outcome==='win'?`+$${(h.payout/100).toFixed(0)}`:'-'}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CoinflipPage() {
  return <Suspense fallback={<div className="min-h-screen pt-24 flex items-center justify-center font-mono" style={{ color:'var(--gold-dim)' }}>Loading...</div>}><CoinflipInner /></Suspense>
}
