"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { LoyaltyTable } from "@/components/loyalty-table";
import { BottomNav } from "@/components/bottom-nav";
import { TRAVELERS, getTravelerMeta } from "@/lib/constants";
import type { LoyaltyNumber } from "@/lib/supabase/types";

export default function LoyaltyPage() {
  const [rows, setRows] = useState<LoyaltyNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTraveler, setSelectedTraveler] = useState<string | null>(null);

  const fetchRows = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/loyalty");
      const data = await res.json();
      if (res.ok) {
        setRows(data);
      } else {
        setError(data.error || `API returned ${res.status}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch numbers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const travelersInData = useMemo(() => {
    const seen = new Set<string>();
    for (const r of rows) seen.add(r.traveler_name);
    const known = TRAVELERS.filter((t) => seen.has(t));
    const extras = Array.from(seen)
      .filter((t) => !(TRAVELERS as readonly string[]).includes(t))
      .sort();
    return [...known, ...extras];
  }, [rows]);

  const filteredRows = useMemo(
    () =>
      selectedTraveler
        ? rows.filter((r) => r.traveler_name === selectedTraveler)
        : rows,
    [rows, selectedTraveler]
  );

  return (
    <div className="min-h-screen pb-32">
      <main style={{ maxWidth: 520, margin: "0 auto", padding: "0 0 140px" }}>
        <div style={{ padding: "20px 20px 0" }}>
          <Link
            href="/"
            className="inline-flex items-center"
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
        </div>

        <header style={{ padding: "14px 20px 8px" }}>
          <h1
            className="font-display"
            style={{
              margin: 0,
              fontSize: 34,
              lineHeight: 1.05,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#6B3410",
            }}
          >
            Loyalty Numbers
          </h1>
        </header>

        {!loading && !error && travelersInData.length > 0 && (
          <div
            style={{
              padding: "12px 20px 0",
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() => setSelectedTraveler(null)}
              style={{
                border: "1.5px solid #6B3410",
                background: selectedTraveler === null ? "#6B3410" : "#fff",
                color: selectedTraveler === null ? "#F5E9C8" : "#6B3410",
                borderRadius: 999,
                padding: "6px 14px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Everyone
            </button>
            {travelersInData.map((name) => {
              const meta = getTravelerMeta(name);
              const active = selectedTraveler === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedTraveler(name)}
                  style={{
                    border: `1.5px solid ${meta.color}`,
                    background: active ? meta.color : "#fff",
                    color: active ? "#fff" : meta.color,
                    borderRadius: 999,
                    padding: "6px 14px",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {meta.short}
                </button>
              );
            })}
          </div>
        )}

        <div style={{ padding: "20px" }}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div
                className="animate-spin rounded-full h-10 w-10"
                style={{
                  border: "2px solid #C41E3A",
                  borderBottomColor: "transparent",
                }}
              />
              <p className="mt-4 text-muted-foreground">Loading…</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p
                className="font-display mb-2"
                style={{ fontSize: 22, fontWeight: 600, color: "#C41E3A" }}
              >
                Couldn&rsquo;t load
              </p>
              <p className="text-muted-foreground mb-4">{error}</p>
              <button
                onClick={() => {
                  setLoading(true);
                  fetchRows();
                }}
                className="text-china-red underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <LoyaltyTable rows={filteredRows} onChange={fetchRows} />
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
