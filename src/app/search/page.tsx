"use client";

import { useState, useEffect } from "react";
import { Search, Sparkles, ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/components/bottom-nav";
import { BOOKING_TYPE_COLORS, BOOKING_TYPE_LABELS } from "@/lib/constants";
import type { Booking } from "@/lib/supabase/types";

const SUGGESTED_QUESTIONS = [
  "What flights do we have?",
  "Which hotels are in China?",
  "What's our first booking?",
  "Show me all confirmed bookings",
  "What's planned for Day 10?",
  "How many hotels do we have?",
];

export default function SearchPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [aiQuery, setAiQuery] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setBookings(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = bookings.filter((b) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    const details = b.details as Record<string, string>;
    return (
      b.title.toLowerCase().includes(q) ||
      (b.provider || "").toLowerCase().includes(q) ||
      (b.confirmation_code || "").toLowerCase().includes(q) ||
      b.type.toLowerCase().includes(q) ||
      (b.travelers || []).some((t) => t.toLowerCase().includes(q)) ||
      (details?.departure_airport || "").toLowerCase().includes(q) ||
      (details?.arrival_airport || "").toLowerCase().includes(q) ||
      (details?.city || "").toLowerCase().includes(q) ||
      (b.notes || "").toLowerCase().includes(q)
    );
  });

  const handleAskAI = async (question?: string) => {
    const q = question || aiQuery;
    if (!q.trim()) return;
    setAiQuery(q);
    setAiLoading(true);
    setAiAnswer("");

    try {
      // Build context from bookings
      const context = bookings.map((b) => {
        const details = b.details as Record<string, string>;
        return `${b.type}: ${b.title} | Provider: ${b.provider || "N/A"} | Status: ${b.status} | Date: ${b.date_start || "N/A"} | Confirmation: ${b.confirmation_code || "N/A"} | Travelers: ${(b.travelers || []).join(", ")} | Route: ${details?.departure_airport || ""} → ${details?.arrival_airport || ""} | City: ${details?.city || ""}`;
      }).join("\n");

      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aiQuestion: q,
          tripContext: context,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiAnswer(data.answer || "I couldn't find an answer to that question.");
      } else {
        setAiAnswer("Sorry, I couldn't process that question right now. Try searching instead.");
      }
    } catch {
      setAiAnswer("Sorry, something went wrong. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-20 bg-cream/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-bold">
          <span className="text-china-red">Search & AI</span>
        </h1>
      </header>

      <main className="px-4 pt-4 max-w-2xl mx-auto">
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="search" className="flex-1 gap-1">
              <Search className="h-4 w-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex-1 gap-1">
              <Sparkles className="h-4 w-4" />
              Ask AI
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="mt-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, airline, city, confirmation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-3 text-base rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-china-red/30 focus:border-china-red"
              />
            </div>

            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-china-red" />
              </div>
            ) : searchQuery.trim() === "" ? (
              <p className="text-center text-muted-foreground py-10">
                Type to search across all bookings
              </p>
            ) : filtered.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">
                No bookings match &ldquo;{searchQuery}&rdquo;
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</p>
                {filtered.map((b) => {
                  const color = BOOKING_TYPE_COLORS[b.type] || "#6B7280";
                  return (
                    <Card key={b.id} className="p-3" style={{ borderLeft: `4px solid ${color}` }}>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="text-xs" style={{ backgroundColor: color, color: "white" }}>
                          {BOOKING_TYPE_LABELS[b.type]}
                        </Badge>
                        {b.status === "cancelled" && (
                          <Badge variant="outline" className="text-xs text-red-600 border-red-600">CANCELLED</Badge>
                        )}
                      </div>
                      <h3 className="font-semibold">{b.title}</h3>
                      {b.provider && <p className="text-sm text-muted-foreground">{b.provider}</p>}
                      {b.confirmation_code && (
                        <p className="text-xs font-mono text-muted-foreground mt-1">{b.confirmation_code}</p>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ai" className="mt-4">
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Ask about your trip..."
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAskAI()}
                className="flex-1 px-3 py-3 text-base rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-china-red/30 focus:border-china-red"
              />
              <button
                onClick={() => handleAskAI()}
                disabled={aiLoading || !aiQuery.trim()}
                className="px-4 py-3 bg-china-red text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>

            {/* Suggested questions */}
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleAskAI(q)}
                    className="text-sm px-3 py-1.5 rounded-full bg-white border border-gray-300 hover:border-china-red hover:text-china-red transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Answer */}
            {aiLoading && (
              <div className="flex items-center gap-3 py-8 justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-china-red" />
                <span className="text-muted-foreground">Thinking...</span>
              </div>
            )}

            {aiAnswer && !aiLoading && (
              <Card className="p-4">
                <div className="flex items-start gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-china-red flex-shrink-0 mt-0.5" />
                  <p className="font-medium">AI Answer</p>
                </div>
                <p className="text-base leading-relaxed whitespace-pre-wrap">{aiAnswer}</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
}
