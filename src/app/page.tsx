import Link from 'next/link'
import FaqList from '@/components/ui/FaqList'


// All sections inline — this IS conwaycasino.com, no redirect
export default function LandingPage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 pb-16 relative">
        <div className="font-mono text-xs uppercase tracking-widest mb-6" style={{ letterSpacing:'6px', color:'var(--gold-dim)' }}>
          Built on Conway Infrastructure · x402 Protocol · Base Chain
        </div>

        <h1 className="font-pixel mb-4" style={{
          fontSize: 'clamp(22px,5vw,60px)',
          color: '#fff',
          letterSpacing: '4px',
          textShadow: '4px 4px 0 var(--gold-dim), 0 0 40px rgba(201,147,58,0.5)',
          animation: 'glow 2.5s ease-in-out infinite',
        }}>
          CONWAY CASINO<span style={{ color:'var(--gold)', animation:'blink 1s step-end infinite' }}>_</span>
        </h1>

        <p className="font-serif italic mb-10 max-w-xl" style={{ fontSize:'clamp(14px,2vw,19px)', color:'#c8b896', lineHeight:1.8 }}>
          The first provably fair casino where every game runs inside an ephemeral Conway VM.
          For humans. For autonomous AI agents. For anyone with a wallet.
        </p>

        <div className="flex gap-4 flex-wrap justify-center">
          <Link href="/play"
            className="font-pixel shimmer-hover"
            style={{ fontSize:'10px', background:'linear-gradient(135deg,#3a2506,#6b4510,#3a2506)', border:'1px solid var(--gold)', color:'var(--gold-light)', padding:'16px 28px', letterSpacing:'2px' }}>
            ▶ ENTER CASINO
          </Link>
          <a href="#how"
            className="font-pixel"
            style={{ fontSize:'10px', background:'transparent', border:'1px solid var(--gold-dim)', color:'#b8a070', padding:'16px 28px', letterSpacing:'2px' }}>
            HOW IT WORKS
          </a>
        </div>

        <div className="flex gap-10 mt-14 flex-wrap justify-center">
          {[
            { val: '$48,290', label: 'Wagered Today', green: false },
            { val: '1,847',   label: 'VMs Spawned',   green: false },
            { val: '$3,500',  label: 'Biggest Win',    green: true  },
            { val: '170',     label: 'Players Online', green: false },
          ].map(({ val, label, green }) => (
            <div key={label} className="text-center">
              <span className="font-cinzel block text-xl" style={{ color: green ? 'var(--green)' : 'var(--gold)' }}>{val}</span>
              <span className="font-mono block mt-1" style={{ fontSize:'9px', color:'var(--dim)', letterSpacing:'2px', textTransform:'uppercase' }}>{label}</span>
            </div>
          ))}
        </div>

        <a href="#who" className="absolute bottom-8 font-mono text-xs uppercase tracking-widest animate-bounce" style={{ color:'var(--dim)', fontSize:'9px', letterSpacing:'3px' }}>▼ scroll</a>
      </section>

      {/* ── WHO IS IT FOR ── */}
      <section id="who" style={{ borderTop:'1px solid rgba(201,147,58,0.08)', background:'rgba(6,5,5,0.5)', backdropFilter:'blur(4px)' }}>
        <div className="max-w-5xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <div className="font-mono mb-3" style={{ fontSize:'9px', letterSpacing:'5px', color:'var(--gold-dim)', textTransform:'uppercase' }}>Built For Everyone With a Wallet</div>
            <h2 className="font-cinzel gold-text" style={{ fontSize:'clamp(18px,3vw,32px)' }}>Human or Agent?</h2>
            <div className="flex items-center justify-center gap-3 mt-4 mx-auto" style={{ width:300 }}>
              <span style={{ flex:1, height:1, background:'linear-gradient(90deg,transparent,var(--gold-dim))' }} />
              <span style={{ width:6, height:6, background:'var(--gold)', transform:'rotate(45deg)', boxShadow:'0 0 8px var(--gold)', display:'inline-block' }} />
              <span style={{ flex:1, height:1, background:'linear-gradient(90deg,var(--gold-dim),transparent)' }} />
            </div>
            <p className="font-serif italic mt-6 mx-auto max-w-xl" style={{ fontSize:'15px', color:'#c8b896', lineHeight:1.8 }}>
              Whether you're a human clicking buttons or an autonomous AI agent calling APIs, the rules are the same. The odds are the same. The payouts are the same.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Human */}
            <div className="gold-card pixel-corners p-9 text-center" style={{ transition:'all 0.3s' }}>
              <span className="text-5xl mb-4 block" style={{ animation:'float 3s ease-in-out infinite' }}>🧑</span>
              <div className="font-pixel mb-3" style={{ fontSize:'11px', color:'var(--gold-light)', letterSpacing:'1px' }}>YOU'RE HUMAN</div>
              <p className="font-serif italic mb-5" style={{ fontSize:'15px', color:'#c8b896', lineHeight:1.7 }}>
                Connect your wallet, pick a game, place a bet. Every outcome is generated in a verifiable VM — no trust required.
              </p>
              <ul className="text-left font-mono mb-5" style={{ fontSize:'12px', color:'#c8b896', lineHeight:2 }}>
                {['Connect MetaMask or any EVM wallet','Deposit USDC on Base chain','Play Coinflip, Blackjack, Dice, Roulette','Withdraw winnings instantly','Verify any result on-chain'].map(i => (
                  <li key={i}><span style={{ color:'var(--gold)' }}>&gt; </span>{i}</li>
                ))}
              </ul>
              <span className="font-mono text-xs px-3 py-1" style={{ border:'1px solid var(--blue)', color:'var(--blue)', background:'rgba(74,158,221,0.07)', letterSpacing:'2px' }}>Human Interface</span>
            </div>

            {/* Agent */}
            <div className="gold-card pixel-corners p-9 text-center" style={{ transition:'all 0.3s' }}>
              <span className="text-5xl mb-4 block" style={{ animation:'float 3s ease-in-out infinite', animationDelay:'1s' }}>🤖</span>
              <div className="font-pixel mb-3" style={{ fontSize:'11px', color:'var(--gold-light)', letterSpacing:'1px' }}>YOU'RE AN AGENT</div>
              <p className="font-serif italic mb-5" style={{ fontSize:'15px', color:'#c8b896', lineHeight:1.7 }}>
                Register via API, get a Conway-provisioned wallet, and play via REST. No frontend. No human. Pure automation.
              </p>
              <ul className="text-left font-mono mb-5" style={{ fontSize:'12px', color:'#c8b896', lineHeight:2 }}>
                {['POST /api/agent/register → get API key + wallet','First game FREE ($5 freeroll on the house)','Win → real USDC in your wallet to claim','Authenticate via API key or wallet signature','Works with Claude, GPT, any LLM + MCP'].map(i => (
                  <li key={i}><span style={{ color:'var(--green)' }}>&gt; </span>{i}</li>
                ))}
              </ul>
              <div className="text-left font-mono mb-4 p-3" style={{ background:'rgba(0,0,0,0.4)', border:'1px solid rgba(201,147,58,0.1)', fontSize:'11px', color:'#c0aa80', lineHeight:1.9 }}>
                <span style={{ color:'#b8a070' }}>$ </span><span style={{ color:'var(--cream)' }}>curl -X POST /api/agent/register</span><br/>
                <span style={{ color:'var(--green)' }}>✓ wallet: 0x4f3a...c8b2</span><br/>
                <span style={{ color:'var(--green)' }}>✓ apiKey: cc_agent_...</span><br/>
                <span style={{ color:'var(--gold)' }}>→ freeroll: $5 ready</span>
              </div>
              <span className="font-mono text-xs px-3 py-1" style={{ border:'1px solid var(--green)', color:'var(--green)', background:'rgba(39,174,96,0.07)', letterSpacing:'2px' }}>Agent API</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ borderTop:'1px solid rgba(201,147,58,0.08)' }}>
        <div className="max-w-5xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <div className="font-mono mb-3" style={{ fontSize:'9px', letterSpacing:'5px', color:'var(--gold-dim)', textTransform:'uppercase' }}>The Process</div>
            <h2 className="font-cinzel gold-text" style={{ fontSize:'clamp(18px,3vw,32px)' }}>How It Works</h2>
            <p className="font-serif italic mt-6 mx-auto max-w-xl" style={{ fontSize:'15px', color:'#c8b896', lineHeight:1.8 }}>
              Every game follows the same trustless flow. No server can cheat. No outcome can be altered. The VM is the dealer.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { n:'01', icon:'🔗', title:'Connect',    desc:'Connect your EVM wallet. Deposit USDC on Base. Non-custodial at all times.' },
              { n:'02', icon:'🎰', title:'Place Bet',  desc:'Choose your game. A seed hash is committed to Base before randomness is generated.' },
              { n:'03', icon:'⚡', title:'Conway VM',  desc:'A fresh VM spins up, generates the outcome, returns result, then destroys itself in ~200ms.' },
              { n:'04', icon:'💰', title:'Settle',     desc:'Settlement is instant on-chain. Verify the VM output against the committed seed anytime.' },
            ].map(step => (
              <div key={step.n} className="gold-card pixel-corners p-7 text-center">
                <span className="font-pixel block mb-3" style={{ fontSize:'18px', color:'var(--gold)', textShadow:'0 0 16px rgba(201,147,58,0.4)' }}>{step.n}</span>
                <span className="text-3xl block mb-3">{step.icon}</span>
                <div className="font-cinzel mb-2" style={{ fontSize:'13px', color:'var(--gold-light)', letterSpacing:'1px' }}>{step.title}</div>
                <p className="font-mono" style={{ fontSize:'10px', color:'#c8b896', lineHeight:1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GAMES ── */}
      <section id="games" style={{ borderTop:'1px solid rgba(201,147,58,0.08)', background:'rgba(6,5,5,0.4)', backdropFilter:'blur(4px)' }}>
        <div className="max-w-5xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <div className="font-mono mb-3" style={{ fontSize:'9px', letterSpacing:'5px', color:'var(--gold-dim)', textTransform:'uppercase' }}>The Floor</div>
            <h2 className="font-cinzel gold-text" style={{ fontSize:'clamp(18px,3vw,32px)' }}>Choose Your Game</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { slug:'coinflip',  name:'COINFLIP',  icon:'🪙', badge:'LIVE',  badgeColor:'var(--green)', edge:'2%',   payout:'2×',   desc:'Heads or tails. The purest wager. Each flip runs in an isolated Conway VM.' },
              { slug:'blackjack', name:'BLACKJACK', icon:'🃏', badge:'HOT',   badgeColor:'var(--gold)',  edge:'0.5%', payout:'3:2',  desc:'Beat the dealer to 21. Deck shuffled by Conway RNG — verifiable post-game.' },
              { slug:'dados',     name:'DICE',     icon:'🎲', badge:'LIVE',  badgeColor:'var(--green)', edge:'1%',   payout:'98×',  desc:'Roll over or under your target. Set your own risk. Up to 98× multiplier.' },
              { slug:'ruleta',    name:'ROULETTE',    icon:'🎡', badge:'HOT',   badgeColor:'var(--gold)',  edge:'2.7%', payout:'35:1', desc:'European roulette, 37 numbers. Colors, dozens, or straight up on a number.' },
            ].map(game => (
              <Link key={game.slug} href={`/play/${game.slug}`}
                className="gold-card pixel-corners shimmer-hover p-7 block"
                style={{ transition:'all 0.3s', cursor:'pointer' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{game.icon}</span>
                    <span className="font-pixel" style={{ fontSize:'12px', color:'var(--gold-light)', textShadow:'2px 2px 0 var(--gold-dim)' }}>{game.name}</span>
                  </div>
                  <span className="font-mono text-xs px-2 py-1" style={{ border:`1px solid ${game.badgeColor}`, color:game.badgeColor, fontSize:'8px', letterSpacing:'2px' }}>{game.badge}</span>
                </div>
                <p className="font-serif italic mb-4" style={{ fontSize:'13px', color:'#c8b896', lineHeight:1.7 }}>{game.desc}</p>
                <div className="flex gap-5">
                  <div><div className="font-mono" style={{ fontSize:'8px', color:'var(--gold-dim)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:2 }}>House Edge</div><div className="font-cinzel" style={{ fontSize:'13px', color:'var(--gold)' }}>{game.edge}</div></div>
                  <div><div className="font-mono" style={{ fontSize:'8px', color:'var(--gold-dim)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:2 }}>Max Payout</div><div className="font-cinzel" style={{ fontSize:'13px', color:'var(--green)' }}>{game.payout}</div></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROVABLY FAIR ── */}
      <section id="provably" style={{ borderTop:'1px solid rgba(201,147,58,0.08)' }}>
        <div className="max-w-5xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <div className="font-mono mb-3" style={{ fontSize:'9px', letterSpacing:'5px', color:'var(--gold-dim)', textTransform:'uppercase' }}>No Trust Required</div>
            <h2 className="font-cinzel gold-text" style={{ fontSize:'clamp(18px,3vw,32px)' }}>Provably Fair</h2>
            <p className="font-serif italic mt-6 mx-auto max-w-xl" style={{ fontSize:'15px', color:'#c8b896', lineHeight:1.8 }}>
              Every outcome is mathematically verifiable. The house cannot cheat. The chain doesn't forget.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            {[
              { icon:'🔐', title:'Seed Commitment',        text:'Before any randomness, a SHA-256 seed hash is committed to Base. The outcome cannot be altered after you place your bet.' },
              { icon:'⚡', title:'Ephemeral Conway VM',    text:'A fresh Linux VM generates the result and destroys itself. No persistent state. The VM is the dealer.' },
              { icon:'🔗', title:'On-Chain Settlement',    text:'USDC payouts are instant and automatic. The smart contract is the cashier — no human approval needed.' },
              { icon:'🔍', title:'Independent Verification', text:'Any player can verify any past result by replaying the VM with the published seed. Full audit trail forever.' },
            ].map(card => (
              <div key={card.title} className="gold-card pixel-corners p-7">
                <span className="text-3xl block mb-3">{card.icon}</span>
                <div className="font-cinzel mb-2" style={{ fontSize:'13px', color:'var(--gold-light)', letterSpacing:'1px' }}>{card.title}</div>
                <p className="font-serif" style={{ fontSize:'13px', color:'#c8b896', lineHeight:1.8 }}>{card.text}</p>
              </div>
            ))}
          </div>
          <div className="p-7" style={{ background:'rgba(0,0,0,0.3)', border:'1px solid var(--gold-border)' }}>
            <div className="font-mono text-center mb-5" style={{ fontSize:'9px', letterSpacing:'3px', color:'var(--gold-dim)', textTransform:'uppercase' }}>Verification Flow</div>
            <div className="flex flex-wrap justify-center items-center gap-2">
              {['Bet placed → seed committed','→ Conway VM spawns','→ Result generated','→ Seed revealed on-chain','→ Anyone can replay'].map((step, i) => (
                <span key={i} className="font-mono text-center px-3 py-2" style={{ fontSize:'10px', color: i % 2 === 0 ? 'var(--cream)' : 'var(--gold-dim)', background: i % 2 === 0 ? 'rgba(201,147,58,0.06)' : 'transparent', border: i % 2 === 0 ? '1px solid var(--gold-border)' : 'none' }}>{step}</span>
              ))}
            </div>
            <div className="mt-5 p-4 font-mono" style={{ background:'rgba(0,0,0,0.5)', border:'1px solid rgba(201,147,58,0.1)', fontSize:'10px', color:'var(--gold-dim)', wordBreak:'break-all', lineHeight:1.9 }}>
              <span className="block mb-1" style={{ color:'var(--dim)', fontSize:'9px', letterSpacing:'2px', textTransform:'uppercase' }}>Example Seed Hash (committed before spin)</span>
              0x7f3a9b2c4e1d8f6a3b5c9e2f4a7d1b8c3f6e9a2d5b8c1f4e7a3d6b9c2f5e8a1
            </div>
          </div>
        </div>
      </section>

      {/* ── FEES ── */}
      <section id="fees" style={{ borderTop:'1px solid rgba(201,147,58,0.08)', background:'rgba(6,5,5,0.4)', backdropFilter:'blur(4px)' }}>
        <div className="max-w-5xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <div className="font-mono mb-3" style={{ fontSize:'9px', letterSpacing:'5px', color:'var(--gold-dim)', textTransform:'uppercase' }}>The Numbers</div>
            <h2 className="font-cinzel gold-text" style={{ fontSize:'clamp(18px,3vw,32px)' }}>Fees & Revenue Split</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            {[
              { pct:'0.5–2.7%', color:'var(--gold)',  name:'House Edge',          desc:'Varies by game. Blackjack 0.5%, Dice 1%, Coinflip 2%, Roulette 2.7%.' },
              { pct:'80%',      color:'var(--green)',  name:'Pays Out to Players', desc:'Of all house edge revenue flows back into prize pool and liquidity.' },
              { pct:'$0.001',   color:'var(--blue)',   name:'Per Conway VM',       desc:'Each game spawns a fresh VM. Fractions of a cent per game via x402 protocol.' },
            ].map(f => (
              <div key={f.name} className="gold-card pixel-corners p-8 text-center">
                <span className="font-cinzel block mb-2" style={{ fontSize:'36px', background:`linear-gradient(180deg,${f.color}99,${f.color})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', filter:`drop-shadow(0 0 12px ${f.color}55)` }}>{f.pct}</span>
                <div className="font-cinzel mb-2" style={{ fontSize:'12px', color:'var(--gold-light)', letterSpacing:'2px' }}>{f.name}</div>
                <p className="font-serif italic" style={{ fontSize:'13px', color:'#c8b896', lineHeight:1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center font-mono p-4" style={{ background:'rgba(0,0,0,0.3)', border:'1px solid var(--gold-border)', fontSize:'11px', color:'#b8a070' }}>
            All payouts in <span style={{ color:'var(--gold)' }}>USDC on Base</span> · No KYC below $10,000 · Min withdrawal <span style={{ color:'var(--gold)' }}>$1</span> · No withdrawal fees
          </div>
        </div>
      </section>

      {/* ── ROADMAP ── */}
      <section id="roadmap" style={{ borderTop:'1px solid rgba(201,147,58,0.08)' }}>
        <div className="max-w-3xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <div className="font-mono mb-3" style={{ fontSize:'9px', letterSpacing:'5px', color:'var(--gold-dim)', textTransform:'uppercase' }}>Where We're Going</div>
            <h2 className="font-cinzel gold-text" style={{ fontSize:'clamp(18px,3vw,32px)' }}>Roadmap</h2>
          </div>
          <div className="relative pl-10" style={{ borderLeft:'1px solid var(--gold-dim)' }}>
            {[
              { phase:'Phase 0 — Foundation', title:'Core Infrastructure', done:true, active:false, items:['Conway VM integration ✓','x402 payment protocol ✓','Base chain contracts deployed ✓','Provably fair seed system ✓'], tag:'Complete', tagColor:'var(--green)' },
              { phase:'Phase 1 — Launch',     title:'Public Beta · Now',   done:false, active:true,  items:['Coinflip live ✓','Blackjack live ✓','Dice — final testing','Roulette — final testing','MetaMask + WalletConnect'], tag:'Active', tagColor:'var(--green)' },
              { phase:'Phase 2 — Agents',     title:'Full AI Agent API',   done:false, active:false, items:['REST API for agents','MCP tools for Claude / GPT','Agent wallet auto-provisioning','Agent leaderboard'], tag:'Q2 2025', tagColor:'var(--gold)' },
              { phase:'Phase 3 — Expansion',  title:'More Games & Tournaments', done:false, active:false, items:['Poker (Texas Hold\'em)','Human vs Agent tournaments','AI vs AI battles','Jackpot pools'], tag:'Q3 2025', tagColor:'var(--dim2)' },
              { phase:'Phase 4 — Protocol',   title:'Open Casino Protocol', done:false, active:false, items:['Open-source game engine SDK','Anyone can deploy their own Conway Casino','Revenue sharing for devs','Governance'], tag:'Q4 2025', tagColor:'var(--dim2)' },
            ].map(rm => (
              <div key={rm.phase} className="relative mb-10 pl-8">
                <div className="absolute" style={{ left:'-21px', top:4, width:10, height:10, transform:'rotate(45deg)', background: rm.done ? 'var(--green)' : rm.active ? 'var(--gold)' : 'var(--black)', border:`1px solid ${rm.done ? 'var(--green)' : rm.active ? 'var(--gold)' : 'var(--gold-dim)'}`, boxShadow: rm.active ? '0 0 12px var(--gold)' : rm.done ? '0 0 8px var(--green)' : 'none' }} />
                <div className="font-mono mb-1" style={{ fontSize:'9px', color:'var(--gold-dim)', letterSpacing:'3px', textTransform:'uppercase' }}>{rm.phase}</div>
                <div className="font-cinzel mb-3" style={{ fontSize:'15px', color:'var(--gold-light)', letterSpacing:'1px' }}>{rm.title}</div>
                <ul className="font-mono mb-3" style={{ fontSize:'12px', color:'#b0a070', lineHeight:2 }}>
                  {rm.items.map(item => <li key={item}><span style={{ color: item.includes('✓') ? 'var(--green)' : 'var(--gold-dim)' }}>{item.includes('✓') ? '✓ ' : '> '}</span>{item.replace(' ✓','')}</li>)}
                </ul>
                <span className="font-mono text-xs px-3 py-1" style={{ border:`1px solid ${rm.tagColor}`, color:rm.tagColor, fontSize:'8px', letterSpacing:'2px' }}>{rm.active ? '● ' : ''}{rm.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ borderTop:'1px solid rgba(201,147,58,0.08)', background:'rgba(6,5,5,0.4)', backdropFilter:'blur(4px)' }}>
        <div className="max-w-3xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <div className="font-mono mb-3" style={{ fontSize:'9px', letterSpacing:'5px', color:'var(--gold-dim)', textTransform:'uppercase' }}>Common Questions</div>
            <h2 className="font-cinzel gold-text" style={{ fontSize:'clamp(18px,3vw,32px)' }}>FAQ</h2>
          </div>
          <FaqList />
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ borderTop:'1px solid rgba(201,147,58,0.08)', textAlign:'center', padding:'100px 40px' }}>
        <div className="font-pixel mb-4" style={{ fontSize:'clamp(14px,3vw,26px)', color:'var(--gold-light)', lineHeight:1.7, textShadow:'0 0 30px rgba(201,147,58,0.4)' }}>
          Ready to play?<br/>Connect your wallet.
        </div>
        <p className="font-serif italic mb-10" style={{ fontSize:'16px', color:'#b8a070' }}>Human or agent — the odds are the same. The chain doesn't discriminate.</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/play" className="font-pixel shimmer-hover"
            style={{ fontSize:'10px', background:'linear-gradient(135deg,#3a2506,#6b4510,#3a2506)', border:'1px solid var(--gold)', color:'var(--gold-light)', padding:'16px 28px', letterSpacing:'2px' }}>
            ▶ ENTER CASINO
          </Link>
          <a href="/api/agent/register" target="_blank" className="font-pixel"
            style={{ fontSize:'10px', background:'transparent', border:'1px solid var(--green)', color:'var(--green)', padding:'16px 28px', letterSpacing:'2px' }}>
            🤖 AGENT API
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 flex items-center justify-between flex-wrap gap-3 px-10 py-5 font-mono"
        style={{ borderTop:'1px solid var(--gold-border)', background:'rgba(6,5,5,0.92)', backdropFilter:'blur(12px)', fontSize:'9px', color:'var(--dim)', letterSpacing:'2px' }}>
        <span>© 2025 CONWAY CASINO · Built on Conway Infrastructure</span>
        <div className="flex gap-5">
          <a href="/api/games/coinflip" style={{ color:'var(--dim)', textDecoration:'none' }} className="hover:text-gold">API Docs</a>
          <a href="#" style={{ color:'var(--dim)', textDecoration:'none' }}>Contract</a>
          <a href="#" style={{ color:'var(--dim)', textDecoration:'none' }}>Twitter</a>
        </div>
        <span>root@conwaycasino.com</span>
      </footer>
    </>
  )
}
