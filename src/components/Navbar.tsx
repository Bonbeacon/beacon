import React, { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useWallet } from "@/contexts/WalletContext";
import { useContracts } from "@/contexts/ContractContext";

export function Navbar() {
  const { address, isConnected, connect, disconnect, isCorrectNetwork, switchNetwork } = useWallet();
  const contracts = useContracts();
  const [bcnBalance, setBcnBalance] = useState<number | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const truncate = (addr: string) => `${addr.slice(0, 6)}···${addr.slice(-4)}`;

  useEffect(() => {
    if (!address || !isConnected) { setBcnBalance(null); return; }
    const fetch = async () => {
      const bal = await contracts.getOnChainBcnBalance(address);
      setBcnBalance(bal);
    };
    fetch();
    const id = setInterval(fetch, 30000);
    return () => clearInterval(id);
  }, [address, isConnected, contracts]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50, width: "100%", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(9,9,11,0.85)", backdropFilter: "blur(16px)" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>

        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="4.5" fill="#FAFF00" />
            <circle cx="14" cy="14" r="9" fill="none" stroke="#FAFF00" strokeWidth="1.2" strokeOpacity="0.5" />
            <circle cx="14" cy="14" r="13" fill="none" stroke="#FAFF00" strokeWidth="0.8" strokeOpacity="0.2" />
          </svg>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span style={{ fontFamily: "'Tomorrow', sans-serif", fontWeight: 700, fontSize: "18px", letterSpacing: "0.06em", color: "#FFFFFF" }}>BEACON</span>
            <span style={{ fontFamily: "'Geist Mono', monospace", fontWeight: 500, fontSize: "12px", color: "#FAFF00", background: "rgba(250,255,0,0.08)", padding: "1px 7px", borderRadius: "3px", border: "1px solid rgba(250,255,0,0.2)" }}>$BCN</span>
          </div>
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <a href="#mine" style={{ fontFamily: "'Geist Mono', monospace", fontSize: "12px", letterSpacing: "0.08em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", textDecoration: "none" }}>Mine</a>
          <a href="#presale" style={{ fontFamily: "'Geist Mono', monospace", fontSize: "12px", letterSpacing: "0.08em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", textDecoration: "none" }}>Presale</a>
          <Link href="/litepaper" style={{ fontFamily: "'Geist Mono', monospace", fontSize: "12px", letterSpacing: "0.08em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", textDecoration: "none" }}>Litepaper</Link>
        </nav>

        <div style={{ position: "relative" }} ref={menuRef}>
          {!isConnected ? (
            <button
              onClick={connect}
              style={{ fontFamily: "'Geist Mono', monospace", fontWeight: 700, fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", background: "#FAFF00", color: "#09090B", border: "none", borderRadius: "9999px", padding: "8px 20px", cursor: "pointer" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
              Connect Wallet
            </button>
          ) : !isCorrectNetwork ? (
            <button
              onClick={switchNetwork}
              style={{ fontFamily: "'Geist Mono', monospace", fontWeight: 700, fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", background: "transparent", color: "#ef4444", border: "1px solid #ef4444", borderRadius: "9999px", padding: "8px 20px", cursor: "pointer" }}>
              Switch to Pharos
            </button>
          ) : (
            <>
              <button
                onClick={() => setShowMenu(v => !v)}
                style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "3px", background: "rgba(250,255,0,0.06)", border: "1px solid rgba(250,255,0,0.15)", borderRadius: "10px", padding: "7px 14px", cursor: "pointer" }}>
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "12px", letterSpacing: "0.05em", color: "#FAFF00" }}>{truncate(address!)}</span>
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "10px", letterSpacing: "0.06em", color: "rgba(255,255,255,0.4)" }}>
                  {bcnBalance !== null ? `${bcnBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} BCN` : "— BCN"}
                </span>
              </button>

              {showMenu && (
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", background: "#131316", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "6px", minWidth: "180px", zIndex: 100, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
                  <div style={{ padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: "4px" }}>
                    <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Connected</div>
                    <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: "12px", color: "#FAFF00", marginTop: "2px" }}>{truncate(address!)}</div>
                    <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>
                      {bcnBalance !== null ? `${bcnBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} BCN earned` : "Loading balance…"}
                    </div>
                  </div>
                  <button
                    onClick={() => { disconnect(); setShowMenu(false); }}
                    style={{ width: "100%", textAlign: "left", padding: "9px 12px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "'Geist Mono', monospace", fontSize: "12px", letterSpacing: "0.06em", color: "rgba(255,80,80,0.8)", borderRadius: "6px" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,80,80,0.06)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    Disconnect
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
