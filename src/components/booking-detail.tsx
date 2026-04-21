"use client";

import type { ReactNode } from "react";
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
import { BOOKING_TYPE_COLORS, BOOKING_TYPE_LABELS } from "@/lib/constants";
import type { Booking } from "@/lib/supabase/types";

function confirmationLinkFor(booking: Booking): string | null {
  if (booking.booking_url) return booking.booking_url;
  if (booking.gdrive_file_id) {
    return `https://drive.google.com/file/d/${booking.gdrive_file_id}/view`;
  }
  if (booking.raw_file_url && booking.raw_file_url.includes("drive.google")) {
    return booking.raw_file_url;
  }
  return null;
}

interface BookingDetailProps {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
  onEdit: (booking: Booking) => void;
  onDelete: (booking: Booking) => void;
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  if (value === null || value === undefined || value === "") return null;
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
  onDelete,
}: BookingDetailProps) {
  if (!booking) return null;

  const color = BOOKING_TYPE_COLORS[booking.type] || "#6B7280";
  const details = booking.details as Record<string, string>;
  const cost = booking.cost as Record<string, unknown>;
  const isCancelled = booking.status === "cancelled";
  const showStatusBadge = booking.status !== "confirmed";

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom">
        <SheetHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge
              className="text-sm"
              style={{ backgroundColor: color, color: "white" }}
            >
              {BOOKING_TYPE_LABELS[booking.type]}
            </Badge>
            {showStatusBadge && (
              <Badge
                variant="outline"
                className={`text-sm ${
                  isCancelled
                    ? "text-muted-foreground"
                    : booking.status === "pending"
                    ? "text-coral border-coral"
                    : "text-jade border-jade"
                }`}
              >
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </Badge>
            )}
          </div>
          <SheetTitle className={`text-xl ${isCancelled ? "line-through" : ""}`}>
            {booking.title}
          </SheetTitle>
          <SheetDescription>
            {booking.provider && `${booking.provider} · `}
            {booking.confirmation_code && `Confirmation: ${booking.confirmation_code}`}
          </SheetDescription>
        </SheetHeader>

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
          {details?.seats && <DetailRow label="Seats" value={details.seats} />}
          {details?.city && <DetailRow label="City" value={details.city} />}
          {details?.room_type && <DetailRow label="Room Type" value={details.room_type} />}
          {details?.check_in && <DetailRow label="Check-in" value={details.check_in} />}
          {details?.check_out && <DetailRow label="Check-out" value={details.check_out} />}
          {booking.type === "hotel" && details?.address && (
            <DetailRow label="Address" value={details.address} />
          )}
          {booking.type === "hotel" && details?.phone && (
            <DetailRow
              label="Phone"
              value={
                <a
                  href={`tel:${String(details.phone).replace(/[^+\d]/g, "")}`}
                  style={{ color: "#6B3410", textDecoration: "underline" }}
                >
                  {details.phone}
                </a>
              }
            />
          )}
          {booking.type === "hotel" && details?.website && (
            <DetailRow
              label="Website"
              value={
                <a
                  href={details.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center"
                  style={{ color: "#6B3410", textDecoration: "underline", gap: 6 }}
                >
                  <ExternalLink style={{ width: 14, height: 14 }} />
                  {details.website}
                </a>
              }
            />
          )}
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

        <div className="mt-4 space-y-2">
          {(() => {
            const url = confirmationLinkFor(booking);
            if (!url) return null;
            return (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-base font-medium"
                style={{ color: "#6B3410" }}
              >
                <ExternalLink className="h-4 w-4" />
                Open Booking Confirmation Link
              </a>
            );
          })()}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-4 border-t">
          <Button
            onClick={() => onEdit(booking)}
            variant="outline"
            className="flex-1"
          >
            Edit
          </Button>
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
