"use client";

import { useState } from "react";
import { Plane, Building2, MapPin, Bus, Utensils, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { BOOKING_TYPE_COLORS, BOOKING_TYPE_LABELS } from "@/lib/constants";
import { formatDualTime } from "@/lib/timezone";
import { getAirlineLogo, getHotelLogo } from "@/lib/logos";
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

export function BookingCard({ booking, onClick }: BookingCardProps) {
  const isCancelled = booking.status === "cancelled";
  const color = BOOKING_TYPE_COLORS[booking.type] || "#6B7280";
  const Icon = TYPE_ICONS[booking.type] || HelpCircle;
  const details = booking.details as Record<string, string>;

  // Determine logo
  let logoUrl: string | null = null;
  if (booking.type === "flight") {
    logoUrl = getAirlineLogo(booking.provider);
  } else if (booking.type === "hotel") {
    logoUrl = getHotelLogo(booking.title, booking.provider);
  }

  const [logoFailed, setLogoFailed] = useState(false);
  const showLogo = logoUrl && !logoFailed;

  // Dual time display
  const timeDisplay = booking.date_start
    ? formatDualTime(
        booking.date_start,
        details?.departure_airport || details?.arrival_airport,
        details?.city
      )
    : null;

  const subtitle = (() => {
    if (booking.type === "flight" && details?.departure_airport && details?.arrival_airport) {
      return `${details.departure_airport} → ${details.arrival_airport}${details.flight_number ? ` · ${details.flight_number}` : ""}`;
    }
    if (booking.type === "hotel" && details?.city) {
      return details.city;
    }
    return booking.provider || "";
  })();

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md active:scale-[0.98] ${
        isCancelled ? "opacity-50" : ""
      }`}
      onClick={onClick}
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="p-4 flex items-start gap-3">
        {/* Logo or icon */}
        {showLogo ? (
          <div className="flex-shrink-0 mt-0.5 rounded-lg overflow-hidden bg-white border border-gray-100 w-10 h-10 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl!}
              alt=""
              className="w-10 h-10 object-contain"
              onError={() => setLogoFailed(true)}
            />
          </div>
        ) : (
          <div
            className="rounded-full p-2 flex-shrink-0 mt-0.5"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
        )}

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

          <h3
            className={`font-semibold text-base leading-tight ${
              isCancelled ? "line-through text-muted-foreground" : ""
            }`}
          >
            {booking.title}
          </h3>

          {subtitle && (
            <p className={`text-sm mt-0.5 ${isCancelled ? "line-through text-muted-foreground" : "text-muted-foreground"}`}>
              {subtitle}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2 text-sm">
            {timeDisplay && (
              <span className="text-foreground">
                <span className="font-medium">{timeDisplay.localTime}</span>
                {timeDisplay.localLabel && (
                  <span className="text-muted-foreground ml-1">{timeDisplay.localLabel}</span>
                )}
                <span className="text-muted-foreground mx-1.5">·</span>
                <span className="text-muted-foreground text-xs">{timeDisplay.etTime} ET</span>
              </span>
            )}
            {booking.confirmation_code && (
              <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                {booking.confirmation_code}
              </span>
            )}
          </div>

          {booking.travelers && booking.travelers.length > 0 && (
            <p className="text-sm mt-1 text-muted-foreground">
              {booking.travelers.map((t) => t.split(" ")[0]).join(", ")}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
