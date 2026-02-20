'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'

type BetType = 'straight'|'red'|'black'|'even'|'odd'|'low'|'high'|'dozen1'|'dozen2'|'dozen3'
type Result = { gameId:string; outcome:'win'|'lose'; payout:number; profit:number; resultData:{ spinResult:number; color:string; won:boolean; multiplier:number }; seed:string; vmId:string }

const RED_NUMS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36])
const BET_OPTIONS: { type:BetType; label:string; odds:string; payout:string }[] = [
  { type:'red',    label:'🔴 RED',    odds:'48.6%', payout:'2:1' },
  { type:'black',  label:'⚫ BLACK',  odds:'48.6%', payout:'2:1' },
  { type:'even',   label:'EVEN',      odds:'48.6%', payout:'2:1' },
  { type:'odd',    label:'ODD',       odds:'48.6%', payout:'2:1' },
  { type:'low',    label:'LOW 1-18',  odds:'48.6%', payout:'2:1' },
  { type:'high',   label:'HIGH 19-36',odds:'48.6%', payout:'2:1' },
  { type:'dozen1', label:'1ST 12',    odds:'32.4%', payout:'3:1' },
  { type:'dozen2', label:'2ND 12',    odds:'32.4%', payout:'3:1' },
  { type:'dozen3', label:'3RD 12',    odds:'32.4%', payout:'3:1' },
  { type:'straight', label:'STRAIGHT', odds:'2.7%', payout:'35:1' },
]
const CHIPS = [100, 500, 2500, 10000]

export default function RoulettePage() {
  const params      = useSearchParams()
  const { address } = useAccount()
  const [bet,      setBet]     = useState(Number(params.get('bet')) || 500)
  const [betType,  setBetType] = useState<BetType>('red')
  const [number,   setNumber]  = useState(17)
  const [result,   setResult]  = useState<Result | null>(null)
  const [loading,  setLoading] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [flash,    setFlash]   = useState<'win'|'lose'|null>(null)

  async function play() {
    if (!address) return
    setLoading(true); setSpinning(true); setResult(null); setFlash(null)
    try {
      const res  = await fetch('/api/games/ruleta', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ bet, betType, number: betType==='straight'?number:undefined, walletAddress: address }) })
      const json = await res.json()
      await new Promise(r => setTimeout(r, 1800))
      setSpinning(false)
      if (!json.success) { alert(json.error); return }
      setResult(json.data)
      setFlash(json.data.outcome === 'win' ? 'win' : 'lose')
      setTimeout(() => setFlash(null), 1200)
    } finally { setLoading(false); setSpinning(false) }
  }

  const numColor = (n: number) => n === 0 ? '#27ae60' : RED_NUMS.has(n) ? '#e74c3c' : '#222'

  return (
    <div className="min-h-screen pt-24 pb-16 px-6" style={{ background: flash==='win'?'rgba(39,174,96,0.04)':flash==='lose'?'rgba(231,76,60,0.04)':'transparent', transition:'background 0.4s' }}>
      <div className="max-w-lg mx-auto">
        <Link href="/play" className="font-mono" style={{ fontSize:'10px', color:'var(--gold-dim)', textDecoration:'none', letterSpacing:'2px', display:'inline-block', marginBottom:24 }}>← LOBBY</Link>

        <div className="gold-card pixel-corners">
          <div style={{ height:3, background:'linear-gradient(90deg,transparent,var(--gold),transparent)' }} />
          <div className="p-8">
            <h1 className="font-pixel mb-1" style={{ fontSize:'16px', color:'#fff', textShadow:'3px 3px 0 var(--gold-dim)', letterSpacing:'3px' }}>🎡 ROULETTE</h1>
            <p className="font-mono mb-6" style={{ fontSize:'10px', color:'#b8a070' }}>2.7% house edge · European · Single zero</p>

            {/* Wheel display */}
            <div className="flex justify-center mb-6">
              <div style={{ width:100, height:100, borderRadius:'50%', border:'4px solid var(--gold)', background: result ? `radial-gradient(circle, ${numColor(result.resultData.spinResult)} 30%, rgba(20,15,5,0.95) 100%)` : 'radial-gradient(circle, #2a1a08 30%, #1a1000 100%)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, fontWeight:'bold', color:'#fff', animation: spinning ? 'spin 0.3s linear infinite' : 'none', boxShadow: result ? (result.outcome==='win' ? '0 0 40px rgba(39,174,96,0.5)' : '0 0 30px rgba(231,76,60,0.3)') : '0 0 20px rgba(201,147,58,0.2)', transition:'box-shadow 0.4s' }}>
                {spinning ? '🎡' : result ? result.resultData.spinResult : '?'}
              </div>
            </div>

            {/* Bet type grid */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              {BET_OPTIONS.map(opt => (
                <button key={opt.type} onClick={() => setBetType(opt.type)}
                  className="font-pixel"
                  style={{ fontSize:'7px', padding:'8px 6px', cursor:'pointer', letterSpacing:'0.5px', transition:'all 0.2s', textAlign:'center', lineHeight:1.6, background: betType===opt.type ? 'linear-gradient(135deg,#3a2506,#6b4510,#3a2506)' : 'transparent', border:`1px solid ${betType===opt.type ? 'var(--gold)' : 'var(--gold-dim)'}`, color: betType===opt.type ? 'var(--gold-light)' : 'var(--dim)' }}>
                  {opt.label}<br/><span style={{ color:'var(--gold-dim)', fontSize:'6px' }}>{opt.payout}</span>
                </button>
              ))}
            </div>

            {/* Straight number selector */}
            {betType === 'straight' && (
              <div className="mb-5">
                <div className="font-mono mb-2" style={{ fontSize:'9px', color:'var(--gold-dim)', letterSpacing:'2px' }}>PICK NUMBER: <strong style={{ color:'var(--gold-light)' }}>{number}</strong></div>
                <div className="flex flex-wrap gap-1">
                  {Array.from({length:37},(_,i)=>i).map(n => (
                    <button key={n} onClick={() => setNumber(n)} style={{ width:28, height:28, borderRadius:2, fontSize:9, fontWeight:'bold', cursor:'pointer', background: number===n ? numColor(n) : 'transparent', border:`1px solid ${number===n ? numColor(n) : 'rgba(201,147,58,0.2)'}`, color: number===n ? '#fff' : numColor(n) }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chips */}
            <div className="flex gap-2 mb-5 flex-wrap">
              {CHIPS.map(c => (
                <button key={c} onClick={() => setBet(c)} className="font-pixel" style={{ fontSize:'8px', padding:'8px 12px', cursor:'pointer', transition:'all 0.15s', background: bet===c?'linear-gradient(135deg,#3a2506,#6b4510,#3a2506)':'transparent', border:`1px solid ${bet===c?'var(--gold)':'var(--gold-dim)'}`, color: bet===c?'var(--gold-light)':'var(--dim)' }}>
                  ${(c/100).toFixed(c<100?2:0)}
                </button>
              ))}
            </div>

            {/* Result */}
            {result && !loading && (
              <div className="mb-5 p-4 text-center" style={{ border:`1px solid ${result.outcome==='win'?'var(--green)':'rgba(231,76,60,0.4)'}`, background: result.outcome==='win'?'rgba(39,174,96,0.05)':'rgba(0,0,0,0.1)' }}>
                <div className="font-pixel mb-1" style={{ fontSize:'18px', color: result.outcome==='win'?'var(--green)':'#e74c3c' }}>
                  {result.outcome==='win' ? `✓ WIN! Landed: ${result.resultData.spinResult}` : `✗ LOSE. Landed: ${result.resultData.spinResult}`}
                </div>
                <div className="font-mono" style={{ fontSize:'12px', color:'#c8b896' }}>
                  {result.outcome==='win' ? <span style={{ color:'var(--green)' }}>+${(result.payout/100).toFixed(2)} ({result.resultData.multiplier}:1)</span> : <span style={{ color:'#e74c3c' }}>-${(bet/100).toFixed(2)}</span>}
                </div>
              </div>
            )}

            {!address ? (
              <div className="text-center"><p className="font-mono mb-4" style={{ fontSize:'11px', color:'#b8a070' }}>Connect wallet to play</p><ConnectButton /></div>
            ) : (
              <button onClick={play} disabled={loading} className="w-full font-pixel shimmer-hover" style={{ fontSize:'11px', padding:'16px', cursor:loading?'wait':'pointer', letterSpacing:'2px', background:loading?'#2a1e08':'linear-gradient(135deg,#3a2506,#7a5012,#3a2506)', border:`1px solid ${loading?'var(--gold-dim)':'var(--gold)'}`, color:loading?'var(--gold-dim)':'var(--gold-light)', opacity:loading?0.7:1 }}>
                {loading ? (spinning ? '⟳ SPINNING...' : '...') : `▶ SPIN $${(bet/100).toFixed(2)}`}
              </button>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
