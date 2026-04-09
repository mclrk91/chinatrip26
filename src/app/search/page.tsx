"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Sparkles, ArrowLeft, Send } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { BookingCard } from "@/components/booking-card";
import { BookingDetail } from "@/components/booking-detail";
import type { Booking } from "@/lib/supabase/types";

const SUGGESTED_QUESTIONS = [
  "What time do we fly to Bangkok?",
  "Where are we staying in Tianjin?",
  "What's the confirmation code for Qatar Airways?",
  "Do we have any pending bookings?",
  "What's our itinerary for Day 8?",
  "Which flights does David have a different confirmation?",
];

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "ai" ? "ai" : "search";
  const [mode, setMode] = useState<"search" | "ai">(initialMode);
  const [query, setQuery] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filtered, setFiltered] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // AI state
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setBookings(data);
      })
      .catch(() => {});
  }, []);

  const handleSearch = useCallback(
    (q: string) => {
      setQuery(q);
      if (!q.trim()) {
        setFiltered([]);
        return;
      }
      const lower = q.toLowerCase();
      const results = bookings.filter((b) => {
        const searchable = [
          b.title,
          b.provider,
          b.confirmation_code,
          b.type,
          b.status,
          b.notes,
          ...(b.travelers || []),
          ...Object.values((b.details as Record<string, string>) || {}),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return searchable.includes(lower);
      });
      setFiltered(results);
    },
    [bookings]
  );

  const handleAskAI = async (question: string) => {
    if (!question.trim()) return;
    setAiQuestion(question);
    setAiLoading(true);
    setAiAnswer("");
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, bookings }),
      });
      const data = await res.json();
      setAiAnswer(data.answer || "Sorry, I couldn't answer that.");
    } catch {
      setAiAnswer("Sorry, something went wrong. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-cream/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2 mb-3">
          <button onClick={() => router.push("/")} className="p-1">
            <ArrowLeft className="h-5 w-5 text-near-black" />
          </button>
          <h1 className="text-lg font-bold">Search & AI</h1>
        </div>

        {/* Mode tabs */}
        <div className="flex bg-muted rounded-lg p-1">
          <button
            onClick={() => setMode("search")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === "search" ? "bg-white text-near-black shadow-sm" : "text-muted-foreground"
            }`}
          >
            <Search className="h-4 w-4" />
            Search
          </button>
          <button
            onClick={() => setMode("ai")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === "ai" ? "bg-white text-near-black shadow-sm" : "text-muted-foreground"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Ask AI
          </button>
        </div>
      </header>

      <main className="px-4 pt-4 max-w-2xl mx-auto">
        {mode === "search" ? (
          <>
            {/* Search input */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search bookings, flights, hotels..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-china-red/30 focus:border-china-red"
                autoFocus
              />
            </div>

            {/* Results */}
            {query && (
              <p className="text-sm text-muted-foreground mb-3">
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </p>
            )}
            <div className="space-y-3">
              {filtered.map((b) => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  onClick={() => {
                    setSelectedBooking(b);
                    setDetailOpen(true);
                  }}
                />
              ))}
            </div>
            {query && filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-10">
                No bookings match &ldquo;{query}&rdquo;
              </p>
            )}
          </>
        ) : (
          <>
            {/* AI input */}
            <div className="relative mb-4">
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAskAI(aiQuestion)}
                placeholder="Ask anything about the trip..."
                className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-china-red/30 focus:border-china-red"
                autoFocus
              />
              <button
                onClick={() => handleAskAI(aiQuestion)}
                disabled={aiLoading || !aiQuestion.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-china-red disabled:text-gray-300"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>

            {/* AI Answer */}
            {aiLoading && (
              <div className="flex items-center gap-3 p-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-china-red" />
                <span className="text-muted-foreground">Thinking...</span>
              </div>
            )}
            {aiAnswer && !aiLoading && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
                <p className="text-base leading-relaxed whitespace-pre-wrap">{aiAnswer}</p>
              </div>
            )}

            {/* Suggested questions */}
            {!aiAnswer && !aiLoading && (
              <div>
                <p className="text-sm text-muted-foreground mb-3">Suggested questions:</p>
                <div className="space-y-2">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setAiQuestion(q);
                        handleAskAI(q);
                      }}
                      className="block w-full text-left px-4 py-3 bg-white rounded-lg border border-gray-200 text-base hover:border-china-red hover:bg-red-50/30 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Booking detail sheet */}
      <BookingDetail
        booking={selectedBooking}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onEdit={() => {}}
        onCancel={() => {}}
        onDelete={() => {}}
      />

      <BottomNav />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-china-red" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
