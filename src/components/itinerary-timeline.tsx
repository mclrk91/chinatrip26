"use client";

import { useMemo, useState } from "react";
import { format, addDays, isSameDay, parseISO } from "date-fns";
import { BookingCard } from "./booking-card";
import { DayNotes } from "./day-notes";
import { ItineraryTopBar } from "./itinerary-top-bar";
import { CITIES_BY_DATE, FLAGS_BY_DATE, TRIP_START, TRIP_DAYS } from "@/lib/constants";
import type { Booking, DayNote } from "@/lib/supabase/types";

interface ItineraryTimelineProps {
  bookings: Booking[];
  dayNotes: DayNote[];
  onBookingClick: (booking: Booking) => void;
  onDayNotesChange: () => void;
}

export function ItineraryTimeline({
  bookings,
  dayNotes,
  onBookingClick,
  onDayNotesChange,
}: ItineraryTimelineProps) {
  const [query, setQuery] = useState("");

  const notesByDate = useMemo(() => {
    const map: Record<string, DayNote[]> = {};
    for (const n of dayNotes) {
      (map[n.date] ||= []).push(n);
    }
    return map;
  }, [dayNotes]);

  const days = useMemo(() => {
    const result = [] as {
      date: Date;
      dateStr: string;
      dayNumber: number;
      bookings: Booking[];
      notes: DayNote[];
      city: string;
      flag: string;
    }[];
    for (let i = 0; i < TRIP_DAYS; i++) {
      const date = addDays(TRIP_START, i);
      const dateStr = format(date, "yyyy-MM-dd");
      const dayBookings = bookings.filter((b) => {
        if (!b.date_start) return false;
        const bookingDate = parseISO(b.date_start);
        return isSameDay(bookingDate, date);
      });

      dayBookings.sort((a, b) => {
        if (!a.date_start || !b.date_start) return 0;
        return new Date(a.date_start).getTime() - new Date(b.date_start).getTime();
      });

      result.push({
        date,
        dateStr,
        dayNumber: i + 1,
        bookings: dayBookings,
        notes: notesByDate[dateStr] || [],
        city: CITIES_BY_DATE[dateStr] || "",
        flag: FLAGS_BY_DATE[dateStr] || "",
      });
    }
    return result;
  }, [bookings, notesByDate]);

  const q = query.trim().toLowerCase();
  const matches = (b: Booking) => {
    if (!q) return true;
    const details = b.details as Record<string, string>;
    return [
      b.title,
      b.provider,
      b.confirmation_code,
      details?.departure_airport,
      details?.arrival_airport,
      details?.city,
    ]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
  };

  const displayedDays = days.map((d) => ({
    ...d,
    bookings: d.bookings.filter(matches),
  }));
  const shown = q ? displayedDays.filter((d) => d.bookings.length > 0) : displayedDays;

  const scrollToDay = (dateStr: string) => {
    const el = document.querySelector(`[data-day-key="${dateStr}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 0 140px" }}>
      <div style={{ padding: "28px 20px 0" }}>
        <ItineraryTopBar
          query={query}
          onQueryChange={setQuery}
          days={days.map((d) => ({
            dateStr: d.dateStr,
            dayNumber: d.dayNumber,
            date: d.date,
            flag: d.flag,
          }))}
          onJumpTo={scrollToDay}
          bookings={bookings}
        />
      </div>

      <header style={{ padding: "28px 20px 20px" }}>
        <h1
          className="font-display"
          style={{
            margin: 0,
            fontSize: 34,
            lineHeight: 1.05,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "#6B3410",
          }}
        >
          Daily Schedule
        </h1>
        <p
          className="font-display"
          style={{
            margin: "6px 0 0",
            fontSize: 17,
            fontWeight: 400,
            color: "#8C7B6A",
            letterSpacing: "-0.01em",
          }}
        >
          Thailand &amp; China · Oct 2026
        </p>
      </header>

      {q && shown.length === 0 && (
        <p
          style={{
            padding: "24px 20px",
            color: "var(--muted-foreground)",
            fontSize: 14,
            textAlign: "center",
          }}
        >
          No bookings match &ldquo;<b>{query}</b>&rdquo;
        </p>
      )}

      <div style={{ position: "relative", paddingLeft: 100, paddingRight: 16 }}>
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: 86,
            top: 6,
            bottom: 6,
            width: 1.5,
            background: "#D9CFC2",
          }}
        />

        {shown.map((day) => {
          const hasBookings = day.bookings.length > 0;
          const dow = format(day.date, "EEE").toUpperCase();
          const mon = format(day.date, "MMM").toUpperCase();
          const dnum = day.date.getDate();

          return (
            <section
              key={day.dateStr}
              data-day-key={day.dateStr}
              style={{
                position: "relative",
                marginBottom: hasBookings ? 28 : 22,
                scrollMarginTop: 16,
                minHeight: hasBookings ? "auto" : 60,
              }}
            >
              {/* Day N label on left */}
              <div
                style={{
                  position: "absolute",
                  left: -100,
                  top: 0,
                  width: 72,
                  textAlign: "right",
                  paddingRight: 6,
                }}
              >
                <div
                  className="font-display"
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                    color: "#2B1810",
                    lineHeight: 1,
                  }}
                >
                  Day {day.dayNumber}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    color: "#2B1810",
                    lineHeight: 1.35,
                    opacity: 0.7,
                    whiteSpace: "nowrap",
                  }}
                >
                  {dow}, {mon} {dnum}
                </div>
              </div>

              {/* Rail dot */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  left: -15,
                  top: 8,
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#8B4513",
                  boxShadow: "0 0 0 3px var(--background)",
                }}
              />

              {/* Right column */}
              <div style={{ paddingLeft: 8 }}>
                {(day.flag || day.city) && (
                  <div
                    className="flex items-center"
                    style={{
                      gap: 8,
                      marginBottom: hasBookings ? 10 : 0,
                      paddingTop: 1,
                    }}
                  >
                    {day.flag && (
                      <span style={{ fontSize: 20, lineHeight: 1 }}>{day.flag}</span>
                    )}
                    {day.city && (
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#2B1810",
                        }}
                      >
                        {day.city}
                      </span>
                    )}
                  </div>
                )}

                {hasBookings && (
                  <div className="flex flex-col" style={{ gap: 8 }}>
                    {day.bookings.map((booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        onClick={() => onBookingClick(booking)}
                      />
                    ))}
                  </div>
                )}

                <DayNotes
                  date={day.dateStr}
                  notes={day.notes}
                  onChange={onDayNotesChange}
                />
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
