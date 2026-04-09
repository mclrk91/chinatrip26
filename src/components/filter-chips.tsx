"use client";

import { BOOKING_TYPE_COLORS } from "@/lib/constants";
import type { Booking } from "@/lib/supabase/types";

const FILTER_OPTIONS = [
  { key: "all", label: "All", emoji: "" },
  { key: "flight", label: "Flights", emoji: "\u2708\uFE0F" },
  { key: "hotel", label: "Hotels", emoji: "\uD83C\uDFE8" },
  { key: "tour", label: "Tours", emoji: "\uD83C\uDFAB" },
  { key: "activity", label: "Activities", emoji: "\uD83C\uDFC4" },
  { key: "transport", label: "Transport", emoji: "\uD83D\uDE97" },
  { key: "restaurant", label: "Food", emoji: "\uD83C\uDF7D\uFE0F" },
  { key: "other", label: "Other", emoji: "\uD83D\uDCCC" },
] as const;

interface FilterChipsProps {
  bookings: Booking[];
  activeFilters: Set<string>;
  onToggle: (type: string) => void;
}

export function FilterChips({ bookings, activeFilters, onToggle }: FilterChipsProps) {
  const counts: Record<string, number> = {};
  for (const b of bookings) {
    counts[b.type] = (counts[b.type] || 0) + 1;
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
      {FILTER_OPTIONS.map((opt) => {
        const isAll = opt.key === "all";
        const isActive = isAll ? activeFilters.size === 0 : activeFilters.has(opt.key);
        const count = isAll ? bookings.length : counts[opt.key] || 0;

        if (!isAll && count === 0) return null;

        const color = !isAll ? BOOKING_TYPE_COLORS[opt.key as keyof typeof BOOKING_TYPE_COLORS] : undefined;

        return (
          <button
            key={opt.key}
            onClick={() => onToggle(opt.key)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all active:scale-90 ${
              isActive
                ? "text-white border-transparent shadow-sm"
                : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
            }`}
            style={
              isActive
                ? { backgroundColor: color || "#C41E3A" }
                : undefined
            }
          >
            {opt.emoji && <span>{opt.emoji}</span>}
            <span>{opt.label}</span>
            <span className={`text-xs ${isActive ? "text-white/80" : "text-gray-400"}`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
