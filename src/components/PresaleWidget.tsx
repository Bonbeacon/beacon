import React, { useState, useEffect } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { useContracts } from "@/contexts/ContractContext";
import { useGetPresaleInfo, useRecordPresaleParticipation } from "@/lib/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { contractsDeployed, TOKENOMICS } from "@/lib/contracts";
import { ethers } from "ethers";

const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "12px",
  padding: "32px 28px",
  display: "flex",
  flexDirection: "column",
  gap: "22px",
  position: "relative",
  overflow: "hidden",
  flex: 1,
};

const lbl: React.CSSProperties = {
  fontFamily: "'Geist Mono', monospace",
  fontSize: "10px",
  letterSpacing: "0.14em",
  textTransform: "uppercase" as const,
  color: "rgba(255,255,255,0.35)",
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

export function PresaleWidget() {
  const { address, isConnected, connect, isCorrectNetwork, switchNetwork } = useWallet();
  const contracts = useContracts();
  const { toast } = useToast();

  const { data: presaleInfo, isLoading, refetch } = useGetPresaleInfo();
  const participate = useRecordPresaleParticipation();

  const [amount, setAmount] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [showReferral, setShowReferral] = useState(false);
  const [txPending, setTxPending] = useState(false);
  const [estimatedBcn, setEstimatedBcn] = useState<number | null>(null);

  // Live estimate from contract (if deployed) or local math
  useEffect(() => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0 || !presaleInfo) {
      setEstimatedBcn(null);
      return;
    }
    const base = Number(amount) / presaleInfo.pricePerBcn;
    const withBonus = referralCode ? base * 1.15 : base;
    setEstimatedBcn(withBonus);
  }, [amount, referralCode, presaleInfo]);

  const handleBuy = async () => {
    if (!address || !amount || isNaN(Number(amount)) || Number(amount) <= 0 || txPending) return;
    if (Number(amount) < 0.01) {
      toast({ title: "Minimum 0.01 PROS", description: "Purchase must be at least 0.01 PROS.", variant: "destructive" });
      return;
    }
    setTxPending(true);
    try {
      let txHash: string;

      if (contracts.contractsDeployed) {
        // ── REAL on-chain transaction ──
        toast({ title: "Confirm in wallet", description: `Sending ${amount} PROS to presale contract…` });
        txHash = await contracts.buyPresale(amount, referralCode);
        toast({ title: "Purchase confirmed", description: `Tx: ${txHash.slice(0,10)}…` });
      } else {
        // ── API-only fallback ──
        txHash = "pending-" + Date.now();
        toast({ title: "Purchase recorded", description: "Contracts not deployed yet — recorded off-chain." });
      }

      // Sync to DB
      participate.mutate({
        data: {
          walletAddress: address,
          txHash,
          prosAmount: Number(amount),
          bcnAmount: estimatedBcn ?? Number(amount) / (presaleInfo?.pricePerBcn ?? 0.001),
          stage: presaleInfo?.currentStage ?? 1,
        }
      }, {
        onSuccess: () => {
          setAmount("");
          setReferralCode("");
          refetch();
        },
        onError: () => {
          toast({ title: "DB sync warning", description: "Tx confirmed on-chain but DB record failed.", variant: "destructive" });
        },
      });
    } catch (err: any) {
      toast({
        title: "Purchase failed",
        description: err?.reason ?? err?.message ?? "Transaction rejected.",
        variant: "destructive",
      });
    } finally {
      setTxPending(false);
    }
  };

  if (isLoading || !presaleInfo) {
    return (
      <div style={{ ...card, minHeight:"400px", justifyContent:"center", alignItems:"center" }}>
        <div style={{ width:"28px", height:"28px", borderRadius:"50%", border:"2px solid rgba(250,255,0,0.2)", borderTopColor:"#FAFF00", animation:"spin 0.8s linear infinite" }} />
      </div>
    );
  }

  const progressPct = Math.min(100, (presaleInfo.stageRaisedUsd / presaleInfo.stageTargetUsd) * 100);
  const stageData = TOKENOMICS.stages[presaleInfo.currentStage - 1];

  return (
    <div style={card} id="presale">
      {/* Accent */}
      <div style={{ position:"absolute", top:0, left:0, width:"160px", height:"160px", background:"radial-gradient(circle at top left, rgba(124,58,237,0.06), transparent 70%)", pointerEvents:"none" }} />

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <span style={{ fontFamily:"'Tomorrow',sans-serif", fontWeight:600, fontSize:"14px", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,255,255,0.9)", display:"block" }}>
            {presaleInfo.stageName}
          </span>
          <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:"11px", color:"rgba(255,255,255,0.35)", marginTop:"4px", display:"block" }}>
            Stage {presaleInfo.currentStage} of 5 · {stageData?.bcnAvailable.toLocaleString()} BCN available
          </span>
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"4px" }}>
          <span className="pill-live">Live</span>
          {!contractsDeployed && (
            <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:"9px", color:"rgba(255,165,0,0.7)", letterSpacing:"0.08em" }}>off-chain</span>
          )}
        </div>
      </div>

      {/* Price */}
      <div style={{ padding:"16px", background:"rgba(255,255,255,0.03)", borderRadius:"8px", border:"1px solid rgba(255,255,255,0.06)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={lbl}>Price per BCN</span>
        <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:"20px", fontWeight:700, color:"#FAFF00", letterSpacing:"0.04em" }}>
          {presaleInfo.pricePerBcn} PROS
        </span>
      </div>

      {/* Stage comparison pills */}
      <div style={{ display:"flex", gap:"4px", flexWrap:"wrap" }}>
        {TOKENOMICS.stages.map((s, i) => {
          const isActive = s.stage === presaleInfo.currentStage;
          const isDone = s.stage < presaleInfo.currentStage;
          return (
            <div key={s.stage} style={{
              padding:"3px 10px", borderRadius:"9999px", fontFamily:"'Geist Mono',monospace", fontSize:"10px",
              letterSpacing:"0.08em",
              background: isActive ? "rgba(250,255,0,0.08)" : isDone ? "rgba(255,255,255,0.03)" : "transparent",
              border: `1px solid ${isActive ? "rgba(250,255,0,0.25)" : "rgba(255,255,255,0.06)"}`,
              color: isActive ? "#FAFF00" : isDone ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.15)",
              textDecoration: isDone ? "line-through" : "none",
            }}>
              {s.pricePerBcn}
            </div>
          );
        })}
      </div>

      {/* Progress */}
      <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
        <div style={{ display:"flex", justifyContent:"space-between" }}>
          <span style={lbl}>Stage Progress</span>
          <span style={{ ...lbl, color:"rgba(255,255,255,0.55)" }}>{progressPct.toFixed(1)}%</span>
        </div>
        <div style={{ height:"3px", background:"rgba(255,255,255,0.06)", borderRadius:"9999px", overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${progressPct}%`, background:"linear-gradient(90deg,#7C3AED,#FAFF00)", borderRadius:"9999px", transition:"width 0.6s ease" }} />
        </div>
        <div style={{ display:"flex", justifyContent:"space-between" }}>
          <span style={{ ...lbl, fontSize:"11px", color:"rgba(255,255,255,0.35)" }}>${presaleInfo.stageRaisedUsd.toLocaleString()} raised</span>
          <span style={{ ...lbl, fontSize:"11px", color:"rgba(255,255,255,0.35)" }}>${presaleInfo.stageTargetUsd.toLocaleString()} target</span>
        </div>
      </div>

      {/* Action */}
      {!isConnected ? (
        <button style={btnPrimary} onClick={connect}
          onMouseEnter={e=>(e.currentTarget.style.opacity="0.85")}
          onMouseLeave={e=>(e.currentTarget.style.opacity="1")}>
          Connect Wallet to Buy
        </button>

      ) : !isCorrectNetwork ? (
        <button style={{ ...btnPrimary, background:"transparent", color:"#ef4444", border:"1px solid rgba(239,68,68,0.3)", cursor:"pointer" }} onClick={switchNetwork}>
          Switch to Pharos
        </button>

      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
          {/* Amount input */}
          <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
            <span style={lbl}>Amount — PROS</span>
            <div style={{ display:"flex", gap:"8px" }}>
              <input
                type="number"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={e=>setAmount(e.target.value)}
                style={{ flex:1, padding:"11px 14px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px", color:"#fff", fontFamily:"'Geist Mono',monospace", fontSize:"14px", outline:"none" }}
                onFocus={e=>(e.currentTarget.style.borderColor="rgba(250,255,0,0.3)")}
                onBlur={e=>(e.currentTarget.style.borderColor="rgba(255,255,255,0.1)")}
              />
              <button
                style={{ ...btnPrimary, width:"72px", flex:"none", opacity: txPending || !amount || Number(amount) <= 0 ? 0.45 : 1 }}
                onClick={handleBuy}
                disabled={txPending || !amount || Number(amount) <= 0}
                onMouseEnter={e=>!txPending&&Number(amount)>0&&(e.currentTarget.style.opacity="0.85")}
                onMouseLeave={e=>(e.currentTarget.style.opacity=txPending||!amount||Number(amount)<=0?"0.45":"1")}
              >
                {txPending ? "…" : "Buy"}
              </button>
            </div>
          </div>

          {/* Referral toggle */}
          <button
            style={{ background:"none", border:"none", padding:0, cursor:"pointer", textAlign:"left", fontFamily:"'Geist Mono',monospace", fontSize:"10px", letterSpacing:"0.1em", textTransform:"uppercase", color: showReferral ? "#7C3AED" : "rgba(255,255,255,0.3)" }}
            onClick={()=>setShowReferral(!showReferral)}
          >
            {showReferral ? "▾" : "▸"} Referral code (+15% bonus BCN)
          </button>
          {showReferral && (
            <input
              type="text"
              placeholder="Enter referral code"
              value={referralCode}
              onChange={e=>setReferralCode(e.target.value)}
              style={{ padding:"10px 14px", background:"rgba(124,58,237,0.06)", border:"1px solid rgba(124,58,237,0.2)", borderRadius:"8px", color:"#fff", fontFamily:"'Geist Mono',monospace", fontSize:"13px", outline:"none" }}
            />
          )}

          {/* Estimated output */}
          {estimatedBcn !== null && estimatedBcn > 0 && (
            <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 14px", background:"rgba(250,255,0,0.04)", border:"1px solid rgba(250,255,0,0.1)", borderRadius:"8px" }}>
              <span style={lbl}>You will receive</span>
              <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:"13px", fontWeight:600, color:"#FAFF00" }}>
                ≈ {Math.floor(estimatedBcn).toLocaleString()} BCN{referralCode ? " (+15%)" : ""}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Referral bonus note */}
      <div style={{ padding:"10px 14px", background:"rgba(124,58,237,0.06)", borderRadius:"8px", border:"1px solid rgba(124,58,237,0.14)" }}>
        <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:"11px", color:"rgba(255,255,255,0.45)", lineHeight:1.7 }}>
          Use a referral code for <span style={{ color:"#7C3AED", fontWeight:600 }}>+15% bonus BCN</span>.
          Tokens unlock <span style={{ color:"rgba(255,255,255,0.65)" }}>June 30, 2026</span>.
        </span>
      </div>
    </div>
  );
}
