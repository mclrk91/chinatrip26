export const TRAVELERS = ["Mike Clark", "Tonya Clark", "David Ramos", "Amanda Ford"] as const;

export const BOOKING_TYPES = ["flight", "hotel", "tour", "activity", "transport", "restaurant", "other"] as const;
export type BookingType = (typeof BOOKING_TYPES)[number];

export const BOOKING_STATUSES = ["confirmed", "cancelled", "pending", "modified"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const BOOKING_TYPE_COLORS: Record<BookingType, string> = {
  flight: "#C41E3A",
  hotel: "#D4AF37",
  tour: "#1B4D3E",
  activity: "#1B4D3E",
  transport: "#4A90D9",
  restaurant: "#6B7280",
  other: "#6B7280",
};

export const BOOKING_TYPE_LABELS: Record<BookingType, string> = {
  flight: "Flight",
  hotel: "Hotel",
  tour: "Tour",
  activity: "Activity",
  transport: "Transport",
  restaurant: "Restaurant",
  other: "Other",
};

export const TRIP_START = new Date("2026-10-05T00:00:00");
export const TRIP_END = new Date("2026-10-24T23:59:59");
export const TRIP_DAYS = 20; // Oct 5-24 inclusive

// Traveler colors for pills/badges
export const TRAVELER_COLORS: Record<string, { bg: string; text: string }> = {
  "Mike Clark": { bg: "#3B82F6", text: "#ffffff" },
  "Tonya Clark": { bg: "#8B5CF6", text: "#ffffff" },
  "David Ramos": { bg: "#22C55E", text: "#ffffff" },
  "Amanda Ford": { bg: "#F97316", text: "#ffffff" },
};

// Airline IATA codes for logos
export const AIRLINE_IATA_CODES: Record<string, string> = {
  "Delta Air Lines": "DL",
  "Delta": "DL",
  "EgyptAir": "MS",
  "Hainan Airlines": "HU",
  "Bangkok Airways": "PG",
  "Qatar Airways": "QR",
  "American Airlines": "AA",
  "Air Canada": "AC",
};

// Airport timezone offsets for October 2026 (all within EDT period)
// Values are UTC offsets in hours
export const AIRPORT_TIMEZONES: Record<string, { utcOffset: number; label: string }> = {
  TPA: { utcOffset: -4, label: "EDT" },
  JFK: { utcOffset: -4, label: "EDT" },
  DFW: { utcOffset: -5, label: "CDT" },
  CAI: { utcOffset: 2, label: "EET" },
  PEK: { utcOffset: 8, label: "CST" },
  BKK: { utcOffset: 7, label: "ICT" },
  USM: { utcOffset: 7, label: "ICT" },
  CNX: { utcOffset: 7, label: "ICT" },
  SZX: { utcOffset: 8, label: "CST" },
  HKG: { utcOffset: 8, label: "HKT" },
  DOH: { utcOffset: 3, label: "AST" },
  STR: { utcOffset: 2, label: "CEST" },
  LHR: { utcOffset: 1, label: "BST" },
  "SZX/HKG": { utcOffset: 8, label: "CST" },
};

// US Eastern offset for October 2026 (EDT = UTC-4)
export const ET_OFFSET = -4;

export const CITIES_BY_DATE: Record<string, string> = {
  "2026-10-05": "Tampa → New York",
  "2026-10-06": "In Transit (Cairo)",
  "2026-10-07": "Cairo → Beijing",
  "2026-10-08": "Beijing → Bangkok → Koh Samui",
  "2026-10-09": "Koh Samui",
  "2026-10-10": "Koh Samui",
  "2026-10-11": "Koh Samui → Chiang Mai",
  "2026-10-12": "Chiang Mai",
  "2026-10-13": "Chiang Mai → Shenzhen/Hong Kong",
  "2026-10-14": "Shenzhen",
  "2026-10-15": "Shenzhen",
  "2026-10-16": "Tianjin",
  "2026-10-17": "Tianjin",
  "2026-10-18": "Xi'an",
  "2026-10-19": "Xi'an",
  "2026-10-20": "Chongqing",
  "2026-10-21": "Chongqing",
  "2026-10-22": "Hong Kong",
  "2026-10-23": "Hong Kong → Doha",
  "2026-10-24": "Doha → Dallas → Tampa",
};
