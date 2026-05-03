import React, { useState, useEffect } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { useContracts } from "@/contexts/ContractContext";
import { useToast } from "@/hooks/use-toast";
import { contractsDeployed, TOKENOMICS } from "@/lib/contracts";

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

const STAGE = TOKENOMICS.stages[0];

export function PresaleWidget() {
  const { address, isConnected, connect, isCorrectNetwork, switchNetwork } = useWallet();
  const contracts = useContracts();
  const { toast } = useToast();

  const [amount, setAmount] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [showReferral, setShowReferral] = useState(false);
  const [txPending, setTxPending] = useState(false);
  const [estimatedBcn, setEstimatedBcn] = useState<number | null>(null);

  useEffect(() => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setEstimatedBcn(null);
      return;
    }
    const base = Number(amount) / STAGE.pricePerBcn;
    const withBonus = referralCode ? base * 1.15 : base;
    setEstimatedBcn(withBonus);
  }, [amount, referralCode]);

  const handleBuy = async () => {
    if (!address || !amount || isNaN(Number(amount)) || Number(amount) <= 0 || txPending) return;
    if (Number(amount) < 0.01) {
      toast({ title: "Minimum 0.01 PROS", description: "Purchase must be at least 0.01 PROS.", variant: "destructive" });
      return;
    }
    setTxPending(true);
    try {
      toast({ title: "Confirm in wallet", description: `Sending ${amount} PROS to presale contract…` });
      const txHash = await contracts.buyPresale(amount, referralCode);
      toast({ title: "Purchase confirmed!", description: `Tx: ${txHash.slice(0, 10)}… BCN will be claimable at unlock.` });
      setAmount("");
      setReferralCode("");
    } catch (err: any) {
      toast({ title: "Purchase failed", description: err?.reason ?? err?.message ?? "Transaction rejected.", variant: "destructive" });
    } finally {
      setTxPending(false);
    }
  };

  return (
    <div style={card} id="presale">
      <div style={{ position:"absolute", top:0, left:0, width:"160px", height:"160px", background:"radial-gradient(circle at top left, rgba(124,58,237,0.06), transparent 70%)", pointerEvents:"none" }} />

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <span style={{ fontFamily:"'Tomorrow',sans-serif", fontWeight:600, fontSize:"14px", letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,255,255,0.9)", display:"block" }}>
            {STAGE.name}
          </span>
          <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:"11px", color:"rgba(255,255,255,0.35)", marginTop:"4px", display:"block" }}>
            Stage 1 of 5 · {STAGE.bcnAvailable.toLocaleString()} BCN available
          </span>
        </div>
        <span className="pill-live">Live</span>
      </div>

      {/* Price */}
      <div style={{ padding:"16px", background:"rgba(255,255,255,0.03)", borderRadius:"8px", border:"1px solid rgba(255,255,255,0.06)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={lbl}>Price per BCN</span>
        <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:"20px", fontWeight:700, color:"#FAFF00", letterSpacing:"0.04em" }}>
          {STAGE.pricePerBcn} PROS
        </span>
      </div>

      {/* Stage pills */}
      <div style={{ display:"flex", gap:"4px", flexWrap:"wrap" }}>
        {TOKENOMICS.stages.map((s) => (
          <div key={s.stage} style={{
            padding:"3px 10px", borderRadius:"9999px", fontFamily:"'Geist Mono',monospace", fontSize:"10px", letterSpacing:"0.08em",
            background: s.stage === 1 ? "rgba(250,255,0,0.08)" : "transparent",
            border: `1px solid ${s.stage === 1 ? "rgba(250,255,0,0.25)" : "rgba(255,255,255,0.06)"}`,
            color: s.stage === 1 ? "#FAFF00" : "rgba(255,255,255,0.15)",
          }}>
            {s.pricePerBcn}
          </div>
        ))}
      </div>

      {/* Target */}
      <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
        <div style={{ display:"flex", justifyContent:"space-between" }}>
          <span style={lbl}>Stage Target</span>
          <span style={{ ...lbl, color:"rgba(255,255,255,0.55)" }}>{STAGE.targetPros.toLocaleString()} PROS</span>
        </div>
        <div style={{ height:"3px", background:"rgba(255,255,255,0.06)", borderRadius:"9999px", overflow:"hidden" }}>
          <div style={{ height:"100%", width:"3%", background:"linear-gradient(90deg,#7C3AED,#FAFF00)", borderRadius:"9999px" }} />
        </div>
        <div style={{ display:"flex", justifyContent:"space-between" }}>
          <span style={{ ...lbl, fontSize:"11px", color:"rgba(255,255,255,0.35)" }}>Stage 1 · The First Light</span>
          <span style={{ ...lbl, fontSize:"11px", color:"rgba(255,255,255,0.35)" }}>Unlock: Jun 30, 2026</span>
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
                onMouseLeave={e=>(e.currentTarget.style.opacity=txPending||!amount||Number(amount)<=0?"0.45":"1")}>
                {txPending ? "…" : "Buy"}
              </button>
            </div>
          </div>

          <button
            style={{ background:"none", border:"none", padding:0, cursor:"pointer", textAlign:"left", fontFamily:"'Geist Mono',monospace", fontSize:"10px", letterSpacing:"0.1em", textTransform:"uppercase", color: showReferral ? "#7C3AED" : "rgba(255,255,255,0.3)" }}
            onClick={()=>setShowReferral(!showReferral)}>
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

      <div style={{ padding:"10px 14px", background:"rgba(124,58,237,0.06)", borderRadius:"8px", border:"1px solid rgba(124,58,237,0.14)" }}>
        <span style={{ fontFamily:"'Geist Mono',monospace", fontSize:"11px", color:"rgba(255,255,255,0.45)", lineHeight:1.7 }}>
          Use a referral code for <span style={{ color:"#7C3AED", fontWeight:600 }}>+15% bonus BCN</span>.
          Tokens unlock <span style={{ color:"rgba(255,255,255,0.65)" }}>June 30, 2026</span>.
        </span>
      </div>
    </div>
  );
}
