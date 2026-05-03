import React from "react";
import { useGetNews } from "@/lib/api-client-react";
import { format } from "date-fns";

export function NewsFeed() {
  const { data: news } = useGetNews();
  if (!news || news.length === 0) return null;

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "40px" }}>
        <h2
          style={{
            fontFamily: "'Tomorrow', sans-serif",
            fontWeight: 700,
            fontSize: "22px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#fff",
          }}
        >
          Transmissions
        </h2>
        <span
          style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: "10px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.25)",
          }}
        >
          {news.length} dispatches
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
        {news.slice(0, 4).map((item, idx) => (
          <div
            key={item.id}
            className="card-hover"
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "10px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              cursor: "default",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span
                style={{
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: "10px",
                  letterSpacing: "0.1em",
                  color: idx === 0 ? "#FAFF00" : "rgba(255,255,255,0.3)",
                  textTransform: "uppercase",
                }}
              >
                {format(new Date(item.date), "dd MMM yyyy")}
              </span>
              {idx === 0 && (
                <span
                  style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: "9px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#FAFF00",
                    background: "rgba(250,255,0,0.07)",
                    border: "1px solid rgba(250,255,0,0.15)",
                    padding: "2px 8px",
                    borderRadius: "9999px",
                  }}
                >
                  Latest
                </span>
              )}
            </div>
            <h3
              style={{
                fontFamily: "'Tomorrow', sans-serif",
                fontWeight: 600,
                fontSize: "15px",
                lineHeight: 1.4,
                color: "rgba(255,255,255,0.9)",
                margin: 0,
              }}
            >
              {item.title}
            </h3>
            <p
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: "12px",
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.4)",
                margin: 0,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {item.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
