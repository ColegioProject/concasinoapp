// ─── Player / Wallet ───────────────────────────────────────────
export interface Player {
  address: string
  balance: number          // USDC balance in cents
  totalWon: number
  totalWagered: number
  gamesPlayed: number
  isAgent: boolean
  freerollUsed: boolean
  createdAt: string
}

// ─── Agent ─────────────────────────────────────────────────────
export interface Agent {
  id: string
  apiKey: string
  walletAddress: string
  walletPrivateKey?: string  // Only returned on creation
  balance: number
  freerollUsed: boolean
  freerollWon: boolean
  totalGames: number
  totalWon: number
  createdAt: string
  name?: string
}

export interface AgentCreateRequest {
  name?: string
  withdrawAddress?: string   // Where to send winnings
}

export interface AgentCreateResponse {
  agent: Agent
  walletPrivateKey: string   // One-time reveal
  apiKey: string
  freeroll: {
    available: true
    amount: 5                // $5 USD
    message: string
  }
}

// ─── Games ─────────────────────────────────────────────────────
export type GameType = 'coinflip' | 'blackjack' | 'dados' | 'ruleta'

export interface GameResult {
  gameId: string
  gameType: GameType
  playerAddress: string
  bet: number              // in USDC cents
  outcome: 'win' | 'lose' | 'push'
  payout: number           // in USDC cents
  isFreeroll: boolean
  vmId: string             // Conway VM that ran this game
  seedHash: string         // committed before game
  seed: string             // revealed after game
  resultData: CoinflipResult | BlackjackResult | DadosResult | RuletaResult
  timestamp: string
}

// Coinflip
export interface CoinflipRequest {
  bet: number
  choice: 'heads' | 'tails'
  isFreeroll?: boolean
}
export interface CoinflipResult {
  choice: 'heads' | 'tails'
  result: 'heads' | 'tails'
  won: boolean
}

// Blackjack
export type Card = { suit: '♠'|'♥'|'♦'|'♣'; value: string; numValue: number }
export interface BlackjackRequest {
  bet: number
  action: 'deal' | 'hit' | 'stand' | 'double'
  gameSessionId?: string
  isFreeroll?: boolean
}
export interface BlackjackResult {
  playerCards: Card[]
  dealerCards: Card[]
  playerTotal: number
  dealerTotal: number
  action: string
  outcome: 'win' | 'lose' | 'push' | 'blackjack' | 'bust'
  sessionId: string
}

// Dados
export interface DadosRequest {
  bet: number
  target: number           // 2–98
  direction: 'over' | 'under'
  isFreeroll?: boolean
}
export interface DadosResult {
  target: number
  direction: 'over' | 'under'
  roll: number             // 0–100
  won: boolean
  multiplier: number
}

// Ruleta
export type RuletaBetType = 'straight' | 'red' | 'black' | 'even' | 'odd' | 'low' | 'high' | 'dozen1' | 'dozen2' | 'dozen3'
export interface RuletaRequest {
  bet: number
  betType: RuletaBetType
  number?: number          // for straight bet
  isFreeroll?: boolean
}
export interface RuletaResult {
  betType: RuletaBetType
  betNumber?: number
  spinResult: number       // 0–36
  color: 'red' | 'black' | 'green'
  won: boolean
  multiplier: number
}

// ─── API responses ─────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  code?: string
}

// ─── Claim ─────────────────────────────────────────────────────
export interface ClaimRequest {
  agentApiKey: string
  withdrawTo: string       // EVM address to send winnings
}
export interface ClaimResponse {
  txHash: string
  amount: number
  to: string
}
