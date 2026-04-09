"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format, addDays } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { CITIES_BY_DATE, BOOKING_TYPE_COLORS } from "@/lib/constants";
import { BottomNav } from "@/components/bottom-nav";
import type { Booking } from "@/lib/supabase/types";

export default function CalendarPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setBookings(data);
      })
      .catch(() => {});
  }, []);

  const tripStart = new Date("2026-10-05T00:00:00");
  const days = Array.from({ length: 20 }, (_, i) => {
    const date = addDays(tripStart, i);
    const dateStr = format(date, "yyyy-MM-dd");
    const dayBookings = bookings.filter((b) => {
      if (!b.date_start) return false;
      return b.date_start.startsWith(dateStr);
    });
    return {
      date,
      dateStr,
      dayNumber: i + 1,
      city: CITIES_BY_DATE[dateStr] || "",
      bookings: dayBookings,
    };
  });

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-20 bg-cream/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <button onClick={() => router.push("/")} className="p-1">
            <ArrowLeft className="h-5 w-5 text-near-black" />
          </button>
          <h1 className="text-lg font-bold">Trip Calendar</h1>
        </div>
      </header>

      <main className="px-4 pt-4 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-center mb-4">October 2026</h2>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Oct 2026 starts on Thursday (index 3 for Mon-start grid) */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for Oct 1-4 padding (Mon=Oct 5 is actually a Monday!) */}
          {/* Oct 5, 2026 is a Monday, so let's calculate: */}
          {/* Actually Oct 1 2026 is Thursday, so pad 3 cells for Mon grid */}
          {Array.from({ length: 3 }, (_, i) => (
            <div key={`pad-${i}`} className="aspect-square" />
          ))}
          {/* Oct 1-4 (before trip) */}
          {Array.from({ length: 4 }, (_, i) => (
            <div key={`pre-${i}`} className="aspect-square flex items-center justify-center text-sm text-gray-300">
              {i + 1}
            </div>
          ))}
          {/* Trip days Oct 5-24 */}
          {days.map((day) => {
            const dayNum = day.date.getDate();
            const typeColors = day.bookings.map(
              (b) => BOOKING_TYPE_COLORS[b.type] || "#6B7280"
            );
            const uniqueColors = Array.from(new Set(typeColors));
            return (
              <button
                key={day.dateStr}
                onClick={() => router.push(`/?scrollTo=day-${day.dayNumber}`)}
                className="aspect-square flex flex-col items-center justify-center rounded-lg bg-white border border-gray-100 hover:border-china-red transition-colors relative"
              >
                <span className="text-sm font-medium">{dayNum}</span>
                {day.bookings.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {uniqueColors.slice(0, 3).map((c, i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
          {/* Oct 25-31 (after trip) */}
          {Array.from({ length: 7 }, (_, i) => (
            <div key={`post-${i}`} className="aspect-square flex items-center justify-center text-sm text-gray-300">
              {25 + i}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Trip Overview</h3>
          <div className="space-y-2">
            {days.map((day) => (
              <div key={day.dateStr} className="flex items-center gap-3 text-sm">
                <span className="font-bold text-china-red w-12">Day {day.dayNumber}</span>
                <span className="font-medium">{format(day.date, "EEE d")}</span>
                <span className="text-muted-foreground flex-1 truncate">{day.city}</span>
                <span className="text-xs text-muted-foreground">
                  {day.bookings.length > 0 ? `${day.bookings.length} booking${day.bookings.length > 1 ? "s" : ""}` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
