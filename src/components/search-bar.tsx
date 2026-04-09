"use client";

import { useState, useCallback, useMemo } from "react";
import { Search, X } from "lucide-react";
import type { Booking } from "@/lib/supabase/types";

interface SearchBarProps {
  bookings: Booking[];
  onFilteredBookings: (filtered: Booking[] | null) => void;
}

export function SearchBar({ bookings, onFilteredBookings }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const filteredCount = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase().trim();
    return bookings.filter((b) => {
      const searchableFields = [
        b.title,
        b.provider,
        b.confirmation_code,
        b.notes,
        b.travelers?.join(" "),
        b.alt_codes ? JSON.stringify(b.alt_codes) : "",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return searchableFields.includes(q);
    }).length;
  }, [query, bookings]);

  const handleChange = useCallback(
    (value: string) => {
      setQuery(value);
      if (!value.trim()) {
        onFilteredBookings(null);
        return;
      }
      const q = value.toLowerCase().trim();
      const filtered = bookings.filter((b) => {
        const searchableFields = [
          b.title,
          b.provider,
          b.confirmation_code,
          b.notes,
          b.travelers?.join(" "),
          b.alt_codes ? JSON.stringify(b.alt_codes) : "",
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return searchableFields.includes(q);
      });
      onFilteredBookings(filtered);
    },
    [bookings, onFilteredBookings]
  );

  const handleClear = useCallback(() => {
    setQuery("");
    onFilteredBookings(null);
  }, [onFilteredBookings]);

  return (
    <div className="relative mb-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search bookings..."
          className="w-full min-h-[48px] pl-12 pr-12 text-base rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-china-red/50 focus:border-china-red placeholder:text-muted-foreground"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>
      {query.trim() && filteredCount !== null && (
        <p className="text-sm text-muted-foreground mt-2 ml-1">
          {filteredCount} result{filteredCount !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
