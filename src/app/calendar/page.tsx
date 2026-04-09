"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from "date-fns";
import { BottomNav } from "@/components/bottom-nav";
import type { Booking } from "@/lib/supabase/types";

const OCTOBER_2026 = new Date(2026, 9, 1); // Month is 0-indexed

// One-line summaries and country colors for the trip
const DAY_SUMMARIES: Record<string, { emoji: string; text: string; country: string }> = {
  "2026-10-05": { emoji: "✈️", text: "Fly TPA→JFK→CAI", country: "transit" },
  "2026-10-06": { emoji: "✈️", text: "In Transit to Cairo", country: "transit" },
  "2026-10-07": { emoji: "🛬", text: "Arrive Beijing via Cairo", country: "transit" },
  "2026-10-08": { emoji: "✈️", text: "PEK→BKK→Koh Samui", country: "thailand" },
  "2026-10-09": { emoji: "🏖️", text: "Koh Samui", country: "thailand" },
  "2026-10-10": { emoji: "🏖️", text: "Koh Samui", country: "thailand" },
  "2026-10-11": { emoji: "✈️", text: "Fly to Chiang Mai", country: "thailand" },
  "2026-10-12": { emoji: "🐘", text: "Elephant Sanctuary", country: "thailand" },
  "2026-10-13": { emoji: "✈️", text: "Travel to China", country: "transit" },
  "2026-10-14": { emoji: "🏢", text: "Shenzhen Expo", country: "china" },
  "2026-10-15": { emoji: "🏢", text: "Shenzhen Expo", country: "china" },
  "2026-10-16": { emoji: "🏙️", text: "Tianjin", country: "china" },
  "2026-10-17": { emoji: "🏙️", text: "Tianjin", country: "china" },
  "2026-10-18": { emoji: "🚄", text: "Travel to Xi'an", country: "china" },
  "2026-10-19": { emoji: "⚔️", text: "Terracotta Warriors", country: "china" },
  "2026-10-20": { emoji: "🏙️", text: "Chongqing", country: "china" },
  "2026-10-21": { emoji: "🏙️", text: "Chongqing", country: "china" },
  "2026-10-22": { emoji: "🏙️", text: "Hong Kong", country: "china" },
  "2026-10-23": { emoji: "✈️", text: "Fly HKG→Doha", country: "transit" },
  "2026-10-24": { emoji: "✈️", text: "Fly home DOH→DFW→TPA", country: "transit" },
};

const COUNTRY_COLORS: Record<string, string> = {
  pre: "bg-gray-50",
  thailand: "bg-green-50",
  china: "bg-blue-50",
  transit: "bg-yellow-50",
};

function getDaySummary(dateStr: string, bookings: Booking[]): { emoji: string; text: string; bgClass: string } {
  const manual = DAY_SUMMARIES[dateStr];
  if (manual) {
    return {
      emoji: manual.emoji,
      text: manual.text,
      bgClass: COUNTRY_COLORS[manual.country] || "",
    };
  }

  // Auto-generate from bookings
  const dayBookings = bookings.filter((b) => {
    if (!b.date_start) return false;
    return b.date_start.startsWith(dateStr);
  });

  if (dayBookings.length > 0) {
    const first = dayBookings[0];
    if (first.type === "flight") return { emoji: "✈️", text: first.title, bgClass: "bg-yellow-50" };
    if (first.type === "hotel") return { emoji: "🏨", text: first.title, bgClass: "bg-blue-50" };
    return { emoji: "📋", text: first.title, bgClass: "" };
  }

  return { emoji: "", text: "", bgClass: "" };
}

export default function CalendarPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then(setBookings)
      .catch(() => {});
    setIsMobile(window.innerWidth < 640);
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(OCTOBER_2026);
    const monthEnd = endOfMonth(OCTOBER_2026);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);

    const days = [];
    let day = calStart;
    while (day <= calEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, []);

  const handleDayClick = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const summary = DAY_SUMMARIES[dateStr];
    if (summary) {
      // Navigate to itinerary and scroll to that day
      router.push(`/?scrollTo=${dateStr}`);
    }
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (isMobile) {
    // List view for small screens
    const tripDays = [];
    for (let i = 0; i < 31; i++) {
      tripDays.push(addDays(OCTOBER_2026, i));
    }

    return (
      <div className="min-h-screen pb-24 px-4 pt-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">
          <span className="text-china-red">October 2026</span>
        </h1>
        <p className="text-sm text-muted-foreground mb-4">Tap a day to view details</p>

        <div className="space-y-1">
          {tripDays.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const summary = getDaySummary(dateStr, bookings);
            const isTrip = DAY_SUMMARIES[dateStr];
            return (
              <button
                key={dateStr}
                onClick={() => handleDayClick(day)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors hover:bg-gray-100 ${summary.bgClass} ${isTrip ? "border border-gray-200" : ""}`}
              >
                <div className="w-12 text-center">
                  <div className="text-xs text-muted-foreground">{format(day, "EEE")}</div>
                  <div className="text-lg font-bold">{format(day, "d")}</div>
                </div>
                <div className="flex-1 min-w-0">
                  {summary.text ? (
                    <span className="text-sm font-medium truncate block">
                      {summary.emoji} {summary.text}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">No plans</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <BottomNav />
      </div>
    );
  }

  // Desktop grid view
  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">
        <span className="text-china-red">October 2026</span>{" "}
        <span className="text-muted-foreground font-normal text-lg">Calendar</span>
      </h1>
      <div className="flex gap-4 text-xs text-muted-foreground mb-4">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-100 border border-green-200" /> Thailand</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-100 border border-blue-200" /> China</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-100 border border-yellow-200" /> Travel</span>
      </div>

      <div className="grid grid-cols-7 border border-gray-200 rounded-lg overflow-hidden">
        {/* Weekday headers */}
        {weekDays.map((wd) => (
          <div key={wd} className="text-center text-sm font-semibold py-2 bg-gray-50 border-b border-gray-200">
            {wd}
          </div>
        ))}

        {/* Calendar cells */}
        {calendarDays.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const isCurrentMonth = isSameMonth(day, OCTOBER_2026);
          const summary = getDaySummary(dateStr, bookings);
          const isTrip = !!DAY_SUMMARIES[dateStr];
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={dateStr}
              onClick={() => isTrip && handleDayClick(day)}
              disabled={!isTrip}
              className={`min-h-[90px] p-1.5 border-b border-r border-gray-100 text-left transition-colors
                ${isCurrentMonth ? "" : "opacity-30"}
                ${summary.bgClass}
                ${isTrip ? "hover:bg-gray-100 cursor-pointer" : "cursor-default"}
                ${isToday ? "ring-2 ring-china-red ring-inset" : ""}
              `}
            >
              <div className={`text-sm font-bold mb-0.5 ${isTrip ? "text-china-red" : ""}`}>
                {format(day, "d")}
              </div>
              {isCurrentMonth && summary.text && (
                <div className="text-[11px] leading-tight">
                  <span>{summary.emoji}</span>{" "}
                  <span className="text-near-black">{summary.text}</span>
                </div>
              )}
              {isCurrentMonth && !summary.text && isTrip && (
                <div className="text-[11px] text-muted-foreground italic">No plans</div>
              )}
            </button>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}
