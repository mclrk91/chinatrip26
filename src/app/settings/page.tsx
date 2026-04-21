"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { addDays, format } from "date-fns";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BottomNav } from "@/components/bottom-nav";
import {
  CITIES_BY_DATE,
  FLAGS_BY_DATE,
  TRIP_DAYS,
  TRIP_START,
} from "@/lib/constants";

interface DayRow {
  date: string;
  dayNumber: number;
  label: string;
  flag: string;
  city: string;
}

export default function SettingsPage() {
  const initialDays = useMemo<DayRow[]>(() => {
    const rows: DayRow[] = [];
    for (let i = 0; i < TRIP_DAYS; i++) {
      const d = addDays(TRIP_START, i);
      const date = format(d, "yyyy-MM-dd");
      rows.push({
        date,
        dayNumber: i + 1,
        label: format(d, "EEE, MMM d"),
        flag: FLAGS_BY_DATE[date] || "",
        city: CITIES_BY_DATE[date] || "",
      });
    }
    return rows;
  }, []);

  const [days, setDays] = useState<DayRow[]>(initialDays);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/trip-days")
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: { date: string; city: string; flag: string }[]) => {
        if (cancelled || !Array.isArray(rows)) return;
        const byDate: Record<string, { city: string; flag: string }> = {};
        for (const r of rows) byDate[r.date] = { city: r.city, flag: r.flag };
        setDays((prev) =>
          prev.map((d) =>
            byDate[d.date]
              ? { ...d, city: byDate[d.date].city, flag: byDate[d.date].flag }
              : d
          )
        );
      })
      .catch(() => {
        // Keep constants fallback.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateLocal = (date: string, patch: Partial<Pick<DayRow, "city" | "flag">>) => {
    setDays((prev) => prev.map((d) => (d.date === date ? { ...d, ...patch } : d)));
  };

  const saveDay = async (date: string, patch: Partial<Pick<DayRow, "city" | "flag">>) => {
    try {
      const res = await fetch("/api/trip-days", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, ...patch }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      toast.success("Saved");
    } catch {
      toast.error("Couldn't save. Try again.");
    }
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-2xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center mb-3"
        style={{
          gap: 6,
          color: "#6B3410",
          fontSize: 14,
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        <ChevronLeft style={{ width: 18, height: 18 }} />
        Back
      </Link>

      <h1
        className="font-display mb-6"
        style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.01em", color: "#6B3410" }}
      >
        Settings
      </h1>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trip Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-base">
            <p><strong>Trip:</strong> Thailand &amp; China Oct 2026</p>
            <p><strong>Dates:</strong> October 5 – 24, 2026</p>
            <p><strong>Travelers:</strong> Mike Clark, Tonya Clark, David Ramos, Amanda Ford</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Days &amp; Flags</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Edit the flag and city label shown for each day. Changes save when
              you click out of the field.
            </p>
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {days.map((d) => (
                <div
                  key={d.date}
                  className="flex items-center"
                  style={{ gap: 8 }}
                >
                  <div
                    style={{
                      width: 110,
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#2B1810",
                      lineHeight: 1.2,
                    }}
                  >
                    <div>Day {d.dayNumber}</div>
                    <div style={{ color: "#8C7B6A", fontSize: 11 }}>{d.label}</div>
                  </div>
                  <input
                    value={d.flag}
                    maxLength={4}
                    onChange={(e) => updateLocal(d.date, { flag: e.target.value })}
                    onBlur={(e) => saveDay(d.date, { flag: e.target.value })}
                    style={{
                      width: 56,
                      height: 36,
                      textAlign: "center",
                      fontSize: 18,
                      border: "1px solid #D9CFC2",
                      borderRadius: 8,
                      background: "#fff",
                      padding: "0 6px",
                    }}
                    aria-label={`Flag for ${d.label}`}
                  />
                  <input
                    value={d.city}
                    onChange={(e) => updateLocal(d.date, { city: e.target.value })}
                    onBlur={(e) => saveDay(d.date, { city: e.target.value })}
                    style={{
                      flex: 1,
                      height: 36,
                      fontSize: 14,
                      border: "1px solid #D9CFC2",
                      borderRadius: 8,
                      background: "#fff",
                      padding: "0 10px",
                      fontFamily: "inherit",
                    }}
                    aria-label={`City for ${d.label}`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
