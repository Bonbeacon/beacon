/**
 * ContractContext — real on-chain interactions via ethers.js
 *
 * When contracts are deployed and env vars set:
 *   - startMining()  → calls BeaconToken.startSession() with 0.05 PROS
 *   - claimMining()  → calls BeaconToken.claimReward() with 0.05 PROS
 *   - buyPresale()   → calls BeaconPresale.buy(referralCode) with PROS amount
 *   - getOnChainSession() → reads session state from chain
 *
 * When contracts are NOT deployed (env vars missing):
 *   - All functions fall back to API-only mode (records in DB only)
 *   - UI shows "contract not yet deployed" badge
 */

import { createContext, useContext, ReactNode, useCallback } from "react";
import { ethers } from "ethers";
import {
  BCN_TOKEN_ADDRESS,
  PRESALE_ADDRESS,
  BCN_TOKEN_ABI,
  PRESALE_ABI,
  contractsDeployed,
  TOKENOMICS,
} from "@/lib/contracts";

interface OnChainSession {
  startTime: number;
  endTime: number;
  claimed: boolean;
  canClaim: boolean;
  isActive: boolean;
}

interface ContractContextType {
  contractsDeployed: boolean;

  /** Start a 48h mining session. Sends 0.05 PROS to contract. Returns txHash. */
  startMining: () => Promise<string>;

  /** Claim 200 BCN after session. Sends 0.05 PROS to contract. Returns txHash. */
  claimMining: () => Promise<string>;

  /** Buy BCN in the presale. prosAmountEther is a string like "1.5". Returns txHash. */
  buyPresale: (prosAmountEther: string, referralCode?: string) => Promise<string>;

  /** Read on-chain session state. Returns null if contracts not deployed. */
  getOnChainSession: (address: string) => Promise<OnChainSession | null>;

  /** Read on-chain BCN balance for an address. Returns 0 if not deployed. */
  getOnChainBcnBalance: (address: string) => Promise<number>;

  /** Estimate BCN output for a given PROS amount (from contract). */
  estimateBcnOut: (prosEther: string, withReferral?: boolean) => Promise<{ base: number; withBonus: number } | null>;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

function getSigner(): ethers.BrowserProvider {
  if (!window.ethereum) throw new Error("No wallet detected. Install MetaMask.");
  return new ethers.BrowserProvider(window.ethereum);
}

async function getBcnContract(withSigner = true) {
  if (!BCN_TOKEN_ADDRESS) throw new Error("BCN contract not deployed yet.");
  const provider = getSigner();
  const signer = withSigner ? await provider.getSigner() : provider;
  return new ethers.Contract(BCN_TOKEN_ADDRESS, BCN_TOKEN_ABI, signer);
}

async function getPresaleContract(withSigner = true) {
  if (!PRESALE_ADDRESS) throw new Error("Presale contract not deployed yet.");
  const provider = getSigner();
  const signer = withSigner ? await provider.getSigner() : provider;
  return new ethers.Contract(PRESALE_ADDRESS, PRESALE_ABI, signer);
}

export function ContractProvider({ children }: { children: ReactNode }) {

  const startMining = useCallback(async (): Promise<string> => {
    if (!contractsDeployed) throw new Error("Contracts not deployed yet.");
    const contract = await getBcnContract(true);
    const fee = ethers.parseEther(String(TOKENOMICS.miningFeeStart));

    const tx = await contract.startSession({ value: fee });
    const receipt = await tx.wait();
    if (!receipt || receipt.status !== 1) throw new Error("Transaction reverted.");
    return receipt.hash;
  }, []);

  const claimMining = useCallback(async (): Promise<string> => {
    if (!contractsDeployed) throw new Error("Contracts not deployed yet.");
    const contract = await getBcnContract(true);
    const fee = ethers.parseEther(String(TOKENOMICS.miningFeeClaim));

    const tx = await contract.claimReward({ value: fee });
    const receipt = await tx.wait();
    if (!receipt || receipt.status !== 1) throw new Error("Transaction reverted.");
    return receipt.hash;
  }, []);

  const buyPresale = useCallback(async (prosAmountEther: string, referralCode = ""): Promise<string> => {
    if (!contractsDeployed) throw new Error("Contracts not deployed yet.");
    const contract = await getPresaleContract(true);

    const value = ethers.parseEther(prosAmountEther);
    if (value < ethers.parseEther("0.01")) throw new Error("Minimum purchase is 0.01 PROS.");

    const tx = await contract.buy(referralCode, { value });
    const receipt = await tx.wait();
    if (!receipt || receipt.status !== 1) throw new Error("Transaction reverted.");
    return receipt.hash;
  }, []);

  const getOnChainSession = useCallback(async (address: string): Promise<OnChainSession | null> => {
    if (!contractsDeployed) return null;
    try {
      const contract = await getBcnContract(false);
      const result = await contract.getSession(address);
      return {
        startTime: Number(result.startTime),
        endTime:   Number(result.endTime),
        claimed:   result.claimed,
        canClaim:  result.canClaim,
        isActive:  result.isActive,
      };
    } catch {
      return null;
    }
  }, []);

  const getOnChainBcnBalance = useCallback(async (address: string): Promise<number> => {
    if (!contractsDeployed) return 0;
    try {
      const contract = await getBcnContract(false);
      const raw = await contract.balanceOf(address);
      return Number(ethers.formatEther(raw));
    } catch {
      return 0;
    }
  }, []);

  const estimateBcnOut = useCallback(async (prosEther: string, withReferral = false): Promise<{ base: number; withBonus: number } | null> => {
    if (!contractsDeployed) return null;
    try {
      const contract = await getPresaleContract(false);
      const value = ethers.parseEther(prosEther);
      const result = await contract.getBcnForPros(value);
      return {
        base:      Number(ethers.formatEther(result.bcnBase)),
        withBonus: Number(ethers.formatEther(result.withReferral)),
      };
    } catch {
      return null;
    }
  }, []);

  return (
    <ContractContext.Provider value={{
      contractsDeployed,
      startMining,
      claimMining,
      buyPresale,
      getOnChainSession,
      getOnChainBcnBalance,
      estimateBcnOut,
    }}>
      {children}
    </ContractContext.Provider>
  );
}

export function useContracts() {
  const ctx = useContext(ContractContext);
  if (!ctx) throw new Error("useContracts must be inside ContractProvider");
  return ctx;
}
