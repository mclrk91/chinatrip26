"use client";

import { format } from "date-fns";
import { ExternalLink, Share2, FileText } from "lucide-react";
import { toast } from "sonner";
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

function buildShareText(booking: Booking): string {
  const details = booking.details as Record<string, string>;
  const typeEmoji: Record<string, string> = {
    flight: "\u2708\uFE0F",
    hotel: "\uD83C\uDFE8",
    tour: "\uD83C\uDFAB",
    activity: "\uD83C\uDFC4",
    transport: "\uD83D\uDE97",
    restaurant: "\uD83C\uDF7D\uFE0F",
    other: "\uD83D\uDCCC",
  };
  const emoji = typeEmoji[booking.type] || "";

  let line1 = `${emoji} ${booking.title}`;
  if (booking.type === "flight" && details?.departure_airport && details?.arrival_airport) {
    line1 = `${emoji} ${details.departure_airport} \u2192 ${details.arrival_airport}`;
    if (details.flight_number) line1 += ` | ${booking.provider || ""} ${details.flight_number}`;
  }

  const dateLine = booking.date_start
    ? format(new Date(booking.date_start), "MMM d, h:mm a")
    : "";

  const confLine = booking.confirmation_code
    ? `Confirmation: ${booking.confirmation_code}`
    : "";

  return [line1, dateLine, confLine].filter(Boolean).join("\n");
}

async function handleShare(booking: Booking) {
  const text = buildShareText(booking);

  if (navigator.share) {
    try {
      await navigator.share({ text });
    } catch {
      // User cancelled share — ignore
    }
  } else {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard \u2014 paste in Messages");
    } catch {
      toast.error("Unable to copy to clipboard");
    }
  }
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
            <Badge
              variant="outline"
              className={`text-sm ${
                isCancelled ? "text-muted-foreground" : booking.status === "pending" ? "text-coral border-coral" : "text-jade border-jade"
              }`}
            >
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Badge>
          </div>
          <SheetTitle className={`text-xl ${isCancelled ? "line-through" : ""}`}>
            {booking.title}
          </SheetTitle>
          <SheetDescription>
            {booking.provider && `${booking.provider} \u00B7 `}
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
              value={`${details.departure_airport} \u2192 ${details.arrival_airport}`}
            />
          )}
          {details?.seats && <DetailRow label="Seats" value={details.seats} />}
          {details?.city && <DetailRow label="City" value={details.city} />}
          {details?.room_type && <DetailRow label="Room Type" value={details.room_type} />}
          {details?.check_in && <DetailRow label="Check-in" value={details.check_in} />}
          {details?.check_out && <DetailRow label="Check-out" value={details.check_out} />}
          {details?.meeting_point && <DetailRow label="Meeting Point" value={details.meeting_point} />}
          {details?.duration && <DetailRow label="Duration" value={details.duration} />}
          {details?.includes && <DetailRow label="Includes" value={details.includes} />}
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

        {/* Links */}
        <div className="flex flex-col gap-2 mt-4">
          {booking.booking_url && (
            <a
              href={booking.booking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-china-red text-base font-medium active:opacity-70 transition-opacity"
            >
              <ExternalLink className="h-4 w-4" />
              View on Booking Site
            </a>
          )}
          {booking.raw_file_url && (
            <a
              href={booking.raw_file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sky-blue text-base font-medium active:opacity-70 transition-opacity"
            >
              <FileText className="h-4 w-4" />
              View Original Document
            </a>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-4 border-t">
          {!isCancelled && (
            <>
              <Button
                onClick={() => onEdit(booking)}
                variant="outline"
                className="flex-1 active:scale-95 active:opacity-80 transition-all"
              >
                Edit
              </Button>
              <Button
                onClick={() => onCancel(booking)}
                variant="outline"
                className="flex-1 text-coral border-coral hover:bg-coral hover:text-white active:scale-95 active:opacity-80 transition-all"
              >
                Cancel Booking
              </Button>
            </>
          )}
          <Button
            onClick={() => handleShare(booking)}
            variant="outline"
            className="active:scale-95 active:opacity-80 transition-all"
            title="Share"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => onDelete(booking)}
            variant="destructive"
            className="flex-1 active:scale-95 active:opacity-80 transition-all"
          >
            Delete
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
