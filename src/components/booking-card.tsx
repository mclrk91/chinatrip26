"use client";

import { format } from "date-fns";
import { Plane, Building2, MapPin, Bus, Utensils, HelpCircle, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { BOOKING_TYPE_COLORS, BOOKING_TYPE_LABELS, getProviderUrl } from "@/lib/constants";
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
  const providerLink = getProviderUrl(booking.provider, booking.booking_url);

  const timeStr = booking.date_start
    ? format(new Date(booking.date_start), "h:mm a")
    : "";

  // Calculate flight duration if both start and end times exist
  const durationStr = (() => {
    if (booking.type !== "flight" || !booking.date_start || !booking.date_end) return "";
    const ms = new Date(booking.date_end).getTime() - new Date(booking.date_start).getTime();
    if (ms <= 0) return "";
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const mins = Math.round((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  })();

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
        <div
          className="rounded-full p-2 flex-shrink-0 mt-0.5"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
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
              <Badge className="text-xs px-2 py-0.5 bg-red-600 text-white">
                CANCELLED
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

          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground flex-wrap">
            {timeStr && <span>{timeStr}</span>}
            {durationStr && (
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">
                {durationStr}
              </span>
            )}
            {booking.confirmation_code && (
              <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                {booking.confirmation_code}
              </span>
            )}
          </div>

          {providerLink && (
            <a
              href={providerLink.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 mt-2 text-xs font-medium text-china-red hover:underline bg-china-red/5 px-2 py-1 rounded-full"
            >
              <ExternalLink className="h-3 w-3" />
              {providerLink.label}
            </a>
          )}

          {isCancelled && (
            <p className="text-xs text-muted-foreground mt-2 italic">
              This booking is cancelled. Tap to see details and cancellation policy.
            </p>
          )}

          {booking.travelers && booking.travelers.length > 0 && !isCancelled && (
            <p className="text-sm mt-1 text-muted-foreground">
              {booking.travelers.map((t) => t.split(" ")[0]).join(", ")}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
