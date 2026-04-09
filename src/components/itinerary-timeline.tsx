"use client";

import { useMemo } from "react";
import { format, addDays, isSameDay, parseISO } from "date-fns";
import { Clock } from "lucide-react";
import { BookingCard } from "./booking-card";
import { CITIES_BY_DATE } from "@/lib/constants";
import type { Booking } from "@/lib/supabase/types";

interface ItineraryTimelineProps {
  bookings: Booking[];
  onBookingClick: (booking: Booking) => void;
}

function getLayoverInfo(prev: Booking, next: Booking): string | null {
  // Only show layover between consecutive flights
  if (prev.type !== "flight" || next.type !== "flight") return null;
  if (!prev.date_end || !next.date_start) return null;

  const prevDetails = prev.details as Record<string, string>;
  const nextDetails = next.details as Record<string, string>;

  // Check if arrival airport matches departure airport
  const arrivalAirport = prevDetails?.arrival_airport;
  const departureAirport = nextDetails?.departure_airport;
  if (!arrivalAirport || !departureAirport) return null;
  if (arrivalAirport !== departureAirport) return null;

  // Check they share at least one traveler (to handle Amanda's separate flights)
  const prevTravelers = new Set(prev.travelers || []);
  const nextTravelers = next.travelers || [];
  const sharedTravelers = nextTravelers.filter((t) => prevTravelers.has(t));
  if (sharedTravelers.length === 0) return null;

  const ms = new Date(next.date_start).getTime() - new Date(prev.date_end).getTime();
  if (ms <= 0 || ms > 24 * 60 * 60 * 1000) return null; // skip if > 24h or negative

  const hours = Math.floor(ms / (1000 * 60 * 60));
  const mins = Math.round((ms % (1000 * 60 * 60)) / (1000 * 60));
  const duration = hours > 0 ? (mins > 0 ? `${hours}h ${mins}m` : `${hours}h`) : `${mins}m`;

  const travelersLabel = sharedTravelers.length < (prev.travelers?.length || 0) + (next.travelers?.length || 0) - sharedTravelers.length
    ? ` (${sharedTravelers.map((t) => t.split(" ")[0]).join(", ")})`
    : "";

  return `${duration} layover at ${arrivalAirport}${travelersLabel}`;
}

export function ItineraryTimeline({ bookings, onBookingClick }: ItineraryTimelineProps) {
  const tripStart = new Date("2026-10-05T00:00:00");
  const tripDays = 20;

  const days = useMemo(() => {
    const result = [];
    for (let i = 0; i < tripDays; i++) {
      const date = addDays(tripStart, i);
      const dateStr = format(date, "yyyy-MM-dd");
      const dayBookings = bookings.filter((b) => {
        if (!b.date_start) return false;
        const bookingDate = parseISO(b.date_start);
        return isSameDay(bookingDate, date);
      });

      // Sort by time
      dayBookings.sort((a, b) => {
        if (!a.date_start || !b.date_start) return 0;
        return new Date(a.date_start).getTime() - new Date(b.date_start).getTime();
      });

      result.push({
        date,
        dateStr,
        dayNumber: i + 1,
        bookings: dayBookings,
        city: CITIES_BY_DATE[dateStr] || "",
      });
    }
    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings]);

  return (
    <div className="space-y-6">
      {days.map((day) => (
        <div key={day.dateStr}>
          {/* Day Header */}
          <div className="sticky top-0 z-10 bg-cream/95 backdrop-blur-sm pb-2 pt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-china-red">
                Day {day.dayNumber}
              </span>
              <span className="text-lg font-semibold">
                {format(day.date, "EEE, MMM d")}
              </span>
            </div>
            {day.city && (
              <p className="text-sm text-muted-foreground">{day.city}</p>
            )}
          </div>

          {/* Bookings for this day */}
          {day.bookings.length > 0 ? (
            <div className="space-y-3 mt-2">
              {day.bookings.map((booking, idx) => {
                // Check for layover between this flight and the previous one
                const layover = idx > 0 ? getLayoverInfo(day.bookings[idx - 1], booking) : null;
                return (
                  <div key={booking.id}>
                    {layover && (
                      <div className="flex items-center gap-2 py-1.5 px-3 my-1 text-xs text-blue-700 bg-blue-50 rounded-lg">
                        <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="font-medium">{layover}</span>
                      </div>
                    )}
                    <BookingCard
                      booking={booking}
                      onClick={() => onBookingClick(booking)}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm italic mt-2 pl-2">
              Nothing planned yet
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
