"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, parseISO } from "date-fns";
import { BottomNav } from "@/components/bottom-nav";
import { BOOKING_TYPE_COLORS, CITIES_BY_DATE, TRIP_DAYS } from "@/lib/constants";
import type { Booking } from "@/lib/supabase/types";

const MONTH = new Date("2026-10-01");

function getDotColor(type: string): string {
  return BOOKING_TYPE_COLORS[type as keyof typeof BOOKING_TYPE_COLORS] || "#6B7280";
}

export default function CalendarPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setBookings(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const bookingsByDate = useMemo(() => {
    const map: Record<string, Booking[]> = {};
    bookings.forEach((b) => {
      if (!b.date_start) return;
      const dateStr = format(parseISO(b.date_start), "yyyy-MM-dd");
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(b);
    });
    return map;
  }, [bookings]);

  // Calendar grid
  const monthStart = startOfMonth(MONTH);
  const monthEnd = endOfMonth(MONTH);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);

  const calDays: Date[] = [];
  let d = calStart;
  while (d <= calEnd) {
    calDays.push(d);
    d = addDays(d, 1);
  }

  const tripStart = new Date("2026-10-05");
  const tripEnd = new Date("2026-10-24");

  // Thailand: Oct 8-12, China: Oct 13-24
  const thailandStart = new Date("2026-10-08");
  const thailandEnd = new Date("2026-10-12");
  const chinaStart = new Date("2026-10-13");

  const getDayBg = (date: Date) => {
    if (date >= thailandStart && date <= thailandEnd) return "bg-emerald-50";
    if (date >= chinaStart && date <= tripEnd) return "bg-red-50";
    return "";
  };

  const handleDayClick = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    // Navigate to itinerary and scroll to that day
    router.push(`/?jumpTo=${dateStr}`);
  };

  // List view data
  const tripDays = useMemo(() => {
    const result = [];
    for (let i = 0; i < TRIP_DAYS; i++) {
      const date = addDays(tripStart, i);
      const dateStr = format(date, "yyyy-MM-dd");
      result.push({
        date,
        dateStr,
        dayNumber: i + 1,
        city: CITIES_BY_DATE[dateStr] || "",
        bookings: bookingsByDate[dateStr] || [],
      });
    }
    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingsByDate]);

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-20 bg-cream/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-bold">
          <span className="text-china-red">Calendar</span>{" "}
          <span className="text-muted-foreground font-normal">Oct 2026</span>
        </h1>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setView("grid")}
            className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
              view === "grid"
                ? "bg-china-red text-white border-china-red"
                : "bg-white text-near-black border-gray-300 hover:border-china-red"
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setView("list")}
            className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
              view === "list"
                ? "bg-china-red text-white border-china-red"
                : "bg-white text-near-black border-gray-300 hover:border-china-red"
            }`}
          >
            List
          </button>
        </div>
      </header>

      <main className="px-4 pt-4 max-w-2xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-china-red" />
            <p className="mt-4 text-muted-foreground">Loading calendar...</p>
          </div>
        ) : view === "grid" ? (
          <div>
            {/* Legend */}
            <div className="flex gap-4 mb-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-50 border"></span> Thailand</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-50 border"></span> China</span>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground mb-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="py-1">{day}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
              {calDays.map((date, i) => {
                const dateStr = format(date, "yyyy-MM-dd");
                const dayBookings = bookingsByDate[dateStr] || [];
                const inMonth = isSameMonth(date, MONTH);
                const isTrip = date >= tripStart && date <= tripEnd;
                const dayBg = getDayBg(date);

                return (
                  <button
                    key={i}
                    onClick={() => isTrip && handleDayClick(date)}
                    className={`min-h-[60px] p-1 flex flex-col items-center ${
                      inMonth ? "bg-white" : "bg-gray-50"
                    } ${dayBg} ${isTrip ? "cursor-pointer hover:bg-gray-100" : "cursor-default"}`}
                    disabled={!isTrip}
                  >
                    <span className={`text-sm ${!inMonth ? "text-gray-300" : isTrip ? "font-semibold text-near-black" : "text-muted-foreground"}`}>
                      {format(date, "d")}
                    </span>
                    {dayBookings.length > 0 && (
                      <div className="flex flex-wrap gap-0.5 mt-1 justify-center">
                        {dayBookings.slice(0, 4).map((b, j) => (
                          <span
                            key={j}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: getDotColor(b.type) }}
                          />
                        ))}
                        {dayBookings.length > 4 && (
                          <span className="text-[8px] text-muted-foreground">+{dayBookings.length - 4}</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* List View */
          <div className="space-y-3">
            {tripDays.map((day) => (
              <button
                key={day.dateStr}
                onClick={() => handleDayClick(day.date)}
                className="w-full text-left p-3 bg-white rounded-lg border hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-china-red">Day {day.dayNumber}</span>
                    <span className="text-sm font-semibold ml-2">{format(day.date, "EEE, MMM d")}</span>
                  </div>
                  {day.bookings.length > 0 && (
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                      {day.bookings.length} booking{day.bookings.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                {day.city && (
                  <p className="text-sm text-muted-foreground mt-0.5">{day.city}</p>
                )}
                {day.bookings.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {day.bookings.map((b) => (
                      <span
                        key={b.id}
                        className="text-xs px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: getDotColor(b.type) }}
                      >
                        {b.title.length > 25 ? b.title.slice(0, 25) + "..." : b.title}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
