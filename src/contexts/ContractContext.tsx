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
  startMining: () => Promise<string>;
  claimMining: () => Promise<string>;
  buyPresale: (prosAmountEther: string, referralCode?: string) => Promise<string>;
  getOnChainSession: (address: string) => Promise<OnChainSession | null>;
  getOnChainBcnBalance: (address: string) => Promise<number>;
  estimateBcnOut: (prosEther: string, withReferral?: boolean) => Promise<{ base: number; withBonus: number } | null>;
  registerReferral: (code: string) => Promise<string>;
  /** Returns true if this address has registered a referral code on-chain */
  hasRegisteredReferral: (address: string) => Promise<boolean>;
  /** Withdraw 35% deployer share from presale contract */
  deployerWithdraw: (destination: string) => Promise<string>;
  /** Withdraw all PROS from presale contract */
  withdrawAll: (destination: string) => Promise<string>;
  /** Get accumulated deployer share in presale contract */
  getDeployerShare: () => Promise<number>;
  sendPros: (toAddress: string, amountEther: string) => Promise<string>;
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

  const registerReferral = useCallback(async (code: string): Promise<string> => {
    if (!contractsDeployed) throw new Error("Contracts not deployed yet.");
    const contract = await getPresaleContract(true);
    const tx = await contract.registerReferralCode(code);
    const receipt = await tx.wait();
    if (!receipt || receipt.status !== 1) throw new Error("Transaction reverted.");
    return receipt.hash;
  }, []);

  /**
   * Returns true if this address has registered a referral code on-chain.
   * The contract stores the code as keccak256 hash — plain text is NOT on-chain.
   * bytes32(0) means not registered.
   */
  const hasRegisteredReferral = useCallback(async (address: string): Promise<boolean> => {
    if (!contractsDeployed) return false;
    try {
      const contract = await getPresaleContract(false);
      const hash: string = await contract.referralCodeHash(address);
      return hash !== "0x0000000000000000000000000000000000000000000000000000000000000000";
    } catch {
      return false;
    }
  }, []);

  const deployerWithdraw = useCallback(async (destination: string): Promise<string> => {
    if (!contractsDeployed) throw new Error("Contracts not deployed yet.");
    const contract = await getPresaleContract(true);
    const tx = await contract.deployerWithdraw(destination);
    const receipt = await tx.wait();
    if (!receipt || receipt.status !== 1) throw new Error("Transaction reverted.");
    return receipt.hash;
  }, []);

  const withdrawAll = useCallback(async (destination: string): Promise<string> => {
    if (!contractsDeployed) throw new Error("Contracts not deployed yet.");
    const contract = await getPresaleContract(true);
    const tx = await contract.withdrawAll(destination);
    const receipt = await tx.wait();
    if (!receipt || receipt.status !== 1) throw new Error("Transaction reverted.");
    return receipt.hash;
  }, []);

  const getDeployerShare = useCallback(async (): Promise<number> => {
    if (!contractsDeployed) return 0;
    try {
      const contract = await getPresaleContract(false);
      const raw = await contract.deployerSharePros();
      return Number(ethers.formatEther(raw));
    } catch {
      return 0;
    }
  }, []);

  const sendPros = useCallback(async (toAddress: string, amountEther: string): Promise<string> => {
    const provider = getSigner();
    const signer = await provider.getSigner();
    const tx = await signer.sendTransaction({
      to: toAddress,
      value: ethers.parseEther(amountEther),
    });
    const receipt = await tx.wait();
    if (!receipt || receipt.status !== 1) throw new Error("Transaction reverted.");
    return receipt.hash;
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
      registerReferral,
      hasRegisteredReferral,
      deployerWithdraw,
      withdrawAll,
      getDeployerShare,
      sendPros,
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
