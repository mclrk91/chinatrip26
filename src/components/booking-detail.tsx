"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ExternalLink, CheckCircle2, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
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
  onBookingUpdated?: () => void;
}

function DetailRow({ label, value, mono }: { label: string; value: string | null | undefined; mono?: boolean }) {
  if (!value) return null;
  return (
    <div className="py-2.5 border-b border-gray-100 last:border-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className={`text-base font-medium mt-0.5 ${mono ? "font-mono text-lg tracking-wide" : ""}`}>
        {value}
      </dd>
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  confirmed: "text-jade border-jade bg-jade/10",
  cancelled: "text-muted-foreground border-muted-foreground bg-muted",
  pending: "text-gold border-gold bg-gold/10",
  modified: "text-sky-blue border-sky-blue bg-sky-blue/10",
};

export function BookingDetail({
  booking,
  open,
  onClose,
  onEdit,
  onCancel,
  onDelete,
  onBookingUpdated,
}: BookingDetailProps) {
  const [wanderlogSending, setWanderlogSending] = useState(false);

  if (!booking) return null;

  const color = BOOKING_TYPE_COLORS[booking.type] || "#6B7280";
  const details = booking.details as Record<string, string>;
  const cost = booking.cost as Record<string, unknown>;
  const isCancelled = booking.status === "cancelled";
  const isFlightOrHotel = booking.type === "flight" || booking.type === "hotel";

  const handleResendWanderlog = async () => {
    setWanderlogSending(true);
    try {
      const res = await fetch("/api/wanderlog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Sent to Wanderlog!");
        onBookingUpdated?.();
      } else {
        toast.error(data.error || "Failed to send — try again");
      }
    } catch {
      toast.error("Failed to send — try again");
    } finally {
      setWanderlogSending(false);
    }
  };

  // Determine raw file type
  const rawFileUrl = booking.raw_file_url;
  const isPdf = rawFileUrl?.toLowerCase().endsWith(".pdf") || rawFileUrl?.includes("pdf");
  const isImage = rawFileUrl && /\.(jpg|jpeg|png|gif|webp|heic)$/i.test(rawFileUrl);

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge
              className="text-sm"
              style={{ backgroundColor: color, color: "white" }}
            >
              {BOOKING_TYPE_LABELS[booking.type]}
            </Badge>
            <Badge
              variant="outline"
              className={`text-sm ${STATUS_STYLES[booking.status] || ""}`}
            >
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Badge>
            {/* Wanderlog sync status */}
            {isFlightOrHotel && (
              <span className="flex items-center gap-1 text-xs">
                {booking.wanderlog_synced ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-jade" />
                    <span className="text-jade">Wanderlog</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-gold" />
                    <span className="text-gold">Not synced</span>
                  </>
                )}
              </span>
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
          <DetailRow label="Confirmation #" value={booking.confirmation_code} mono />
          {booking.alt_codes && Object.keys(booking.alt_codes).length > 0 && (
            <div className="py-2.5 border-b border-gray-100">
              <dt className="text-sm text-muted-foreground">Other Confirmations</dt>
              <dd className="mt-1 space-y-1">
                {Object.entries(booking.alt_codes).map(([name, code]) => (
                  <div key={name} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{name}</span>
                    <span className="font-mono text-base font-medium tracking-wide">{code}</span>
                  </div>
                ))}
              </dd>
            </div>
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
          {details?.address && <DetailRow label="Address" value={details.address} />}
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

        {/* Booking URL */}
        {booking.booking_url && (
          <a
            href={booking.booking_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-china-red mt-4 text-base font-medium min-h-[48px]"
          >
            <ExternalLink className="h-4 w-4" />
            View on Booking Site
          </a>
        )}

        {/* Raw File Preview */}
        {rawFileUrl && (
          <div className="mt-4 border rounded-lg overflow-hidden">
            <p className="text-sm text-muted-foreground px-3 py-2 bg-muted/50 border-b">
              Uploaded Document
            </p>
            {isPdf ? (
              <iframe
                src={rawFileUrl}
                className="w-full h-[400px]"
                title="Booking document"
              />
            ) : isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={rawFileUrl}
                alt="Booking document"
                className="w-full max-h-[400px] object-contain"
              />
            ) : (
              <a
                href={rawFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-3 text-china-red hover:underline"
              >
                View uploaded file
              </a>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-6 pt-4 border-t">
          <div className="flex gap-3">
            {!isCancelled && (
              <>
                <Button
                  onClick={() => onEdit(booking)}
                  variant="outline"
                  className="flex-1 min-h-[48px]"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => onCancel(booking)}
                  variant="outline"
                  className="flex-1 min-h-[48px] text-coral border-coral hover:bg-coral hover:text-white"
                >
                  Cancel Booking
                </Button>
              </>
            )}
            <Button
              onClick={() => onDelete(booking)}
              variant="destructive"
              className="flex-1 min-h-[48px]"
            >
              Delete
            </Button>
          </div>

          {/* Wanderlog resend button */}
          {isFlightOrHotel && !isCancelled && (
            <Button
              onClick={handleResendWanderlog}
              disabled={wanderlogSending}
              variant="outline"
              className="w-full min-h-[48px] text-jade border-jade hover:bg-jade hover:text-white"
            >
              {wanderlogSending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Resend to Wanderlog
                </span>
              )}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
