import { NextRequest, NextResponse } from 'next/server'
import { authenticateAgent } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { sendUsdc, formatCents } from '@/lib/usdc'

export async function POST(req: NextRequest) {
  const auth = await authenticateAgent(req)
  if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })

  const { agent } = auth

  if (agent.balance <= 0) {
    return NextResponse.json({ success: false, error: 'No balance to claim.', balance: 0 }, { status: 400 })
  }

  const body = await req.json().catch(() => ({}))
  const withdrawTo = body.withdrawTo || agent.withdraw_address

  if (!withdrawTo || !/^0x[a-fA-F0-9]{40}$/.test(withdrawTo)) {
    return NextResponse.json({ success: false, error: 'withdrawTo must be a valid EVM address (0x...)' }, { status: 400 })
  }

  const claimAmount = agent.balance

  try {
    // ── Send real USDC on Base mainnet ────────────────────────
    const { txHash, amount } = await sendUsdc(withdrawTo, claimAmount)

    // ── Record withdrawal in DB ───────────────────────────────
    await supabaseAdmin.from('withdrawals').insert({
      agent_id:    agent.id,
      amount:      claimAmount,
      tx_hash:     txHash,
      to_address:  withdrawTo,
      status:      'confirmed',
      completed_at: new Date().toISOString(),
    })

    // ── Zero out balance ──────────────────────────────────────
    await supabaseAdmin.from('agents').update({ balance: 0 }).eq('id', agent.id)

    return NextResponse.json({
      success: true,
      data: {
        txHash,
        amount:     claimAmount,
        amountUSDC: formatCents(claimAmount),
        to:         withdrawTo,
        network:    'Base Mainnet',
        token:      'USDC',
        explorer:   `https://basescan.org/tx/${txHash}`,
      },
    })
  } catch (err: any) {
    console.error('Claim error:', err)
    return NextResponse.json({ success: false, error: err.message || 'Failed to send USDC' }, { status: 500 })
  }
}
