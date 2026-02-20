import crypto from 'crypto'
import { Agent } from '@/types'

// In production: replace with Supabase/PostgreSQL
// For now: in-memory store (resets on server restart)
// Each agent entry is keyed by apiKey

const agents = new Map<string, Agent>()
const agentsByWallet = new Map<string, Agent>()

export function createAgent(name?: string): Agent & { walletPrivateKey: string } {
  // Generate EVM-compatible wallet (simplified — in prod use ethers.Wallet.createRandom())
  const privateKey = '0x' + crypto.randomBytes(32).toString('hex')
  // Derive address deterministically from private key hash (simplified)
  const address = '0x' + crypto.createHash('sha256').update(privateKey).digest('hex').slice(0, 40)
  const apiKey = 'cc_agent_' + crypto.randomBytes(24).toString('hex')

  const agent: Agent = {
    id: crypto.randomUUID(),
    apiKey,
    walletAddress: address,
    balance: 0,
    freerollUsed: false,
    freerollWon: false,
    totalGames: 0,
    totalWon: 0,
    createdAt: new Date().toISOString(),
    name: name || `Agent_${address.slice(2, 8)}`,
  }

  agents.set(apiKey, agent)
  agentsByWallet.set(address.toLowerCase(), agent)

  return { ...agent, walletPrivateKey: privateKey }
}

export function getAgentByApiKey(apiKey: string): Agent | null {
  return agents.get(apiKey) || null
}

export function getAgentByWallet(address: string): Agent | null {
  return agentsByWallet.get(address.toLowerCase()) || null
}

export function updateAgent(apiKey: string, updates: Partial<Agent>): Agent | null {
  const agent = agents.get(apiKey)
  if (!agent) return null
  const updated = { ...agent, ...updates }
  agents.set(apiKey, updated)
  agentsByWallet.set(updated.walletAddress.toLowerCase(), updated)
  return updated
}

export function verifyApiKey(apiKey: string): boolean {
  return agents.has(apiKey)
}

// Verify EVM wallet signature (simplified)
export function verifyWalletSignature(
  address: string,
  message: string,
  signature: string
): boolean {
  // In production: use ethers.verifyMessage(message, signature) === address
  // For now: check agent exists with that address
  const agent = agentsByWallet.get(address.toLowerCase())
  return !!agent
}

export function getAllAgents(): Agent[] {
  return Array.from(agents.values())
}
