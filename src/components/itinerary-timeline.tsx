"use client";

import { useMemo } from "react";
import { format, addDays, isSameDay, parseISO } from "date-fns";
import { AlertTriangle } from "lucide-react";
import { BookingCard } from "./booking-card";
import { CITIES_BY_DATE } from "@/lib/constants";
import { detectConflicts } from "@/lib/conflict-detection";
import type { Booking } from "@/lib/supabase/types";
import type { Conflict } from "@/lib/conflict-detection";

interface ItineraryTimelineProps {
  bookings: Booking[];
  onBookingClick: (booking: Booking) => void;
}

export function ItineraryTimeline({ bookings, onBookingClick }: ItineraryTimelineProps) {
  const tripStart = new Date("2026-10-05T00:00:00");
  const tripDays = 20;

  const conflicts = useMemo(() => detectConflicts(bookings), [bookings]);

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

      // Get conflicts for this day
      const dayConflicts = conflicts.filter((c: Conflict) => c.date === dateStr);

      result.push({
        date,
        dateStr,
        dayNumber: i + 1,
        bookings: dayBookings,
        city: CITIES_BY_DATE[dateStr] || "",
        conflicts: dayConflicts,
      });
    }
    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings, conflicts]);

  return (
    <div className="space-y-6">
      {days.map((day) => (
        <div key={day.dateStr} data-date={day.dateStr}>
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

          {/* Conflict Warnings for this day */}
          {day.conflicts.length > 0 && (
            <div className="space-y-1.5 mt-1 mb-2">
              {day.conflicts.map((conflict: Conflict, idx: number) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${
                    conflict.severity === "red"
                      ? "bg-red-50 border border-red-200 text-red-700"
                      : "bg-amber-50 border border-amber-200 text-amber-700"
                  }`}
                >
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{conflict.message}</span>
                </div>
              ))}
            </div>
          )}

          {/* Bookings for this day */}
          {day.bookings.length > 0 ? (
            <div className="space-y-3 mt-2">
              {day.bookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onClick={() => onBookingClick(booking)}
                />
              ))}
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
