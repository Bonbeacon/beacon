import React from "react";
import { cn } from "@/lib/utils";

interface LighthouseProps {
  status: "idle" | "active" | "ready";
  className?: string;
}

export function Lighthouse({ status, className }: LighthouseProps) {
  const isActive = status === "active";
  const isReady = status === "ready";
  const isIdle = status === "idle";

  const primaryColor = "#FAFF00";
  const secondaryColor = "#7C3AED";
  const activeColor = isReady ? secondaryColor : primaryColor;

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: 260, height: 260 }}>
      <svg
        viewBox="0 0 200 200"
        width="260"
        height="260"
        style={{
          filter: isActive
            ? `drop-shadow(0 0 24px ${primaryColor}55)`
            : isReady
            ? `drop-shadow(0 0 24px ${secondaryColor}88)`
            : `drop-shadow(0 0 8px ${primaryColor}22)`,
          transition: "filter 0.6s ease",
        }}
      >
        <defs>
          <radialGradient id="orb-fill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={activeColor} stopOpacity={isIdle ? "0.08" : "0.18"} />
            <stop offset="60%" stopColor={activeColor} stopOpacity={isIdle ? "0.03" : "0.06"} />
            <stop offset="100%" stopColor={activeColor} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="core-fill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={activeColor} stopOpacity="1" />
            <stop offset="100%" stopColor={activeColor} stopOpacity="0.4" />
          </radialGradient>
        </defs>

        {/* Outer glow disk */}
        <circle cx="100" cy="100" r="90" fill="url(#orb-fill)" />

        {/* Signal rings — only when active or ready */}
        {!isIdle && (
          <>
            <circle
              cx="100" cy="100"
              fill="none"
              stroke={activeColor}
              className={isReady ? "ring-pulse-fast" : "ring-pulse"}
              style={{ strokeOpacity: 0.7, strokeWidth: 2 }}
            />
            <circle
              cx="100" cy="100"
              fill="none"
              stroke={activeColor}
              className={isReady ? "ring-pulse-fast-1" : "ring-pulse-delay-1"}
              style={{ strokeOpacity: 0.5, strokeWidth: 1.5 }}
            />
            <circle
              cx="100" cy="100"
              fill="none"
              stroke={activeColor}
              className={isReady ? "ring-pulse-fast-2" : "ring-pulse-delay-2"}
              style={{ strokeOpacity: 0.3, strokeWidth: 1 }}
            />
            <circle
              cx="100" cy="100"
              fill="none"
              stroke={activeColor}
              className="ring-pulse-delay-3"
              style={{ strokeOpacity: 0.2, strokeWidth: 0.8 }}
            />
          </>
        )}

        {/* Idle subtle ring */}
        {isIdle && (
          <circle
            cx="100" cy="100" r="40"
            fill="none"
            stroke={primaryColor}
            strokeOpacity="0.12"
            strokeWidth="1"
            strokeDasharray="4 6"
          />
        )}

        {/* Outer ring border */}
        <circle
          cx="100" cy="100" r="28"
          fill="none"
          stroke={activeColor}
          strokeOpacity={isIdle ? "0.15" : "0.55"}
          strokeWidth="1"
        />

        {/* Cross-hair lines */}
        <line x1="100" y1="72" x2="100" y2="86" stroke={activeColor} strokeOpacity={isIdle ? "0.15" : "0.5"} strokeWidth="1" />
        <line x1="100" y1="114" x2="100" y2="128" stroke={activeColor} strokeOpacity={isIdle ? "0.15" : "0.5"} strokeWidth="1" />
        <line x1="72" y1="100" x2="86" y2="100" stroke={activeColor} strokeOpacity={isIdle ? "0.15" : "0.5"} strokeWidth="1" />
        <line x1="114" y1="100" x2="128" y2="100" stroke={activeColor} strokeOpacity={isIdle ? "0.15" : "0.5"} strokeWidth="1" />

        {/* Diagonal marks */}
        <line x1="80" y1="80" x2="85" y2="85" stroke={activeColor} strokeOpacity={isIdle ? "0.1" : "0.35"} strokeWidth="1" />
        <line x1="115" y1="85" x2="120" y2="80" stroke={activeColor} strokeOpacity={isIdle ? "0.1" : "0.35"} strokeWidth="1" />
        <line x1="80" y1="120" x2="85" y2="115" stroke={activeColor} strokeOpacity={isIdle ? "0.1" : "0.35"} strokeWidth="1" />
        <line x1="115" y1="115" x2="120" y2="120" stroke={activeColor} strokeOpacity={isIdle ? "0.1" : "0.35"} strokeWidth="1" />

        {/* Core dot */}
        <circle
          cx="100" cy="100" r="7"
          fill="url(#core-fill)"
          style={{
            animation: isReady
              ? "orb-ready 0.8s ease-in-out infinite"
              : isActive
              ? "orb-breathe 2.4s ease-in-out infinite"
              : "none",
            transition: "r 0.4s ease",
          }}
        />

        {/* Inner ring */}
        <circle
          cx="100" cy="100" r="14"
          fill="none"
          stroke={activeColor}
          strokeOpacity={isIdle ? "0.1" : "0.3"}
          strokeWidth="0.75"
          strokeDasharray="3 5"
          style={{
            animation: isActive ? "spin 8s linear infinite" : isReady ? "spin 3s linear infinite" : "none",
            transformOrigin: "100px 100px",
          }}
        />
      </svg>

      {/* Data stream particles when active */}
      {isActive && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute font-mono text-[9px] text-primary/60"
              style={{
                left: `${20 + i * 12}%`,
                top: `${65 + (i % 3) * 10}%`,
                animation: `data-stream ${1.5 + i * 0.4}s ease-in-out ${i * 0.3}s infinite`,
                fontFamily: "'Geist Mono', monospace",
              }}
            >
              {["BCN", "1000", "48H", "SIG", "TX", "ORB"][i]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
