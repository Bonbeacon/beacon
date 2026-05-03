/**
 * Contract ABIs and addresses for BEACON ($BCN) on Pharos Mainnet (Chain 1672).
 *
 * Set these env vars after deployment:
 *   VITE_BCN_TOKEN_ADDRESS   — BeaconToken contract address
 *   VITE_PRESALE_ADDRESS     — BeaconPresale contract address
 *
 * Until contracts are deployed, all contract interactions are no-ops
 * and the UI falls back to API-only mode.
 */

export const PHAROS_CHAIN_ID = 1672;

// Contract addresses from env (set after deployment)
export const BCN_TOKEN_ADDRESS = import.meta.env.VITE_BCN_TOKEN_ADDRESS as string | undefined;
export const PRESALE_ADDRESS   = import.meta.env.VITE_PRESALE_ADDRESS   as string | undefined;

export const contractsDeployed = !!(BCN_TOKEN_ADDRESS && PRESALE_ADDRESS);

// ── BeaconToken ABI (functions used by frontend) ──────────────────────────────

export const BCN_TOKEN_ABI = [
  // Mining
  {
    name: "startSession",
    type: "function",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
  {
    name: "claimReward",
    type: "function",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
  {
    name: "getSession",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "miner", type: "address" }],
    outputs: [
      { name: "startTime",  type: "uint256" },
      { name: "endTime",    type: "uint256" },
      { name: "claimed",    type: "bool" },
      { name: "canClaim",   type: "bool" },
      { name: "isActive",   type: "bool" },
    ],
  },
  // Constants
  {
    name: "SESSION_FEE",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "BCN_PER_SESSION",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "MINING_RESERVE",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "miningCapRemaining",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  // ERC-20
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  // Events
  {
    name: "SessionStarted",
    type: "event",
    inputs: [
      { name: "miner",     type: "address", indexed: true },
      { name: "startTime", type: "uint256", indexed: false },
      { name: "endTime",   type: "uint256", indexed: false },
    ],
  },
  {
    name: "RewardClaimed",
    type: "event",
    inputs: [
      { name: "miner",     type: "address", indexed: true },
      { name: "amount",    type: "uint256", indexed: false },
      { name: "totalPaid", type: "uint256", indexed: false },
    ],
  },
] as const;

// ── BeaconPresale ABI (functions used by frontend) ────────────────────────────

export const PRESALE_ABI = [
  // Buy
  {
    name: "buy",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "referralCode", type: "string" }],
    outputs: [],
  },
  // Referral registration
  {
    name: "registerReferralCode",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "code", type: "string" }],
    outputs: [],
  },
  // Views
  {
    name: "getCurrentStageInfo",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "info",
        type: "tuple",
        components: [
          { name: "stageIndex",    type: "uint8" },
          { name: "pricePerBcn",   type: "uint256" },
          { name: "bcnAllocation", type: "uint256" },
          { name: "bcnSold",       type: "uint256" },
          { name: "bcnRemaining",  type: "uint256" },
          { name: "raisedPros",    type: "uint256" },
          { name: "active",        type: "bool" },
        ],
      },
    ],
  },
  {
    name: "getBcnForPros",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "prosAmount", type: "uint256" }],
    outputs: [
      { name: "bcnBase",       type: "uint256" },
      { name: "withReferral",  type: "uint256" },
    ],
  },
  {
    name: "totalBcnPurchased",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "buyer", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "totalRaisedPros",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "currentStage",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    name: "MIN_PURCHASE",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  // Events
  {
    name: "Purchased",
    type: "event",
    inputs: [
      { name: "buyer",       type: "address", indexed: true },
      { name: "prosAmount",  type: "uint256", indexed: false },
      { name: "bcnAmount",   type: "uint256", indexed: false },
      { name: "bonusBcn",    type: "uint256", indexed: false },
      { name: "stage",       type: "uint8",   indexed: false },
      { name: "hadReferral", type: "bool",    indexed: false },
    ],
  },
] as const;

// ── Tokenomics constants (match contracts exactly) ─────────────────────────────

export const TOKENOMICS = {
  totalSupply:       1_000_000_000,
  presaleAlloc:        400_000_000,  // 40%
  miningAlloc:          50_000_000,  // 5%
  teamAlloc:           150_000_000,  // 15%
  treasuryAlloc:       300_000_000,  // 30%
  liquidityAlloc:      100_000_000,  // 10%

  miningBcnPerSession: 200,          // BCN per 48h session
  miningFeeStart:      0.05,         // PROS to start
  miningFeeClaim:      0.05,         // PROS to claim
  miningFeeTotalPros:  0.10,         // PROS per full cycle

  unlockDate: "2026-06-30",
  unlockTimestamp: 1782777600,

  stages: [
    { stage: 1, name: "The First Light",  pricePerBcn: 0.001, bcnAvailable: 80_000_000, targetPros: 80_000 },
    { stage: 2, name: "Signal Rising",    pricePerBcn: 0.002, bcnAvailable: 80_000_000, targetPros: 160_000 },
    { stage: 3, name: "The Beam Widens",  pricePerBcn: 0.003, bcnAvailable: 80_000_000, targetPros: 240_000 },
    { stage: 4, name: "Storm Season",     pricePerBcn: 0.004, bcnAvailable: 80_000_000, targetPros: 320_000 },
    { stage: 5, name: "Full Spectrum",    pricePerBcn: 0.005, bcnAvailable: 80_000_000, targetPros: 400_000 },
  ],
} as const;
