"use client";

import { useCallback, useEffect, useState } from "react";
import { LoyaltyTable } from "@/components/loyalty-table";
import { BottomNav } from "@/components/bottom-nav";
import type { LoyaltyNumber } from "@/lib/supabase/types";

export default function LoyaltyPage() {
  const [rows, setRows] = useState<LoyaltyNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen pb-32">
      <main style={{ maxWidth: 520, margin: "0 auto", padding: "0 0 140px" }}>
        <header style={{ padding: "28px 20px 8px" }}>
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
          <p
            className="font-display"
            style={{
              margin: "6px 0 0",
              fontSize: 15,
              fontWeight: 400,
              color: "#8C7B6A",
              letterSpacing: "-0.01em",
            }}
          >
            Membership, KTN, Global Entry, Bonvoy & friends
          </p>
        </header>

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
            <LoyaltyTable rows={rows} onChange={fetchRows} />
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
