"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import type { Booking } from "@/lib/supabase/types";

interface AskAISheetProps {
  onClose: () => void;
  bookings: Booking[];
}

const SUGGESTIONS = [
  "When do I land in Bangkok?",
  "How long is my longest flight?",
  "What's happening on Oct 15?",
  "Any bookings that conflict?",
];

export function AskAISheet({ onClose, bookings }: AskAISheetProps) {
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setLoading(true);
    setAnswer(null);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, bookings }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setAnswer(data.answer || "Sorry, I couldn't answer that.");
    } catch {
      setAnswer(
        "Sorry — I couldn't reach the assistant right now. Please try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(26,26,46,.55)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(180deg, #6B3410 0%, #4A2309 100%)",
          color: "#F5E9C8",
          width: "100%",
          maxWidth: 520,
          borderRadius: "20px 20px 0 0",
          padding: 20,
          paddingBottom: 32,
          maxHeight: "80vh",
          overflow: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.04em",
          }}
        >
          <Sparkles style={{ width: 16, height: 16 }} /> Ask AI
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              marginLeft: "auto",
              border: "none",
              background: "transparent",
              color: "#F5E9C8",
              cursor: "pointer",
              display: "inline-flex",
            }}
          >
            <X style={{ width: 22, height: 22 }} />
          </button>
        </div>
        <p style={{ margin: "6px 0 14px", fontSize: 13, opacity: 0.75 }}>
          Questions about your trip — flights, gaps, connections, hotels.
        </p>

        <div
          style={{
            display: "flex",
            gap: 6,
            background: "rgba(255,255,255,.08)",
            borderRadius: 12,
            padding: 6,
          }}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask()}
            placeholder="e.g. What time do I land in Bangkok on Oct 8?"
            autoFocus
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              color: "#F5E9C8",
              fontSize: 15,
              padding: "8px 10px",
              fontFamily: "var(--font-body)",
            }}
          />
          <button
            type="button"
            onClick={ask}
            disabled={loading}
            style={{
              border: "none",
              cursor: loading ? "wait" : "pointer",
              borderRadius: 8,
              background: "#F5E9C8",
              color: "#6B3410",
              padding: "0 16px",
              fontWeight: 700,
              fontSize: 13,
              fontFamily: "var(--font-body)",
            }}
          >
            {loading ? "…" : "Ask"}
          </button>
        </div>

        {answer && (
          <div
            style={{
              marginTop: 16,
              padding: 14,
              borderRadius: 12,
              background: "rgba(245,233,200,.08)",
              borderLeft: "3px solid #F5E9C8",
              fontSize: 14,
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
            }}
          >
            {answer}
          </div>
        )}

        {!answer && !loading && (
          <>
            <div
              className="label-caps"
              style={{
                marginTop: 14,
                fontSize: 12,
                opacity: 0.6,
              }}
            >
              Try asking
            </div>
            <div
              style={{
                marginTop: 8,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setQ(s);
                  }}
                  style={{
                    textAlign: "left",
                    border: "1px solid rgba(245,233,200,.2)",
                    background: "rgba(255,255,255,.04)",
                    color: "#F5E9C8",
                    borderRadius: 10,
                    padding: "10px 12px",
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
