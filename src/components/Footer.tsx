import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { FaXTwitter, FaDiscord } from "react-icons/fa6";

export function Footer() {
  const [socialLinks, setSocialLinks] = useState<{ twitter?: string; discord?: string }>({});

  useEffect(() => {
    fetch("/social_links.txt")
      .then(r => r.json())
      .then(d => setSocialLinks(d))
      .catch(() => {});
  }, []);

  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: "80px" }}>
      <div style={{ maxWidth: "1024px", margin: "0 auto", padding: "48px 24px", display: "flex", flexDirection: "column", gap: "32px" }}>
        {/* Top row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "24px" }}>
          {/* Brand */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="4.5" fill="#FAFF00" />
                <circle cx="14" cy="14" r="9" fill="none" stroke="#FAFF00" strokeWidth="1.2" strokeOpacity="0.5" />
                <circle cx="14" cy="14" r="13" fill="none" stroke="#FAFF00" strokeWidth="0.8" strokeOpacity="0.2" />
              </svg>
              <span style={{ fontFamily: "'Tomorrow', sans-serif", fontWeight: 700, fontSize: "16px", letterSpacing: "0.06em", color: "#fff" }}>
                BEACON
              </span>
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "11px", color: "#FAFF00", background: "rgba(250,255,0,0.07)", border: "1px solid rgba(250,255,0,0.18)", padding: "1px 7px", borderRadius: "3px" }}>
                $BCN
              </span>
            </div>
            <p style={{ fontFamily: "'Geist Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.28)", letterSpacing: "0.04em", maxWidth: "240px", lineHeight: 1.7 }}>
              The first signal on Pharos.<br />Mine. Transmit. Prevail.
            </p>
          </div>

          {/* Nav */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)" }}>
              Resources
            </span>
            <Link href="/litepaper" style={{ fontFamily: "'Geist Mono', monospace", fontSize: "12px", color: "rgba(255,255,255,0.45)", textDecoration: "none", letterSpacing: "0.04em" }}
              className="hover:text-white transition-colors">
              Litepaper
            </Link>
            <a href="#presale" style={{ fontFamily: "'Geist Mono', monospace", fontSize: "12px", color: "rgba(255,255,255,0.45)", textDecoration: "none", letterSpacing: "0.04em" }}
              className="hover:text-white transition-colors">
              Presale
            </a>
            <a href="#mine" style={{ fontFamily: "'Geist Mono', monospace", fontSize: "12px", color: "rgba(255,255,255,0.45)", textDecoration: "none", letterSpacing: "0.04em" }}
              className="hover:text-white transition-colors">
              Mine
            </a>
          </div>

          {/* Network info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)" }}>
              Network
            </span>
            {[
              ["Chain", "Pharos Mainnet"],
              ["Chain ID", "1672"],
              ["Currency", "PROS"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", gap: "12px" }}>
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.25)", minWidth: "60px" }}>{k}</span>
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Social */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)" }}>
              Community
            </span>
            <div style={{ display: "flex", gap: "16px" }}>
              {socialLinks.twitter && (
                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                  style={{ color: "rgba(255,255,255,0.35)", transition: "color 0.15s ease" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#FAFF00")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}>
                  <FaXTwitter style={{ width: "18px", height: "18px" }} />
                </a>
              )}
              {socialLinks.discord && (
                <a href={socialLinks.discord} target="_blank" rel="noopener noreferrer"
                  style={{ color: "rgba(255,255,255,0.35)", transition: "color 0.15s ease" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#7C3AED")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}>
                  <FaDiscord style={{ width: "18px", height: "18px" }} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "10px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.04em" }}>
            © 2026 BEACON Protocol. All rights reserved.
          </span>
          <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: "10px", color: "rgba(255,255,255,0.15)", letterSpacing: "0.04em" }}>
            Pharos Chain ID: 1672 · rpc.pharos.xyz
          </span>
        </div>
      </div>
    </footer>
  );
}
