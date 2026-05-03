import React from "react";
import { Link } from "wouter";
import { useWallet } from "@/contexts/WalletContext";
import { Button } from "@/components/ui/button";
import { useGetWalletBalance, getGetWalletBalanceQueryKey } from "../lib/api-client-react";

export function Navbar() {
  const { address, isConnected, connect, isCorrectNetwork, switchNetwork } = useWallet();
  const { data: balance } = useGetWalletBalance(address || "", {
    query: {
      enabled: !!address,
      queryKey: getGetWalletBalanceQueryKey(address || ""),
    },
  });

  const truncateAddress = (addr: string) =>
    `${addr.slice(0, 6)}···${addr.slice(-4)}`;

  return (
    <header className="sticky top-0 z-50 w-full" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(9,9,11,0.85)", backdropFilter: "blur(16px)" }}>
      <div className="container flex h-[60px] max-w-screen-xl items-center justify-between px-6 mx-auto">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 select-none">
          {/* Signal mark */}
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="4.5" fill="#FAFF00" />
            <circle cx="14" cy="14" r="9" fill="none" stroke="#FAFF00" strokeWidth="1.2" strokeOpacity="0.5" />
            <circle cx="14" cy="14" r="13" fill="none" stroke="#FAFF00" strokeWidth="0.8" strokeOpacity="0.2" />
          </svg>
          <div className="flex items-baseline gap-[6px]">
            <span
              style={{
                fontFamily: "'Tomorrow', sans-serif",
                fontWeight: 700,
                fontSize: "18px",
                letterSpacing: "0.06em",
                color: "#FFFFFF",
              }}
            >
              BEACON
            </span>
            <span
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontWeight: 500,
                fontSize: "12px",
                letterSpacing: "0.04em",
                color: "#FAFF00",
                background: "rgba(250,255,0,0.08)",
                padding: "1px 7px",
                borderRadius: "3px",
                border: "1px solid rgba(250,255,0,0.2)",
              }}
            >
              $BCN
            </span>
          </div>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#mine" style={{ fontFamily: "'Geist Mono', monospace", fontSize: "12px", letterSpacing: "0.08em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", textDecoration: "none" }}
            className="hover:text-white transition-colors">Mine</a>
          <a href="#presale" style={{ fontFamily: "'Geist Mono', monospace", fontSize: "12px", letterSpacing: "0.08em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", textDecoration: "none" }}
            className="hover:text-white transition-colors">Presale</a>
          <Link href="/litepaper" style={{ fontFamily: "'Geist Mono', monospace", fontSize: "12px", letterSpacing: "0.08em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", textDecoration: "none" }}
            className="hover:text-white transition-colors">Litepaper</Link>
        </nav>

        {/* Wallet */}
        <div className="flex items-center gap-3">
          {!isConnected ? (
            <button
              onClick={connect}
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontWeight: 600,
                fontSize: "12px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                background: "#FAFF00",
                color: "#09090B",
                border: "none",
                borderRadius: "9999px",
                padding: "8px 20px",
                cursor: "pointer",
                transition: "opacity 0.15s ease",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              Connect Wallet
            </button>
          ) : !isCorrectNetwork ? (
            <button
              onClick={switchNetwork}
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontWeight: 600,
                fontSize: "12px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                background: "transparent",
                color: "#ef4444",
                border: "1px solid #ef4444",
                borderRadius: "9999px",
                padding: "8px 20px",
                cursor: "pointer",
              }}
            >
              Switch to Pharos
            </button>
          ) : (
            <div className="flex flex-col items-end gap-0.5">
              <span
                style={{
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: "12px",
                  letterSpacing: "0.05em",
                  color: "#FAFF00",
                  background: "rgba(250,255,0,0.06)",
                  border: "1px solid rgba(250,255,0,0.15)",
                  borderRadius: "9999px",
                  padding: "5px 14px",
                }}
              >
                {truncateAddress(address!)}
              </span>
              {balance && (
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "10px", color: "rgba(255,255,255,0.35)", paddingRight: "4px" }}>
                  {balance.totalBcn.toLocaleString()} BCN
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
