import { createWalletClient, createPublicClient, http, parseUnits, formatUnits, encodeFunctionData } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { base } from 'viem/chains'

// Base mainnet USDC contract
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const
const USDC_DECIMALS = 6

// ERC-20 minimal ABI
const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to',    type: 'address' },
      { name: 'value', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'transferFrom',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'from',  type: 'address' },
      { name: 'to',    type: 'address' },
      { name: 'value', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
] as const

// ── Clients ────────────────────────────────────────────────────
const rpcUrl = process.env.BASE_RPC_URL || 'https://mainnet.base.org'

export const publicClient = createPublicClient({
  chain: base,
  transport: http(rpcUrl),
})

function getHotWallet() {
  const pk = process.env.HOT_WALLET_PRIVATE_KEY
  if (!pk) throw new Error('HOT_WALLET_PRIVATE_KEY not set')
  return privateKeyToAccount(pk as `0x${string}`)
}

function getWalletClient() {
  const account = getHotWallet()
  return createWalletClient({
    account,
    chain: base,
    transport: http(rpcUrl),
  })
}

// ── Hot wallet address (public, for deposits) ─────────────────
export function getHotWalletAddress(): string {
  return getHotWallet().address
}

// ── cents ↔ USDC conversion ───────────────────────────────────
// We store amounts as cents ($1.00 = 100 cents)
// USDC has 6 decimals ($1.00 = 1_000_000 units)
export function centsToUsdc(cents: number): bigint {
  // cents * 10_000 = USDC units (6 decimals)
  return BigInt(cents) * BigInt(10_000)
}

export function usdcToCents(units: bigint): number {
  return Number(units / BigInt(10_000))
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

// ── Check hot wallet USDC balance ────────────────────────────
export async function getHotWalletBalance(): Promise<{ cents: number; usdc: string }> {
  const address = getHotWallet().address
  const raw = await publicClient.readContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address],
  }) as bigint

  const cents = usdcToCents(raw)
  return { cents, usdc: formatUnits(raw, USDC_DECIMALS) }
}

// ── Check any address USDC balance ───────────────────────────
export async function getAddressUsdcBalance(address: string): Promise<bigint> {
  return await publicClient.readContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
  }) as bigint
}

// ── Send USDC FROM hot wallet TO player (payout) ─────────────
export async function sendUsdc(
  toAddress: string,
  cents: number
): Promise<{ txHash: string; amount: string }> {
  if (cents <= 0) throw new Error('Amount must be positive')

  const walletClient = getWalletClient()
  const amount = centsToUsdc(cents)

  // Check balance first
  const { cents: balance } = await getHotWalletBalance()
  if (balance < cents) {
    throw new Error(`Hot wallet insufficient balance. Have: ${formatCents(balance)}, Need: ${formatCents(cents)}`)
  }

  const hash = await walletClient.writeContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'transfer',
    args: [toAddress as `0x${string}`, amount],
  })

  // Wait for confirmation
  const receipt = await publicClient.waitForTransactionReceipt({ hash })
  if (receipt.status !== 'success') throw new Error('Transaction failed on-chain')

  return {
    txHash: hash,
    amount: formatUnits(amount, USDC_DECIMALS),
  }
}

// ── Verify incoming deposit ───────────────────────────────────
// Call this to confirm a user's deposit tx actually sent USDC to hot wallet
export async function verifyDeposit(txHash: string): Promise<{
  valid: boolean
  from: string
  amount: bigint
  cents: number
} | null> {
  try {
    const receipt = await publicClient.getTransactionReceipt({
      hash: txHash as `0x${string}`,
    })

    if (!receipt || receipt.status !== 'success') return null

    const hotWallet = getHotWallet().address.toLowerCase()

    // Parse Transfer event logs from USDC contract
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== USDC_ADDRESS.toLowerCase()) continue
      // Transfer(address indexed from, address indexed to, uint256 value)
      // topic[0] = keccak256("Transfer(address,address,uint256)")
      const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
      if (log.topics[0] !== TRANSFER_TOPIC) continue
      if (log.topics.length < 3) continue

      const topic1 = log.topics[1]
      const topic2 = log.topics[2]
      if (!topic1 || !topic2) continue

      const to = '0x' + topic2.slice(26)
      if (to.toLowerCase() !== hotWallet) continue

      const amount = BigInt(log.data)
      const cents  = usdcToCents(amount)
      const from   = '0x' + topic1.slice(26)

      return { valid: true, from, amount, cents }
    }

    return null
  } catch {
    return null
  }
}

// ── Freeroll payout ($5) ──────────────────────────────────────
export const FREEROLL_CENTS = 500  // $5.00

export async function payFreerollWin(toAddress: string): Promise<string> {
  const { txHash } = await sendUsdc(toAddress, FREEROLL_CENTS)
  return txHash
}
