"use client";

import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { Search, Calendar, Sparkles, X } from "lucide-react";
import { AskAISheet } from "./ask-ai-sheet";
import type { Booking } from "@/lib/supabase/types";

interface DayOption {
  dateStr: string;
  dayNumber: number;
  date: Date;
  flag: string;
}

interface ItineraryTopBarProps {
  query: string;
  onQueryChange: (v: string) => void;
  days: DayOption[];
  onJumpTo: (dateStr: string) => void;
  bookings: Booking[];
}

export function ItineraryTopBar({
  query,
  onQueryChange,
  days,
  onJumpTo,
  bookings,
}: ItineraryTopBarProps) {
  const [jumpOpen, setJumpOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!jumpOpen) return;
    const onClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setJumpOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [jumpOpen]);

  const handleJump = (dateStr: string) => {
    setJumpOpen(false);
    onJumpTo(dateStr);
  };

  return (
    <div>
      <div
        ref={wrapperRef}
        style={{ display: "flex", gap: 8, position: "relative" }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#ffffff",
            borderRadius: 12,
            padding: "0 12px",
            height: 44,
            boxShadow: "0 1px 2px rgba(26,26,46,.05)",
          }}
        >
          <Search style={{ width: 16, height: 16, color: "#8C7B6A" }} />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search bookings, codes, cities…"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 15,
              fontFamily: "var(--font-body)",
              color: "#2B1810",
              minWidth: 0,
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="Clear search"
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: "#8C7B6A",
                padding: 0,
                display: "inline-flex",
              }}
            >
              <X style={{ width: 16, height: 16 }} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setJumpOpen((v) => !v)}
          aria-label="Jump to date"
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "#ffffff",
            border: "none",
            cursor: "pointer",
            color: "#2B1810",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 1px 2px rgba(26,26,46,.05)",
          }}
        >
          <Calendar style={{ width: 18, height: 18 }} />
        </button>

        {jumpOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              right: 0,
              background: "#fff",
              borderRadius: 12,
              padding: 6,
              boxShadow:
                "0 8px 28px rgba(26,26,46,.16), 0 2px 6px rgba(26,26,46,.08)",
              maxHeight: 280,
              overflow: "auto",
              zIndex: 50,
              minWidth: 240,
            }}
          >
            {days.map((d) => {
              const dow = format(d.date, "EEE");
              const mon = format(d.date, "MMM");
              return (
                <button
                  key={d.dateStr}
                  type="button"
                  onClick={() => handleJump(d.dateStr)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    padding: "8px 10px",
                    border: "none",
                    background: "transparent",
                    borderRadius: 8,
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "inherit",
                    fontSize: 14,
                    color: "#2B1810",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--paper-200)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <span style={{ fontSize: 16 }}>{d.flag}</span>
                  <span style={{ fontWeight: 700, width: 54 }}>Day {d.dayNumber}</span>
                  <span
                    style={{
                      color: "#8C7B6A",
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    {dow}, {mon} {d.date.getDate()}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setAiOpen(true)}
        style={{
          marginTop: 16,
          width: "100%",
          height: 44,
          borderRadius: 999,
          background: "linear-gradient(135deg, #6B3410 0%, #8B4513 100%)",
          color: "#F5E9C8",
          border: "none",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          fontFamily: "var(--font-body)",
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: "0.02em",
          boxShadow: "0 2px 8px rgba(43,27,77,.25)",
        }}
      >
        <Sparkles style={{ width: 16, height: 16 }} />
        Ask AI about your trip
      </button>

      {aiOpen && (
        <AskAISheet onClose={() => setAiOpen(false)} bookings={bookings} />
      )}
    </div>
  );
}
