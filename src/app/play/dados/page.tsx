'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'

type Result = { gameId:string; outcome:'win'|'lose'; payout:number; profit:number; resultData:{ roll:number; won:boolean; multiplier:number; winChance:number }; seed:string; vmId:string }
const CHIPS = [100, 500, 2500, 10000]

export default function DicePage() {
  const params      = useSearchParams()
  const { address } = useAccount()
  const [bet,       setBet]       = useState(Number(params.get('bet')) || 500)
  const [target,    setTarget]    = useState(50)
  const [direction, setDirection] = useState<'over'|'under'>('over')
  const [result,    setResult]    = useState<Result | null>(null)
  const [loading,   setLoading]   = useState(false)
  const [flash,     setFlash]     = useState<'win'|'lose'|null>(null)

  const winChance = direction === 'over' ? (100-target)/100 : target/100
  const multiplier = winChance > 0 ? (0.99 / winChance).toFixed(2) : '∞'

  async function play() {
    if (!address) return
    setLoading(true); setResult(null); setFlash(null)
    try {
      const res  = await fetch('/api/games/dados', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ bet, target, direction, walletAddress: address }) })
      const json = await res.json()
      if (!json.success) { alert(json.error); return }
      setResult(json.data)
      setFlash(json.data.outcome === 'win' ? 'win' : 'lose')
      setTimeout(() => setFlash(null), 1200)
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6" style={{ background: flash==='win'?'rgba(39,174,96,0.04)':flash==='lose'?'rgba(231,76,60,0.04)':'transparent', transition:'background 0.4s' }}>
      <div className="max-w-lg mx-auto">
        <Link href="/play" className="font-mono" style={{ fontSize:'10px', color:'var(--gold-dim)', textDecoration:'none', letterSpacing:'2px', display:'inline-block', marginBottom:24 }}>← LOBBY</Link>

        <div className="gold-card pixel-corners">
          <div style={{ height:3, background:'linear-gradient(90deg,transparent,var(--green),transparent)' }} />
          <div className="p-8">
            <h1 className="font-pixel mb-1" style={{ fontSize:'16px', color:'#fff', textShadow:'3px 3px 0 var(--gold-dim)', letterSpacing:'3px' }}>🎲 DICE</h1>
            <p className="font-mono mb-6" style={{ fontSize:'10px', color:'#b8a070' }}>1% house edge · Up to 98× · Set your own risk</p>

            {/* Roll display */}
            <div className="flex justify-center mb-8">
              <div style={{ width:100, height:100, border:'3px solid var(--green)', background:'rgba(39,174,96,0.05)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:44, boxShadow: result ? (result.outcome==='win' ? '0 0 40px rgba(39,174,96,0.4)' : '0 0 30px rgba(231,76,60,0.3)') : '0 0 20px rgba(39,174,96,0.15)', transition:'box-shadow 0.4s' }}>
                {loading ? <span style={{ animation:'spin 0.3s linear infinite', display:'inline-block' }}>🎲</span> : result ? result.resultData.roll : '?'}
              </div>
            </div>

            {/* Direction toggle */}
            <div className="flex gap-3 mb-5">
              {(['over','under'] as const).map(d => (
                <button key={d} onClick={() => setDirection(d)} className="flex-1 font-pixel" style={{ fontSize:'9px', padding:'11px', cursor:'pointer', letterSpacing:'1px', transition:'all 0.2s', background: direction===d ? 'linear-gradient(135deg,#0a2010,#1a5030,#0a2010)' : 'transparent', border:`1px solid ${direction===d ? 'var(--green)' : 'var(--gold-dim)'}`, color: direction===d ? 'var(--green)' : 'var(--dim)' }}>
                  {d === 'over' ? '▲ OVER' : '▼ UNDER'} {target}
                </button>
              ))}
            </div>

            {/* Target slider */}
            <div className="mb-6">
              <div className="flex justify-between font-mono mb-2" style={{ fontSize:'9px', color:'var(--gold-dim)', letterSpacing:'2px' }}>
                <span>TARGET: <strong style={{ color:'var(--gold-light)' }}>{target}</strong></span>
                <span>WIN CHANCE: <strong style={{ color:'var(--green)' }}>{(winChance*100).toFixed(1)}%</strong></span>
                <span>PAYOUT: <strong style={{ color:'var(--gold-light)' }}>{multiplier}×</strong></span>
              </div>
              <input type="range" min={2} max={98} value={target} onChange={e => setTarget(Number(e.target.value))} className="w-full" style={{ accentColor:'var(--gold)', height:4, cursor:'pointer' }} />
              <div className="flex justify-between font-mono mt-1" style={{ fontSize:'8px', color:'var(--gold-dim)' }}>
                <span>2 (LOW RISK)</span><span>98 (HIGH RISK)</span>
              </div>
            </div>

            {/* Chips */}
            <div className="flex gap-2 mb-5 flex-wrap">
              {CHIPS.map(c => (
                <button key={c} onClick={() => setBet(c)} className="font-pixel" style={{ fontSize:'8px', padding:'8px 12px', cursor:'pointer', transition:'all 0.15s', background: bet===c ? 'linear-gradient(135deg,#3a2506,#6b4510,#3a2506)' : 'transparent', border:`1px solid ${bet===c ? 'var(--gold)' : 'var(--gold-dim)'}`, color: bet===c ? 'var(--gold-light)' : 'var(--dim)' }}>
                  ${(c/100).toFixed(c<100?2:0)}
                </button>
              ))}
            </div>

            {/* Result */}
            {result && !loading && (
              <div className="mb-5 p-4 text-center" style={{ border:`1px solid ${result.outcome==='win'?'var(--green)':'rgba(231,76,60,0.4)'}`, background: result.outcome==='win'?'rgba(39,174,96,0.05)':'rgba(0,0,0,0.1)' }}>
                <div className="font-pixel mb-1" style={{ fontSize:'18px', color: result.outcome==='win'?'var(--green)':'#e74c3c' }}>
                  {result.outcome==='win' ? `✓ WIN! Roll: ${result.resultData.roll}` : `✗ LOSE. Roll: ${result.resultData.roll}`}
                </div>
                <div className="font-mono" style={{ fontSize:'12px', color:'#c8b896' }}>
                  {result.outcome==='win' ? <span style={{ color:'var(--green)' }}>+${(result.payout/100).toFixed(2)} ({result.resultData.multiplier}×)</span> : <span style={{ color:'#e74c3c' }}>-${(bet/100).toFixed(2)}</span>}
                </div>
              </div>
            )}

            {!address ? (
              <div className="text-center"><p className="font-mono mb-4" style={{ fontSize:'11px', color:'#b8a070' }}>Connect wallet to play</p><ConnectButton /></div>
            ) : (
              <button onClick={play} disabled={loading} className="w-full font-pixel shimmer-hover" style={{ fontSize:'11px', padding:'16px', cursor:loading?'wait':'pointer', letterSpacing:'2px', background:loading?'#2a1e08':'linear-gradient(135deg,#3a2506,#7a5012,#3a2506)', border:`1px solid ${loading?'var(--gold-dim)':'var(--gold)'}`, color:loading?'var(--gold-dim)':'var(--gold-light)', opacity:loading?0.7:1 }}>
                {loading ? '⟳ ROLLING...' : `▶ ROLL $${(bet/100).toFixed(2)}`}
              </button>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
