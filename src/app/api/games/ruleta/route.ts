import { NextRequest, NextResponse } from 'next/server'
import { authenticateAgent } from '@/lib/auth'
import { generateSeedPair, generateConwayVmId, playRuleta, ruletaPayout } from '@/lib/games'
import { supabaseAdmin, getOrCreatePlayer, saveGame, updatePlayerStats } from '@/lib/supabase'
import { FREEROLL_CENTS } from '@/lib/usdc'
import { RuletaBetType } from '@/types'

const VALID_BET_TYPES: RuletaBetType[] = ['straight','red','black','even','odd','low','high','dozen1','dozen2','dozen3']

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { bet, betType, number, isFreeroll, walletAddress } = body

    if (!VALID_BET_TYPES.includes(betType)) return NextResponse.json({ success: false, error: `betType: ${VALID_BET_TYPES.join(', ')}` }, { status: 400 })
    if (betType === 'straight' && (number === undefined || number < 0 || number > 36)) return NextResponse.json({ success: false, error: 'straight needs number 0–36' }, { status: 400 })

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
    const result = playRuleta(seed, betType, number)
    const payout = ruletaPayout(betAmount, result)
    const outcome: 'win'|'lose' = result.won ? 'win' : 'lose'
    const profit = isFreeroll ? (result.won ? payout - betAmount : 0) : (result.won ? payout - betAmount : -betAmount)
    const playerId = isAgent ? agent!.id : player!.id

    const gameRow = await saveGame({
      player_id:   isAgent ? null : playerId,
      agent_id:    isAgent ? playerId : null,
      player_type: isAgent ? 'agent' : 'human',
      game_type:   'roulette',
      bet: betAmount, outcome, payout: result.won ? payout : 0, profit,
      is_freeroll: !!isFreeroll, seed_hash: seedHash, seed, vm_id: vmId,
      result_data: result as unknown as Record<string, unknown>,
    })

    await updatePlayerStats(playerId, isAgent, betAmount, result.won ? payout : 0, outcome, profit)
    if (isFreeroll && isAgent) await supabaseAdmin.from('agents').update({ freeroll_used: true, freeroll_won: result.won }).eq('id', agent!.id)

    return NextResponse.json({
      success: true,
      data: { gameId: gameRow.id, outcome, payout: result.won ? payout : 0, profit, isFreeroll: !!isFreeroll, seedHash, seed, vmId, resultData: result },
      summary: { betType, number: number ?? null, spinResult: result.spinResult, color: result.color, won: result.won, multiplier: `${result.multiplier}:1`, bet: `$${(betAmount/100).toFixed(2)}`, payout: `$${((result.won?payout:0)/100).toFixed(2)}` },
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ success: true, data: { game: 'Roulette', endpoint: 'POST /api/games/ruleta', houseEdge: '2.7%', betTypes: VALID_BET_TYPES } })
}
