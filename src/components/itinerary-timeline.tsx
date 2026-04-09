"use client";

import { useMemo } from "react";
import { format, addDays, isSameDay, parseISO } from "date-fns";
import { BookingCard } from "./booking-card";
import { CITIES_BY_DATE } from "@/lib/constants";
import type { Booking } from "@/lib/supabase/types";

interface ItineraryTimelineProps {
  bookings: Booking[];
  onBookingClick: (booking: Booking) => void;
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
          <div className="sticky top-0 z-10 bg-brand-bg/95 backdrop-blur-sm pb-2 pt-2">
            <div className="flex items-stretch">
              <div className="w-2 bg-brand-red rounded-l-md mr-3 self-stretch" />
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-serif font-bold text-brand-text">
                    Day {day.dayNumber}
                  </span>
                  <span className="text-lg font-semibold text-brand-text">
                    {format(day.date, "EEE, MMM d")}
                  </span>
                </div>
                {day.city && (
                  <p className="text-sm text-brand-muted">{day.city}</p>
                )}
              </div>
            </div>
          </div>

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
