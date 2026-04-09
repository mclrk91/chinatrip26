"use client";

import { useMemo } from "react";
import { format, addDays, isSameDay, parseISO } from "date-fns";
import { BookingCard } from "./booking-card";
import { CITIES_BY_DATE, TRIP_START, TRIP_DAYS } from "@/lib/constants";
import type { Booking } from "@/lib/supabase/types";

interface ItineraryTimelineProps {
  bookings: Booking[];
  onBookingClick: (booking: Booking) => void;
}

export function ItineraryTimeline({ bookings, onBookingClick }: ItineraryTimelineProps) {
  const days = useMemo(() => {
    const result = [];
    for (let i = 0; i < TRIP_DAYS; i++) {
      const date = addDays(TRIP_START, i);
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
          <div className="sticky top-[73px] z-10 bg-cream/95 backdrop-blur-sm pb-2 pt-2">
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
