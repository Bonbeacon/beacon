import React, { useState, useEffect, useRef } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { useContracts } from "@/contexts/ContractContext";
import { useToast } from "@/hooks/use-toast";

const VIRAL_TEXTS = [
  "🚨 The signal is live. $BCN just launched on Pharos Mainnet and early miners are already stacking. 200 BCN per 48h session. Stage 1 presale is 0.001 PROS — next stage doubles the price. Don't miss the first beacon. Use my link:",
  "⚡ I'm mining $BEACON on Pharos and the presale is still Stage 1. 80M BCN at 0.001 PROS — then it's gone forever. This is the earliest you can get in. My referral link (+15% bonus BCN):",
  "📡 BEACON ($BCN) is transmitting from Pharos Chain. The first DeFi signal. Mine daily. Buy the presale before Stage 2. 10× target ROI baked into the tokenomics. Get in early with my link:",
  "🛰️ Just started mining $BCN on Pharos. 200 BCN every 48 hours, 5-stage presale with unlock June 30. Devs can't sell before community does. This is the move. Use my referral for +15% bonus:",
];

function getViralText(_code: string, link: string) {
  const base = VIRAL_TEXTS[Math.floor(Math.random() * VIRAL_TEXTS.length)];
  return `${base} ${link} #BCN #BEACON #Pharos #DeFi #Crypto #Web3 #Altcoin #Presale`;
}

const LS_KEY = (addr: string) => `bcn_ref_${addr.toLowerCase()}`;

const lbl: React.CSSProperties = {
  fontFamily: "'Geist Mono', monospace",
  fontSize: "10px",
  letterSpacing: "0.14em",
  textTransform: "uppercase" as const,
  color: "rgba(255,255,255,0.35)",
};

export function ReferralSection() {
  const { address, isConnected, connect } = useWallet();
  const contracts = useContracts();
  const { toast } = useToast();

  const [code, setCode] = useState("");
  const [registeredCode, setRegisteredCode] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const [copied, setCopied] = useState(false);

  // Track last known address to detect wallet switch vs simple disconnect
  const lastAddrRef = useRef<string | null>(null);

  useEffect(() => {
    if (address) {
      // New address connected — load from localStorage for this wallet
      lastAddrRef.current = address;
      const saved = localStorage.getItem(LS_KEY(address));
      setRegisteredCode(saved ?? null);
    }
    // If address is null (disconnected), keep showing the last code —
    // it will be refreshed when the user reconnects.
  }, [address]);

  const siteBase = typeof window !== "undefined"
    ? window.location.origin
    : "https://beacon-steel-one.vercel.app";
  const refLink = registeredCode
    ? `${siteBase}/?ref=${encodeURIComponent(registeredCode)}`
    : "";

  const handleRegister = async () => {
    if (!code.trim() || registering) return;
    if (code.trim().length < 3 || code.trim().length > 20) {
      toast({ title: "Invalid code", description: "Code must be 3–20 characters.", variant: "destructive" });
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(code.trim())) {
      toast({ title: "Invalid code", description: "Letters, numbers and underscores only.", variant: "destructive" });
      return;
    }
    setRegistering(true);
    try {
      toast({ title: "Confirm in wallet", description: "Register your referral code on-chain…" });
      const finalCode = code.trim().toUpperCase();
      await contracts.registerReferral(finalCode);
      setRegisteredCode(finalCode);
      // Persist to localStorage so it survives disconnect/reconnect
      const addrKey = address ?? lastAddrRef.current;
      if (addrKey) localStorage.setItem(LS_KEY(addrKey), finalCode);
      toast({ title: "Referral code registered!", description: `Code "${finalCode}" is now live on-chain.` });
    } catch (err: any) {
      toast({
        title: "Registration failed",
        description: err?.reason ?? err?.message ?? "Try a different code — it may already be taken.",
        variant: "destructive",
      });
    } finally {
      setRegistering(false);
    }
  };

  const handleCopy = () => {
    if (!refLink) return;
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: "Referral link copied to clipboard." });
  };

  const handleShareX = () => {
    if (!registeredCode) return;
    const text = getViralText(registeredCode, refLink);
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", width: "100%" }}>
      {/* Header */}
      <div style={{ marginBottom: "40px" }}>
        <span style={{ ...lbl, color: "rgba(124,58,237,0.7)" }}>Grow the network</span>
        <h2 style={{ fontFamily: "'Tomorrow', sans-serif", fontWeight: 700, fontSize: "clamp(22px, 3vw, 32px)", color: "#fff", marginTop: "8px", lineHeight: 1.1 }}>
          Referral Program
        </h2>
        <p style={{ fontFamily: "'Geist Mono', monospace", fontSize: "12px", color: "rgba(255,255,255,0.35)", marginTop: "10px", lineHeight: 1.8 }}>
          Register your unique code on-chain. Every presale buyer who uses your link gets{" "}
          <span style={{ color: "#7C3AED" }}>+15% bonus BCN</span>.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>

        {/* ── Panel 1: Register or show code ── */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "28px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ fontFamily: "'Tomorrow', sans-serif", fontWeight: 600, fontSize: "13px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>
            1. Register Your Code
          </div>

          {/* Always show active code if we have one, regardless of connection state */}
          {registeredCode ? (
            <div style={{ padding: "14px 16px", background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: "8px" }}>
              <div style={lbl}>Your active code</div>
              <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: "20px", fontWeight: 700, color: "#7C3AED", marginTop: "6px", letterSpacing: "0.1em" }}>
                {registeredCode}
              </div>
              {!isConnected && (
                <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: "10px", color: "rgba(255,255,255,0.25)", marginTop: "8px" }}>
                  Reconnect wallet to share
                </div>
              )}
            </div>
          ) : !isConnected ? (
            <button
              onClick={connect}
              style={{ padding: "12px", background: "#FAFF00", color: "#09090B", border: "none", borderRadius: "9999px", fontFamily: "'Geist Mono', monospace", fontWeight: 700, fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
              Connect Wallet First
            </button>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <span style={lbl}>Choose a code (3–20 chars, A-Z 0-9 _)</span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    placeholder="e.g. SIGNAL42"
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ""))}
                    maxLength={20}
                    style={{ flex: 1, padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontFamily: "'Geist Mono', monospace", fontSize: "14px", letterSpacing: "0.08em", outline: "none" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "rgba(124,58,237,0.4)")}
                    onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                  />
                  <button
                    onClick={handleRegister}
                    disabled={registering || !code.trim()}
                    style={{ padding: "10px 18px", background: "#7C3AED", color: "#fff", border: "none", borderRadius: "8px", fontFamily: "'Geist Mono', monospace", fontWeight: 700, fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", cursor: registering || !code.trim() ? "not-allowed" : "pointer", opacity: registering || !code.trim() ? 0.45 : 1 }}
                    onMouseEnter={e => !registering && code.trim() && (e.currentTarget.style.opacity = "0.85")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = registering || !code.trim() ? "0.45" : "1")}>
                    {registering ? "…" : "Register"}
                  </button>
                </div>
              </div>
              <p style={{ fontFamily: "'Geist Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.25)", lineHeight: 1.6 }}>
                Registration is a one-time on-chain transaction. Code is permanent and unique.
              </p>
            </>
          )}
        </div>

        {/* ── Panel 2: Share & Earn ── */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "28px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ fontFamily: "'Tomorrow', sans-serif", fontWeight: 600, fontSize: "13px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>
            2. Share &amp; Earn
          </div>

          {!registeredCode ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.2)", textAlign: "center", letterSpacing: "0.06em" }}>
                Register your code first to<br />unlock your referral link
              </span>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <span style={lbl}>Your referral link</span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <div style={{ flex: 1, padding: "10px 14px", background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.18)", borderRadius: "8px", fontFamily: "'Geist Mono', monospace", fontSize: "11px", color: "#7C3AED", letterSpacing: "0.04em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {refLink}
                  </div>
                  <button
                    onClick={handleCopy}
                    style={{ padding: "10px 14px", background: copied ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.05)", border: `1px solid ${copied ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.1)"}`, borderRadius: "8px", fontFamily: "'Geist Mono', monospace", fontSize: "11px", color: copied ? "#7C3AED" : "rgba(255,255,255,0.5)", cursor: "pointer", whiteSpace: "nowrap" }}>
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <button
                onClick={handleShareX}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "13px 0", background: "#000", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "9999px", fontFamily: "'Geist Mono', monospace", fontWeight: 700, fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.266 5.638 5.898-5.638Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Share on X
              </button>

              <div style={{ padding: "10px 14px", background: "rgba(250,255,0,0.03)", border: "1px solid rgba(250,255,0,0.08)", borderRadius: "8px" }}>
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.35)", lineHeight: 1.7 }}>
                  When someone buys using your link they get{" "}
                  <span style={{ color: "#FAFF00" }}>+15% bonus BCN</span> automatically on-chain.
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
