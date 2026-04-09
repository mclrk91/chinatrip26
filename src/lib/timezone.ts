// Timezone offset mappings for airports/cities used in the trip
// October 2026: EDT (UTC-4) for Eastern Time, all Asia times are standard

const AIRPORT_TIMEZONES: Record<string, { offset: number; label: string }> = {
  // US airports (EDT in October)
  TPA: { offset: -4, label: "TPA" },
  JFK: { offset: -4, label: "JFK" },
  DFW: { offset: -5, label: "DFW" },
  // Egypt
  CAI: { offset: 2, label: "CAI" },
  // China (CST UTC+8)
  PEK: { offset: 8, label: "PEK" },
  SZX: { offset: 8, label: "SZX" },
  HKG: { offset: 8, label: "HKG" },
  // Thailand (ICT UTC+7)
  BKK: { offset: 7, label: "BKK" },
  USM: { offset: 7, label: "USM" },
  CNX: { offset: 7, label: "CNX" },
  // Qatar (AST UTC+3)
  DOH: { offset: 3, label: "DOH" },
  // Europe
  LHR: { offset: 1, label: "LHR" },
  STR: { offset: 2, label: "STR" },
};

const CITY_TIMEZONES: Record<string, { offset: number; label: string }> = {
  "Tampa": { offset: -4, label: "ET" },
  "New York": { offset: -4, label: "ET" },
  "Cairo": { offset: 2, label: "CAI" },
  "Beijing": { offset: 8, label: "PEK" },
  "Bangkok": { offset: 7, label: "BKK" },
  "Koh Samui": { offset: 7, label: "USM" },
  "Chiang Mai": { offset: 7, label: "CNX" },
  "Shenzhen": { offset: 8, label: "SZX" },
  "Hong Kong": { offset: 8, label: "HKG" },
  "Tianjin": { offset: 8, label: "TJN" },
  "Xi'an": { offset: 8, label: "XIY" },
  "Chongqing": { offset: 8, label: "CKG" },
  "Doha": { offset: 3, label: "DOH" },
};

const ET_OFFSET = -4; // EDT in October 2026

function formatTimeWithAmPm(hours: number, minutes: number): string {
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, "0");
  return `${displayHours}:${displayMinutes} ${period}`;
}

function getUtcFromLocal(dateStr: string): { utcMs: number; localOffset: number } {
  // Parse the ISO string to extract the timezone offset
  const match = dateStr.match(/([+-])(\d{2}):(\d{2})$/);
  if (!match) {
    // No timezone info, treat as UTC
    const d = new Date(dateStr);
    return { utcMs: d.getTime(), localOffset: 0 };
  }
  const sign = match[1] === "+" ? 1 : -1;
  const offsetHours = parseInt(match[2]);
  const offsetMinutes = parseInt(match[3]);
  const localOffset = sign * (offsetHours * 60 + offsetMinutes);

  // Parse the date parts without timezone conversion
  const d = new Date(dateStr);
  return { utcMs: d.getTime(), localOffset };
}

export function formatDualTime(
  dateStr: string,
  airportCode?: string,
  city?: string
): { localTime: string; localLabel: string; etTime: string } {
  const { utcMs } = getUtcFromLocal(dateStr);

  // Determine local timezone from airport code or city
  let localTz = airportCode ? AIRPORT_TIMEZONES[airportCode] : undefined;
  if (!localTz && city) {
    localTz = CITY_TIMEZONES[city];
  }

  // If no timezone found, extract from the date string offset
  if (!localTz) {
    const match = dateStr.match(/([+-])(\d{2}):(\d{2})$/);
    if (match) {
      const sign = match[1] === "+" ? 1 : -1;
      const offsetHours = parseInt(match[2]);
      const offsetMinutes = parseInt(match[3]);
      const totalMinutes = sign * (offsetHours * 60 + offsetMinutes);
      localTz = { offset: totalMinutes / 60, label: airportCode || "" };
    }
  }

  if (!localTz) {
    localTz = { offset: ET_OFFSET, label: "ET" };
  }

  // Calculate local time
  const localMs = utcMs + localTz.offset * 3600000;
  const localDate = new Date(localMs);
  const localHours = localDate.getUTCHours();
  const localMinutes = localDate.getUTCMinutes();

  // Calculate ET time
  const etMs = utcMs + ET_OFFSET * 3600000;
  const etDate = new Date(etMs);
  const etHours = etDate.getUTCHours();
  const etMinutes = etDate.getUTCMinutes();

  return {
    localTime: formatTimeWithAmPm(localHours, localMinutes),
    localLabel: localTz.label,
    etTime: formatTimeWithAmPm(etHours, etMinutes),
  };
}
