"use client";

import { format } from "date-fns";
import { Plane, Building2, MapPin, Bus, Utensils, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BOOKING_TYPE_COLORS, BOOKING_TYPE_LABELS } from "@/lib/constants";
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

  const timeStr = booking.date_start
    ? format(new Date(booking.date_start), "h:mm a")
    : "";

  const subtitle = (() => {
    if (booking.type === "flight" && details?.departure_airport && details?.arrival_airport) {
      return `${details.departure_airport} → ${details.arrival_airport}${details.flight_number ? ` · ${details.flight_number}` : ""}`;
    }
    if (booking.type === "hotel" && details?.city) {
      return details.city;
    }
    return booking.provider || "";
  })();

  // Map booking type to badge background color class
  const badgeBgMap: Record<string, string> = {
    flight: "bg-brand-lightred text-brand-red",
    hotel: "bg-amber-100 text-amber-800",
    tour: "bg-emerald-100 text-emerald-800",
    activity: "bg-emerald-100 text-emerald-800",
    transport: "bg-blue-100 text-blue-800",
    restaurant: "bg-gray-100 text-gray-600",
    other: "bg-gray-100 text-gray-600",
  };

  const badgeClasses = badgeBgMap[booking.type] || "bg-gray-100 text-gray-600";

  return (
    <div
      className={`relative bg-brand-cardbg border border-[#F0EAE0] rounded-xl shadow-custom cursor-pointer transition-all hover:shadow-md active:scale-[0.98] overflow-hidden ${
        isCancelled ? "opacity-50" : ""
      }`}
      onClick={onClick}
    >
      {/* Left accent stripe */}
      <div
        className="w-2 absolute left-0 top-0 bottom-0 rounded-l-xl"
        style={{ backgroundColor: color }}
      />

      <div className="pl-6 pr-4 py-4 flex items-start gap-3">
        <div
          className="rounded-full p-2 flex-shrink-0 mt-0.5"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge
              className={`text-xs px-2 py-0.5 border-transparent ${badgeClasses}`}
            >
              {BOOKING_TYPE_LABELS[booking.type]}
            </Badge>
            {booking.status === "pending" && (
              <Badge variant="outline" className="text-xs px-2 py-0.5 text-coral border-coral">
                Pending
              </Badge>
            )}
            {isCancelled && (
              <Badge variant="outline" className="text-xs px-2 py-0.5 text-brand-muted">
                Cancelled
              </Badge>
            )}
          </div>

          <h3
            className={`font-serif text-xl font-bold leading-tight ${
              isCancelled ? "line-through text-brand-muted" : "text-brand-text"
            }`}
          >
            {booking.title}
          </h3>

          {subtitle && (
            <p className={`text-sm mt-0.5 ${isCancelled ? "line-through text-brand-muted" : "text-brand-muted"}`}>
              {subtitle}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2 text-sm text-brand-muted">
            {timeStr && <span className="text-[17px]">{timeStr}</span>}
            {booking.confirmation_code && (
              <span className="text-2xl font-mono tracking-wider text-black">
                {booking.confirmation_code}
              </span>
            )}
          </div>

          {booking.travelers && booking.travelers.length > 0 && (
            <p className="text-sm mt-1 text-brand-muted">
              {booking.travelers.map((t) => t.split(" ")[0]).join(", ")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
