import { NextRequest, NextResponse } from 'next/server'
import { authenticateAgent } from '@/lib/auth'
import { generateSeedPair, generateConwayVmId, playCoinflip, coinflipPayout } from '@/lib/games'
import { supabaseAdmin, getOrCreatePlayer, saveGame, updatePlayerStats } from '@/lib/supabase'
import { FREEROLL_CENTS } from '@/lib/usdc'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { bet, choice, isFreeroll, walletAddress } = body

    if (!['heads', 'tails'].includes(choice)) {
      return NextResponse.json({ success: false, error: "choice must be 'heads' or 'tails'" }, { status: 400 })
    }

    // ── Determine who is playing ──────────────────────────────
    const authResult = await authenticateAgent(req)
    const isAgent    = authResult.ok
    const agent      = isAgent ? authResult.agent : null

    // Human player via wallet address in body
    let player = null
    if (!isAgent && walletAddress) {
      player = await getOrCreatePlayer(walletAddress)
    }

    if (!isAgent && !player) {
      return NextResponse.json({ success: false, error: 'Provide walletAddress or agent authentication' }, { status: 401 })
    }

    // ── Freeroll validation ───────────────────────────────────
    if (isFreeroll) {
      if (!isAgent) return NextResponse.json({ success: false, error: 'Freeroll is for agents only' }, { status: 400 })
      if (agent!.freeroll_used) return NextResponse.json({ success: false, error: 'Freeroll already used' }, { status: 400 })
    }

    const betAmount = isFreeroll ? FREEROLL_CENTS : Number(bet)

    if (!betAmount || betAmount < 100 || betAmount > 1_000_000) {
      return NextResponse.json({ success: false, error: 'bet must be 100–1000000 cents ($1–$10,000)' }, { status: 400 })
    }

    // ── Balance check ─────────────────────────────────────────
    const playerBalance = isAgent ? agent!.balance : player!.balance
    if (!isFreeroll && playerBalance < betAmount) {
      return NextResponse.json({
        success: false,
        error: `Insufficient balance. Have: $${(playerBalance/100).toFixed(2)}, Need: $${(betAmount/100).toFixed(2)}`,
        balance: playerBalance,
      }, { status: 400 })
    }

    // ── Provably fair game ────────────────────────────────────
    const { seed, seedHash } = generateSeedPair()
    const vmId   = generateConwayVmId()
    const result = playCoinflip(seed, choice)
    const payout = coinflipPayout(betAmount, result.won)

    const outcome: 'win' | 'lose' = result.won ? 'win' : 'lose'
    const profit = isFreeroll
      ? (result.won ? payout : 0)
      : (result.won ? payout - betAmount : -betAmount)

    // ── Persist to Supabase ───────────────────────────────────
    const playerId = isAgent ? agent!.id : player!.id

    const gameRow = await saveGame({
      player_id:   isAgent ? null : playerId,
      agent_id:    isAgent ? playerId : null,
      player_type: isAgent ? 'agent' : 'human',
      game_type:   'coinflip',
      bet:         betAmount,
      outcome,
      payout:      result.won ? payout : 0,
      profit,
      is_freeroll: !!isFreeroll,
      seed_hash:   seedHash,
      seed,
      vm_id:       vmId,
      result_data: result as unknown as Record<string, unknown>,
    })

    await updatePlayerStats(playerId, isAgent, betAmount, result.won ? payout : 0, outcome, profit)

    // Mark freeroll used
    if (isFreeroll && isAgent) {
      await supabaseAdmin.from('agents').update({
        freeroll_used: true,
        freeroll_won:  result.won,
      }).eq('id', agent!.id)
    }

    return NextResponse.json({
      success: true,
      data: {
        gameId:   gameRow.id,
        gameType: 'coinflip',
        outcome,
        payout:   result.won ? payout : 0,
        profit,
        isFreeroll: !!isFreeroll,
        seedHash,
        seed,
        vmId,
        resultData: result,
      },
      summary: {
        choice,
        result:    result.result,
        won:       result.won,
        bet:       `$${(betAmount/100).toFixed(2)}`,
        payout:    `$${((result.won ? payout : 0)/100).toFixed(2)}`,
        isFreeroll: !!isFreeroll,
        claimable: result.won && isFreeroll ? `$${(payout/100).toFixed(2)} — POST /api/agent/claim` : null,
        verify:    `conway verify --seed ${seed} --game coinflip --choice ${choice}`,
      },
    })

  } catch (err: any) {
    console.error('Coinflip error:', err)
    return NextResponse.json({ success: false, error: err.message || 'Internal error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      game: 'Coinflip',
      endpoint: 'POST /api/games/coinflip',
      houseEdge: '2%',
      maxPayout: '2× bet',
      body: {
        bet:        'number — cents (100=$1.00, max 1000000=$10,000)',
        choice:     '"heads" | "tails"',
        isFreeroll: 'boolean — agents only, one per registration',
        walletAddress: 'string — for human players (not needed for agents)',
      },
    },
  })
}
