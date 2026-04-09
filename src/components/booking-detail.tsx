"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ExternalLink, Copy, Check, MoreHorizontal } from "lucide-react";
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

function CopyableCode({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 font-mono text-sm bg-muted hover:bg-muted/80 px-2.5 py-1 rounded cursor-pointer transition-colors"
      title={`Copy ${label || code}`}
    >
      {code}
      {copied ? (
        <Check className="h-3.5 w-3.5 text-jade flex-shrink-0" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
      )}
    </button>
  );
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
  const [showMoreActions, setShowMoreActions] = useState(false);

  if (!booking) return null;

  const color = BOOKING_TYPE_COLORS[booking.type] || "#6B7280";
  const details = booking.details as Record<string, string>;
  const cost = booking.cost as Record<string, unknown>;
  const isCancelled = booking.status === "cancelled";

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) { onClose(); setShowMoreActions(false); } }}>
      <SheetContent side="bottom" className="flex flex-col max-h-[90vh] !p-0 !overflow-hidden">
        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-6 pt-6 pb-4">
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
              {booking.provider && `${booking.provider}`}
              {booking.provider && booking.confirmation_code && ` · `}
              {booking.confirmation_code && (
                <>
                  Confirmation: <CopyableCode code={booking.confirmation_code} />
                </>
              )}
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
            {booking.confirmation_code && (
              <div className="py-2 border-b border-gray-100">
                <dt className="text-sm text-muted-foreground">Confirmation #</dt>
                <dd className="mt-1">
                  <CopyableCode code={booking.confirmation_code} />
                </dd>
              </div>
            )}
            {booking.alt_codes && Object.keys(booking.alt_codes).length > 0 && (
              <div className="py-2 border-b border-gray-100">
                <dt className="text-sm text-muted-foreground">Other Confirmations</dt>
                <dd className="mt-1 flex flex-wrap gap-2">
                  {Object.entries(booking.alt_codes).map(([name, code]) => (
                    <div key={name} className="flex items-center gap-1.5">
                      <span className="text-sm text-muted-foreground">{name}:</span>
                      <CopyableCode code={code} label={`${name}: ${code}`} />
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

          {booking.booking_url && (
            <a
              href={booking.booking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-china-red mt-4 text-base font-medium"
            >
              <ExternalLink className="h-4 w-4" />
              View on Booking Site
            </a>
          )}
        </div>

        {/* Pinned action bar */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4">
          {!isCancelled ? (
            <div className="flex gap-3">
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
              <Button
                onClick={() => setShowMoreActions(!showMoreActions)}
                variant="outline"
                size="icon"
                className="flex-shrink-0"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-3">
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
          )}
          {showMoreActions && !isCancelled && (
            <div className="mt-3">
              <Button
                onClick={() => { setShowMoreActions(false); onDelete(booking); }}
                variant="destructive"
                className="w-full"
              >
                Delete Booking
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
