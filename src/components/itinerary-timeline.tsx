"use client";

import { useMemo, useRef, useEffect, useCallback } from "react";
import { format, addDays, isSameDay, parseISO, isWithinInterval } from "date-fns";
import { BookingCard } from "./booking-card";
import { CITIES_BY_DATE, TRIP_START, TRIP_DAYS } from "@/lib/constants";
import type { Booking } from "@/lib/supabase/types";

interface ItineraryTimelineProps {
  bookings: Booking[];
  onBookingClick: (booking: Booking) => void;
  activeFilters: Set<string>;
}

export function ItineraryTimeline({ bookings, onBookingClick, activeFilters }: ItineraryTimelineProps) {
  const tripStart = TRIP_START;
  const tripDays = TRIP_DAYS;
  const dayRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const days = useMemo(() => {
    const result = [];
    for (let i = 0; i < tripDays; i++) {
      const date = addDays(tripStart, i);
      const dateStr = format(date, "yyyy-MM-dd");
      let dayBookings = bookings.filter((b) => {
        if (!b.date_start) return false;
        const bookingDate = parseISO(b.date_start);
        return isSameDay(bookingDate, date);
      });

      // Apply type filters
      if (activeFilters.size > 0) {
        dayBookings = dayBookings.filter((b) => activeFilters.has(b.type));
      }

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
  }, [bookings, activeFilters]);

  const scrollToDay = useCallback((dateStr: string) => {
    const el = dayRefs.current[dateStr];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Auto-scroll to today during the trip
  useEffect(() => {
    const now = new Date();
    const tripEnd = addDays(tripStart, tripDays - 1);
    if (isWithinInterval(now, { start: tripStart, end: tripEnd })) {
      const todayStr = format(now, "yyyy-MM-dd");
      // Small delay to let DOM render
      setTimeout(() => scrollToDay(todayStr), 300);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      {days.map((day) => (
        <div
          key={day.dateStr}
          ref={(el) => { dayRefs.current[day.dateStr] = el; }}
          id={`day-${day.dateStr}`}
        >
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
              {activeFilters.size > 0 ? "No matching bookings" : "Nothing planned yet"}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// Export the day data for use in JumpToDay
export function useTripDays() {
  return useMemo(() => {
    const result = [];
    for (let i = 0; i < TRIP_DAYS; i++) {
      const date = addDays(TRIP_START, i);
      const dateStr = format(date, "yyyy-MM-dd");
      result.push({
        date,
        dateStr,
        dayNumber: i + 1,
        city: CITIES_BY_DATE[dateStr] || "",
      });
    }
    return result;
  }, []);
}
