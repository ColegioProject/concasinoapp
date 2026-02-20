import { NextRequest, NextResponse } from 'next/server'
import { authenticateAgent } from '@/lib/auth'
import { generateSeedPair, generateConwayVmId, playDados, dadosPayout } from '@/lib/games'
import { supabaseAdmin, getOrCreatePlayer, saveGame, updatePlayerStats } from '@/lib/supabase'
import { FREEROLL_CENTS } from '@/lib/usdc'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { bet, target, direction, isFreeroll, walletAddress } = body

    if (!['over','under'].includes(direction)) return NextResponse.json({ success: false, error: "direction: 'over'|'under'" }, { status: 400 })
    if (!target || target < 2 || target > 98) return NextResponse.json({ success: false, error: 'target: 2–98' }, { status: 400 })

    const authResult = await authenticateAgent(req)
    const isAgent    = authResult.ok
    const agent      = isAgent ? authResult.agent : null
    let player = null
    if (!isAgent && walletAddress) player = await getOrCreatePlayer(walletAddress)
    if (!isAgent && !player) return NextResponse.json({ success: false, error: 'Provide walletAddress or agent auth' }, { status: 401 })

    if (isFreeroll) {
      if (!isAgent) return NextResponse.json({ success: false, error: 'Freeroll agents only' }, { status: 400 })
      if (agent!.freeroll_used) return NextResponse.json({ success: false, error: 'Freeroll already used' }, { status: 400 })
    }

    const betAmount = isFreeroll ? FREEROLL_CENTS : Number(bet)
    if (!betAmount || betAmount < 100) return NextResponse.json({ success: false, error: 'min bet 100 cents' }, { status: 400 })

    const playerBalance = isAgent ? agent!.balance : player!.balance
    if (!isFreeroll && playerBalance < betAmount) return NextResponse.json({ success: false, error: 'Insufficient balance' }, { status: 400 })

    const { seed, seedHash } = generateSeedPair()
    const vmId   = generateConwayVmId()
    const result = playDados(seed, target, direction)
    const payout = dadosPayout(betAmount, result)
    const outcome: 'win'|'lose' = result.won ? 'win' : 'lose'
    const profit = isFreeroll ? (result.won ? payout : 0) : (result.won ? payout - betAmount : -betAmount)
    const playerId = isAgent ? agent!.id : player!.id

    const gameRow = await saveGame({
      player_id:   isAgent ? null : playerId,
      agent_id:    isAgent ? playerId : null,
      player_type: isAgent ? 'agent' : 'human',
      game_type:   'dice',
      bet: betAmount, outcome, payout: result.won ? payout : 0, profit,
      is_freeroll: !!isFreeroll, seed_hash: seedHash, seed, vm_id: vmId,
      result_data: result as unknown as Record<string, unknown>,
    })

    await updatePlayerStats(playerId, isAgent, betAmount, result.won ? payout : 0, outcome, profit)
    if (isFreeroll && isAgent) await supabaseAdmin.from('agents').update({ freeroll_used: true, freeroll_won: result.won }).eq('id', agent!.id)

    return NextResponse.json({
      success: true,
      data: { gameId: gameRow.id, outcome, payout: result.won ? payout : 0, profit, isFreeroll: !!isFreeroll, seedHash, seed, vmId, resultData: result },
      summary: { target, direction, roll: result.roll, won: result.won, multiplier: `${result.multiplier}x`, bet: `$${(betAmount/100).toFixed(2)}`, payout: `$${((result.won?payout:0)/100).toFixed(2)}` },
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ success: true, data: { game: 'Dice', endpoint: 'POST /api/games/dados', houseEdge: '1%', body: { bet: 'cents', target: '2-98', direction: '"over"|"under"', isFreeroll: 'boolean', walletAddress: 'string' } } })
}
