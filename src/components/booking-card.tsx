"use client";

import { format } from "date-fns";
import { Plane, Building2, MapPin, Bus, Utensils, HelpCircle, Clock } from "lucide-react";
import {
  BOOKING_TYPE_COLORS,
  BOOKING_TYPE_SOFT,
  BOOKING_TYPE_LABELS,
  getTravelerMeta,
} from "@/lib/constants";
import type { Booking } from "@/lib/supabase/types";

const TYPE_ICONS: Record<string, React.ElementType> = {
  flight: Plane,
  hotel: Building2,
  tour: MapPin,
  activity: MapPin,
  transport: Bus,
  restaurant: Utensils,
  other: HelpCircle,
};

interface BookingCardProps {
  booking: Booking;
  onClick: () => void;
}

function TravelerAvatar({ name, size = 20 }: { name: string; size?: number }) {
  const m = getTravelerMeta(name);
  return (
    <span
      title={m.short}
      className="inline-flex items-center justify-center rounded-full text-white font-bold"
      style={{
        width: size,
        height: size,
        background: m.color,
        fontSize: Math.round(size * 0.46),
        fontFamily: "var(--font-body)",
        boxShadow: "0 0 0 2px #ffffff",
      }}
    >
      {m.initial}
    </span>
  );
}

function TravelerStack({ names, size = 20 }: { names: string[]; size?: number }) {
  if (names.length === 0) return null;
  const allFour = names.length >= 4;
  if (allFour) {
    return (
      <span
        className="label-caps inline-flex items-center whitespace-nowrap"
        style={{
          fontSize: 11,
          color: "var(--ink-500)",
          background: "var(--paper-200)",
          padding: "3px 8px",
          borderRadius: 999,
        }}
      >
        All 4
      </span>
    );
  }
  return (
    <span className="inline-flex items-center">
      {names.map((n, i) => (
        <span key={n} style={{ marginLeft: i === 0 ? 0 : -6 }}>
          <TravelerAvatar name={n} size={size} />
        </span>
      ))}
    </span>
  );
}

export function BookingCard({ booking, onClick }: BookingCardProps) {
  const isCancelled = booking.status === "cancelled";
  const isPending = booking.status === "pending";
  const color = BOOKING_TYPE_COLORS[booking.type] || "#6B6B78";
  const soft = BOOKING_TYPE_SOFT[booking.type] || "#EFE8DF";
  const Icon = TYPE_ICONS[booking.type] || HelpCircle;
  const details = booking.details as Record<string, string>;

  const startTime = booking.date_start ? format(new Date(booking.date_start), "h:mm a") : "";
  const endTime = booking.date_end ? format(new Date(booking.date_end), "h:mm a") : "";
  const tz = (details?.timezone as string) || "";

  const subtitle = (() => {
    if (booking.type === "flight" && details?.departure_airport && details?.arrival_airport) {
      return `${details.departure_airport} → ${details.arrival_airport}${
        details.flight_number ? ` · ${details.flight_number}` : ""
      }`;
    }
    if (booking.type === "hotel" && details?.city) {
      const nights = details?.nights ? ` · ${details.nights} night${details.nights === "1" ? "" : "s"}` : "";
      return `${details.city}${nights}`;
    }
    return booking.provider || "";
  })();

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left cursor-pointer transition-all active:scale-[0.99]"
      style={{
        background: "#ffffff",
        borderRadius: 14,
        padding: "12px 14px",
        boxShadow:
          "0 1px 2px rgba(26,26,46,.05), 0 2px 8px rgba(26,26,46,.04)",
        display: "flex",
        gap: 12,
        alignItems: "stretch",
        opacity: isCancelled ? 0.55 : 1,
        border: "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 6px 16px rgba(26,26,46,.10)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow =
          "0 1px 2px rgba(26,26,46,.05), 0 2px 8px rgba(26,26,46,.04)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Icon tile */}
      <div
        className="flex-shrink-0 inline-flex items-center justify-center"
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          background: soft,
          color,
          marginTop: 2,
        }}
      >
        <Icon style={{ width: 16, height: 16 }} />
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0 flex flex-col" style={{ gap: 4 }}>
        <div
          className="flex items-center gap-2"
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            color,
          }}
        >
          <span>{BOOKING_TYPE_LABELS[booking.type]}</span>
          {isPending && (
            <span
              style={{
                color: "#C96F3B",
                background: "#F7E3D3",
                padding: "2px 6px",
                borderRadius: 4,
                fontSize: 10,
              }}
            >
              Pending
            </span>
          )}
          {isCancelled && (
            <span
              style={{
                color: "var(--ink-500)",
                background: "var(--paper-200)",
                padding: "2px 6px",
                borderRadius: 4,
                fontSize: 10,
              }}
            >
              Cancelled
            </span>
          )}
        </div>

        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            lineHeight: 1.25,
            color: "var(--foreground)",
            textDecoration: isCancelled ? "line-through" : "none",
          }}
        >
          {booking.title}
        </div>

        {subtitle && (
          <div style={{ fontSize: 13, color: "var(--muted-foreground)", lineHeight: 1.3 }}>
            {subtitle}
          </div>
        )}

        <div
          className="flex items-center justify-between flex-wrap"
          style={{ gap: 8, marginTop: 4 }}
        >
          {startTime && (
            <span
              className="inline-flex items-center whitespace-nowrap"
              style={{ gap: 4, fontSize: 12, color: "var(--muted-foreground)" }}
            >
              <Clock style={{ width: 13, height: 13 }} />
              {startTime}
              {endTime ? ` – ${endTime}` : ""}
              {tz && (
                <span
                  style={{
                    marginLeft: 4,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    color: "var(--brown-300, #8C7B6A)",
                  }}
                >
                  {tz}
                </span>
              )}
            </span>
          )}
          <TravelerStack names={booking.travelers || []} />
        </div>
      </div>
    </button>
  );
}
