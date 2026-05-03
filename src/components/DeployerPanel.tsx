/**
 * DeployerPanel — floating terminal for the presale owner
 *
 * Shows:
 *  - Total PROS balance inside presale contract
 *  - Accumulated deployer share (35% of raised PROS, withdrawable now)
 *  - deployerWithdraw(destination) → pulls the 35% share to any address
 *  - withdrawAll(destination)      → pulls all PROS (post-presale liquidity)
 *
 * Visible only when connected wallet matches VITE_DEPLOYER_ADDRESS.
 */
import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useWallet } from "@/contexts/WalletContext";
import { useContracts } from "@/contexts/ContractContext";
import { useToast } from "@/hooks/use-toast";
import { PRESALE_ADDRESS } from "@/lib/contracts";

const DEPLOYER_ADDRESS = (import.meta.env.VITE_DEPLOYER_ADDRESS || "").toLowerCase();

const lbl: React.CSSProperties = {
  fontFamily: "'Geist Mono', monospace",
  fontSize: "10px",
  letterSpacing: "0.14em",
  textTransform: "uppercase" as const,
  color: "rgba(255,255,255,0.35)",
};

function Row({ label, value, unit = "PROS" }: { label: string; value: string | null; unit?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
      <span style={lbl}>{label}</span>
      <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "13px", fontWeight: 700, color: "#FAFF00" }}>
        {value !== null ? `${value} ${unit}` : "—"}
      </span>
    </div>
  );
}

export function DeployerPanel() {
  const { address, isConnected } = useWallet();
  const contracts = useContracts();
  const { toast } = useToast();

  // ── state ──────────────────────────────────────────────────────────────────
  const [totalBalance, setTotalBalance] = useState<string | null>(null);
  const [deployerShare, setDeployerShare] = useState<string | null>(null);
  const [loadingBal, setLoadingBal] = useState(false);

  const [destination, setDestination] = useState("");
  const [working, setWorking] = useState<"share" | "all" | null>(null);

  const isDeployer =
    isConnected && !!DEPLOYER_ADDRESS && address?.toLowerCase() === DEPLOYER_ADDRESS;

  // ── fetch balances ─────────────────────────────────────────────────────────
  const fetchBalances = useCallback(async () => {
    if (!PRESALE_ADDRESS || !window.ethereum) return;
    setLoadingBal(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const [rawTotal, share] = await Promise.all([
        provider.getBalance(PRESALE_ADDRESS),
        contracts.getDeployerShare(),
      ]);
      setTotalBalance(
        Number(ethers.formatEther(rawTotal)).toLocaleString(undefined, { maximumFractionDigits: 4 }),
      );
      setDeployerShare(
        share.toLocaleString(undefined, { maximumFractionDigits: 4 }),
      );
    } catch {
      setTotalBalance(null);
      setDeployerShare(null);
    } finally {
      setLoadingBal(false);
    }
  }, [contracts]);

  useEffect(() => {
    if (!isDeployer) return;
    fetchBalances();
    const id = setInterval(fetchBalances, 15000);
    return () => clearInterval(id);
  }, [isDeployer, fetchBalances]);

  // ── hooks must be before any conditional return ────────────────────────────
  if (!isDeployer || !DEPLOYER_ADDRESS) return null;

  // ── handlers ───────────────────────────────────────────────────────────────
  const validateDest = () => {
    if (!destination.startsWith("0x") || destination.length !== 42) {
      toast({ title: "Invalid address", description: "Enter a valid 0x wallet address.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleWithdrawShare = async () => {
    if (!validateDest() || working) return;
    setWorking("share");
    try {
      toast({ title: "Confirm in wallet", description: "Withdrawing 35% deployer share from presale…" });
      const tx = await contracts.deployerWithdraw(destination);
      toast({ title: "Withdrawn!", description: `Tx: ${tx.slice(0, 10)}…` });
      setTimeout(fetchBalances, 3000);
    } catch (err: any) {
      toast({ title: "Failed", description: err?.reason ?? err?.message ?? "Transaction rejected.", variant: "destructive" });
    } finally {
      setWorking(null);
    }
  };

  const handleWithdrawAll = async () => {
    if (!validateDest() || working) return;
    setWorking("all");
    try {
      toast({ title: "Confirm in wallet", description: "Withdrawing ALL PROS from presale contract…" });
      const tx = await contracts.withdrawAll(destination);
      toast({ title: "Withdrawn!", description: `Tx: ${tx.slice(0, 10)}…` });
      setTimeout(fetchBalances, 3000);
    } catch (err: any) {
      toast({ title: "Failed", description: err?.reason ?? err?.message ?? "Transaction rejected.", variant: "destructive" });
    } finally {
      setWorking(null);
    }
  };

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 999, width: "310px" }}>
      <div style={{ background: "#0D0D10", border: "1px solid rgba(250,255,0,0.2)", borderRadius: "14px", padding: "18px 20px", boxShadow: "0 20px 60px rgba(0,0,0,0.85)", display: "flex", flexDirection: "column", gap: "14px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#FAFF00", animation: "pulse 1.4s ease-in-out infinite" }} />
            <span style={{ fontFamily: "'Tomorrow', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#FAFF00" }}>
              Overseer Terminal
            </span>
          </div>
          <button onClick={fetchBalances} disabled={loadingBal}
            style={{ background: "none", border: "none", fontFamily: "'Geist Mono', monospace", fontSize: "12px", color: "rgba(255,255,255,0.25)", cursor: "pointer", lineHeight: 1, padding: "2px 4px" }}>
            {loadingBal ? "…" : "↻"}
          </button>
        </div>

        {/* Balance rows */}
        <div style={{ background: "rgba(250,255,0,0.04)", border: "1px solid rgba(250,255,0,0.1)", borderRadius: "8px", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <Row label="Presale contract total" value={totalBalance} />
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", margin: "2px 0" }} />
          <Row label="Your withdrawable share (35%)" value={deployerShare} />
        </div>

        {/* Destination */}
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <span style={lbl}>Destination Wallet</span>
          <input
            type="text"
            placeholder="0x…"
            value={destination}
            onChange={e => setDestination(e.target.value.trim())}
            style={{ padding: "8px 10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "7px", color: "#fff", fontFamily: "'Geist Mono', monospace", fontSize: "12px", outline: "none", width: "100%", boxSizing: "border-box" }}
            onFocus={e => (e.currentTarget.style.borderColor = "rgba(250,255,0,0.3)")}
            onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
          />
        </div>

        {/* Withdraw share */}
        <button onClick={handleWithdrawShare} disabled={!!working || !destination}
          style={{ padding: "10px", background: "#FAFF00", color: "#09090B", border: "none", borderRadius: "9999px", fontFamily: "'Geist Mono', monospace", fontWeight: 700, fontSize: "11px", letterSpacing: "0.09em", textTransform: "uppercase", cursor: !!working || !destination ? "not-allowed" : "pointer", opacity: !!working || !destination ? 0.5 : 1 }}>
          {working === "share" ? "Waiting…" : "Withdraw My Share (35%)"}
        </button>

        {/* Withdraw all */}
        <button onClick={handleWithdrawAll} disabled={!!working || !destination}
          style={{ padding: "10px", background: "transparent", color: "rgba(239,68,68,0.85)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "9999px", fontFamily: "'Geist Mono', monospace", fontWeight: 700, fontSize: "11px", letterSpacing: "0.09em", textTransform: "uppercase", cursor: !!working || !destination ? "not-allowed" : "pointer", opacity: !!working || !destination ? 0.5 : 1 }}
          onMouseEnter={e => { if (!working && destination) e.currentTarget.style.borderColor = "rgba(239,68,68,0.7)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)"; }}>
          {working === "all" ? "Waiting…" : "Withdraw All PROS"}
        </button>

        <p style={{ fontFamily: "'Geist Mono', monospace", fontSize: "10px", color: "rgba(255,255,255,0.15)", lineHeight: 1.6, margin: 0 }}>
          "My Share" = accumulated 35% deployer cut from presale buys.<br />
          "All PROS" = entire contract balance (use post-presale for liquidity).
        </p>

      </div>
    </div>
  );
}
