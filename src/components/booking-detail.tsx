"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ExternalLink, Copy, Car } from "lucide-react";
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
import { BOOKING_TYPE_COLORS, BOOKING_TYPE_LABELS, TRAVELER_COLORS } from "@/lib/constants";
import type { Booking } from "@/lib/supabase/types";

interface BookingDetailProps {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
  onEdit: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
  onDelete: (booking: Booking) => void;
}

function DetailRow({ label, value, copyable }: { label: string; value: string | null | undefined; copyable?: boolean }) {
  if (!value) return null;
  return (
    <div className="py-2 border-b border-gray-100 last:border-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-base font-medium mt-0.5 flex items-center gap-2">
        {value}
        {copyable && (
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(value);
              toast.success("Copied to clipboard!");
            }}
            className="text-muted-foreground hover:text-china-red transition-colors"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        )}
      </dd>
    </div>
  );
}

function TravelerPills({ travelers }: { travelers: string[] }) {
  if (!travelers || travelers.length === 0) return null;
  return (
    <div className="py-2 border-b border-gray-100">
      <dt className="text-sm text-muted-foreground mb-1.5">Travelers</dt>
      <dd className="flex flex-wrap gap-2">
        {travelers.map((name) => {
          const color = TRAVELER_COLORS[name] || "#6B7280";
          return (
            <span
              key={name}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: color }}
            >
              {name}
            </span>
          );
        })}
      </dd>
    </div>
  );
}

function ShowToDriverOverlay({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const details = booking.details as Record<string, string>;
  const hotelName = booking.title;
  const address = details?.address || details?.city || "";

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-8" onClick={onClose}>
      <p className="text-sm text-muted-foreground mb-4">Tap anywhere to close</p>
      <div className="text-center space-y-6">
        <p className="text-4xl font-bold leading-tight">{hotelName}</p>
        {address && <p className="text-3xl text-muted-foreground">{address}</p>}
        <div className="border-t pt-6 space-y-4">
          <p className="text-2xl font-medium">请带我去这个酒店</p>
          <p className="text-lg text-muted-foreground">Please take me to this hotel</p>
        </div>
        {details?.address_local && (
          <p className="text-2xl font-medium">{details.address_local}</p>
        )}
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
  const [showDriverOverlay, setShowDriverOverlay] = useState(false);

  if (!booking) return null;

  const color = BOOKING_TYPE_COLORS[booking.type] || "#6B7280";
  const details = booking.details as Record<string, string>;
  const cost = booking.cost as Record<string, unknown>;
  const isCancelled = booking.status === "cancelled";

  const domainUrl = booking.booking_url
    ? (() => {
        try {
          const url = new URL(booking.booking_url);
          return url.hostname.replace(/^www\./, "");
        } catch {
          return null;
        }
      })()
    : null;

  const gdriveUrl = booking.gdrive_file_id
    ? `https://drive.google.com/file/d/${booking.gdrive_file_id}/view`
    : null;

  return (
    <>
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
              {booking.status === "pending" && (
                <Badge
                  variant="outline"
                  className="text-sm text-coral border-coral"
                >
                  Pending
                </Badge>
              )}
              {isCancelled && (
                <Badge
                  variant="outline"
                  className="text-sm text-red-600 border-red-600 font-semibold"
                >
                  CANCELLED
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
            <DetailRow label="Confirmation #" value={booking.confirmation_code} copyable />

            {/* Per-person confirmation codes */}
            {booking.alt_codes && Object.keys(booking.alt_codes).length > 0 && (
              <div className="py-2 border-b border-gray-100">
                <dt className="text-sm text-muted-foreground mb-1">Per-Person Confirmations</dt>
                <dd className="space-y-1">
                  {Object.entries(booking.alt_codes).map(([name, code]) => (
                    <div key={name} className="flex items-center justify-between text-base">
                      <span className="font-medium">{name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(String(code));
                          toast.success(`Copied ${name}'s code!`);
                        }}
                        className="font-mono text-sm bg-muted px-2 py-0.5 rounded hover:bg-gray-200 active:scale-95 transition-all flex items-center gap-1"
                      >
                        {String(code)}
                        <Copy className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </dd>
              </div>
            )}

            {/* Traveler pills with colors */}
            <TravelerPills travelers={booking.travelers} />

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

          {/* Links */}
          <div className="flex flex-col gap-2 mt-4">
            {domainUrl && booking.booking_url && (
              <a
                href={booking.booking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-china-red text-base font-medium"
              >
                <ExternalLink className="h-4 w-4" />
                🔗 {domainUrl}
              </a>
            )}

            {gdriveUrl && (
              <a
                href={gdriveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-china-red text-base font-medium"
              >
                <ExternalLink className="h-4 w-4" />
                View Confirmation
              </a>
            )}

            {booking.type === "hotel" && (
              <button
                onClick={() => setShowDriverOverlay(true)}
                className="flex items-center gap-2 text-china-red text-base font-medium mt-1"
              >
                <Car className="h-4 w-4" />
                🚕 Show to Driver
              </button>
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
            {isCancelled && (
              <Button
                onClick={() => onDelete(booking)}
                variant="destructive"
                className="flex-1"
              >
                Delete
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {showDriverOverlay && (
        <ShowToDriverOverlay
          booking={booking}
          onClose={() => setShowDriverOverlay(false)}
        />
      )}
    </>
  );
}
