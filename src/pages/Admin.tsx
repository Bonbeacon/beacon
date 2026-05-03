import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useWallet } from "@/contexts/WalletContext";
import { useContracts } from "@/contexts/ContractContext";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { PRESALE_ADDRESS, contractsDeployed } from "@/lib/contracts";

const lbl: React.CSSProperties = {
  fontFamily: "'Geist Mono', monospace",
  fontSize: "10px",
  letterSpacing: "0.14em",
  textTransform: "uppercase" as const,
  color: "rgba(255,255,255,0.35)",
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  color: "#fff",
  fontFamily: "'Geist Mono', monospace",
  fontSize: "13px",
  outline: "none",
  boxSizing: "border-box" as const,
};

export default function Admin() {
  const { address, isConnected, connect, isCorrectNetwork, switchNetwork } = useWallet();
  const contracts = useContracts();
  const { toast } = useToast();

  const [presaleBalance, setPresaleBalance] = useState<string | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);

  const fetchPresaleBalance = useCallback(async () => {
    if (!contractsDeployed || !PRESALE_ADDRESS) return;
    setLoadingBalance(true);
    try {
      if (!window.ethereum) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const raw = await provider.getBalance(PRESALE_ADDRESS);
      setPresaleBalance(ethers.formatEther(raw));
    } catch {
      setPresaleBalance(null);
    } finally {
      setLoadingBalance(false);
    }
  }, []);

  useEffect(() => {
    fetchPresaleBalance();
    const id = setInterval(fetchPresaleBalance, 20000);
    return () => clearInterval(id);
  }, [fetchPresaleBalance]);

  const handleTransfer = async () => {
    if (!destination || !amount || sending) return;
    if (!destination.startsWith("0x") || destination.length !== 42) {
      toast({ title: "Invalid address", description: "Enter a valid 0x address.", variant: "destructive" });
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
      fetchPresaleBalance();
    } catch (err: any) {
      toast({
        title: "Transfer failed",
        description: err?.reason ?? err?.message ?? "Transaction rejected.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#09090B", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: "640px", margin: "0 auto", padding: "60px 24px", width: "100%" }}>
        {/* Header */}
        <div style={{ marginBottom: "48px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#FAFF00", animation: "pulse 1.4s ease-in-out infinite" }} />
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(250,255,0,0.6)" }}>
              Restricted
            </span>
          </div>
          <h1 style={{ fontFamily: "'Tomorrow', sans-serif", fontWeight: 800, fontSize: "clamp(28px,5vw,42px)", color: "#fff", letterSpacing: "-0.01em", lineHeight: 1 }}>
            Overseer<br /><span style={{ color: "#FAFF00" }}>Terminal</span>
          </h1>
        </div>

        {!isConnected ? (
          <button
            onClick={connect}
            style={{ width: "100%", padding: "14px", background: "#FAFF00", color: "#09090B", border: "none", borderRadius: "9999px", fontFamily: "'Geist Mono', monospace", fontWeight: 700, fontSize: "13px", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
            Connect Wallet
          </button>
        ) : !isCorrectNetwork ? (
          <button
            onClick={switchNetwork}
            style={{ width: "100%", padding: "14px", background: "transparent", color: "#ef4444", border: "1px solid #ef4444", borderRadius: "9999px", fontFamily: "'Geist Mono', monospace", fontWeight: 700, fontSize: "13px", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
            Switch to Pharos Network
          </button>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Presale balance */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "24px 28px" }}>
              <div style={lbl}>Presale Contract — PROS Balance</div>
              <div style={{ marginTop: "12px", display: "flex", alignItems: "baseline", gap: "10px" }}>
                {loadingBalance ? (
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: "2px solid rgba(250,255,0,0.2)", borderTopColor: "#FAFF00", animation: "spin 0.8s linear infinite" }} />
                ) : (
                  <>
                    <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "36px", fontWeight: 700, color: "#FAFF00", lineHeight: 1 }}>
                      {presaleBalance !== null
                        ? Number(presaleBalance).toLocaleString(undefined, { maximumFractionDigits: 4 })
                        : "—"}
                    </span>
                    <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "14px", color: "rgba(255,255,255,0.35)" }}>PROS</span>
                  </>
                )}
              </div>
              {PRESALE_ADDRESS && (
                <div style={{ marginTop: "10px", fontFamily: "'Geist Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>
                  {PRESALE_ADDRESS}
                </div>
              )}
              <button
                onClick={fetchPresaleBalance}
                style={{ marginTop: "12px", background: "none", border: "none", fontFamily: "'Geist Mono', monospace", fontSize: "11px", letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)", cursor: "pointer", textDecoration: "underline", padding: 0 }}>
                Refresh
              </button>
            </div>

            {/* Transfer */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "24px 28px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ fontFamily: "'Tomorrow', sans-serif", fontWeight: 600, fontSize: "13px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>
                Transfer PROS
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={lbl}>Destination Address</span>
                <input
                  type="text"
                  placeholder="0x..."
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  style={input}
                  onFocus={e => (e.currentTarget.style.borderColor = "rgba(250,255,0,0.3)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={lbl}>Amount (PROS)</span>
                <input
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  style={input}
                  onFocus={e => (e.currentTarget.style.borderColor = "rgba(250,255,0,0.3)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>

              <button
                onClick={handleTransfer}
                disabled={sending || !destination || !amount || Number(amount) <= 0}
                style={{
                  padding: "13px 0",
                  background: "#FAFF00",
                  color: "#09090B",
                  border: "none",
                  borderRadius: "9999px",
                  fontFamily: "'Geist Mono', monospace",
                  fontWeight: 700,
                  fontSize: "12px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  cursor: sending || !destination || !amount || Number(amount) <= 0 ? "not-allowed" : "pointer",
                  opacity: sending || !destination || !amount || Number(amount) <= 0 ? 0.45 : 1,
                }}
                onMouseEnter={e => { if (!sending && destination && Number(amount) > 0) e.currentTarget.style.opacity = "0.85"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = sending || !destination || !amount || Number(amount) <= 0 ? "0.45" : "1"; }}>
                {sending ? "Waiting for wallet…" : "Transfer PROS"}
              </button>

              <p style={{ fontFamily: "'Geist Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.2)", lineHeight: 1.6, margin: 0 }}>
                This sends PROS from your connected wallet. Only the wallet that signed the transaction can authorize the transfer.
              </p>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
