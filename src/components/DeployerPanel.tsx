import React, { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { useContracts } from "@/contexts/ContractContext";
import { useToast } from "@/hooks/use-toast";

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

  const isDeployer = isConnected && address?.toLowerCase() === DEPLOYER_ADDRESS;
  if (!isDeployer || !DEPLOYER_ADDRESS) return null;

  const handleSend = async () => {
    if (!destination || !amount || sending) return;
    if (!destination.startsWith("0x") || destination.length !== 42) {
      toast({ title: "Invalid address", description: "Enter a valid 0x wallet address.", variant: "destructive" }); return;
    }
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" }); return;
    }
    setSending(true);
    try {
      toast({ title: "Confirm in wallet", description: `Sending ${amount} PROS to ${destination.slice(0,8)}…` });
      const txHash = await contracts.sendPros(destination, amount);
      toast({ title: "Transfer complete", description: `Tx: ${txHash.slice(0,10)}…` });
      setDestination(""); setAmount("");
    } catch (err: any) {
      toast({ title: "Transfer failed", description: err?.reason ?? err?.message ?? "Transaction rejected.", variant: "destructive" });
    } finally { setSending(false); }
  };

  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 999, width: "320px" }}>
      <div style={{ background: "#0D0D10", border: "1px solid rgba(250,255,0,0.2)", borderRadius: "12px", padding: "20px", boxShadow: "0 16px 48px rgba(0,0,0,0.7)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#FAFF00", animation: "pulse 1.4s ease-in-out infinite" }} />
          <span style={{ fontFamily: "'Tomorrow', sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#FAFF00" }}>
            Overseer Terminal
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <span style={lbl}>Destination Address</span>
            <input
              type="text"
              placeholder="0x..."
              value={destination}
              onChange={e => setDestination(e.target.value)}
              style={{ padding: "9px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "7px", color: "#fff", fontFamily: "'Geist Mono', monospace", fontSize: "12px", outline: "none" }}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(250,255,0,0.3)")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <span style={lbl}>Amount (PROS)</span>
            <input
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              style={{ padding: "9px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "7px", color: "#fff", fontFamily: "'Geist Mono', monospace", fontSize: "12px", outline: "none" }}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(250,255,0,0.3)")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={sending || !destination || !amount}
            style={{ padding: "11px", background: "#FAFF00", color: "#09090B", border: "none", borderRadius: "9999px", fontFamily: "'Geist Mono', monospace", fontWeight: 700, fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", cursor: sending || !destination || !amount ? "not-allowed" : "pointer", opacity: sending || !destination || !amount ? 0.5 : 1 }}>
            {sending ? "Sending…" : "Transfer PROS"}
          </button>
        </div>
      </div>
    </div>
  );
}
