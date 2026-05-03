import React, { useState, useEffect, useCallback } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { useContracts } from "@/contexts/ContractContext";
import { Lighthouse } from "./Lighthouse";
import { useToast } from "@/hooks/use-toast";
import { contractsDeployed, TOKENOMICS } from "@/lib/contracts";

const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "12px",
  padding: "32px 28px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "24px",
  position: "relative",
  overflow: "hidden",
  flex: 1,
};

const label: React.CSSProperties = {
  fontFamily: "'Geist Mono', monospace",
  fontSize: "10px",
  letterSpacing: "0.14em",
  textTransform: "uppercase" as const,
  color: "rgba(255,255,255,0.35)",
};

const value: React.CSSProperties = {
  fontFamily: "'Geist Mono', monospace",
  fontSize: "30px",
  fontWeight: 700,
  letterSpacing: "0.04em",
  color: "#FAFF00",
  lineHeight: 1,
};

const btnPrimary: React.CSSProperties = {
  width: "100%",
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
  cursor: "pointer",
  transition: "opacity 0.15s",
};

const btnViolet: React.CSSProperties = {
  ...btnPrimary,
  background: "#7C3AED",
  color: "#fff",
};

const btnGhost: React.CSSProperties = {
  ...btnPrimary,
  background: "transparent",
  color: "rgba(255,255,255,0.25)",
  border: "1px solid rgba(255,255,255,0.08)",
  cursor: "default",
};

interface OnChainSession {
  startTime: number;
  endTime: number;
  claimed: boolean;
  canClaim: boolean;
  isActive: boolean;
}

export function MinerWidget() {
  const { address, isConnected, connect, isCorrectNetwork, switchNetwork } = useWallet();
  const contracts = useContracts();
  const { toast } = useToast();

  const [session, setSession] = useState<OnChainSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [status, setStatus] = useState<"idle" | "active" | "ready">("idle");
  const [txPending, setTxPending] = useState(false);

  const fetchSession = useCallback(async () => {
    if (!address || !isConnected || !contractsDeployed) return;
    try {
      const s = await contracts.getOnChainSession(address);
      setSession(s);
    } catch {
      setSession(null);
    }
  }, [address, isConnected, contracts]);

  useEffect(() => {
    if (!isConnected || !address) { setStatus("idle"); return; }
    setLoading(true);
    fetchSession().finally(() => setLoading(false));
    const poll = setInterval(fetchSession, 15000);
    return () => clearInterval(poll);
  }, [isConnected, address, fetchSession]);

  useEffect(() => {
    if (!session || session.claimed || !session.isActive) {
      setStatus("idle");
      return;
    }
    const tick = () => {
      const dist = session.endTime * 1000 - Date.now();
      if (session.canClaim || dist <= 0) {
        setStatus("ready");
        setTimeLeft("00:00:00");
      } else {
        setStatus("active");
        const h = Math.floor(dist / 3600000);
        const m = Math.floor((dist % 3600000) / 60000);
        const s = Math.floor((dist % 60000) / 1000);
        setTimeLeft(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session]);

  const handleStart = async () => {
    if (!address || txPending) return;
    setTxPending(true);
    try {
      toast({ title: "Confirm in wallet", description: "Approve 0.05 PROS in MetaMask…" });
      const txHash = await contracts.startMining();
      toast({ title: "Session started", description: `Tx: ${txHash.slice(0,10)}…` });
      await fetchSession();
    } catch (err: any) {
      toast({ title: "Session failed", description: err?.reason ?? err?.message ?? "Transaction rejected.", variant: "destructive" });
    } finally {
      setTxPending(false);
    }
  };

  const handleClaim = async () => {
    if (!address || txPending) return;
    setTxPending(true);
    try {
      toast({ title: "Confirm in wallet", description: "Approve 0.05 PROS claim fee in MetaMask…" });
      const txHash = await contracts.claimMining();
      toast({ title: `${TOKENOMICS.miningBcnPerSession} BCN claimed!`, description: `Tx: ${txHash.slice(0,10)}…` });
      setSession(null);
      setStatus("idle");
      await fetchSession();
    } catch (err: any) {
      toast({ title: "Claim failed", description: err?.reason ?? err?.message ?? "Transaction rejected.", variant: "destructive" });
    } finally {
      setTxPending(false);
    }
  };

  return (
    <div style={card} id="mine">
      <div style={{ position:"absolute", top:0, right:0, width:"140px", height:"140px", background:"radial-gradient(circle at top right, rgba(250,255,0,0.05), transparent 70%)", pointerEvents:"none" }} />

      <div style={{ width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontFamily:"'Tomorrow', sans-serif", fontWeight:600, fontSize:"14px", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,255,255,0.9)" }}>
          Beacon Node
        </span>
        <span style={{
          fontFamily:"'Geist Mono',monospace", fontSize:"10px", letterSpacing:"0.1em", textTransform:"uppercase",
          color: status==="active" ? "#FAFF00" : status==="ready" ? "#7C3AED" : "rgba(255,255,255,0.2)",
          background: status==="active" ? "rgba(250,255,0,0.07)" : status==="ready" ? "rgba(124,58,237,0.1)" : "rgba(255,255,255,0.03)",
          border:`1px solid ${status==="active" ? "rgba(250,255,0,0.18)" : status==="ready" ? "rgba(124,58,237,0.22)" : "rgba(255,255,255,0.07)"}`,
          padding:"3px 10px", borderRadius:"9999px",
        }}>
          {status==="active" ? "● Transmitting" : status==="ready" ? "● Claim Ready" : "○ Offline"}
        </span>
      </div>

      <Lighthouse status={isConnected ? status : "idle"} />

      {!isConnected ? (
        <div style={{ width:"100%", textAlign:"center", display:"flex", flexDirection:"column", gap:"12px" }}>
          <p style={{ fontFamily:"'Geist Mono',monospace", fontSize:"12px", color:"rgba(255,255,255,0.32)", letterSpacing:"0.04em", lineHeight:1.7 }}>
            Connect your wallet to access<br />the mining terminal.
          </p>
          <button style={btnPrimary} onClick={connect}
            onMouseEnter={e=>(e.currentTarget.style.opacity="0.85")}
            onMouseLeave={e=>(e.currentTarget.style.opacity="1")}>
            Connect Wallet
          </button>
        </div>

      ) : !isCorrectNetwork ? (
        <button style={{ ...btnGhost, color:"#ef4444", border:"1px solid rgba(239,68,68,0.3)", cursor:"pointer" }} onClick={switchNetwork}>
          Switch to Pharos Network
        </button>

      ) : loading ? (
        <div style={{ width:"28px", height:"28px", borderRadius:"50%", border:"2px solid rgba(250,255,0,0.2)", borderTopColor:"#FAFF00", animation:"spin 0.8s linear infinite" }} />

      ) : status === "idle" ? (
        <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:"14px" }}>
          <div style={{ padding:"14px 16px", background:"rgba(255,255,255,0.02)", borderRadius:"8px", border:"1px solid rgba(255,255,255,0.06)", display:"flex", flexDirection:"column", gap:"10px" }}>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={label}>Session Reward</span>
              <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:"13px", fontWeight:600, color:"#FAFF00" }}>{TOKENOMICS.miningBcnPerSession.toLocaleString()} BCN</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={label}>Duration</span>
              <span style={{ ...label, color:"rgba(255,255,255,0.5)" }}>48 hours</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={label}>Start Fee</span>
              <span style={{ ...label, color:"rgba(255,255,255,0.5)" }}>{TOKENOMICS.miningFeeStart} PROS</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={label}>Claim Fee</span>
              <span style={{ ...label, color:"rgba(255,255,255,0.5)" }}>{TOKENOMICS.miningFeeClaim} PROS</span>
            </div>
          </div>
          <div style={{ height:"1px", background:"rgba(255,255,255,0.05)" }} />
          <button
            style={{ ...btnPrimary, opacity: txPending ? 0.5 : 1 }}
            onClick={handleStart}
            disabled={txPending}
            onMouseEnter={e=>!txPending&&(e.currentTarget.style.opacity="0.85")}
            onMouseLeave={e=>(e.currentTarget.style.opacity=txPending?"0.5":"1")}>
            {txPending ? "Waiting for wallet…" : `Start Session — ${TOKENOMICS.miningFeeStart} PROS`}
          </button>
        </div>

      ) : status === "active" ? (
        <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:"14px" }}>
          <div style={{ textAlign:"center" }}>
            <div style={value}>{timeLeft}</div>
            <div style={{ ...label, marginTop:"6px" }}>remaining</div>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <span style={label}>Est. Reward</span>
            <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:"12px", color:"#FAFF00" }}>{TOKENOMICS.miningBcnPerSession.toLocaleString()} BCN</span>
          </div>
          <button style={btnGhost} disabled>Transmitting signal…</button>
        </div>

      ) : (
        <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:"14px" }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ ...value, color:"#7C3AED" }}>{TOKENOMICS.miningBcnPerSession.toLocaleString()} BCN</div>
            <div style={{ ...label, marginTop:"6px" }}>ready to claim</div>
          </div>
          <button
            style={{ ...btnViolet, opacity: txPending ? 0.5 : 1 }}
            onClick={handleClaim}
            disabled={txPending}
            onMouseEnter={e=>!txPending&&(e.currentTarget.style.opacity="0.85")}
            onMouseLeave={e=>(e.currentTarget.style.opacity=txPending?"0.5":"1")}>
            {txPending ? "Waiting for wallet…" : `Claim — ${TOKENOMICS.miningFeeClaim} PROS`}
          </button>
        </div>
      )}
    </div>
  );
}
