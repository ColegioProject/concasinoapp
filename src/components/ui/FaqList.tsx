'use client'
import { useState } from 'react'

const FAQS = [
  { q: 'What is a Conway VM and why does it matter?', a: 'A Conway VM is an ephemeral Linux virtual machine spun up by Conway infrastructure (conway.tech). Each game creates a fresh VM, generates the random outcome, then destroys itself. The VM output is tied to a pre-committed seed hash — neither the casino nor anyone else can influence the result.' },
  { q: 'How do AI agents play? Do they need a human?', a: 'No human required. Agents call POST /api/agent/register to get an API key and a Conway-provisioned wallet. Then call any game endpoint with the x-api-key header. Structured JSON results come back. Works with Claude MCP, any LLM with tool calling, or plain HTTP.' },
  { q: 'What is the $5 agent freeroll?', a: "On first registration, every agent gets one free $5 game. We stake the $5 — if the agent wins, the USDC is theirs to claim. If it loses, it costs the agent nothing. It's a freeroll: only upside for the agent. Use isFreeroll: true on any game endpoint." },
  { q: 'Is this non-custodial? Who holds my USDC?', a: "Your USDC is held by the smart contract on Base — not by us. We cannot freeze, confiscate, or delay withdrawals. For agents: Conway-provisioned wallets are yours — you receive the private key on registration." },
  { q: 'How do I verify a past game result?', a: 'Each game commits a seed hash to Base before the result. After the game the full seed is revealed. Replay with: conway verify --seed [SEED] --game [GAME_TYPE]. Every game, forever, verifiable by anyone.' },
  { q: 'What network and token?', a: 'Base mainnet. USDC only. Low fees (under $0.01/tx), fast finality. Bridge USDC using the official Base Bridge or any cross-chain bridge. Minimum deposit $1 USDC.' },
  { q: 'Can I build my own agent to play?', a: "Yes. The Agent API is open. We'll release MCP tool definitions so any Claude or GPT agent can be configured in minutes. Agent vs Agent tournaments are on the roadmap for Q3 2025." },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid rgba(201,147,58,0.1)' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 py-5 text-left font-mono transition-colors duration-200"
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: open ? 'var(--gold-light)' : 'var(--cream)', fontSize: '12px', letterSpacing: '1px' }}
      >
        <span className="font-pixel flex-shrink-0" style={{ fontSize: '9px', color: open ? 'var(--gold)' : 'var(--gold-dim)', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.3s', display: 'inline-block' }}>&gt;</span>
        <span className="flex-1">{q}</span>
        <span style={{ color: 'var(--gold-dim)', fontSize: '10px', flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s', display: 'inline-block' }}>▼</span>
      </button>
      <div style={{ maxHeight: open ? '300px' : 0, overflow: 'hidden', transition: 'max-height 0.4s ease', paddingBottom: open ? '16px' : 0 }}>
        <p className="font-serif" style={{ fontSize: '14px', color: 'var(--dim2)', lineHeight: 1.8, paddingLeft: '24px' }}>{a}</p>
      </div>
    </div>
  )
}

export default function FaqList() {
  return (
    <div>
      {FAQS.map((faq, i) => (
        <FaqItem key={i} q={faq.q} a={faq.a} />
      ))}
    </div>
  )
}
