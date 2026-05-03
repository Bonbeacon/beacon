/**
 * ReferralSection
 *
 * The presale contract stores referral codes as keccak256 hashes — NOT plain text.
 * This means we can check ON-CHAIN whether a wallet has registered (hash != bytes32(0)),
 * but we CANNOT retrieve the plain text from chain (by design, for privacy).
 *
 * Strategy:
 *  1. On wallet connect → call hasRegisteredReferral(address) on-chain
 *  2. If true  → look up plain text in localStorage (saved at registration time)
 *  3. If true but localStorage empty → show "Restore" UI (user types their code, we verify hash)
 *  4. If false → show register form
 *  5. On successful register → save plain text to localStorage + set state
 */
import React, { useState, useEffect, useCallback, useRef } from "react";
import { ethers } from "ethers";
import { useWallet } from "@/contexts/WalletContext";
import { useContracts } from "@/contexts/ContractContext";
import { useToast } from "@/hooks/use-toast";

/* ── constants ─────────────────────────────────────────────────────────────── */

const MIN_CODE_LEN = 6;   // matches contract: require(bytes(code).length >= 6)
const MAX_CODE_LEN = 32;  // matches contract: require(bytes(code).length <= 32)

function lsKey(addr: string) { return `bcn_ref_v2_${addr.toLowerCase()}`; }

function saveCode(addr: string, code: string) {
  try { localStorage.setItem(lsKey(addr), code); } catch {}
}
function loadCode(addr: string): string {
  try { return localStorage.getItem(lsKey(addr)) ?? ""; } catch { return ""; }
}

/** keccak256(abi.encodePacked(code)) — mirrors what the contract computes */
function hashCode(code: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(code));
}

const VIRAL = [
  "🚨 $BCN just launched on Pharos Mainnet. 200 BCN per 48h mining session. Stage 1 presale at 0.001 PROS — next stage doubles the price. Use my link for +15% bonus BCN:",
  "⚡ Mining $BEACON on Pharos. Stage 1 presale still open — 80M BCN at 0.001 PROS. Get in early with my referral (+15% bonus):",
  "📡 BEACON ($BCN) on Pharos Chain. 5-stage presale, unlock June 30 2026. Devs locked same as community. Get in before Stage 2:",
  "🛰️ Mining $BCN on Pharos — 200 BCN every 48h. Stage 1 presale at 0.001 PROS. Use my referral for +15% bonus on your buy:",
];

function tweet(link: string) {
  const base = VIRAL[Math.floor(Math.random() * VIRAL.length)];
  return `${base} ${link} #BCN #BEACON #Pharos #DeFi #Crypto #Presale`;
}

/* ── styles ─────────────────────────────────────────────────────────────────── */

const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "12px",
  padding: "28px 24px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};
const lbl: React.CSSProperties = {
  fontFamily: "'Geist Mono', monospace",
  fontSize: "10px",
  letterSpacing: "0.14em",
  textTransform: "uppercase" as const,
  color: "rgba(255,255,255,0.35)",
};
const sTitle: React.CSSProperties = {
  fontFamily: "'Tomorrow', sans-serif",
  fontWeight: 600,
  fontSize: "13px",
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  color: "rgba(255,255,255,0.7)",
};
const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: "10px 14px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  color: "#fff",
  fontFamily: "'Geist Mono', monospace",
  fontSize: "14px",
  letterSpacing: "0.08em",
  outline: "none",
};
const btnPurple: React.CSSProperties = {
  padding: "10px 18px",
  background: "#7C3AED",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  fontFamily: "'Geist Mono', monospace",
  fontWeight: 700,
  fontSize: "12px",
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  whiteSpace: "nowrap" as const,
  cursor: "pointer",
};

/* ── component ──────────────────────────────────────────────────────────────── */

type Phase =
  | "idle"          // not connected
  | "checking"      // querying chain
  | "unregistered"  // connected, no on-chain registration
  | "registered"    // registered + plain text code available
  | "restore";      // registered on-chain but localStorage cleared — ask user to re-enter

export function ReferralSection() {
  const { address, isConnected, connect } = useWallet();
  const contracts = useContracts();
  const { toast } = useToast();

  const [phase, setPhase] = useState<Phase>("idle");
  const [code, setCode] = useState("");          // confirmed registered code (plain text)
  const [inputVal, setInputVal] = useState("");  // input field value
  const [working, setWorking] = useState(false); // register / restore in progress
  const [copied, setCopied] = useState(false);

  const lastAddr = useRef<string | null>(null);

  /* ── check on-chain status when wallet connects ── */
  const checkChain = useCallback(async (addr: string) => {
    setPhase("checking");
    try {
      const registered = await contracts.hasRegisteredReferral(addr);
      if (!registered) { setPhase("unregistered"); return; }

      // On-chain: registered. Look for plain text in localStorage.
      const cached = loadCode(addr);
      if (cached) {
        setCode(cached);
        setPhase("registered");
      } else {
        // Registered but localStorage is empty — need the user to re-enter their code
        setPhase("restore");
      }
    } catch {
      // RPC error — try localStorage as fallback
      const cached = loadCode(addr);
      if (cached) { setCode(cached); setPhase("registered"); }
      else { setPhase("unregistered"); }
    }
  }, [contracts]);

  useEffect(() => {
    if (address && address !== lastAddr.current) {
      lastAddr.current = address;
      checkChain(address);
    } else if (!address) {
      // Disconnected — keep phase/code visible (read-only)
    }
  }, [address, checkChain]);

  /* ── register new code ── */
  const handleRegister = async () => {
    if (!address || working) return;
    const clean = inputVal.trim().toUpperCase();
    if (clean.length < MIN_CODE_LEN) {
      toast({ title: "Too short", description: `Minimum ${MIN_CODE_LEN} characters.`, variant: "destructive" }); return;
    }
    if (clean.length > MAX_CODE_LEN) {
      toast({ title: "Too long", description: `Maximum ${MAX_CODE_LEN} characters.`, variant: "destructive" }); return;
    }
    if (!/^[A-Z0-9_]+$/.test(clean)) {
      toast({ title: "Invalid characters", description: "Use A-Z, 0-9, and _ only.", variant: "destructive" }); return;
    }
    setWorking(true);
    try {
      toast({ title: "Confirm in MetaMask", description: "Registering your referral code on-chain…" });
      await contracts.registerReferral(clean);
      saveCode(address, clean);
      setCode(clean);
      setPhase("registered");
      setInputVal("");
      toast({ title: `"${clean}" registered!`, description: "Your referral code is now live on Pharos." });
    } catch (err: any) {
      const msg = err?.reason ?? err?.message ?? "Code may be taken or transaction rejected.";
      toast({ title: "Registration failed", description: msg, variant: "destructive" });
    } finally {
      setWorking(false);
    }
  };

  /* ── restore: user re-enters their code, we verify the hash on-chain ── */
  const handleRestore = async () => {
    if (!address || working) return;
    const clean = inputVal.trim().toUpperCase();
    if (clean.length < MIN_CODE_LEN || clean.length > MAX_CODE_LEN) {
      toast({ title: "Invalid code length", variant: "destructive" }); return;
    }
    setWorking(true);
    try {
      // Compute the hash locally and verify it matches what's on-chain
      const localHash = hashCode(clean);
      const chainHash: string = await (async () => {
        const contract = new ethers.Contract(
          // Access PRESALE_ADDRESS via import
          (await import("@/lib/contracts")).PRESALE_ADDRESS!,
          [{ name: "referralCodeHash", type: "function", stateMutability: "view", inputs: [{ name: "owner", type: "address" }], outputs: [{ name: "", type: "bytes32" }] }],
          new ethers.BrowserProvider(window.ethereum)
        ).referralCodeHash(address);
        return chainHash;
      })();

      if (localHash.toLowerCase() === chainHash.toLowerCase()) {
        saveCode(address, clean);
        setCode(clean);
        setPhase("registered");
        setInputVal("");
        toast({ title: "Code restored!", description: `"${clean}" verified on-chain.` });
      } else {
        toast({ title: "Code doesn't match", description: "This isn't the code registered to your wallet.", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Verification failed", description: err?.message ?? "RPC error.", variant: "destructive" });
    } finally {
      setWorking(false);
    }
  };

  /* ── copy + share ── */
  const siteOrigin = typeof window !== "undefined" ? window.location.origin : "https://beacon-bcn.vercel.app";
  const refLink = code ? `${siteOrigin}/?ref=${encodeURIComponent(code)}` : "";

  const handleCopy = () => {
    if (!refLink) return;
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!" });
  };

  const handleShareX = () => {
    if (!refLink) return;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet(refLink))}`, "_blank", "noopener,noreferrer");
  };

  /* ── spinner helper ── */
  const Spinner = () => (
    <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "2px solid rgba(124,58,237,0.2)", borderTopColor: "#7C3AED", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
  );

  /* ── render ──────────────────────────────────────────────────────────────── */
  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", width: "100%" }}>

      {/* Header */}
      <div style={{ marginBottom: "40px" }}>
        <span style={{ ...lbl, color: "rgba(124,58,237,0.7)" }}>Grow the network</span>
        <h2 style={{ fontFamily: "'Tomorrow', sans-serif", fontWeight: 700, fontSize: "clamp(22px,3vw,32px)", color: "#fff", marginTop: "8px", lineHeight: 1.1 }}>
          Referral Program
        </h2>
        <p style={{ fontFamily: "'Geist Mono', monospace", fontSize: "12px", color: "rgba(255,255,255,0.35)", marginTop: "10px", lineHeight: 1.8 }}>
          Register your unique code on-chain. Every presale buyer who uses your link gets{" "}
          <span style={{ color: "#7C3AED" }}>+15% bonus BCN</span> — enforced by the smart contract.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "20px" }}>

        {/* ── Left: code status ── */}
        <div style={card}>
          <div style={sTitle}>1. Your Referral Code</div>

          {/* IDLE — not connected, and no code in memory */}
          {phase === "idle" && !code && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <p style={{ fontFamily: "'Geist Mono', monospace", fontSize: "12px", color: "rgba(255,255,255,0.3)", lineHeight: 1.7 }}>
                Connect your wallet to register or view your referral code.
              </p>
              <button onClick={connect} style={{ padding: "12px", background: "#FAFF00", color: "#09090B", border: "none", borderRadius: "9999px", fontFamily: "'Geist Mono', monospace", fontWeight: 700, fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                Connect Wallet
              </button>
            </div>
          )}

          {/* CHECKING */}
          {phase === "checking" && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 0" }}>
              <Spinner />
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em" }}>
                Checking on-chain status…
              </span>
            </div>
          )}

          {/* REGISTERED — code available */}
          {(phase === "registered" || (phase === "idle" && code)) && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ padding: "16px", background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.22)", borderRadius: "10px" }}>
                <div style={lbl}>Active on-chain code</div>
                <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: "26px", fontWeight: 700, color: "#7C3AED", marginTop: "8px", letterSpacing: "0.14em" }}>
                  {code}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em" }}>
                  {isConnected ? "Hash verified on Pharos mainnet" : "Loaded from local cache"}
                </span>
              </div>
            </div>
          )}

          {/* UNREGISTERED — show registration form */}
          {phase === "unregistered" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={lbl}>{MIN_CODE_LEN}–{MAX_CODE_LEN} chars · A-Z 0-9 _</span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    placeholder="e.g. SIGNAL42"
                    value={inputVal}
                    onChange={e => setInputVal(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ""))}
                    maxLength={MAX_CODE_LEN}
                    disabled={working}
                    style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = "rgba(124,58,237,0.4)")}
                    onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                    onKeyDown={e => e.key === "Enter" && handleRegister()}
                  />
                  <button onClick={handleRegister} disabled={working || inputVal.trim().length < MIN_CODE_LEN}
                    style={{ ...btnPurple, opacity: working || inputVal.trim().length < MIN_CODE_LEN ? 0.45 : 1, cursor: working || inputVal.trim().length < MIN_CODE_LEN ? "not-allowed" : "pointer" }}
                    onMouseEnter={e => { if (!working && inputVal.trim().length >= MIN_CODE_LEN) e.currentTarget.style.opacity = "0.85"; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = working || inputVal.trim().length < MIN_CODE_LEN ? "0.45" : "1"; }}>
                    {working ? <Spinner /> : "Register"}
                  </button>
                </div>
              </div>
              <p style={{ fontFamily: "'Geist Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.2)", lineHeight: 1.6 }}>
                One-time on-chain transaction. Your code is permanent and stored as a hash for privacy.
              </p>
            </div>
          )}

          {/* RESTORE — registered on-chain but localStorage cleared */}
          {phase === "restore" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ padding: "12px 14px", background: "rgba(250,200,0,0.05)", border: "1px solid rgba(250,200,0,0.15)", borderRadius: "8px" }}>
                <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: "11px", color: "rgba(255,200,0,0.8)", lineHeight: 1.7 }}>
                  ⚠ Your wallet has a code registered on-chain, but we can't find it locally. Enter your code below to restore it.
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  placeholder="Enter your registered code"
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ""))}
                  maxLength={MAX_CODE_LEN}
                  disabled={working}
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = "rgba(250,200,0,0.4)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                  onKeyDown={e => e.key === "Enter" && handleRestore()}
                />
                <button onClick={handleRestore} disabled={working || inputVal.trim().length < MIN_CODE_LEN}
                  style={{ ...btnPurple, background: "rgba(250,200,0,0.15)", color: "rgba(250,200,0,0.9)", border: "1px solid rgba(250,200,0,0.25)", opacity: working || inputVal.trim().length < MIN_CODE_LEN ? 0.45 : 1, cursor: working || inputVal.trim().length < MIN_CODE_LEN ? "not-allowed" : "pointer" }}>
                  {working ? <Spinner /> : "Verify"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: share panel ── */}
        <div style={card}>
          <div style={sTitle}>2. Share &amp; Earn</div>

          {!code || phase === "checking" || (phase === "idle" && !code) || phase === "unregistered" || phase === "restore" ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "36px 0" }}>
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.18)", textAlign: "center", lineHeight: 1.9 }}>
                Register your code to<br />unlock your referral link
              </span>
            </div>
          ) : (
            <>
              {/* Referral link */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={lbl}>Your referral link</span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <div onClick={handleCopy} title="Click to copy"
                    style={{ flex: 1, padding: "10px 14px", background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.18)", borderRadius: "8px", fontFamily: "'Geist Mono', monospace", fontSize: "11px", color: "#7C3AED", letterSpacing: "0.04em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "pointer", userSelect: "all" as const }}>
                    {refLink}
                  </div>
                  <button onClick={handleCopy}
                    style={{ padding: "10px 14px", background: copied ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.05)", border: `1px solid ${copied ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.1)"}`, borderRadius: "8px", fontFamily: "'Geist Mono', monospace", fontSize: "11px", color: copied ? "#7C3AED" : "rgba(255,255,255,0.5)", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s" }}>
                    {copied ? "✓ Copied" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Share on X */}
              <button onClick={handleShareX}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "13px 0", background: "#000", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "9999px", fontFamily: "'Geist Mono', monospace", fontWeight: 700, fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.45)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.266 5.638 5.898-5.638Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Share on X
              </button>

              {/* Bonus info */}
              <div style={{ padding: "12px 14px", background: "rgba(250,255,0,0.03)", border: "1px solid rgba(250,255,0,0.08)", borderRadius: "8px" }}>
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.35)", lineHeight: 1.8 }}>
                  Buyers using your link automatically receive <span style={{ color: "#FAFF00" }}>+15% bonus BCN</span> — enforced by the smart contract, no trust required.
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
