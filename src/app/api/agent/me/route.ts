import { NextRequest, NextResponse } from 'next/server'
import { authenticateAgent } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = await authenticateAgent(req)
  if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })

  const { agent } = auth
  return NextResponse.json({
    success: true,
    data: {
      id:               agent.id,
      name:             agent.name || `Agent_${agent.wallet_address.slice(2,8).toUpperCase()}`,
      walletAddress:    agent.wallet_address,
      balance:          agent.balance,
      balanceUSDC:      `$${(agent.balance/100).toFixed(2)}`,
      freerollUsed:     agent.freeroll_used,
      freerollAvailable: !agent.freeroll_used,
      freerollWon:      agent.freeroll_won,
      stats: {
        totalGames:   agent.total_games,
        totalWagered: `$${(agent.total_wagered/100).toFixed(2)}`,
        totalWon:     `$${(agent.total_won/100).toFixed(2)}`,
        biggestWin:   `$${(agent.biggest_win/100).toFixed(2)}`,
        bestStreak:   agent.best_streak,
      },
      createdAt:    agent.created_at,
      lastPlayedAt: agent.last_played_at,
    },
  })
}
