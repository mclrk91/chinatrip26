"use client";

import { format } from "date-fns";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { BOOKING_TYPE_COLORS, BOOKING_TYPE_LABELS, getProviderUrl } from "@/lib/constants";
import type { Booking } from "@/lib/supabase/types";

interface BookingDetailProps {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
  onEdit: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
  onDelete: (booking: Booking) => void;
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="py-2 border-b border-gray-100 last:border-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-base font-medium mt-0.5">{value}</dd>
    </div>
  );
}

export function BookingDetail({
  booking,
  open,
  onClose,
  onEdit,
  onCancel,
  onDelete,
}: BookingDetailProps) {
  if (!booking) return null;

  const color = BOOKING_TYPE_COLORS[booking.type] || "#6B7280";
  const details = booking.details as Record<string, string>;
  const cost = booking.cost as Record<string, unknown>;
  const isCancelled = booking.status === "cancelled";
  const providerLink = getProviderUrl(booking.provider, booking.booking_url);

  // Flight duration
  const flightDuration = (() => {
    if (booking.type !== "flight" || !booking.date_start || !booking.date_end) return null;
    const ms = new Date(booking.date_end).getTime() - new Date(booking.date_start).getTime();
    if (ms <= 0) return null;
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const mins = Math.round((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  })();

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom">
        <SheetHeader>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge
              className="text-sm"
              style={{ backgroundColor: color, color: "white" }}
            >
              {BOOKING_TYPE_LABELS[booking.type]}
            </Badge>
            {isCancelled ? (
              <Badge className="text-sm bg-red-600 text-white">
                CANCELLED
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className={`text-sm ${
                  booking.status === "pending" ? "text-coral border-coral" : "text-jade border-jade"
                }`}
              >
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </Badge>
            )}
          </div>
          <SheetTitle className={`text-xl ${isCancelled ? "line-through text-muted-foreground" : ""}`}>
            {booking.title}
          </SheetTitle>
          <SheetDescription>
            {booking.provider && `${booking.provider} · `}
            {booking.confirmation_code && `Confirmation: ${booking.confirmation_code}`}
          </SheetDescription>
        </SheetHeader>

        {/* Provider Website Link — prominently placed right after header */}
        {providerLink && (
          <a
            href={providerLink.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 mt-3 py-2.5 px-4 rounded-lg bg-china-red/10 text-china-red font-medium text-base hover:bg-china-red/20 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Manage on {providerLink.label}
          </a>
        )}

        {isCancelled && (
          <p className="text-sm text-muted-foreground italic mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
            This booking is cancelled. Tap details below to see cancellation policy.
          </p>
        )}

        <dl className="mt-4 space-y-0">
          {booking.date_start && (
            <DetailRow
              label="Start"
              value={format(new Date(booking.date_start), "EEE, MMM d, yyyy 'at' h:mm a")}
            />
          )}
          {booking.date_end && (
            <DetailRow
              label="End"
              value={format(new Date(booking.date_end), "EEE, MMM d, yyyy 'at' h:mm a")}
            />
          )}
          <DetailRow label="Provider" value={booking.provider} />
          <DetailRow label="Confirmation #" value={booking.confirmation_code} />
          {booking.alt_codes && Object.keys(booking.alt_codes).length > 0 && (
            <DetailRow
              label="Other Confirmations"
              value={Object.entries(booking.alt_codes)
                .map(([k, v]) => `${k}: ${v}`)
                .join(", ")}
            />
          )}
          {booking.travelers && booking.travelers.length > 0 && (
            <DetailRow label="Travelers" value={booking.travelers.join(", ")} />
          )}
          {details?.flight_number && (
            <DetailRow label="Flight Number" value={details.flight_number} />
          )}
          {details?.departure_airport && details?.arrival_airport && (
            <DetailRow
              label="Route"
              value={`${details.departure_airport} → ${details.arrival_airport}`}
            />
          )}
          {flightDuration && (
            <DetailRow label="Flight Duration" value={flightDuration} />
          )}
          {details?.seats && <DetailRow label="Seats" value={details.seats} />}
          {details?.city && <DetailRow label="City" value={details.city} />}
          {details?.room_type && <DetailRow label="Room Type" value={details.room_type} />}
          {details?.check_in && <DetailRow label="Check-in" value={details.check_in} />}
          {details?.check_out && <DetailRow label="Check-out" value={details.check_out} />}
          <DetailRow label="Payment" value={booking.payment_method} />
          {cost?.amount != null && (
            <DetailRow
              label="Cost"
              value={`${String(cost.currency || "USD")} ${String(cost.amount)}`}
            />
          )}
          <DetailRow label="Cancellation Policy" value={booking.cancellation_policy} />
          <DetailRow label="Notes" value={booking.notes} />
        </dl>

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-4 border-t">
          {!isCancelled && (
            <>
              <Button
                onClick={() => onEdit(booking)}
                variant="outline"
                className="flex-1"
              >
                Edit
              </Button>
              <Button
                onClick={() => onCancel(booking)}
                variant="outline"
                className="flex-1 text-coral border-coral hover:bg-coral hover:text-white"
              >
                Cancel Booking
              </Button>
            </>
          )}
          <Button
            onClick={() => onDelete(booking)}
            variant="destructive"
            className="flex-1"
          >
            Delete
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
