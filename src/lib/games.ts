import crypto from 'crypto'
import {
  Card, CoinflipResult, BlackjackResult,
  DadosResult, RuletaResult, RuletaBetType
} from '@/types'

// ─── Provably Fair RNG ─────────────────────────────────────────
export function generateSeedPair(): { seedHash: string; seed: string } {
  const seed = crypto.randomBytes(32).toString('hex')
  const seedHash = crypto.createHash('sha256').update(seed).digest('hex')
  return { seed, seedHash }
}

export function seedToFloat(seed: string, nonce: number = 0): number {
  const hash = crypto
    .createHmac('sha256', seed)
    .update(nonce.toString())
    .digest('hex')
  return parseInt(hash.slice(0, 8), 16) / 0xffffffff
}

export function generateConwayVmId(): string {
  return `cvm_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`
}

// ─── COINFLIP ──────────────────────────────────────────────────
export function playCoinflip(
  seed: string,
  choice: 'heads' | 'tails'
): CoinflipResult {
  const roll = seedToFloat(seed)
  const result: 'heads' | 'tails' = roll < 0.5 ? 'heads' : 'tails'
  return { choice, result, won: choice === result }
}

export function coinflipPayout(bet: number, won: boolean): number {
  if (!won) return 0
  return Math.floor(bet * 2 * 0.98) // 2% house edge
}

// ─── DADOS ─────────────────────────────────────────────────────
export function playDados(
  seed: string,
  target: number,
  direction: 'over' | 'under'
): DadosResult {
  const roll = Math.floor(seedToFloat(seed) * 100) + 1 // 1–100
  let won: boolean
  let multiplier: number

  if (direction === 'over') {
    won = roll > target
    const winChance = (100 - target) / 100
    multiplier = winChance > 0 ? parseFloat(((0.99 / winChance)).toFixed(4)) : 0
  } else {
    won = roll < target
    const winChance = (target - 1) / 100
    multiplier = winChance > 0 ? parseFloat(((0.99 / winChance)).toFixed(4)) : 0
  }

  return { target, direction, roll, won, multiplier }
}

export function dadosPayout(bet: number, result: DadosResult): number {
  if (!result.won) return 0
  return Math.floor(bet * result.multiplier)
}

// ─── BLACKJACK ─────────────────────────────────────────────────
const SUITS: Card['suit'][] = ['♠', '♥', '♦', '♣']
const VALUES = ['2','3','4','5','6','7','8','9','10','J','Q','K','A']

function cardNumValue(value: string): number {
  if (['J','Q','K'].includes(value)) return 10
  if (value === 'A') return 11
  return parseInt(value)
}

function generateDeck(seed: string): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push({ suit, value, numValue: cardNumValue(value) })
    }
  }
  // Fisher-Yates shuffle seeded
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(seedToFloat(seed, i) * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

function handTotal(cards: Card[]): number {
  let total = cards.reduce((s, c) => s + c.numValue, 0)
  let aces = cards.filter(c => c.value === 'A').length
  while (total > 21 && aces > 0) { total -= 10; aces-- }
  return total
}

export function dealBlackjack(seed: string): BlackjackResult {
  const deck = generateDeck(seed)
  const playerCards = [deck[0], deck[2]]
  const dealerCards = [deck[1], deck[3]]
  const playerTotal = handTotal(playerCards)
  const dealerTotal = handTotal(dealerCards)

  let outcome: BlackjackResult['outcome'] = 'win'
  if (playerTotal === 21) outcome = 'blackjack'
  else if (playerTotal > 21) outcome = 'bust'
  else if (dealerTotal > playerTotal) outcome = 'lose'
  else if (dealerTotal === playerTotal) outcome = 'push'

  return {
    playerCards, dealerCards, playerTotal, dealerTotal,
    action: 'deal', outcome,
    sessionId: crypto.randomBytes(8).toString('hex')
  }
}

export function blackjackPayout(bet: number, outcome: BlackjackResult['outcome']): number {
  switch (outcome) {
    case 'blackjack': return Math.floor(bet * 2.5)  // 3:2
    case 'win':       return bet * 2
    case 'push':      return bet
    default:          return 0
  }
}

// ─── RULETA ────────────────────────────────────────────────────
const RED_NUMBERS = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]

export function playRuleta(
  seed: string,
  betType: RuletaBetType,
  betNumber?: number
): RuletaResult {
  const spinResult = Math.floor(seedToFloat(seed) * 37) // 0–36
  const color = spinResult === 0 ? 'green' : RED_NUMBERS.includes(spinResult) ? 'red' : 'black'

  let won = false
  let multiplier = 1

  switch (betType) {
    case 'straight':
      won = spinResult === betNumber
      multiplier = 36
      break
    case 'red':
      won = color === 'red'
      multiplier = 2
      break
    case 'black':
      won = color === 'black'
      multiplier = 2
      break
    case 'even':
      won = spinResult !== 0 && spinResult % 2 === 0
      multiplier = 2
      break
    case 'odd':
      won = spinResult % 2 === 1
      multiplier = 2
      break
    case 'low':
      won = spinResult >= 1 && spinResult <= 18
      multiplier = 2
      break
    case 'high':
      won = spinResult >= 19 && spinResult <= 36
      multiplier = 2
      break
    case 'dozen1':
      won = spinResult >= 1 && spinResult <= 12
      multiplier = 3
      break
    case 'dozen2':
      won = spinResult >= 13 && spinResult <= 24
      multiplier = 3
      break
    case 'dozen3':
      won = spinResult >= 25 && spinResult <= 36
      multiplier = 3
      break
  }

  return { betType, betNumber, spinResult, color, won, multiplier }
}

export function ruletaPayout(bet: number, result: RuletaResult): number {
  if (!result.won) return 0
  return bet * result.multiplier
}
