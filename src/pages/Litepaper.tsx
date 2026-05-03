import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TOKENOMICS } from "@/lib/contracts";

const lbl: React.CSSProperties = {
  fontFamily: "'Geist Mono', monospace",
  fontSize: "10px",
  letterSpacing: "0.14em",
  textTransform: "uppercase" as const,
  color: "rgba(255,255,255,0.35)",
};

function Section({ title, number, children }: { title: string; number: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: "60px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "16px", marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.07)", paddingBottom: "12px" }}>
        <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: "11px", color: "rgba(124,58,237,0.6)", letterSpacing: "0.1em" }}>{number}</span>
        <h2 style={{ fontFamily: "'Tomorrow',sans-serif", fontWeight: 700, fontSize: "20px", color: "#fff", letterSpacing: "0.04em" }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Table({ rows }: { rows: string[][] }) {
  return (
    <div style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", overflow: "hidden", marginTop: "12px" }}>
      {rows.map((row, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: `repeat(${row.length}, 1fr)`, gap: "0", borderBottom: i < rows.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
          {row.map((cell, j) => (
            <div key={j} style={{ padding: "10px 16px", fontFamily: "'Geist Mono',monospace", fontSize: i === 0 ? "10px" : "12px", letterSpacing: "0.06em", color: i === 0 ? "rgba(255,255,255,0.3)" : j === 0 ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.55)", background: i === 0 ? "rgba(255,255,255,0.02)" : "transparent", textTransform: i === 0 ? "uppercase" : "none" }}>
              {cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function Litepaper() {
  const unlockDays = Math.ceil((TOKENOMICS.unlockTimestamp * 1000 - Date.now()) / 86400000);
  const maxSessions = Math.floor(unlockDays / 2);
  const maxMiningBcn = maxSessions * TOKENOMICS.miningBcnPerSession;
  const presaleBcnFor100Pros = Math.floor(100 / TOKENOMICS.stages[0].pricePerBcn);

  return (
    <div style={{ minHeight: "100vh", background: "#09090B", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <main style={{ flex: 1, maxWidth: "760px", margin: "0 auto", padding: "60px 24px 100px", width: "100%" }}>
        {/* Header */}
        <div style={{ marginBottom: "60px" }}>
          <span style={{ ...lbl, color: "rgba(124,58,237,0.7)" }}>v2.0 — May 2026</span>
          <h1 style={{ fontFamily: "'Tomorrow',sans-serif", fontWeight: 800, fontSize: "clamp(36px, 6vw, 56px)", lineHeight: 0.95, letterSpacing: "-0.02em", color: "#fff", marginTop: "12px", marginBottom: "16px" }}>
            BEACON<br /><span style={{ color: "#FAFF00" }}>Litepaper</span>
          </h1>
          <p style={{ fontFamily: "'Geist Mono',monospace", fontSize: "13px", color: "rgba(255,255,255,0.35)", lineHeight: 1.8, fontStyle: "italic" }}>
            "The pharos network needs beacons. You are one of them."
          </p>
        </div>

        {/* 1. Overview */}
        <Section number="01" title="The Premise">
          <p style={{ fontFamily: "'Geist Mono',monospace", fontSize: "13px", color: "rgba(255,255,255,0.55)", lineHeight: 1.9 }}>
            BEACON ($BCN) is the first native community miner token on Pharos Pacific Ocean Mainnet (Chain ID: 1672).
            Every active session makes you a beacon node — illuminating the first new signal on a new financial internet.
          </p>
          <Table rows={[
            ["Parameter", "Value"],
            ["Network", "Pharos Pacific Ocean Mainnet"],
            ["Chain ID", "1672"],
            ["RPC", "https://rpc.pharos.xyz"],
            ["Explorer", "https://pharosscan.xyz"],
            ["Symbol", "$BCN"],
            ["Total Supply", "1,000,000,000 BCN"],
            ["Transfer Lock", "Until June 30, 2026 00:00 UTC"],
          ]} />
        </Section>

        {/* 2. Token Allocation */}
        <Section number="02" title="Token Allocation">
          <Table rows={[
            ["Category", "%", "Amount", "Purpose"],
            ["Presale (5 stages)", "40%", "400,000,000 BCN", "BeaconPresale contract"],
            ["Mining Pool", "5%", "50,000,000 BCN", "BeaconToken contract (session rewards)"],
            ["Team & Development", "15%", "150,000,000 BCN", "Deployer-held, manual distribution"],
            ["Treasury & Reserve", "30%", "300,000,000 BCN", "Governance, future use"],
            ["DEX Liquidity", "10%", "100,000,000 BCN", "Added at exchange listing"],
          ]} />
        </Section>

        {/* 3. Presale */}
        <Section number="03" title="Presale Structure">
          <p style={{ fontFamily: "'Geist Mono',monospace", fontSize: "13px", color: "rgba(255,255,255,0.55)", lineHeight: 1.9, marginBottom: "16px" }}>
            Five stages with escalating prices. Each stage has 80,000,000 BCN available. Stages advance automatically on-chain when the BCN allocation is exhausted. BCN is transferred to buyer wallets immediately but is non-transferable until June 30, 2026.
          </p>
          <Table rows={[
            ["Stage", "Name", "Price (PROS/BCN)", "BCN Available", "PROS Target"],
            ["1", "The First Light",  "0.001", "80,000,000", "80,000"],
            ["2", "Signal Rising",    "0.002", "80,000,000", "160,000"],
            ["3", "The Beam Widens",  "0.003", "80,000,000", "240,000"],
            ["4", "Storm Season",     "0.004", "80,000,000", "320,000"],
            ["5", "Full Spectrum",    "0.005", "80,000,000", "400,000"],
          ]} />
          <div style={{ marginTop: "20px", padding: "16px 20px", background: "rgba(250,255,0,0.04)", border: "1px solid rgba(250,255,0,0.12)", borderRadius: "8px" }}>
            <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: "12px", color: "rgba(255,255,255,0.5)", lineHeight: 1.8 }}>
              <span style={{ color: "#FAFF00", fontWeight: 700 }}>Target listing: 0.005–0.01 PROS/BCN.</span>{" "}
              Stage 1 buyers entering at 0.001 PROS/BCN stand to see a 5–10× return at listing. This is the primary reason presale is the recommended entry path.
            </span>
          </div>
        </Section>

        {/* 4. Presale vs Mining */}
        <Section number="04" title="Why Presale Beats Mining">
          <p style={{ fontFamily: "'Geist Mono',monospace", fontSize: "13px", color: "rgba(255,255,255,0.55)", lineHeight: 1.9, marginBottom: "16px" }}>
            Mining is a community participation mechanic. The presale is the investment vehicle. Here's the math:
          </p>
          <Table rows={[
            ["", "Stage 1 Presale", "Mining (before unlock)"],
            ["Investment / fees", "100 PROS", "100 PROS"],
            ["BCN received", `${presaleBcnFor100Pros.toLocaleString()} BCN`, `${maxMiningBcn.toLocaleString()} BCN (max)`],
            ["Time required", "Instant", `~${maxSessions} sessions × 48h`],
            ["Volume cap", "Up to 80M BCN", `${maxSessions} sessions before unlock`],
            ["Advantage", `${Math.round(presaleBcnFor100Pros / Math.max(maxMiningBcn,1))}× more BCN`, "Participation + fees earned"],
          ]} />
          <p style={{ fontFamily: "'Geist Mono',monospace", fontSize: "12px", color: "rgba(255,255,255,0.4)", lineHeight: 1.9, marginTop: "16px" }}>
            Mining is intentionally capped at one session per wallet at a time. This prevents mining from inflating supply faster than the presale's price discovery. Miners get community recognition and modest BCN; presale buyers get bulk allocation at the cheapest on-chain price.
          </p>
        </Section>

        {/* 5. Mining */}
        <Section number="05" title="Mining Mechanics">
          <Table rows={[
            ["Parameter", "Value"],
            ["Session Duration", "48 hours"],
            ["BCN per Session", `${TOKENOMICS.miningBcnPerSession} BCN`],
            ["Session Start Fee", "0.05 PROS (native)"],
            ["Claim Fee", "0.05 PROS (native)"],
            ["Total Cost per Cycle", "0.10 PROS"],
            ["Active Sessions per Wallet", "One at a time"],
            ["Mining Hard Cap", "50,000,000 BCN lifetime"],
            ["Max Sessions (lifetime)", "250,000"],
          ]} />
          <p style={{ fontFamily: "'Geist Mono',monospace", fontSize: "12px", color: "rgba(255,255,255,0.4)", lineHeight: 1.9, marginTop: "16px" }}>
            Both fees (start + claim) are forwarded immediately to the deployer wallet via `startSession()` and `claimReward()` in BeaconToken.sol. This is enforced on-chain and disclosed here.
          </p>
        </Section>

        {/* 6. Fees */}
        <Section number="06" title="Fee Disclosure">
          <p style={{ fontFamily: "'Geist Mono',monospace", fontSize: "13px", color: "rgba(255,255,255,0.55)", lineHeight: 1.9, marginBottom: "16px" }}>
            Three fee streams flow to the deployer wallet:
          </p>
          <Table rows={[
            ["Fee Type", "Amount", "When"],
            ["Mining Start Fee", "0.05 PROS", "Per startSession() call"],
            ["Mining Claim Fee", "0.05 PROS", "Per claimReward() call"],
            ["Presale Deployer Share", "35% of PROS raised", "Claimable via deployerWithdraw()"],
          ]} />
          <p style={{ fontFamily: "'Geist Mono',monospace", fontSize: "12px", color: "rgba(255,255,255,0.4)", lineHeight: 1.9, marginTop: "16px" }}>
            The remaining 65% of presale proceeds stay in BeaconPresale.sol for DEX liquidity seeding and development. These mechanics are enforced by smart contracts and verifiable on pharosscan.xyz.
          </p>
        </Section>

        {/* 7. Referral */}
        <Section number="07" title="Referral Program">
          <Table rows={[
            ["Parameter", "Value"],
            ["Bonus", "+15% extra BCN on presale purchase"],
            ["Registration", "On-chain via registerReferralCode()"],
            ["Self-referral", "Not allowed (enforced on-chain)"],
            ["Referral limit", "Unlimited per wallet"],
          ]} />
        </Section>

        {/* 8. Smart Contracts */}
        <Section number="08" title="Smart Contracts">
          <Table rows={[
            ["Contract", "Purpose", "Security"],
            ["BeaconToken.sol", "ERC-20 + mining + transfer lock", "ReentrancyGuard, CEI, hard cap"],
            ["BeaconPresale.sol", "5-stage presale + referrals", "ReentrancyGuard, CEI, min purchase"],
          ]} />
        </Section>

        {/* Risk */}
        <div style={{ marginTop: "40px", padding: "20px 24px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px" }}>
          <p style={{ fontFamily: "'Geist Mono',monospace", fontSize: "11px", color: "rgba(255,255,255,0.3)", lineHeight: 1.9 }}>
            <strong style={{ color: "rgba(255,255,255,0.45)" }}>Risk Disclosure:</strong> BEACON is an experimental community token. It is not a security, investment, or financial instrument. Mining fees and presale participation carry risk. Smart contracts may contain unforeseen bugs. Always DYOR. Never invest more than you can afford to lose.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
