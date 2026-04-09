"use client";

import { useEffect, useState, useMemo } from "react";
import { DollarSign, CreditCard, Users, Award, Loader2 } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import type { Booking } from "@/lib/supabase/types";

interface PointsBalance {
  id: string;
  name: string;
  category: "points" | "credits";
  starting_balance: number;
  unit: string;
  notes: string | null;
  used: boolean;
}

const CATEGORY_COLORS: Record<string, { bg: string; bar: string }> = {
  flight: { bg: "bg-china-red/10", bar: "bg-china-red" },
  hotel: { bg: "bg-gold/10", bar: "bg-gold" },
  tour: { bg: "bg-jade/10", bar: "bg-jade" },
  activity: { bg: "bg-jade/10", bar: "bg-jade" },
  transport: { bg: "bg-sky-blue/10", bar: "bg-sky-blue" },
  restaurant: { bg: "bg-gray-100", bar: "bg-gray-500" },
  other: { bg: "bg-gray-100", bar: "bg-gray-400" },
};

const CATEGORY_LABELS: Record<string, string> = {
  flight: "Flights",
  hotel: "Hotels",
  tour: "Tours & Activities",
  activity: "Tours & Activities",
  transport: "Transport",
  restaurant: "Food",
  other: "Other",
};

export default function BudgetPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [points, setPoints] = useState<PointsBalance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/bookings").then((r) => r.json()),
      fetch("/api/points").then((r) => r.json()),
    ]).then(([bookingsData, pointsData]) => {
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setPoints(Array.isArray(pointsData) ? pointsData : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const activeBookings = useMemo(
    () => bookings.filter((b) => b.status !== "cancelled"),
    [bookings]
  );

  // Calculate totals by category
  const categoryBreakdown = useMemo(() => {
    const cats: Record<string, number> = {};
    activeBookings.forEach((b) => {
      const cost = b.cost as Record<string, unknown>;
      const amount = Number(cost?.amount) || 0;
      if (amount <= 0) return;
      // Merge tour and activity
      const key = b.type === "activity" ? "tour" : b.type;
      cats[key] = (cats[key] || 0) + amount;
    });
    return Object.entries(cats)
      .map(([type, amount]) => ({ type, amount, label: CATEGORY_LABELS[type] || type }))
      .sort((a, b) => b.amount - a.amount);
  }, [activeBookings]);

  const totalCost = useMemo(
    () => categoryBreakdown.reduce((sum, c) => sum + c.amount, 0),
    [categoryBreakdown]
  );

  // Payment method breakdown
  const paymentBreakdown = useMemo(() => {
    const methods: Record<string, number> = {};
    activeBookings.forEach((b) => {
      const cost = b.cost as Record<string, unknown>;
      const amount = Number(cost?.amount) || 0;
      if (amount <= 0) return;
      const method = b.payment_method || "Not specified";
      methods[method] = (methods[method] || 0) + amount;
    });
    return Object.entries(methods)
      .map(([method, amount]) => ({ method, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [activeBookings]);

  // Per-person cost split
  const perPersonCost = useMemo(() => {
    const travelers: Record<string, number> = {
      "Mike Clark": 0,
      "Tonya Clark": 0,
      "David P": 0,
      "Amanda Ford": 0,
    };

    activeBookings.forEach((b) => {
      const cost = b.cost as Record<string, unknown>;
      const amount = Number(cost?.amount) || 0;
      if (amount <= 0) return;
      const numTravelers = b.travelers?.length || 4;
      const share = amount / numTravelers;
      (b.travelers || Object.keys(travelers)).forEach((t) => {
        if (travelers[t] !== undefined) {
          travelers[t] += share;
        }
      });
    });

    return Object.entries(travelers).map(([name, amount]) => ({
      name,
      amount,
    }));
  }, [activeBookings]);

  const pointsBalances = useMemo(
    () => points.filter((p) => p.category === "points"),
    [points]
  );
  const creditBalances = useMemo(
    () => points.filter((p) => p.category === "credits"),
    [points]
  );

  const bookingsWithoutCost = activeBookings.filter((b) => {
    const cost = b.cost as Record<string, unknown>;
    return !cost?.amount || Number(cost.amount) <= 0;
  });

  if (loading) {
    return (
      <div className="min-h-screen pb-24">
        <header className="sticky top-0 z-20 bg-cream/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
          <h1 className="text-xl font-bold">
            <span className="text-china-red">Budget</span>{" "}
            <span className="text-muted-foreground font-normal">Dashboard</span>
          </h1>
        </header>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-china-red" />
        </div>
        <BottomNav />
      </div>
    );
  }

  const maxCategoryAmount = Math.max(...categoryBreakdown.map((c) => c.amount), 1);

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-20 bg-cream/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-bold">
          <span className="text-china-red">Budget</span>{" "}
          <span className="text-muted-foreground font-normal">Dashboard</span>
        </h1>
      </header>

      <main className="px-4 pt-4 max-w-2xl mx-auto space-y-6">
        {/* Total Trip Cost */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">Total Trip Cost</p>
          <p className="text-4xl font-bold text-china-red">
            ${totalCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          {bookingsWithoutCost.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              {bookingsWithoutCost.length} booking{bookingsWithoutCost.length !== 1 ? "s" : ""} without cost data
            </p>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5 text-china-red" />
            <h2 className="font-semibold text-base">By Category</h2>
          </div>
          {categoryBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground">No cost data recorded</p>
          ) : (
            <div className="space-y-3">
              {categoryBreakdown.map((cat) => (
                <div key={cat.type}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium">{cat.label}</span>
                    <span className="text-muted-foreground">
                      ${cat.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      <span className="text-xs ml-1">
                        ({((cat.amount / totalCost) * 100).toFixed(0)}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${CATEGORY_COLORS[cat.type]?.bar || "bg-gray-400"}`}
                      style={{ width: `${(cat.amount / maxCategoryAmount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Method Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-5 w-5 text-china-red" />
            <h2 className="font-semibold text-base">By Payment Method</h2>
          </div>
          {paymentBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payment data recorded</p>
          ) : (
            <div className="space-y-2">
              {paymentBreakdown.map((pm) => (
                <div
                  key={pm.method}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <span className="text-sm">{pm.method}</span>
                  <span className="text-sm font-medium">
                    ${pm.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Per-Person Split */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-china-red" />
            <h2 className="font-semibold text-base">Per-Person Split</h2>
          </div>
          <div className="space-y-2">
            {perPersonCost.map((person) => (
              <div
                key={person.name}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <span className="text-sm font-medium">{person.name}</span>
                <span className="text-sm">
                  {person.amount > 0
                    ? `$${person.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Points & Credits Tracker */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-5 w-5 text-china-red" />
            <h2 className="font-semibold text-base">Points & Credits</h2>
          </div>

          {/* Points */}
          {pointsBalances.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Loyalty Points</h3>
              <div className="space-y-2">
                {pointsBalances.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-1.5">
                    <span className="text-sm">{p.name}</span>
                    <span className="text-sm font-mono font-medium">
                      {p.starting_balance.toLocaleString()} {p.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Credits */}
          {creditBalances.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Travel Credits</h3>
              <div className="space-y-2">
                {creditBalances.map((c) => (
                  <div
                    key={c.id}
                    className={`flex items-center justify-between py-1.5 ${c.used ? "opacity-50" : ""}`}
                  >
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm ${c.used ? "line-through" : ""}`}>
                        {c.name}
                      </span>
                      {c.notes && (
                        <p className="text-xs text-muted-foreground truncate">{c.notes}</p>
                      )}
                    </div>
                    <span className={`text-sm font-mono font-medium ml-3 ${c.used ? "line-through" : ""}`}>
                      ${c.starting_balance.toLocaleString()}
                    </span>
                    {c.used && (
                      <span className="text-xs text-red-500 ml-2 font-medium">USED</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bookings Without Cost */}
        {bookingsWithoutCost.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="font-semibold text-base mb-3">Cost Not Recorded</h2>
            <div className="space-y-1.5">
              {bookingsWithoutCost.map((b) => (
                <p key={b.id} className="text-sm text-muted-foreground">
                  {b.title}
                </p>
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
