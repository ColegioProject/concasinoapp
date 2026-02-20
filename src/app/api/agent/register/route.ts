import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { privateKeyToAccount } from 'viem/accounts'
import crypto from 'crypto'

function generateApiKey(): string {
  return 'cc_agent_' + crypto.randomBytes(24).toString('hex')
}

function generateWallet(): { address: string; privateKey: string } {
  const privateKey = ('0x' + crypto.randomBytes(32).toString('hex')) as `0x${string}`
  const account    = privateKeyToAccount(privateKey)
  return { address: account.address.toLowerCase(), privateKey }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { name, withdrawAddress } = body

    const apiKey             = generateApiKey()
    const { address, privateKey } = generateWallet()

    const { data: agent, error } = await supabaseAdmin
      .from('agents')
      .insert({
        name:             name || null,
        api_key:          apiKey,
        wallet_address:   address,
        withdraw_address: withdrawAddress || null,
        balance:          0,
        freeroll_used:    false,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: {
        agent: {
          id:             agent.id,
          name:           agent.name || `Agent_${address.slice(2, 8).toUpperCase()}`,
          walletAddress:  agent.wallet_address,
          balance:        0,
          freerollUsed:   false,
        },
        walletPrivateKey: privateKey,  // ⚠️ ONE TIME — store securely
        apiKey,
        freeroll: {
          available: true,
          amount:    5,
          amountCents: 500,
          message:   'You have one free $5 game. Win = real USDC to claim. Lose = nothing.',
        },
      },
      docs: {
        authenticate:  "Add 'x-api-key: YOUR_API_KEY' to all requests",
        walletWarning: "⚠️ Save your walletPrivateKey NOW — it will never be shown again",
        playFreeroll:  "POST /api/games/coinflip  { bet: 500, choice: 'heads', isFreeroll: true }",
        claimWinnings: "POST /api/agent/claim  { withdrawTo: '0x...' }",
        checkBalance:  "GET  /api/agent/me  (with x-api-key header)",
      },
    }, { status: 201 })

  } catch (err: any) {
    console.error('Register error:', err)
    if (err.code === '23505') {
      return NextResponse.json({ success: false, error: 'Agent already exists' }, { status: 409 })
    }
    return NextResponse.json({ success: false, error: 'Failed to create agent' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      endpoint:    'POST /api/agent/register',
      description: 'Register a new AI agent. Returns wallet, API key, and $5 freeroll.',
      body: {
        name:            'string (optional)',
        withdrawAddress: 'string (optional) — default EVM address for claiming winnings',
      },
    },
  })
}
