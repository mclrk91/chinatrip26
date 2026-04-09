"use client";

import { useState } from "react";
import { format, addDays } from "date-fns";
import { CalendarDays, X } from "lucide-react";
import { CITIES_BY_DATE, TRIP_START, TRIP_DAYS } from "@/lib/constants";

export function JumpToDay() {
  const [open, setOpen] = useState(false);

  const days = Array.from({ length: TRIP_DAYS }, (_, i) => {
    const date = addDays(TRIP_START, i);
    const dateStr = format(date, "yyyy-MM-dd");
    return {
      date,
      dateStr,
      dayNumber: i + 1,
      city: CITIES_BY_DATE[dateStr] || "",
    };
  });

  const scrollToDay = (dateStr: string) => {
    const el = document.getElementById(`day-${dateStr}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setOpen(false);
  };

  return (
    <>
      {/* Floating button — bottom-left, doesn't overlap chat (bottom-right) */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-20 left-4 z-40 bg-china-red text-white rounded-full p-3 shadow-lg transition-all active:scale-90 active:opacity-80 hover:shadow-xl"
        aria-label="Jump to day"
      >
        <CalendarDays className="h-5 w-5" />
      </button>

      {/* Day picker overlay */}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="fixed bottom-32 left-4 z-50 bg-white rounded-xl shadow-2xl w-72 max-h-[60vh] overflow-y-auto border border-gray-200">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-base">Jump to Day</h3>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 active:scale-90"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="py-1">
              {days.map((day) => (
                <button
                  key={day.dateStr}
                  onClick={() => scrollToDay(day.dateStr)}
                  className="w-full text-left px-4 py-3 hover:bg-red-50 active:bg-red-100 active:scale-[0.98] transition-all border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold text-china-red">
                      Day {day.dayNumber}
                    </span>
                    <span className="text-sm font-medium">
                      {format(day.date, "EEE, MMM d")}
                    </span>
                  </div>
                  {day.city && (
                    <p className="text-xs text-muted-foreground mt-0.5">{day.city}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
