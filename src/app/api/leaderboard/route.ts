import { NextRequest, NextResponse } from 'next/server'
import { getLeaderboard, getCasinoStats, getRecentGames } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const limit  = Math.min(parseInt(searchParams.get('limit')  || '20'), 100)
    const type   = searchParams.get('type') || 'all'   // all | human | agent

    const [entries, stats, recentGames] = await Promise.all([
      getLeaderboard(limit),
      getCasinoStats(),
      getRecentGames(10),
    ])

    const filtered = type === 'all' ? entries : entries.filter(e => e.player_type === type)

    return NextResponse.json({
      success: true,
      data: {
        leaderboard: filtered.map((e, i) => ({
          rank:        i + 1,
          ...e,
          totalWonUSDC:    `$${(e.total_won/100).toFixed(2)}`,
          totalWageredUSDC:`$${(e.total_wagered/100).toFixed(2)}`,
          biggestWinUSDC:  `$${(e.biggest_win/100).toFixed(2)}`,
        })),
        casinoStats: stats ? {
          totalGames:       stats.total_games,
          uniquePlayers:    stats.unique_players,
          totalWageredUSDC: `$${((stats.total_wagered||0)/100).toFixed(2)}`,
          totalPaidOutUSDC: `$${((stats.total_paid_out||0)/100).toFixed(2)}`,
          biggestWinUSDC:   `$${((stats.biggest_win_ever||0)/100).toFixed(2)}`,
          winRate:          stats.total_games > 0
            ? `${((stats.total_wins/stats.total_games)*100).toFixed(1)}%`
            : '0%',
        } : null,
        recentWins: recentGames
          .filter(g => g.outcome === 'win')
          .slice(0, 5)
          .map(g => ({
            gameType: g.game_type,
            payout:   `$${(g.payout/100).toFixed(2)}`,
            playerType: g.player_type,
            createdAt: g.created_at,
          })),
      },
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
