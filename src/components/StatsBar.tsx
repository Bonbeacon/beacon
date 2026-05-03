import React from "react";
import { TOKENOMICS } from "@/lib/contracts";

export function StatsBar() {
  const items = [
    { label: "Pharos Chain ID", value: "1672", color: "#FAFF00" },
    { label: "BCN per Session", value: TOKENOMICS.miningBcnPerSession.toLocaleString(), color: "#7C3AED" },
    { label: "Total Supply", value: "1,000,000,000", color: "rgba(255,255,255,0.85)" },
  ];

  return (
    <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 24px" }}>
      <div style={{ maxWidth: "1024px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 16px", borderRight: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none", gap: "8px" }}>
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "28px", fontWeight: 700, letterSpacing: "-0.01em", color: item.color, lineHeight: 1 }}>
              {item.value}
            </span>
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
