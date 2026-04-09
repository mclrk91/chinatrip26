import { parseISO, differenceInMinutes, format, addDays, isSameDay } from "date-fns";
import type { Booking } from "@/lib/supabase/types";

export interface Conflict {
  type: "time_overlap" | "impossible_connection" | "hotel_gap" | "location_mismatch";
  severity: "red" | "yellow";
  message: string;
  relatedBookingIds: string[];
  date: string; // YYYY-MM-DD
}

export function detectConflicts(bookings: Booking[]): Conflict[] {
  const conflicts: Conflict[] = [];
  const activeBookings = bookings.filter((b) => b.status !== "cancelled");

  // 1. Hotel gap detection
  const hotelBookings = activeBookings.filter((b) => b.type === "hotel");
  const tripStart = new Date("2026-10-05");
  const tripDays = 19; // Oct 5 through Oct 23 (nights)

  for (let i = 0; i < tripDays; i++) {
    const night = addDays(tripStart, i);
    const nightStr = format(night, "yyyy-MM-dd");

    const hasHotel = hotelBookings.some((h) => {
      if (!h.date_start) return false;
      const checkIn = parseISO(h.date_start);
      const checkOut = h.date_end ? parseISO(h.date_end) : addDays(checkIn, 1);
      // Hotel covers this night if check-in <= night < check-out
      const checkInDate = new Date(format(checkIn, "yyyy-MM-dd"));
      const checkOutDate = new Date(format(checkOut, "yyyy-MM-dd"));
      const nightDate = new Date(nightStr);
      return nightDate >= checkInDate && nightDate < checkOutDate;
    });

    if (!hasHotel) {
      conflicts.push({
        type: "hotel_gap",
        severity: "yellow",
        message: `No hotel booked for the night of ${format(night, "MMM d")}`,
        relatedBookingIds: [],
        date: nightStr,
      });
    }
  }

  // 2. Time overlap detection
  const timedBookings = activeBookings
    .filter((b) => b.date_start)
    .sort((a, b) => new Date(a.date_start!).getTime() - new Date(b.date_start!).getTime());

  for (let i = 0; i < timedBookings.length; i++) {
    for (let j = i + 1; j < timedBookings.length; j++) {
      const a = timedBookings[i];
      const b = timedBookings[j];

      if (!a.date_start || !b.date_start) continue;
      if (a.type === "hotel" || b.type === "hotel") continue; // Hotels overlap with other bookings normally

      const aStart = new Date(a.date_start);
      const aEnd = a.date_end ? new Date(a.date_end) : new Date(aStart.getTime() + 60 * 60 * 1000); // Default 1hr
      const bStart = new Date(b.date_start);

      if (bStart < aEnd && isSameDay(aStart, bStart)) {
        conflicts.push({
          type: "time_overlap",
          severity: "red",
          message: `Time overlap: "${a.title}" and "${b.title}" overlap on ${format(aStart, "MMM d")}`,
          relatedBookingIds: [a.id, b.id],
          date: format(aStart, "yyyy-MM-dd"),
        });
      }
    }
  }

  // 3. Tight connections (flights/transport on same day)
  const flightBookings = activeBookings
    .filter((b) => (b.type === "flight" || b.type === "transport") && b.date_start)
    .sort((a, b) => new Date(a.date_start!).getTime() - new Date(b.date_start!).getTime());

  for (let i = 0; i < flightBookings.length - 1; i++) {
    const current = flightBookings[i];
    const next = flightBookings[i + 1];

    if (!current.date_end && !current.date_start) continue;
    if (!next.date_start) continue;

    const arrivalTime = current.date_end ? new Date(current.date_end) : new Date(current.date_start!);
    const departureTime = new Date(next.date_start);

    // Only check same-day or next-day connections
    const daysDiff = Math.abs(differenceInMinutes(departureTime, arrivalTime)) / (60 * 24);
    if (daysDiff > 1) continue;

    const minutesBetween = differenceInMinutes(departureTime, arrivalTime);
    const currentDetails = current.details as Record<string, string>;
    const nextDetails = next.details as Record<string, string>;
    const isInternational =
      currentDetails?.arrival_airport !== nextDetails?.departure_airport;
    const minConnection = isInternational ? 180 : 120; // 3hr intl, 2hr domestic

    if (minutesBetween > 0 && minutesBetween < minConnection) {
      const hours = Math.floor(minutesBetween / 60);
      const mins = minutesBetween % 60;
      conflicts.push({
        type: "impossible_connection",
        severity: minutesBetween < 90 ? "red" : "yellow",
        message: `Tight connection: only ${hours}hr ${mins}min between "${current.title}" and "${next.title}"`,
        relatedBookingIds: [current.id, next.id],
        date: format(arrivalTime, "yyyy-MM-dd"),
      });
    }
  }

  // 4. Location mismatch (consecutive bookings in different cities, same day, no transport)
  for (let i = 0; i < timedBookings.length - 1; i++) {
    const current = timedBookings[i];
    const next = timedBookings[i + 1];

    if (!current.date_start || !next.date_start) continue;
    if (!isSameDay(new Date(current.date_start), new Date(next.date_start))) continue;
    if (current.type === "flight" || current.type === "transport") continue;
    if (next.type === "flight" || next.type === "transport") continue;

    const currentCity = (current.details as Record<string, string>)?.city;
    const nextCity = (next.details as Record<string, string>)?.city;

    if (currentCity && nextCity && currentCity.toLowerCase() !== nextCity.toLowerCase()) {
      // Check if there's a flight/transport between them
      const hasTransport = activeBookings.some(
        (b) =>
          (b.type === "flight" || b.type === "transport") &&
          b.date_start &&
          isSameDay(new Date(b.date_start), new Date(current.date_start!))
      );

      if (!hasTransport) {
        conflicts.push({
          type: "location_mismatch",
          severity: "yellow",
          message: `Location mismatch: "${current.title}" in ${currentCity} and "${next.title}" in ${nextCity} on same day with no transport`,
          relatedBookingIds: [current.id, next.id],
          date: format(new Date(current.date_start), "yyyy-MM-dd"),
        });
      }
    }
  }

  return conflicts;
}
