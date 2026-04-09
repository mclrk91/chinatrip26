"use client";

import { useEffect, useState, useMemo } from "react";
import { format, addDays, isSameDay, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import { ChevronLeft, ChevronRight, Plane, Building2, MapPin, Bus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/components/bottom-nav";
import { BOOKING_TYPE_COLORS, CITIES_BY_DATE } from "@/lib/constants";
import type { Booking } from "@/lib/supabase/types";

const TYPE_ICONS: Record<string, React.ElementType> = {
  flight: Plane,
  hotel: Building2,
  tour: MapPin,
  activity: MapPin,
  transport: Bus,
};

export default function CalendarPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date("2026-10-01"));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetch("/api/bookings")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBookings(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);

    const days: Date[] = [];
    let day = calStart;
    while (day <= calEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  const bookingsByDate = useMemo(() => {
    const map: Record<string, Booking[]> = {};
    bookings.forEach((b) => {
      if (!b.date_start) return;
      const dateKey = format(parseISO(b.date_start), "yyyy-MM-dd");
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(b);
    });
    return map;
  }, [bookings]);

  const selectedBookings = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, "yyyy-MM-dd");
    return bookingsByDate[key] || [];
  }, [selectedDate, bookingsByDate]);

  const prevMonth = () => setCurrentMonth((d) => addDays(startOfMonth(d), -1));
  const nextMonth = () => setCurrentMonth((d) => addDays(endOfMonth(d), 1));

  const tripInterval = { start: new Date("2026-10-05"), end: new Date("2026-10-24") };

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-20 bg-cream/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-bold">
          <span className="text-china-red">Calendar</span>
        </h1>
      </header>

      <main className="px-4 pt-4 max-w-2xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-china-red" />
            <p className="mt-4 text-muted-foreground">Loading calendar...</p>
          </div>
        ) : (
          <>
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-muted">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-bold">{format(currentMonth, "MMMM yyyy")}</h2>
              <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-muted">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Day of Week Headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const dateKey = format(day, "yyyy-MM-dd");
                const dayBookings = bookingsByDate[dateKey] || [];
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                const isInTrip = isWithinInterval(day, tripInterval);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const city = CITIES_BY_DATE[dateKey];

                return (
                  <button
                    key={dateKey}
                    onClick={() => setSelectedDate(day)}
                    className={`relative p-1 min-h-[56px] rounded-lg text-left transition-colors flex flex-col items-center ${
                      !isCurrentMonth ? "text-muted-foreground/40" : ""
                    } ${isInTrip ? "bg-china-red/5" : ""} ${
                      isSelected ? "ring-2 ring-china-red bg-china-red/10" : "hover:bg-muted"
                    }`}
                  >
                    <span className={`text-sm font-medium ${isSelected ? "text-china-red" : ""}`}>
                      {format(day, "d")}
                    </span>
                    {dayBookings.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                        {dayBookings.slice(0, 3).map((b) => (
                          <div
                            key={b.id}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: BOOKING_TYPE_COLORS[b.type] || "#6B7280" }}
                          />
                        ))}
                        {dayBookings.length > 3 && (
                          <span className="text-[8px] text-muted-foreground">+{dayBookings.length - 3}</span>
                        )}
                      </div>
                    )}
                    {city && isCurrentMonth && (
                      <span className="text-[7px] text-muted-foreground leading-tight text-center mt-auto truncate w-full">
                        {city.split("→")[0].trim().split(" ")[0]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Date Details */}
            {selectedDate && (
              <div className="mt-6 border-t pt-4">
                <h3 className="font-bold text-lg mb-1">
                  {format(selectedDate, "EEEE, MMM d, yyyy")}
                </h3>
                {CITIES_BY_DATE[format(selectedDate, "yyyy-MM-dd")] && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {CITIES_BY_DATE[format(selectedDate, "yyyy-MM-dd")]}
                  </p>
                )}
                {selectedBookings.length === 0 ? (
                  <p className="text-muted-foreground text-sm italic">Nothing planned for this day</p>
                ) : (
                  <div className="space-y-2">
                    {selectedBookings.map((b) => {
                      const Icon = TYPE_ICONS[b.type] || MapPin;
                      const color = BOOKING_TYPE_COLORS[b.type] || "#6B7280";
                      const isCancelled = b.status === "cancelled";
                      return (
                        <div
                          key={b.id}
                          className={`flex items-center gap-3 p-3 rounded-lg bg-white border ${isCancelled ? "opacity-50" : ""}`}
                          style={{ borderLeftColor: color, borderLeftWidth: 4 }}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" style={{ color }} />
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium text-sm ${isCancelled ? "line-through" : ""}`}>
                              {b.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {b.date_start && format(parseISO(b.date_start), "h:mm a")}
                              {b.provider && ` · ${b.provider}`}
                            </p>
                          </div>
                          <Badge
                            className="text-xs flex-shrink-0"
                            style={{ backgroundColor: color, color: "white" }}
                          >
                            {b.type}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
