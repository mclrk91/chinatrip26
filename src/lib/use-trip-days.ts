"use client";

import { useCallback, useEffect, useState } from "react";
import { CITIES_BY_DATE, FLAGS_BY_DATE } from "./constants";

export interface TripDay {
  date: string;
  city: string;
  flag: string;
}

type Maps = { cities: Record<string, string>; flags: Record<string, string> };

let cache: Maps | null = null;
let inflight: Promise<Maps> | null = null;

async function fetchTripDays(): Promise<Maps> {
  const res = await fetch("/api/trip-days", { cache: "no-store" });
  if (!res.ok) throw new Error(`trip-days ${res.status}`);
  const rows = (await res.json()) as TripDay[];
  const cities: Record<string, string> = {};
  const flags: Record<string, string> = {};
  for (const r of rows) {
    if (r.city) cities[r.date] = r.city;
    if (r.flag) flags[r.date] = r.flag;
  }
  return { cities, flags };
}

export function useTripDays() {
  const [maps, setMaps] = useState<Maps>(
    cache || { cities: { ...CITIES_BY_DATE }, flags: { ...FLAGS_BY_DATE } }
  );

  const load = useCallback(async () => {
    try {
      inflight ||= fetchTripDays();
      const fetched = await inflight;
      cache = {
        cities: { ...CITIES_BY_DATE, ...fetched.cities },
        flags: { ...FLAGS_BY_DATE, ...fetched.flags },
      };
      setMaps(cache);
    } catch {
      // Keep constants fallback on error.
    } finally {
      inflight = null;
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refetch = useCallback(() => {
    cache = null;
    inflight = null;
    load();
  }, [load]);

  return { cities: maps.cities, flags: maps.flags, refetch };
}
