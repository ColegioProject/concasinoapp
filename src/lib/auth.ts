import { NextRequest } from 'next/server'
import { getAgentByApiKey, getAgentByWallet, Agent } from './supabase'

export type AuthResult =
  | { ok: true;  agent: Agent; method: 'apikey' | 'wallet' }
  | { ok: false; error: string; status: number }

export async function authenticateAgent(req: NextRequest): Promise<AuthResult> {
  const apiKey =
    req.headers.get('x-api-key') ||
    req.headers.get('authorization')?.replace('Bearer ', '') ||
    req.nextUrl.searchParams.get('apiKey')

  if (apiKey) {
    const agent = await getAgentByApiKey(apiKey)
    if (!agent)          return { ok: false, error: 'Invalid API key', status: 401 }
    if (!agent.is_active) return { ok: false, error: 'Agent account disabled', status: 403 }
    return { ok: true, agent, method: 'apikey' }
  }

  const walletAddress = req.headers.get('x-wallet-address')
  const signature     = req.headers.get('x-wallet-signature')
  const message       = req.headers.get('x-wallet-message')

  if (walletAddress && signature && message) {
    const agent = await getAgentByWallet(walletAddress)
    if (!agent)           return { ok: false, error: 'Wallet not registered as agent', status: 404 }
    if (!agent.is_active) return { ok: false, error: 'Agent account disabled', status: 403 }
    return { ok: true, agent, method: 'wallet' }
  }

  return { ok: false, error: 'No authentication provided. Use x-api-key header or wallet signature.', status: 401 }
}
