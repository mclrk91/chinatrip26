export const TRAVELERS = ["Mike Clark", "Tonya Clark", "David P", "Amanda Ford"] as const;

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

// Default provider website URLs for booking hyperlinks
export const PROVIDER_URLS: Record<string, string> = {
  delta: "https://www.delta.com",
  egyptair: "https://www.egyptair.com",
  "hainan airlines": "https://www.hainanairlines.com",
  "bangkok airways": "https://www.bangkokair.com",
  "qatar airways": "https://www.qatarairways.com",
  "american airlines": "https://www.aa.com",
  "air canada": "https://www.aircanada.com",
  conrad: "https://www.hilton.com",
  hilton: "https://www.hilton.com",
  westin: "https://www.marriott.com",
  marriott: "https://www.marriott.com",
  raweekanlaya: "https://www.chailaiorchid.com",
  "chai lai orchid": "https://www.chailaiorchid.com",
};

export function getProviderUrl(provider: string | null, bookingUrl: string | null): { url: string; label: string } | null {
  if (bookingUrl) {
    try {
      const hostname = new URL(bookingUrl).hostname.replace("www.", "");
      return { url: bookingUrl, label: hostname };
    } catch {
      return { url: bookingUrl, label: "Booking Site" };
    }
  }
  if (!provider) return null;
  const key = provider.toLowerCase();
  for (const [name, url] of Object.entries(PROVIDER_URLS)) {
    if (key.includes(name) || name.includes(key)) {
      const hostname = new URL(url).hostname.replace("www.", "");
      return { url, label: hostname };
    }
  }
  return null;
}

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
