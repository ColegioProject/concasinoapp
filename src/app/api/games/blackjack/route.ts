import { NextRequest, NextResponse } from 'next/server'
import { authenticateAgent } from '@/lib/auth'
import { generateSeedPair, generateConwayVmId, dealBlackjack, blackjackPayout } from '@/lib/games'
import { supabaseAdmin, getOrCreatePlayer, saveGame, updatePlayerStats } from '@/lib/supabase'
import { FREEROLL_CENTS } from '@/lib/usdc'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { bet, isFreeroll, walletAddress } = body

    const authResult = await authenticateAgent(req)
    const isAgent    = authResult.ok
    const agent      = isAgent ? authResult.agent : null

    let player = null
    if (!isAgent && walletAddress) {
      player = await getOrCreatePlayer(walletAddress)
    }
    if (!isAgent && !player) {
      return NextResponse.json({ success: false, error: 'Provide walletAddress or agent auth' }, { status: 401 })
    }

    if (isFreeroll) {
      if (!isAgent) return NextResponse.json({ success: false, error: 'Freeroll agents only' }, { status: 400 })
      if (agent!.freeroll_used) return NextResponse.json({ success: false, error: 'Freeroll already used' }, { status: 400 })
    }

    const betAmount = isFreeroll ? FREEROLL_CENTS : Number(bet)
    if (!betAmount || betAmount < 100 || betAmount > 1_000_000) {
      return NextResponse.json({ success: false, error: 'bet must be 100–1000000 cents' }, { status: 400 })
    }

    const playerBalance = isAgent ? agent!.balance : player!.balance
    if (!isFreeroll && playerBalance < betAmount) {
      return NextResponse.json({ success: false, error: `Insufficient balance. Have: $${(playerBalance/100).toFixed(2)}` }, { status: 400 })
    }

    const { seed, seedHash } = generateSeedPair()
    const vmId   = generateConwayVmId()
    const result = dealBlackjack(seed)
    const payout = blackjackPayout(betAmount, result.outcome)

    const won    = ['win','blackjack'].includes(result.outcome)
    const pushed = result.outcome === 'push'
    const outcome: 'win'|'lose'|'push' = won ? 'win' : pushed ? 'push' : 'lose'
    const profit = isFreeroll
      ? (won ? payout - betAmount : pushed ? 0 : 0)
      : (won ? payout - betAmount : pushed ? 0 : -betAmount)

    const playerId = isAgent ? agent!.id : player!.id

    const gameRow = await saveGame({
      player_id:   isAgent ? null : playerId,
      agent_id:    isAgent ? playerId : null,
      player_type: isAgent ? 'agent' : 'human',
      game_type:   'blackjack',
      bet:         betAmount,
      outcome,
      payout,
      profit,
      is_freeroll: !!isFreeroll,
      seed_hash: seedHash, seed, vm_id: vmId,
      result_data: result as unknown as Record<string, unknown>,
    })

    await updatePlayerStats(playerId, isAgent, betAmount, payout, outcome, profit)

    if (isFreeroll && isAgent) {
      await supabaseAdmin.from('agents').update({ freeroll_used: true, freeroll_won: won }).eq('id', agent!.id)
    }

    return NextResponse.json({
      success: true,
      data: { gameId: gameRow.id, outcome, payout, profit, isFreeroll: !!isFreeroll, seedHash, seed, vmId, resultData: result },
      summary: {
        playerCards: result.playerCards.map(c => `${c.value}${c.suit}`).join(' '),
        dealerCards: result.dealerCards.map(c => `${c.value}${c.suit}`).join(' '),
        playerTotal: result.playerTotal,
        dealerTotal: result.dealerTotal,
        outcome: result.outcome,
        bet:    `$${(betAmount/100).toFixed(2)}`,
        payout: `$${(payout/100).toFixed(2)}`,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ success: true, data: { game: 'Blackjack', endpoint: 'POST /api/games/blackjack', houseEdge: '0.5%', body: { bet: 'cents', isFreeroll: 'boolean', walletAddress: 'string' } } })
}
