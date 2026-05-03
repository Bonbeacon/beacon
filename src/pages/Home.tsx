import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MinerWidget } from "@/components/MinerWidget";
import { PresaleWidget } from "@/components/PresaleWidget";
import { StatsBar } from "@/components/StatsBar";
import { ReferralSection } from "@/components/ReferralSection";
import { Roadmap } from "@/components/Roadmap";
import { DeployerPanel } from "@/components/DeployerPanel";
import { TOKENOMICS } from "@/lib/contracts";

const lbl: React.CSSProperties = {
  fontFamily: "'Geist Mono', monospace",
  fontSize: "10px",
  letterSpacing: "0.14em",
  textTransform: "uppercase" as const,
  color: "rgba(255,255,255,0.35)",
};

function TokenomicsComparison() {
  const unlockDays = Math.ceil((TOKENOMICS.unlockTimestamp * 1000 - Date.now()) / 86400000);
  const maxSessions = Math.floor(unlockDays / 2);
  const maxMiningBcn = maxSessions * TOKENOMICS.miningBcnPerSession;
  const presaleBcnFor100Pros = 100 / TOKENOMICS.stages[0].pricePerBcn;

  return (
    <section style={{ padding: "80px 24px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        <div style={{ marginBottom: "48px", textAlign: "center" }}>
          <span style={{ ...lbl, color: "rgba(124,58,237,0.7)" }}>Why presale</span>
          <h2 style={{ fontFamily: "'Tomorrow', sans-serif", fontWeight: 700, fontSize: "clamp(28px, 4vw, 42px)", color: "#fff", marginTop: "10px", lineHeight: 1.1 }}>
            Presale vs Mining — <span style={{ color: "#FAFF00" }}>The Math</span>
          </h2>
          <p style={{ fontFamily: "'Geist Mono', monospace", fontSize: "12px", color: "rgba(255,255,255,0.35)", marginTop: "12px", lineHeight: 1.7, maxWidth: "520px", margin: "12px auto 0" }}>
            Mining rewards community participation. Presale is where serious accumulation happens.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "32px" }}>
          <div style={{ background: "rgba(250,255,0,0.04)", border: "1px solid rgba(250,255,0,0.18)", borderRadius: "12px", padding: "28px 24px", position: "relative" }}>
            <div style={{ position: "absolute", top: "-1px", right: "20px", background: "#FAFF00", color: "#09090B", fontFamily: "'Geist Mono',monospace", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 10px", borderRadius: "0 0 8px 8px" }}>
              Recommended
            </div>
            <div style={{ fontFamily: "'Tomorrow',sans-serif", fontWeight: 600, fontSize: "13px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#FAFF00", marginBottom: "20px" }}>Stage 1 Presale</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { l: "Investment", v: "100 PROS" },
                { l: "BCN received", v: presaleBcnFor100Pros.toLocaleString(), big: true, col: "#FAFF00" },
                { l: "Time required", v: "Instant", col: "rgba(250,255,0,0.8)" },
                { l: "Price per BCN", v: `${TOKENOMICS.stages[0].pricePerBcn} PROS` },
              ].map(({ l, v, big, col }, i, arr) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none", paddingBottom: i < arr.length - 1 ? "12px" : 0 }}>
                  <span style={lbl}>{l}</span>
                  <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: big ? "18px" : "13px", fontWeight: big ? 700 : 400, color: col ?? "#fff" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "28px 24px" }}>
            <div style={{ fontFamily: "'Tomorrow',sans-serif", fontWeight: 600, fontSize: "13px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: "20px" }}>Mining Sessions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { l: "Fee spent", v: "100 PROS" },
                { l: "BCN earned", v: Math.min(maxMiningBcn, (100 / TOKENOMICS.miningFeeTotalPros) * TOKENOMICS.miningBcnPerSession).toLocaleString(), big: true, col: "rgba(255,255,255,0.45)" },
                { l: "Time required", v: `${Math.ceil((100 / TOKENOMICS.miningFeeTotalPros) * 2)} days`, col: "rgba(255,100,100,0.8)" },
                { l: "Before unlock max", v: `${maxMiningBcn.toLocaleString()} BCN` },
              ].map(({ l, v, big, col }, i, arr) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none", paddingBottom: i < arr.length - 1 ? "12px" : 0 }}>
                  <span style={lbl}>{l}</span>
                  <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: big ? "18px" : "12px", fontWeight: big ? 700 : 400, color: col ?? "rgba(255,255,255,0.6)" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", padding: "24px", background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)", borderRadius: "10px" }}>
          <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: "11px", color: "rgba(255,255,255,0.45)", letterSpacing: "0.08em" }}>
            Stage 1 presale returns{" "}
            <span style={{ color: "#FAFF00", fontWeight: 700, fontSize: "16px" }}>{Math.round(presaleBcnFor100Pros / Math.max(maxMiningBcn, 1))}×</span>
            {" "}more BCN than mining alone before unlock.{" "}
            <span style={{ color: "rgba(124,58,237,0.9)" }}>Mining is community participation. Presale is your position.</span>
          </span>
        </div>

        <div style={{ marginTop: "40px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
          {[
            { label: "Presale", pct: "40%", amt: "400M BCN", col: "#FAFF00" },
            { label: "Mining Pool", pct: "5%", amt: "50M BCN", col: "rgba(255,255,255,0.5)" },
            { label: "Team (1yr lock)", pct: "15%", amt: "150M BCN", col: "#7C3AED" },
            { label: "Treasury", pct: "30%", amt: "300M BCN", col: "rgba(255,255,255,0.3)" },
            { label: "DEX Liquidity", pct: "10%", amt: "100M BCN", col: "rgba(255,255,255,0.3)" },
          ].map(item => (
            <div key={item.label} style={{ padding: "14px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px" }}>
              <div style={{ fontFamily: "'Tomorrow',sans-serif", fontSize: "16px", fontWeight: 700, color: item.col }}>{item.pct}</div>
              <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: "10px", color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>{item.label}</div>
              <div style={{ fontFamily: "'Geist Mono',monospace", fontSize: "10px", color: "rgba(255,255,255,0.25)", marginTop: "2px" }}>{item.amt}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", background: "#09090B", display: "flex", flexDirection: "column", position: "relative", overflowX: "hidden" }}>
      <div className="bg-dot-grid" aria-hidden="true" />
      <div style={{ position: "fixed", top: "-20%", left: "50%", transform: "translateX(-50%)", width: "900px", height: "600px", background: "radial-gradient(ellipse, rgba(250,255,0,0.04) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "10%", left: "10%", width: "500px", height: "500px", background: "radial-gradient(ellipse, rgba(124,58,237,0.05) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1 }}>
        <Navbar />

        {/* Hero */}
        <section style={{ padding: "80px 24px 60px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontFamily: "'Geist Mono', monospace", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", padding: "6px 16px", borderRadius: "9999px", marginBottom: "32px" }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#FAFF00", display: "inline-block", animation: "pulse 1.4s ease-in-out infinite" }} />
            Now live on Pharos Mainnet — Chain ID 1672
          </div>

          <h1 style={{ fontFamily: "'Tomorrow', sans-serif", fontWeight: 800, fontSize: "clamp(48px, 8vw, 88px)", lineHeight: 0.95, letterSpacing: "-0.02em", color: "#FFFFFF", marginBottom: "20px", maxWidth: "800px" }}>
            The First Signal<br /><span style={{ color: "#FAFF00" }}>on Pharos.</span>
          </h1>

          <p style={{ fontFamily: "'Geist Mono', monospace", fontSize: "14px", lineHeight: 1.8, color: "rgba(255,255,255,0.38)", maxWidth: "480px", marginBottom: "60px", letterSpacing: "0.03em" }}>
            Mine $BCN. Earn. Signal. Prevail.<br />
            48h sessions · {TOKENOMICS.miningBcnPerSession} BCN reward · 5-stage presale.
          </p>

          <div style={{ width: "100%", maxWidth: "960px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            <MinerWidget />
            <PresaleWidget />
          </div>
        </section>

        <StatsBar />

        {/* Ticker */}
        <div style={{ overflow: "hidden", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "10px 0", background: "rgba(250,255,0,0.02)" }}>
          <div style={{ display: "flex", gap: "64px", width: "max-content", animation: "ticker-scroll 28s linear infinite", fontFamily: "'Geist Mono', monospace", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(250,255,0,0.4)" }}>
            {Array(8).fill(null).map((_, i) => (
              <React.Fragment key={i}>
                <span>$BCN · 0.001 PROS</span>
                <span style={{ color: "rgba(255,255,255,0.1)" }}>·</span>
                <span>Pharos Chain ID: 1672</span>
                <span style={{ color: "rgba(255,255,255,0.1)" }}>·</span>
                <span>48H Sessions · {TOKENOMICS.miningBcnPerSession} BCN</span>
                <span style={{ color: "rgba(255,255,255,0.1)" }}>·</span>
                <span>Stage 1 → 10× Target ROI</span>
                <span style={{ color: "rgba(255,255,255,0.1)" }}>·</span>
              </React.Fragment>
            ))}
          </div>
        </div>

        <TokenomicsComparison />

        {/* Referral */}
        <section style={{ padding: "80px 24px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <ReferralSection />
        </section>

        {/* Roadmap */}
        <section style={{ padding: "80px 24px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <Roadmap />
        </section>

        <Footer />
      </div>

      {/* Deployer-only floating panel — visible only when VITE_DEPLOYER_ADDRESS matches connected wallet */}
      <DeployerPanel />
    </div>
  );
}
