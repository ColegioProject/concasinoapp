import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getOrCreatePlayer } from '@/lib/supabase'
import { verifyDeposit, getHotWalletAddress } from '@/lib/usdc'

// GET — returns the deposit address (hot wallet) and instructions
export async function GET() {
  let address = 'CONFIGURE_HOT_WALLET_PRIVATE_KEY'
  try { address = getHotWalletAddress() } catch {}

  return NextResponse.json({
    success: true,
    data: {
      depositAddress: address,
      network:        'Base Mainnet',
      token:          'USDC',
      contractAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      minDeposit:     '$1.00',
      instructions: [
        `1. Send USDC on Base mainnet to: ${address}`,
        '2. Copy the transaction hash from your wallet',
        '3. POST /api/deposit with { txHash, walletAddress }',
        '4. Your balance will be credited after 1 confirmation (~2 seconds)',
      ],
    },
  })
}

// POST — verify a deposit txHash and credit the player
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { txHash, walletAddress } = body

    if (!txHash)        return NextResponse.json({ success: false, error: 'txHash required' }, { status: 400 })
    if (!walletAddress) return NextResponse.json({ success: false, error: 'walletAddress required' }, { status: 400 })

    // Check if already processed
    const { data: existing } = await supabaseAdmin
      .from('deposits')
      .select('id, status, amount')
      .eq('tx_hash', txHash)
      .single()

    if (existing) {
      return NextResponse.json({
        success: false,
        error:   existing.status === 'confirmed' ? 'Transaction already credited' : 'Transaction already pending',
        deposit: existing,
      }, { status: 409 })
    }

    // Verify on-chain
    const verification = await verifyDeposit(txHash)

    if (!verification || !verification.valid) {
      return NextResponse.json({
        success: false,
        error:   'Transaction not found or did not send USDC to our address. Make sure you sent USDC on Base mainnet.',
      }, { status: 400 })
    }

    if (verification.cents < 100) {
      return NextResponse.json({ success: false, error: 'Minimum deposit is $1.00 USDC' }, { status: 400 })
    }

    // Get or create player
    const player = await getOrCreatePlayer(walletAddress)

    // Record deposit
    await supabaseAdmin.from('deposits').insert({
      player_id:    player.id,
      amount:       verification.cents,
      tx_hash:      txHash,
      from_address: verification.from,
      status:       'confirmed',
      confirmed_at: new Date().toISOString(),
    })

    // Credit player balance
    await supabaseAdmin
      .from('players')
      .update({ balance: player.balance + verification.cents })
      .eq('id', player.id)

    return NextResponse.json({
      success: true,
      data: {
        credited:     verification.cents,
        creditedUSDC: `$${(verification.cents/100).toFixed(2)}`,
        newBalance:   player.balance + verification.cents,
        newBalanceUSDC: `$${((player.balance + verification.cents)/100).toFixed(2)}`,
        txHash,
        explorer: `https://basescan.org/tx/${txHash}`,
      },
    })

  } catch (err: any) {
    console.error('Deposit error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
