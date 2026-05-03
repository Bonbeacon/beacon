import React, { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { useGenerateReferralCode, useGetReferralStats, getGetReferralStatsQueryKey } from "../lib/api-client-react";
import { FaXTwitter } from "react-icons/fa6";
import { useQueryClient } from "@tanstack/react-query";

const VIRAL_TWEETS = [
  "just became a beacon node on @PharosNetwork. if you're not mining $BCN right now you're going to be very unhappy in 3 months 🔦 [REFERRAL_LINK] #BCN #Pharos",
  "the pharos chain just launched and there's already a miner on it. got in stage 1 at 0.001 PROS. this is how you find alpha 🌊 [REFERRAL_LINK] #BEACON #crypto",
  "mining $BCN on pharos mainnet. zero hardware. just vibes and 0.05 PROS per session. [REFERRAL_LINK] 👁️ #BeaconToken",
  "my beacon has been lit. 48hrs to claim. not financial advice but i'm not turning it off either. [REFERRAL_LINK] #BCN",
  "found the first community miner on pharos. early is an understatement. [REFERRAL_LINK] 🗼 #Pharos #crypto",
  "pharos mainnet launched apr 28. BEACON launched may 3. if you're reading this you're still early [REFERRAL_LINK] #BCN #PharosNetwork",
  "accumulating $BCN before the june 30 unlock. referral link if you want in: [REFERRAL_LINK] ⚡",
  "the signal never sleeps. neither do i apparently. [REFERRAL_LINK] 🔦 #BEACON #BCN",
  "stage 1 of $BCN presale is 0.001 PROS per token. stage 5 is 0.005. do the math and grab this: [REFERRAL_LINK]",
  "mining without hardware is the only mining i do tbh [REFERRAL_LINK] 🏴‍☠️ #BCN #pharos",
  "beacon nodes are going live on @PharosNetwork. i lit mine. [REFERRAL_LINK] #BCN 🌊",
  "0.05 PROS per session. 1000 BCN per 48hrs. the math is mathing. [REFERRAL_LINK] #BeaconToken",
  "found $BCN on pharos this morning. by noon my session was running. [REFERRAL_LINK] ⚓ #crypto",
  "not many people know about this yet. that's the point. [REFERRAL_LINK] 🔦 #BCN",
  "launched on a chain that went live 5 days ago. respect the speed. [REFERRAL_LINK] 🚀 #Pharos",
  "mining $BCN feels like finding a signal in the void. [REFERRAL_LINK] 📡",
  "lit the beacon. 48h timer running. see you on the other side. [REFERRAL_LINK] #BCN",
  "just connected to pharos mainnet for the first time and immediately found this [REFERRAL_LINK] 👁️ #BEACON",
  "the signal is live. are you transmitting? [REFERRAL_LINK] ⚡ #BCN #Pharos",
  "tokens unlock june 30. buying now at stage 1 prices. [REFERRAL_LINK] 📅 #BCN",
  "referral gives you 15% bonus BCN. told my group. now telling you: [REFERRAL_LINK]",
  "pharos is the new frontier. BEACON is the first signal. [REFERRAL_LINK] 📡",
  "mining crypto from my browser while working. the future is wild. [REFERRAL_LINK] 💻 #BCN",
  "found stage 1 of $BCN with 40% of tokens still available. [REFERRAL_LINK] 🔦",
  "1000 $BCN per 48hr session. 5 sessions before unlock. do the math. [REFERRAL_LINK]",
  "the beam reaches those who arrive first. [REFERRAL_LINK] 🌊 #BEACON",
  "just aped into $BCN presale. use my link for 15% bonus: [REFERRAL_LINK]",
  "this is what early looks like. pharos mainnet + browser miner + stage 1. [REFERRAL_LINK] 🔦",
  "lit my signal at 2am. timer ends at 2am thursday. can't sleep anyway. [REFERRAL_LINK] #BCN",
  "0 hardware. 0 technical knowledge. just a wallet and a browser. [REFERRAL_LINK] ⚡ #BeaconToken",
  "the pharos network needs beacons. i became one. [REFERRAL_LINK] 📡 #BCN",
  "crypto is just vibes until it isn't. $BCN is very much not vibes. [REFERRAL_LINK]",
  "my wallet says i have 0 BCN. my miner says check back in 48h. [REFERRAL_LINK] ⏳",
  "found alpha on pharos. sharing it with my 14 followers: [REFERRAL_LINK] 🌊 #BCN",
  "stage 1 → stage 5 is a 5x price increase. get in now: [REFERRAL_LINK] 📈",
  "mining $BCN while this tweet writes itself. [REFERRAL_LINK] 📡 #Pharos",
  "beam is live. signal is strong. session is running. [REFERRAL_LINK] ⚡",
  "first mover advantage on pharos mainnet. go: [REFERRAL_LINK] 🚀 #BCN",
  "the signal doesn't ask if you deserve to see it. it just transmits. [REFERRAL_LINK] 📡",
  "i have no idea what pharos is but my BCN is accumulating so [REFERRAL_LINK] 🤷 #crypto",
  "referral system gives 15% bonus. click before someone else gets credit: [REFERRAL_LINK]",
  "my mining session expires in 31hrs 22min. why am i watching this. [REFERRAL_LINK] ⏱️ #BCN",
  "broadcasting on pharos mainnet fr fr [REFERRAL_LINK] 📡📡📡 #BCN",
  "june 30 is the unlock. i'm accumulating until then. [REFERRAL_LINK] 📅 #BeaconToken",
  "the signal reaches you or it doesn't. it reached me. [REFERRAL_LINK] 🌊",
  "this tweet is sponsored by 0.05 PROS and 48 hours of patience. [REFERRAL_LINK] ⚓",
  "new chain. new miner. same grind. [REFERRAL_LINK] 💀 #BCN #Pharos",
  "when your session timer hits 0 and you click claim. that feeling: [REFERRAL_LINK] ✅ #BEACON",
  "i don't make recommendations. i just mine $BCN and share links. [REFERRAL_LINK] 🔦",
  "pharos mainnet: chain id 1672. BEACON: first miner. you: [REFERRAL_LINK] 👈 #BCN"
];

const labelStyle: React.CSSProperties = {
  fontFamily: "'Geist Mono', monospace",
  fontSize: "10px",
  letterSpacing: "0.14em",
  textTransform: "uppercase" as const,
  color: "rgba(255,255,255,0.35)",
};

export function ReferralSection() {
  const { address, isConnected, connect } = useWallet();
  const generateCode = useGenerateReferralCode();
  const queryClient = useQueryClient();
  const { data: stats, refetch } = useGetReferralStats(address || "", {
    query: {
      enabled: !!address,
      queryKey: getGetReferralStatsQueryKey(address || ""),
    }
  });

  const handleGenerate = () => {
    if (!address) return;
    generateCode.mutate({ data: { walletAddress: address } }, {
      onSuccess: () => { refetch(); }
    });
  };

  const referralUrl = stats?.code ? `https://beacon.xyz/?ref=${stats.code}` : "";

  const handleShare = () => {
    if (!referralUrl) return;
    const template = VIRAL_TWEETS[Math.floor(Math.random() * VIRAL_TWEETS.length)];
    const text = template.replace("[REFERRAL_LINK]", referralUrl);
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  const copyToClipboard = () => {
    if (referralUrl) navigator.clipboard.writeText(referralUrl);
  };

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", width: "100%" }}>
      {/* Header */}
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{
          fontFamily: "'Tomorrow', sans-serif", fontWeight: 700,
          fontSize: "22px", letterSpacing: "0.08em", textTransform: "uppercase",
          color: "#fff", marginBottom: "8px",
        }}>
          Propagate the Signal
        </h2>
        <p style={{
          fontFamily: "'Geist Mono', monospace", fontSize: "12px",
          color: "rgba(255,255,255,0.3)", letterSpacing: "0.04em", lineHeight: 1.7,
        }}>
          Refer a node operator. They get <span style={{ color: "#7C3AED" }}>+15% bonus BCN</span>.
          You earn commission on their activity.
        </p>
      </div>

      <div style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "12px",
        padding: "32px 28px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}>
        {!isConnected ? (
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" }}>
            <p style={{ fontFamily: "'Geist Mono', monospace", fontSize: "12px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.04em", lineHeight: 1.7 }}>
              Connect your wallet to generate your referral link.
            </p>
            <button
              onClick={connect}
              style={{
                padding: "11px 28px", background: "#FAFF00", color: "#09090B",
                border: "none", borderRadius: "9999px",
                fontFamily: "'Geist Mono', monospace", fontWeight: 700,
                fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Connect Wallet
            </button>
          </div>
        ) : !stats?.code ? (
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" }}>
            <p style={{ fontFamily: "'Geist Mono', monospace", fontSize: "12px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.04em", lineHeight: 1.7 }}>
              Generate your unique referral link to start earning.
            </p>
            <button
              onClick={handleGenerate}
              disabled={generateCode.isPending}
              style={{
                padding: "11px 28px", background: "#FAFF00", color: "#09090B",
                border: "none", borderRadius: "9999px",
                fontFamily: "'Geist Mono', monospace", fontWeight: 700,
                fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase",
                cursor: "pointer", opacity: generateCode.isPending ? 0.6 : 1,
              }}
            >
              {generateCode.isPending ? "Generating…" : "Generate Referral Link"}
            </button>
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div style={{ padding: "16px 20px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: "26px", fontWeight: 700, color: "#FAFF00", lineHeight: 1 }}>
                  {stats.referralCount}
                </div>
                <div style={{ ...labelStyle, marginTop: "6px" }}>Recruits</div>
              </div>
              <div style={{ padding: "16px 20px", background: "rgba(124,58,237,0.06)", borderRadius: "8px", border: "1px solid rgba(124,58,237,0.15)" }}>
                <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: "26px", fontWeight: 700, color: "#7C3AED", lineHeight: 1 }}>
                  {stats.totalBonusBcn.toLocaleString()}
                </div>
                <div style={{ ...labelStyle, marginTop: "6px" }}>Bonus BCN Earned</div>
              </div>
            </div>

            {/* Link */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={labelStyle}>Your Referral Link</span>
              <div style={{ display: "flex", gap: "8px" }}>
                <div style={{
                  flex: 1, padding: "11px 14px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  fontFamily: "'Geist Mono', monospace", fontSize: "12px",
                  color: "#FAFF00", overflow: "hidden", whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}>
                  {referralUrl}
                </div>
                <button
                  onClick={copyToClipboard}
                  style={{
                    padding: "11px 18px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "8px",
                    fontFamily: "'Geist Mono', monospace", fontSize: "11px",
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    color: "rgba(255,255,255,0.7)", cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Copy
                </button>
              </div>
            </div>

            {/* Share */}
            <button
              onClick={handleShare}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                padding: "13px 0", width: "100%",
                background: "#000", color: "#fff",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "9999px",
                fontFamily: "'Geist Mono', monospace", fontWeight: 600,
                fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase",
                cursor: "pointer", transition: "border-color 0.15s ease",
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)")}
            >
              <FaXTwitter style={{ width: "15px", height: "15px" }} />
              Share on X
            </button>
          </>
        )}
      </div>
    </div>
  );
}
