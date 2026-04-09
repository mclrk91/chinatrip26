"use client";

import { useEffect, useState } from "react";
import { X, MapPin, Phone } from "lucide-react";
import type { Booking } from "@/lib/supabase/types";

interface ShowDriverModalProps {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
}

export function ShowDriverModal({ booking, open, onClose }: ShowDriverModalProps) {
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);

  // Keep screen awake while modal is open
  useEffect(() => {
    if (!open) {
      if (wakeLock) {
        wakeLock.release();
        setWakeLock(null);
      }
      return;
    }

    async function requestWakeLock() {
      try {
        if ("wakeLock" in navigator) {
          const lock = await navigator.wakeLock.request("screen");
          setWakeLock(lock);
        }
      } catch {
        // WakeLock not available or denied — ignore
      }
    }
    requestWakeLock();

    return () => {
      if (wakeLock) {
        wakeLock.release();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!booking || !open) return null;

  const details = booking.details as Record<string, string>;

  const localizedName = details?.localized_name || "";
  const localizedAddress = details?.localized_address || "";
  const address = details?.address || "";
  const phone = details?.phone || "";
  const city = details?.city || "";

  // Build Google Maps URL
  const mapsQuery = encodeURIComponent(
    `${booking.title} ${address || city}`.trim()
  );
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col">
      {/* Close button */}
      <div className="flex justify-end p-4">
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Close"
        >
          <X className="h-6 w-6 text-near-black" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-8 text-center">
        <p className="text-sm text-muted-foreground uppercase tracking-widest mb-4">
          Your {booking.type === "hotel" ? "Hotel" : "Destination"}
        </p>

        {/* English name */}
        <h1 className="text-[32px] leading-tight font-bold text-near-black mb-2">
          {booking.title}
        </h1>

        {/* Localized name */}
        {localizedName && (
          <p className="text-[28px] leading-tight text-near-black/80 mb-6">
            {localizedName}
          </p>
        )}

        {/* Divider */}
        <div className="w-16 h-0.5 bg-gray-200 mb-6" />

        {/* Address */}
        {address && (
          <p className="text-xl text-near-black mb-1">
            {address}
          </p>
        )}
        {localizedAddress && (
          <p className="text-xl text-near-black/80 mb-2">
            {localizedAddress}
          </p>
        )}

        {/* Phone */}
        {phone && (
          <a
            href={`tel:${phone}`}
            className="flex items-center gap-2 text-xl text-china-red mt-4 mb-2"
          >
            <Phone className="h-5 w-5" />
            {phone}
          </a>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full max-w-xs mt-8">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-china-red text-white px-6 py-4 rounded-xl font-semibold text-lg hover:bg-china-red/90 transition-colors"
          >
            <MapPin className="h-5 w-5" />
            Open in Maps
          </a>

          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex items-center justify-center gap-2 bg-near-black text-white px-6 py-4 rounded-xl font-semibold text-lg hover:bg-near-black/90 transition-colors"
            >
              <Phone className="h-5 w-5" />
              Call Hotel
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
