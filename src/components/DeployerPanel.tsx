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

export function DeployerPanel() {
  const { address, isConnected } = useWallet();
  const contracts = useContracts();
  const { toast } = useToast();

  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);
  const [presaleBalance, setPresaleBalance] = useState<string | null>(null);
  const [loadingBal, setLoadingBal] = useState(false);

  const isDeployer = isConnected && !!DEPLOYER_ADDRESS && address?.toLowerCase() === DEPLOYER_ADDRESS;

  const fetchBalance = useCallback(async () => {
    if (!PRESALE_ADDRESS || !window.ethereum) return;
    setLoadingBal(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const raw = await provider.getBalance(PRESALE_ADDRESS);
      setPresaleBalance(ethers.formatEther(raw));
    } catch {
      setPresaleBalance(null);
    } finally {
      setLoadingBal(false);
    }
  }, []);

  useEffect(() => {
    if (!isDeployer) return;
    fetchBalance();
    const id = setInterval(fetchBalance, 15000);
    return () => clearInterval(id);
  }, [isDeployer, fetchBalance]);

  // Must be after all hooks
  if (!isDeployer || !DEPLOYER_ADDRESS) return null;

  const handleSend = async () => {
    if (!destination || !amount || sending) return;
    if (!destination.startsWith("0x") || destination.length !== 42) {
      toast({ title: "Invalid address", description: "Enter a valid 0x wallet address.", variant: "destructive" });
      return;
    }
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      toast({ title: "Confirm in wallet", description: `Sending ${amount} PROS to ${destination.slice(0, 8)}…` });
      const txHash = await contracts.sendPros(destination, amount);
      toast({ title: "Transfer complete", description: `Tx: ${txHash.slice(0, 10)}…` });
      setDestination("");
      setAmount("");
      setTimeout(fetchBalance, 3000);
    } catch (err: any) {
      toast({ title: "Transfer failed", description: err?.reason ?? err?.message ?? "Transaction rejected.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 999, width: "300px" }}>
      <div style={{ background: "#0D0D10", border: "1px solid rgba(250,255,0,0.2)", borderRadius: "12px", padding: "18px", boxShadow: "0 16px 48px rgba(0,0,0,0.8)" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#FAFF00", animation: "pulse 1.4s ease-in-out infinite" }} />
            <span style={{ fontFamily: "'Tomorrow', sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#FAFF00" }}>
              Overseer
            </span>
          </div>
          <button
            onClick={fetchBalance}
            style={{ background: "none", border: "none", fontFamily: "'Geist Mono', monospace", fontSize: "10px", color: "rgba(255,255,255,0.25)", cursor: "pointer", letterSpacing: "0.06em" }}>
            ↻ Refresh
          </button>
        </div>

        {/* Presale PROS balance */}
        <div style={{ background: "rgba(250,255,0,0.04)", border: "1px solid rgba(250,255,0,0.1)", borderRadius: "8px", padding: "12px 14px", marginBottom: "14px" }}>
          <div style={lbl}>Presale Contract — PROS Collected</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "8px" }}>
            {loadingBal ? (
              <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "2px solid rgba(250,255,0,0.15)", borderTopColor: "#FAFF00", animation: "spin 0.8s linear infinite" }} />
            ) : (
              <>
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "26px", fontWeight: 700, color: "#FAFF00", lineHeight: 1 }}>
                  {presaleBalance !== null
                    ? Number(presaleBalance).toLocaleString(undefined, { maximumFractionDigits: 4 })
                    : "—"}
                </span>
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>PROS</span>
              </>
            )}
          </div>
          {PRESALE_ADDRESS && (
            <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: "10px", color: "rgba(255,255,255,0.15)", marginTop: "6px", letterSpacing: "0.03em" }}>
              {PRESALE_ADDRESS.slice(0, 10)}…{PRESALE_ADDRESS.slice(-6)}
            </div>
          )}
        </div>

        {/* Transfer form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={lbl}>Destination Address</span>
            <input
              type="text"
              placeholder="0x..."
              value={destination}
              onChange={e => setDestination(e.target.value)}
              style={{ padding: "8px 10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "7px", color: "#fff", fontFamily: "'Geist Mono', monospace", fontSize: "12px", outline: "none", width: "100%", boxSizing: "border-box" }}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(250,255,0,0.3)")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={lbl}>Amount (PROS)</span>
            <input
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              style={{ padding: "8px 10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "7px", color: "#fff", fontFamily: "'Geist Mono', monospace", fontSize: "12px", outline: "none", width: "100%", boxSizing: "border-box" }}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(250,255,0,0.3)")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={sending || !destination || !amount || Number(amount) <= 0}
            style={{ padding: "10px", background: "#FAFF00", color: "#09090B", border: "none", borderRadius: "9999px", fontFamily: "'Geist Mono', monospace", fontWeight: 700, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", cursor: sending || !destination || !amount || Number(amount) <= 0 ? "not-allowed" : "pointer", opacity: sending || !destination || !amount || Number(amount) <= 0 ? 0.5 : 1 }}>
            {sending ? "Waiting for wallet…" : "Transfer PROS"}
          </button>
        </div>
      </div>
    </div>
  );
}
