"use client";

import { X } from "lucide-react";
import {
  TRAVELERS,
  BOOKING_TYPES,
  BOOKING_TYPE_COLORS,
  BOOKING_TYPE_LABELS,
  getTravelerMeta,
  type BookingType,
} from "@/lib/constants";

interface ItineraryFilterPanelProps {
  selectedTravelers: Set<string>;
  selectedTypes: Set<BookingType>;
  onToggleTraveler: (name: string) => void;
  onToggleType: (type: BookingType) => void;
  onClear: () => void;
  onClose: () => void;
}

export function ItineraryFilterPanel({
  selectedTravelers,
  selectedTypes,
  onToggleTraveler,
  onToggleType,
  onClear,
  onClose,
}: ItineraryFilterPanelProps) {
  const hasAny = selectedTravelers.size > 0 || selectedTypes.size > 0;

  return (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 6px)",
        right: 0,
        left: 0,
        background: "#fff",
        borderRadius: 12,
        padding: 14,
        boxShadow:
          "0 8px 28px rgba(26,26,46,.16), 0 2px 6px rgba(26,26,46,.08)",
        zIndex: 50,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#6B3410",
          }}
        >
          Filters
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close filters"
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
      </div>

      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#8C7B6A",
            marginBottom: 8,
          }}
        >
          Traveler
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {TRAVELERS.map((name) => {
            const meta = getTravelerMeta(name);
            const active = selectedTravelers.has(name);
            return (
              <button
                key={name}
                type="button"
                onClick={() => onToggleTraveler(name)}
                style={{
                  border: `1.5px solid ${meta.color}`,
                  background: active ? meta.color : "#fff",
                  color: active ? "#fff" : meta.color,
                  borderRadius: 999,
                  padding: "6px 12px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {meta.short}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#8C7B6A",
            marginBottom: 8,
          }}
        >
          Booking type
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {BOOKING_TYPES.map((type) => {
            const color = BOOKING_TYPE_COLORS[type];
            const active = selectedTypes.has(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => onToggleType(type)}
                style={{
                  border: `1.5px solid ${color}`,
                  background: active ? color : "#fff",
                  color: active ? "#fff" : color,
                  borderRadius: 999,
                  padding: "6px 12px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {BOOKING_TYPE_LABELS[type]}
              </button>
            );
          })}
        </div>
      </div>

      {hasAny && (
        <div style={{ marginTop: 12, textAlign: "right" }}>
          <button
            type="button"
            onClick={onClear}
            style={{
              border: "none",
              background: "transparent",
              color: "#6B3410",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "underline",
              cursor: "pointer",
              padding: 0,
              fontFamily: "inherit",
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
