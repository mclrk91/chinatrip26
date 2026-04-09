"use client";

import { format } from "date-fns";
import { ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  BOOKING_TYPE_COLORS,
  BOOKING_TYPE_LABELS,
  AIRLINE_IATA_CODES,
  TRAVELERS,
  TRAVELER_COLORS,
  AIRPORT_TIMEZONES,
  ET_OFFSET,
} from "@/lib/constants";
import type { Booking } from "@/lib/supabase/types";
import { AirlineLogo } from "./airline-logo";

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

function formatFlightTime(dateStr: string, airportCode?: string): string {
  const date = new Date(dateStr);
  const h12 = format(date, "h:mm a");
  const h24 = format(date, "HH:mm");
  return `${h12} / ${h24} local${airportCode ? ` (${airportCode})` : ""}`;
}

function getETTime(dateStr: string, airportCode?: string): string {
  if (!airportCode) return "";
  const date = new Date(dateStr);
  const tz = AIRPORT_TIMEZONES[airportCode];
  if (!tz) return "";
  const diffFromET = tz.utcOffset - ET_OFFSET;
  const etTime = new Date(date.getTime() - diffFromET * 60 * 60 * 1000);
  return `${format(etTime, "h:mm a")} ET`;
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
  const isFlight = booking.type === "flight";
  const iataCode = details?.airline_iata || (booking.provider ? AIRLINE_IATA_CODES[booking.provider] : undefined);
  const depAirport = details?.departure_airport;
  const arrAirport = details?.arrival_airport;

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
          <SheetTitle className={`text-xl flex items-center gap-2 ${isCancelled ? "line-through" : ""}`}>
            {isFlight && iataCode && <AirlineLogo iataCode={iataCode} size={28} />}
            {booking.title}
          </SheetTitle>
          <SheetDescription>
            {booking.provider && `${booking.provider}`}
          </SheetDescription>
        </SheetHeader>

        <dl className="mt-4 space-y-0">
          {/* Traveler pills */}
          <div className="py-2 border-b border-gray-100">
            <dt className="text-sm text-muted-foreground mb-1.5">Travelers</dt>
            <dd className="flex flex-wrap gap-1.5">
              {TRAVELERS.map((name) => {
                const isOnBooking = booking.travelers?.includes(name);
                const colors = TRAVELER_COLORS[name];
                return (
                  <span
                    key={name}
                    className="text-sm px-3 py-1 rounded-full font-medium"
                    style={
                      isOnBooking
                        ? { backgroundColor: colors?.bg || "#6B7280", color: colors?.text || "#fff" }
                        : { backgroundColor: "#f3f4f6", color: "#9ca3af", border: "1px dashed #d1d5db" }
                    }
                  >
                    {name}
                    {!isOnBooking && <span className="ml-1 text-xs italic">not on this booking</span>}
                  </span>
                );
              })}
            </dd>
          </div>

          {/* Flight times with dual format */}
          {isFlight && booking.date_start && (
            <div className="py-2 border-b border-gray-100">
              <dt className="text-sm text-muted-foreground">Departure</dt>
              <dd className="text-base font-medium mt-0.5">
                {format(new Date(booking.date_start), "EEE, MMM d, yyyy")}
                <br />
                <span>{formatFlightTime(booking.date_start, depAirport)}</span>
                {depAirport && (
                  <span className="text-china-red ml-2 font-semibold">→ {getETTime(booking.date_start, depAirport)}</span>
                )}
              </dd>
            </div>
          )}
          {isFlight && booking.date_end && (
            <div className="py-2 border-b border-gray-100">
              <dt className="text-sm text-muted-foreground">Arrival</dt>
              <dd className="text-base font-medium mt-0.5">
                {format(new Date(booking.date_end), "EEE, MMM d, yyyy")}
                <br />
                <span>{formatFlightTime(booking.date_end, arrAirport)}</span>
                {arrAirport && (
                  <span className="text-china-red ml-2 font-semibold">→ {getETTime(booking.date_end, arrAirport)}</span>
                )}
              </dd>
            </div>
          )}

          {/* Non-flight dates */}
          {!isFlight && booking.date_start && (
            <DetailRow
              label="Start"
              value={format(new Date(booking.date_start), "EEE, MMM d, yyyy 'at' h:mm a")}
            />
          )}
          {!isFlight && booking.date_end && (
            <DetailRow
              label="End"
              value={format(new Date(booking.date_end), "EEE, MMM d, yyyy 'at' h:mm a")}
            />
          )}

          <DetailRow label="Provider" value={booking.provider} />

          {/* Per-person confirmation codes */}
          {(booking.confirmation_code || (booking.alt_codes && Object.keys(booking.alt_codes).length > 0)) && (
            <div className="py-2 border-b border-gray-100">
              <dt className="text-sm text-muted-foreground">Confirmations</dt>
              <dd className="mt-1 space-y-1">
                {booking.confirmation_code && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {booking.alt_codes && Object.keys(booking.alt_codes).length > 0
                        ? (() => {
                            const altNames = Object.keys(booking.alt_codes);
                            const mainTravelers = booking.travelers?.filter(t => !altNames.includes(t)) || [];
                            return mainTravelers.length > 0 ? mainTravelers.map(t => t.split(" ")[0]).join(" & ") + ":" : "Primary:";
                          })()
                        : "All:"}
                    </span>
                    <span className="font-mono text-base font-semibold bg-muted px-2 py-0.5 rounded">
                      {booking.confirmation_code}
                    </span>
                  </div>
                )}
                {booking.alt_codes && Object.entries(booking.alt_codes).map(([name, code]) => (
                  <div key={name} className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{name}:</span>
                    <span className="font-mono text-base font-semibold bg-muted px-2 py-0.5 rounded">
                      {code}
                    </span>
                  </div>
                ))}
              </dd>
            </div>
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

          {/* Payment Details Section */}
          {(booking.payment_method || (cost && Object.keys(cost).length > 0)) && (() => {
            const platform = cost?.booking_platform ? String(cost.booking_platform) : "";
            const pointsUsed = cost?.points_used ? String(cost.points_used) : "";
            const pointsCurrency = cost?.points_currency ? String(cost.points_currency) : "points";
            const totalCash = cost?.total_cash ? String(cost.total_cash) : "";
            const cardUsed = cost?.card_used ? String(cost.card_used) : "";
            const amount = cost?.amount != null ? String(cost.amount) : "";
            const currency = cost?.currency ? String(cost.currency) : "USD";
            return (
              <div className="py-2 border-b border-gray-100">
                <dt className="text-sm text-muted-foreground mb-1">Payment Details</dt>
                <dd className="space-y-1 text-base">
                  {platform && (
                    <p><span className="text-sm text-muted-foreground">Booked through:</span> <span className="font-medium">{platform}</span></p>
                  )}
                  {pointsUsed && (
                    <p>
                      <span className="text-sm text-muted-foreground">Payment:</span>{" "}
                      <span className="font-medium">
                        {pointsUsed} {pointsCurrency}
                        {totalCash ? ` + $${totalCash}` : ""}
                      </span>
                    </p>
                  )}
                  {!pointsUsed && amount && (
                    <p><span className="text-sm text-muted-foreground">Cost:</span> <span className="font-medium">{currency} {amount}</span></p>
                  )}
                  {cardUsed && (
                    <p><span className="text-sm text-muted-foreground">Card:</span> <span className="font-medium">{cardUsed}</span></p>
                  )}
                  {booking.payment_method && !platform && (
                    <p><span className="text-sm text-muted-foreground">Method:</span> <span className="font-medium">{booking.payment_method}</span></p>
                  )}
                </dd>
              </div>
            );
          })()}

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
              className="flex items-center gap-2 text-china-red text-base font-medium"
            >
              <ExternalLink className="h-4 w-4" />
              View on Booking Site
            </a>
          )}
          {booking.gdrive_file_id && (
            <a
              href={`https://drive.google.com/file/d/${booking.gdrive_file_id}/view`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sky-blue text-base font-medium"
            >
              <FileText className="h-4 w-4" />
              View in Google Drive
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
