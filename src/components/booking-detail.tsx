"use client";

import { format } from "date-fns";
import { ExternalLink, FileText, Upload, Phone } from "lucide-react";
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
import { formatDualTime } from "@/lib/timezone";
import { getAirlineLogo, getHotelLogo } from "@/lib/logos";
import type { Booking } from "@/lib/supabase/types";

interface BookingDetailProps {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
  onEdit: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
  onDelete: (booking: Booking) => void;
  onShowDriver?: (booking: Booking) => void;
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

function TimeDetailRow({ label, dateStr, airportCode, city }: { label: string; dateStr: string; airportCode?: string; city?: string }) {
  const dual = formatDualTime(dateStr, airportCode, city);
  const dateLabel = format(new Date(dateStr), "EEE, MMM d, yyyy");
  return (
    <div className="py-2 border-b border-gray-100 last:border-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-base font-medium mt-0.5">
        {dateLabel} at{" "}
        <span>{dual.localTime}</span>
        {dual.localLabel && <span className="text-muted-foreground ml-1 text-sm">{dual.localLabel}</span>}
        <span className="text-muted-foreground mx-1">·</span>
        <span className="text-muted-foreground text-sm">{dual.etTime} ET</span>
      </dd>
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
  onShowDriver,
}: BookingDetailProps) {
  if (!booking) return null;

  const color = BOOKING_TYPE_COLORS[booking.type] || "#6B7280";
  const details = booking.details as Record<string, string>;
  const cost = booking.cost as Record<string, unknown>;
  const isCancelled = booking.status === "cancelled";

  // Logo
  let logoUrl: string | null = null;
  if (booking.type === "flight") {
    logoUrl = getAirlineLogo(booking.provider);
  } else if (booking.type === "hotel") {
    logoUrl = getHotelLogo(booking.title, booking.provider);
  }

  // Show to Driver: hotels and bookings with address
  const hasAddress = booking.type === "hotel" || details?.address || details?.meeting_point;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-2 mb-1">
            {logoUrl && (
              <div className="rounded-lg overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoUrl}
                  alt={booking.provider || booking.title}
                  className="w-12 h-12 object-contain"
                />
              </div>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                className="text-sm"
                style={{ backgroundColor: color, color: "white" }}
              >
                {BOOKING_TYPE_LABELS[booking.type]}
              </Badge>
              {booking.status !== "confirmed" && (
                <Badge
                  variant="outline"
                  className={`text-sm ${
                    isCancelled ? "text-muted-foreground" : booking.status === "pending" ? "text-coral border-coral" : "text-jade border-jade"
                  }`}
                >
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </Badge>
              )}
            </div>
          </div>
          <SheetTitle className={`text-xl ${isCancelled ? "line-through" : ""}`}>
            {booking.title}
          </SheetTitle>
          <SheetDescription>
            {booking.provider && `${booking.provider} · `}
            {booking.confirmation_code && `Confirmation: ${booking.confirmation_code}`}
          </SheetDescription>
        </SheetHeader>

        {/* Google Drive Link */}
        {booking.gdrive_file_id ? (
          <a
            href={`https://drive.google.com/file/d/${booking.gdrive_file_id}/view`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-3 rounded-lg mt-3 font-medium hover:bg-blue-100 transition-colors"
          >
            <FileText className="h-5 w-5" />
            View Confirmation
          </a>
        ) : (
          <a
            href="/upload"
            className="flex items-center gap-2 text-muted-foreground px-4 py-2 mt-3 text-sm"
          >
            <Upload className="h-4 w-4" />
            No confirmation uploaded — Upload
          </a>
        )}

        {/* Show to Driver button */}
        {hasAddress && onShowDriver && (
          <button
            onClick={() => onShowDriver(booking)}
            className="flex items-center justify-center gap-2 w-full bg-near-black text-white px-4 py-3 rounded-lg mt-2 font-medium text-base hover:bg-near-black/90 transition-colors"
          >
            <span className="text-lg">🚕</span>
            Show to Driver
          </button>
        )}

        <dl className="mt-4 space-y-0">
          {booking.date_start && (
            <TimeDetailRow
              label="Start"
              dateStr={booking.date_start}
              airportCode={details?.departure_airport}
              city={details?.city}
            />
          )}
          {booking.date_end && (
            <TimeDetailRow
              label="End"
              dateStr={booking.date_end}
              airportCode={details?.arrival_airport}
              city={details?.city}
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

          {/* Show address if present */}
          {details?.address && (
            <DetailRow label="Address" value={details.address} />
          )}
          {details?.phone && (
            <div className="py-2 border-b border-gray-100 last:border-0">
              <dt className="text-sm text-muted-foreground">Phone</dt>
              <dd className="text-base font-medium mt-0.5">
                <a href={`tel:${details.phone}`} className="flex items-center gap-1 text-china-red">
                  <Phone className="h-4 w-4" />
                  {details.phone}
                </a>
              </dd>
            </div>
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
