"use client";

import { format } from "date-fns";
import {
  ExternalLink,
  Plane,
  Building2,
  MapPin,
  Bus,
  Utensils,
  HelpCircle,
  Clock,
  Users,
  MapPinned,
  Hash,
  CreditCard,
  ShieldCheck,
  StickyNote,
  Armchair,
  CalendarDays,
  PenLine,
  X,
  Trash2,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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

interface BookingDetailProps {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
  onEdit: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
  onDelete: (booking: Booking) => void;
}

function DetailSection({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | null | undefined;
  icon: React.ElementType;
}) {
  if (!value) return null;
  return (
    <div className="border-b border-divider pb-5">
      <h2 className="text-sm font-bold tracking-wider text-muted-foreground mb-2 uppercase">
        {label}
      </h2>
      <div className="flex items-start gap-4">
        <Icon className="h-5 w-5 mt-0.5 flex-shrink-0 text-foreground/70" />
        <p className="text-[17px] font-medium leading-snug">{value}</p>
      </div>
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
  const TypeIcon = TYPE_ICONS[booking.type] || HelpCircle;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="bg-parchment px-6 pt-8 pb-6 flex flex-col">
        <SheetHeader className="text-center mb-0">
          {/* Type badge and status */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold text-white"
              style={{ backgroundColor: color }}
            >
              <TypeIcon className="h-3.5 w-3.5" />
              {BOOKING_TYPE_LABELS[booking.type]}
            </span>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${
                isCancelled
                  ? "text-muted-foreground border-muted"
                  : booking.status === "pending"
                    ? "text-coral border-coral"
                    : "text-jade border-jade"
              }`}
            >
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
          </div>

          {/* Confirmation code — ticket stub style */}
          <SheetTitle className="text-center">
            <span className="block text-lg font-bold tracking-tight text-foreground/70 uppercase">
              Confirmation Code:
            </span>
            <span
              className={`block text-2xl font-extrabold tracking-widest font-mono mt-1 ${
                isCancelled ? "line-through text-muted-foreground" : ""
              }`}
            >
              {booking.confirmation_code || "N/A"}
            </span>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Booking details for {booking.title}
          </SheetDescription>
        </SheetHeader>

        {/* Ticket perforated separator */}
        <div className="ticket-separator w-full" />

        {/* Scrollable detail sections */}
        <div className="flex-1 overflow-y-auto space-y-5 mt-1">
          {/* Title */}
          <div className="border-b border-divider pb-5">
            <h2 className="text-sm font-bold tracking-wider text-muted-foreground mb-2 uppercase">
              Booking
            </h2>
            <div className="flex items-start gap-4">
              <TypeIcon className="h-5 w-5 mt-0.5 flex-shrink-0 text-foreground/70" />
              <p
                className={`text-[17px] font-semibold leading-snug ${
                  isCancelled ? "line-through text-muted-foreground" : ""
                }`}
              >
                {booking.title}
              </p>
            </div>
          </div>

          {/* Provider */}
          <DetailSection
            label="Provider"
            value={
              booking.provider
                ? `${booking.provider}${details?.flight_number ? ` (${details.flight_number})` : ""}`
                : details?.flight_number || null
            }
            icon={Plane}
          />

          {/* Dates / Time */}
          {booking.date_start && (
            <DetailSection
              label="Time / Timezone"
              value={
                booking.date_end
                  ? `${format(new Date(booking.date_start), "h:mm a EEE, MMM d")} – ${format(new Date(booking.date_end), "h:mm a EEE, MMM d, yyyy")}`
                  : format(new Date(booking.date_start), "h:mm a EEE, MMM d, yyyy")
              }
              icon={Clock}
            />
          )}

          {/* Travelers */}
          {booking.travelers && booking.travelers.length > 0 && (
            <DetailSection
              label="Travelers"
              value={booking.travelers.join(", ")}
              icon={Users}
            />
          )}

          {/* Route (flights) */}
          {details?.departure_airport && details?.arrival_airport && (
            <DetailSection
              label="Route"
              value={`${details.departure_airport} → ${details.arrival_airport}`}
              icon={MapPinned}
            />
          )}

          {/* City (hotels/tours) */}
          <DetailSection label="City" value={details?.city} icon={MapPin} />

          {/* Room Type */}
          <DetailSection label="Room Type" value={details?.room_type} icon={Building2} />

          {/* Check-in / Check-out */}
          <DetailSection label="Check-in" value={details?.check_in} icon={CalendarDays} />
          <DetailSection label="Check-out" value={details?.check_out} icon={CalendarDays} />

          {/* Seats */}
          <DetailSection label="Seats" value={details?.seats} icon={Armchair} />

          {/* Confirmation # (if not already shown up top, show alt codes) */}
          {booking.alt_codes && Object.keys(booking.alt_codes).length > 0 && (
            <DetailSection
              label="Other Confirmations"
              value={Object.entries(booking.alt_codes)
                .map(([k, v]) => `${k}: ${v}`)
                .join(", ")}
              icon={Hash}
            />
          )}

          {/* Payment */}
          <DetailSection label="Payment" value={booking.payment_method} icon={CreditCard} />

          {/* Cost */}
          {cost?.amount != null && (
            <DetailSection
              label="Cost"
              value={`${String(cost.currency || "USD")} ${String(cost.amount)}`}
              icon={CreditCard}
            />
          )}

          {/* Cancellation Policy */}
          <DetailSection
            label="Cancellation Policy"
            value={booking.cancellation_policy}
            icon={ShieldCheck}
          />

          {/* Notes */}
          <DetailSection label="Notes" value={booking.notes} icon={StickyNote} />

          {/* Booking URL */}
          {booking.booking_url && (
            <div className="pb-2">
              <a
                href={booking.booking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-china-red text-[17px] font-medium hover:underline"
              >
                <ExternalLink className="h-5 w-5 flex-shrink-0" />
                View on Booking Site
              </a>
            </div>
          )}
        </div>

        {/* Action Buttons — styled per brief */}
        <footer className="mt-6 pt-4 border-t border-divider flex items-center justify-between gap-3">
          {!isCancelled && (
            <>
              {/* Edit — outlined */}
              <button
                onClick={() => onEdit(booking)}
                className="flex items-center justify-center gap-2 border-2 border-foreground rounded-lg py-3 px-5 font-bold text-[15px] hover:bg-foreground hover:text-parchment transition-colors min-h-[48px]"
              >
                <PenLine className="h-4 w-4" />
                EDIT
              </button>
              {/* Cancel Booking — red text */}
              <button
                onClick={() => onCancel(booking)}
                className="flex items-center justify-center gap-2 text-china-red font-bold text-[15px] hover:opacity-80 transition-opacity min-h-[48px]"
              >
                <X className="h-5 w-5" />
                <span className="text-left leading-tight">
                  CANCEL<br />BOOKING
                </span>
              </button>
            </>
          )}
          {/* Delete — grey text */}
          <button
            onClick={() => onDelete(booking)}
            className="flex items-center justify-center gap-2 text-muted-foreground font-bold text-[15px] hover:opacity-80 transition-opacity min-h-[48px]"
          >
            <Trash2 className="h-4 w-4" />
            DELETE
          </button>
        </footer>
      </SheetContent>
    </Sheet>
  );
}
