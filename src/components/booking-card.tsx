"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Plane, Building2, MapPin, Bus, Utensils, HelpCircle, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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

function ConfirmationCodeRow({ timeStr, code }: { timeStr: string; code: string | null }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success(`Copied: ${code}`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
      {timeStr && <span>{timeStr}</span>}
      {code && (
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1 font-mono text-xs bg-muted hover:bg-muted/80 px-2 py-0.5 rounded cursor-pointer transition-colors"
          title={`Copy ${code}`}
        >
          {code}
          {copied ? (
            <Check className="h-3 w-3 text-jade flex-shrink-0" />
          ) : (
            <Copy className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          )}
        </button>
      )}
    </div>
  );
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

          <ConfirmationCodeRow timeStr={timeStr} code={booking.confirmation_code} />

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
