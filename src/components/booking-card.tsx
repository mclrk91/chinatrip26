"use client";

import { format } from "date-fns";
import { Plane, Building2, MapPin, Bus, Utensils, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  BOOKING_TYPE_COLORS,
  BOOKING_TYPE_LABELS,
  AIRLINE_IATA_CODES,
  TRAVELERS,
  TRAVELER_COLORS,
  AIRPORT_TIMEZONES,
  ET_OFFSET,
} from "@/lib/constants";
import type { Booking } from "@/lib/supabase/types";
import { AirlineLogo } from "./airline-logo";

const TYPE_ICONS: Record<string, React.ElementType> = {
  flight: Plane,
  hotel: Building2,
  tour: MapPin,
  activity: MapPin,
  transport: Bus,
  restaurant: Utensils,
  other: HelpCircle,
};

function formatLocalTime(dateStr: string, airportCode?: string): string {
  const date = new Date(dateStr);
  const h12 = format(date, "h:mm a");
  const h24 = format(date, "HH:mm");
  const code = airportCode || "";
  return `${h12} / ${h24} local${code ? ` (${code})` : ""}`;
}

function formatETTime(dateStr: string, airportCode?: string): string {
  const date = new Date(dateStr);
  const tz = airportCode ? AIRPORT_TIMEZONES[airportCode] : null;
  if (!tz) return "";
  const diffFromET = tz.utcOffset - ET_OFFSET;
  const etTime = new Date(date.getTime() - diffFromET * 60 * 60 * 1000);
  return `${format(etTime, "h:mm a")} ET`;
}

interface BookingCardProps {
  booking: Booking;
  onClick: () => void;
}

export function BookingCard({ booking, onClick }: BookingCardProps) {
  const isCancelled = booking.status === "cancelled";
  const color = BOOKING_TYPE_COLORS[booking.type] || "#6B7280";
  const Icon = TYPE_ICONS[booking.type] || HelpCircle;
  const details = booking.details as Record<string, string>;
  const isFlight = booking.type === "flight";

  const iataCode =
    details?.airline_iata ||
    (booking.provider ? AIRLINE_IATA_CODES[booking.provider] : undefined);

  const subtitle = (() => {
    if (isFlight && details?.departure_airport && details?.arrival_airport) {
      return `${details.departure_airport} → ${details.arrival_airport}${details.flight_number ? ` · ${details.flight_number}` : ""}`;
    }
    if (booking.type === "hotel" && details?.city) {
      return details.city;
    }
    return booking.provider || "";
  })();

  const depAirport = details?.departure_airport;
  const arrAirport = details?.arrival_airport;

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md active:scale-[0.98] ${
        isCancelled ? "opacity-50" : ""
      }`}
      onClick={onClick}
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="p-4 flex items-start gap-3">
        <div
          className="rounded-full p-2 flex-shrink-0 mt-0.5"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge
              className="text-xs px-2 py-0.5"
              style={{ backgroundColor: color, color: "white" }}
            >
              {BOOKING_TYPE_LABELS[booking.type]}
            </Badge>
            {booking.status === "pending" && (
              <Badge variant="outline" className="text-xs px-2 py-0.5 text-coral border-coral">
                Pending
              </Badge>
            )}
            {isCancelled && (
              <Badge variant="outline" className="text-xs px-2 py-0.5 text-muted-foreground">
                Cancelled
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isFlight && iataCode && (
              <AirlineLogo iataCode={iataCode} size={24} />
            )}
            <h3
              className={`font-semibold text-base leading-tight ${
                isCancelled ? "line-through text-muted-foreground" : ""
              }`}
            >
              {booking.title}
            </h3>
          </div>

          {subtitle && (
            <p className={`text-sm mt-0.5 ${isCancelled ? "line-through text-muted-foreground" : "text-muted-foreground"}`}>
              {subtitle}
            </p>
          )}

          {/* Dual time display for flights */}
          {isFlight && booking.date_start && (
            <div className="mt-1.5 text-xs text-muted-foreground space-y-0.5">
              <div>
                <span className="font-medium text-near-black">Dep:</span>{" "}
                {formatLocalTime(booking.date_start, depAirport)}
                {depAirport && (
                  <span className="text-china-red ml-1">→ {formatETTime(booking.date_start, depAirport)}</span>
                )}
              </div>
              {booking.date_end && (
                <div>
                  <span className="font-medium text-near-black">Arr:</span>{" "}
                  {formatLocalTime(booking.date_end, arrAirport)}
                  {arrAirport && (
                    <span className="text-china-red ml-1">→ {formatETTime(booking.date_end, arrAirport)}</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Non-flight time display */}
          {!isFlight && booking.date_start && (
            <div className="mt-1 text-sm text-muted-foreground">
              {format(new Date(booking.date_start), "h:mm a")}
            </div>
          )}

          {booking.confirmation_code && (
            <span className="inline-block font-mono text-xs bg-muted px-2 py-0.5 rounded mt-1.5">
              {booking.confirmation_code}
            </span>
          )}

          {/* Traveler pills */}
          {booking.travelers && booking.travelers.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {TRAVELERS.map((name) => {
                const isOnBooking = booking.travelers.includes(name);
                const colors = TRAVELER_COLORS[name];
                return (
                  <span
                    key={name}
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={
                      isOnBooking
                        ? { backgroundColor: colors?.bg || "#6B7280", color: colors?.text || "#fff" }
                        : { backgroundColor: "#e5e7eb", color: "#9ca3af" }
                    }
                  >
                    {name.split(" ")[0]}
                    {!isOnBooking && <span className="ml-0.5 text-[10px]">✗</span>}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
