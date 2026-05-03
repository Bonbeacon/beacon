import React from "react";

const phases = [
  {
    id: "01",
    name: "The First Light",
    status: "complete",
    statusLabel: "Live",
    color: "#FAFF00",
    items: [
      "Pharos mainnet ignites — Chain ID 1672.",
      "BEACON contracts deployed. Signal source established.",
      "Stage 1 presale open. 0.001 PROS per BCN.",
      "48h mining sessions activated.",
    ],
  },
  {
    id: "02",
    name: "Signal Propagation",
    status: "active",
    statusLabel: "In Progress",
    color: "#7C3AED",
    items: [
      "500 beacon nodes active. The beam widens.",
      "Stages 2–3 presale. Price climbs. Late is still early.",
      "X presence established. Signal reaches the timeline.",
      "Discord opens. The harbor fills.",
    ],
  },
  {
    id: "03",
    name: "The Crossing",
    status: "upcoming",
    statusLabel: "Upcoming",
    color: "rgba(255,255,255,0.25)",
    items: [
      "June 30: tokens transferable. Open sea reached.",
      "Stages 4–5. Final boarding.",
      "DEX listing on Pharos. Price discovery begins.",
      "Staking module proposed.",
    ],
  },
  {
    id: "04",
    name: "Full Spectrum",
    status: "future",
    statusLabel: "Future",
    color: "rgba(255,255,255,0.15)",
    items: [
      "Governance: Beacon Council forms.",
      "Cross-chain expansion beyond Pharos.",
      "Mining power upgrades — Lens, Prism, Storm Shield.",
      "The signal becomes a network.",
    ],
  },
];

export function Roadmap() {
  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", width: "100%" }}>
      <div style={{ marginBottom: "48px" }}>
        <h2
          style={{
            fontFamily: "'Tomorrow', sans-serif",
            fontWeight: 700,
            fontSize: "22px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#fff",
            marginBottom: "8px",
          }}
        >
          The Crossing
        </h2>
        <p style={{ fontFamily: "'Geist Mono', monospace", fontSize: "12px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.04em" }}>
          Four phases. One signal.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: "16px" }}>
        {phases.map((phase) => (
          <div
            key={phase.id}
            className="card-hover"
            style={{
              background: phase.status === "active"
                ? "rgba(124,58,237,0.06)"
                : "rgba(255,255,255,0.025)",
              border: `1px solid ${phase.status === "active" ? "rgba(124,58,237,0.2)" : phase.status === "complete" ? "rgba(250,255,0,0.12)" : "rgba(255,255,255,0.06)"}`,
              borderRadius: "10px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {/* Phase number */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "11px", color: phase.color, letterSpacing: "0.08em" }}>
                Phase {phase.id}
              </span>
              <span style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: "9px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: phase.color,
                background: phase.status === "complete"
                  ? "rgba(250,255,0,0.07)"
                  : phase.status === "active"
                  ? "rgba(124,58,237,0.1)"
                  : "rgba(255,255,255,0.04)",
                border: `1px solid ${phase.status === "complete" ? "rgba(250,255,0,0.15)" : phase.status === "active" ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.08)"}`,
                padding: "2px 8px",
                borderRadius: "9999px",
                animation: phase.status === "active" ? "pulse 2s ease-in-out infinite" : "none",
              }}>
                {phase.statusLabel}
              </span>
            </div>

            {/* Name */}
            <h3
              style={{
                fontFamily: "'Tomorrow', sans-serif",
                fontWeight: 600,
                fontSize: "14px",
                lineHeight: 1.3,
                color: phase.status === "future" ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.9)",
                margin: 0,
              }}
            >
              {phase.name}
            </h3>

            {/* Divider */}
            <div style={{ height: "1px", background: `${phase.color}`, opacity: 0.12 }} />

            {/* Items */}
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
              {phase.items.map((item, i) => (
                <li
                  key={i}
                  style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: "11px",
                    lineHeight: 1.6,
                    color: phase.status === "future" ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.45)",
                    paddingLeft: "12px",
                    position: "relative",
                  }}
                >
                  <span style={{
                    position: "absolute",
                    left: 0,
                    top: "7px",
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    background: phase.color,
                    opacity: phase.status === "future" ? 0.3 : 0.7,
                  }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
