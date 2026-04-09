// Airline and hotel logo mappings using Clearbit Logo API

const AIRLINE_DOMAINS: Record<string, string> = {
  "delta air lines": "delta.com",
  "delta": "delta.com",
  "egyptair": "egyptair.com",
  "hainan airlines": "hainanairlines.com",
  "bangkok airways": "bangkokair.com",
  "qatar airways": "qatarairways.com",
  "american airlines": "aa.com",
  "air canada": "aircanada.com",
  "united airlines": "united.com",
  "british airways": "britishairways.com",
};

const HOTEL_DOMAINS: Record<string, string> = {
  "conrad": "hilton.com",
  "hilton": "hilton.com",
  "westin": "marriott.com",
  "marriott": "marriott.com",
  "hyatt": "hyatt.com",
  "ihg": "ihg.com",
  "sheraton": "marriott.com",
};

export function getAirlineLogo(provider: string | null): string | null {
  if (!provider) return null;
  const key = provider.toLowerCase();
  for (const [name, domain] of Object.entries(AIRLINE_DOMAINS)) {
    if (key.includes(name)) {
      return `https://logo.clearbit.com/${domain}`;
    }
  }
  return null;
}

export function getHotelLogo(title: string, provider: string | null): string | null {
  const combined = `${title} ${provider || ""}`.toLowerCase();
  for (const [name, domain] of Object.entries(HOTEL_DOMAINS)) {
    if (combined.includes(name)) {
      return `https://logo.clearbit.com/${domain}`;
    }
  }
  return null;
}
