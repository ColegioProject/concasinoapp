import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ── Lazy clients (initialized on first use, not at import time) ──
let _supabase: SupabaseClient | null = null
let _supabaseAdmin: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
    _supabase = createClient(url, key)
  }
  return _supabase
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    const url     = process.env.NEXT_PUBLIC_SUPABASE_URL
    const service = process.env.SUPABASE_SERVICE_KEY
    if (!url || !service) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY')
    _supabaseAdmin = createClient(url, service, { auth: { persistSession: false } })
  }
  return _supabaseAdmin
}

// Convenience aliases (lazy)
export const supabase      = new Proxy({} as SupabaseClient, { get: (_, prop) => (getSupabase() as any)[prop] })
export const supabaseAdmin = new Proxy({} as SupabaseClient, { get: (_, prop) => (getSupabaseAdmin() as any)[prop] })

// ── Types ─────────────────────────────────────────────────────
export type Player = {
  id: string
  address: string
  display_name: string | null
  balance: number
  total_wagered: number
  total_won: number
  games_played: number
  biggest_win: number
  win_streak: number
  best_streak: number
  created_at: string
  last_seen_at: string
}

export type Agent = {
  id: string
  name: string | null
  api_key: string
  wallet_address: string
  withdraw_address: string | null
  balance: number
  freeroll_used: boolean
  freeroll_won: boolean
  total_games: number
  total_wagered: number
  total_won: number
  biggest_win: number
  win_streak: number
  best_streak: number
  is_active: boolean
  created_at: string
  last_played_at: string | null
}

export type Game = {
  id: string
  player_id: string | null
  agent_id: string | null
  player_type: 'human' | 'agent'
  game_type: 'coinflip' | 'blackjack' | 'dice' | 'roulette'
  bet: number
  outcome: 'win' | 'lose' | 'push'
  payout: number
  profit: number
  is_freeroll: boolean
  seed_hash: string
  seed: string
  vm_id: string
  result_data: Record<string, unknown>
  created_at: string
}

export type LeaderboardEntry = {
  id: string
  address: string
  display_name: string
  player_type: 'human' | 'agent'
  total_won: number
  total_wagered: number
  games_played: number
  biggest_win: number
  best_streak: number
  roi_pct: number
  created_at: string
}

export type CasinoStats = {
  total_games: number
  unique_players: number
  total_wagered: number
  total_paid_out: number
  biggest_win_ever: number
  total_wins: number
  total_losses: number
  total_freerolls: number
}

// ── Helpers ───────────────────────────────────────────────────
export async function getOrCreatePlayer(address: string): Promise<Player> {
  const addr = address.toLowerCase()
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('players')
    .upsert({ address: addr, last_seen_at: new Date().toISOString() }, { onConflict: 'address', ignoreDuplicates: false })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getPlayerByAddress(address: string): Promise<Player | null> {
  const { data } = await getSupabaseAdmin()
    .from('players').select('*').eq('address', address.toLowerCase()).single()
  return data
}

export async function getAgentByApiKey(apiKey: string): Promise<Agent | null> {
  const { data } = await getSupabaseAdmin()
    .from('agents').select('*').eq('api_key', apiKey).single()
  return data
}

export async function getAgentByWallet(address: string): Promise<Agent | null> {
  const { data } = await getSupabaseAdmin()
    .from('agents').select('*').eq('wallet_address', address.toLowerCase()).single()
  return data
}

export async function saveGame(game: Omit<Game, 'id' | 'created_at'>): Promise<Game> {
  const { data, error } = await getSupabaseAdmin()
    .from('games').insert(game).select().single()
  if (error) throw error
  return data
}

export async function updatePlayerStats(
  playerId: string, isAgent: boolean,
  bet: number, payout: number,
  outcome: 'win' | 'lose' | 'push', profit: number
): Promise<void> {
  const { error } = await getSupabaseAdmin().rpc('update_player_stats', {
    p_player_id: playerId, p_is_agent: isAgent,
    p_bet: bet, p_payout: payout, p_outcome: outcome, p_profit: profit,
  })
  if (error) throw error
}

export async function getLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
  const { data, error } = await getSupabase()
    .from('leaderboard').select('*').order('total_won', { ascending: false }).limit(limit)
  if (error) throw error
  return data || []
}

export async function getCasinoStats(): Promise<CasinoStats | null> {
  const { data } = await getSupabase().from('casino_stats').select('*').single()
  return data
}

export async function getRecentGames(limit = 20): Promise<Game[]> {
  const { data } = await getSupabase()
    .from('games').select('*').order('created_at', { ascending: false }).limit(limit)
  return data || []
}
