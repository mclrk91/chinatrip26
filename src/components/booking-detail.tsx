"use client";

import { format } from "date-fns";
import { ExternalLink, Plane, Clock, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { BOOKING_TYPE_LABELS } from "@/lib/constants";
import type { Booking } from "@/lib/supabase/types";

interface BookingDetailProps {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
  onEdit: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
  onDelete: (booking: Booking) => void;
}

function DetailRow({ label, value, icon }: { label: string; value: string | null | undefined; icon?: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="py-3 border-b border-[#E6E2D6] last:border-0 pb-5">
      <dt className="text-sm font-bold tracking-wider uppercase text-brand-muted flex items-center gap-2">
        {icon}
        {label}
      </dt>
      <dd className="text-base font-medium mt-1 text-brand-text">{value}</dd>
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

  const details = booking.details as Record<string, string>;
  const cost = booking.cost as Record<string, unknown>;
  const isCancelled = booking.status === "cancelled";

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="bg-[#F7F4EB] rounded-t-[2.5rem]">
        <SheetHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge
              className="text-sm border-transparent bg-brand-lightred text-brand-red"
            >
              {BOOKING_TYPE_LABELS[booking.type]}
            </Badge>
            <Badge
              variant="outline"
              className={`text-sm ${
                isCancelled ? "text-brand-muted" : booking.status === "pending" ? "text-coral border-coral" : "text-jade border-jade"
              }`}
            >
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Badge>
          </div>
          <SheetTitle className={`font-serif text-xl ${isCancelled ? "line-through" : ""}`}>
            {booking.title}
          </SheetTitle>
          {booking.confirmation_code && (
            <div className="text-2xl font-bold text-center mt-2 text-brand-text">
              {booking.confirmation_code}
            </div>
          )}
          <SheetDescription>
            {booking.provider && `${booking.provider}`}
          </SheetDescription>
        </SheetHeader>

        {/* Ticket separator */}
        <div className="ticket-separator" />

        <dl className="mt-4 space-y-0">
          {booking.date_start && (
            <DetailRow
              label="Start"
              icon={<Clock className="h-4 w-4" />}
              value={format(new Date(booking.date_start), "EEE, MMM d, yyyy 'at' h:mm a")}
            />
          )}
          {booking.date_end && (
            <DetailRow
              label="End"
              icon={<Clock className="h-4 w-4" />}
              value={format(new Date(booking.date_end), "EEE, MMM d, yyyy 'at' h:mm a")}
            />
          )}
          <DetailRow label="Provider" icon={<Plane className="h-4 w-4" />} value={booking.provider} />
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
            <DetailRow label="Travelers" icon={<Users className="h-4 w-4" />} value={booking.travelers.join(", ")} />
          )}
          {details?.flight_number && (
            <DetailRow label="Flight Number" icon={<Plane className="h-4 w-4" />} value={details.flight_number} />
          )}
          {details?.departure_airport && details?.arrival_airport && (
            <DetailRow
              label="Route"
              icon={<MapPin className="h-4 w-4" />}
              value={`${details.departure_airport} → ${details.arrival_airport}`}
            />
          )}
          {details?.seats && <DetailRow label="Seats" value={details.seats} />}
          {details?.city && <DetailRow label="City" icon={<MapPin className="h-4 w-4" />} value={details.city} />}
          {details?.room_type && <DetailRow label="Room Type" value={details.room_type} />}
          {details?.check_in && <DetailRow label="Check-in" icon={<Clock className="h-4 w-4" />} value={details.check_in} />}
          {details?.check_out && <DetailRow label="Check-out" icon={<Clock className="h-4 w-4" />} value={details.check_out} />}
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
            className="flex items-center gap-2 text-brand-red mt-4 text-base font-medium"
          >
            <ExternalLink className="h-4 w-4" />
            View on Booking Site
          </a>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-[#E6E2D6]">
          {!isCancelled && (
            <>
              <Button
                onClick={() => onEdit(booking)}
                variant="outline"
                className="flex-1 border-brand-border"
              >
                Edit
              </Button>
              <Button
                onClick={() => onCancel(booking)}
                variant="ghost"
                className="flex-1 text-[#A3333D] hover:text-[#A3333D] hover:bg-brand-lightred"
              >
                Cancel Booking
              </Button>
            </>
          )}
          <Button
            onClick={() => onDelete(booking)}
            variant="ghost"
            className="flex-1 text-[#737373] hover:text-[#737373] hover:bg-gray-100"
          >
            Delete
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
