"use client";

import { useState } from "react";
import { Sparkles, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Booking } from "@/lib/supabase/types";

interface AskAIProps {
  bookings: Booking[];
}

function answerQuestion(question: string, bookings: Booking[]): string {
  const q = question.toLowerCase();

  // Search for confirmation codes
  if (q.includes("confirmation") || q.includes("code") || q.includes("booking number")) {
    const matches = bookings.filter((b) => {
      const searchTerms = q.split(/\s+/);
      return searchTerms.some(
        (term) =>
          b.title?.toLowerCase().includes(term) ||
          b.provider?.toLowerCase().includes(term) ||
          (b.details as Record<string, string>)?.city?.toLowerCase().includes(term)
      );
    });
    if (matches.length > 0) {
      return matches
        .map((b) => {
          let result = `**${b.title}** — Confirmation: \`${b.confirmation_code}\``;
          if (b.alt_codes && Object.keys(b.alt_codes).length > 0) {
            result += "\n" + Object.entries(b.alt_codes).map(([k, v]) => `  ${k}: \`${v}\``).join("\n");
          }
          return result;
        })
        .join("\n\n");
    }
  }

  // Search for hotel info
  if (q.includes("hotel") || q.includes("stay") || q.includes("where")) {
    const hotels = bookings.filter((b) => b.type === "hotel");
    if (hotels.length > 0) {
      const cityMatch = q.match(/xi.?an|xian|tianjin|chiang|samui|shenzhen|conrad|westin|raweekanlaya|orchid/i);
      if (cityMatch) {
        const searchTerm = cityMatch[0].toLowerCase();
        const match = hotels.find((h) =>
          h.title.toLowerCase().includes(searchTerm) ||
          (h.details as Record<string, string>)?.city?.toLowerCase().includes(searchTerm)
        );
        if (match) {
          const d = match.details as Record<string, string>;
          return `**${match.title}**\nCity: ${d?.city || "N/A"}\nCheck-in: ${d?.check_in || "N/A"}\nCheck-out: ${d?.check_out || "N/A"}\nConfirmation: \`${match.confirmation_code}\`\nTravelers: ${match.travelers?.join(", ")}`;
        }
      }
      return hotels
        .map((h) => {
          const d = h.details as Record<string, string>;
          return `**${h.title}** (${d?.city || ""}) — Confirmation: \`${h.confirmation_code}\``;
        })
        .join("\n\n");
    }
  }

  // Search for flight info
  if (q.includes("flight") || q.includes("fly") || q.includes("airline")) {
    const flights = bookings.filter((b) => b.type === "flight" && b.status !== "cancelled");
    return flights
      .slice(0, 5)
      .map((f) => {
        const d = f.details as Record<string, string>;
        return `**${f.title}** · ${d?.flight_number || ""}\n${d?.departure_airport || ""} → ${d?.arrival_airport || ""} · \`${f.confirmation_code}\``;
      })
      .join("\n\n");
  }

  // Generic search across all bookings
  const searchTerms = q.split(/\s+/).filter((t) => t.length > 2);
  const matches = bookings.filter((b) =>
    searchTerms.some(
      (term) =>
        b.title?.toLowerCase().includes(term) ||
        b.provider?.toLowerCase().includes(term) ||
        (b.details as Record<string, string>)?.city?.toLowerCase().includes(term) ||
        b.notes?.toLowerCase().includes(term)
    )
  );

  if (matches.length > 0) {
    return matches
      .map((b) => `**${b.title}** — ${b.provider || ""} · \`${b.confirmation_code || "N/A"}\``)
      .join("\n\n");
  }

  return "I couldn't find specific information about that. Try asking about hotels, flights, confirmations, or a specific city like Xi'an or Tianjin.";
}

export function AskAI({ bookings }: AskAIProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = () => {
    if (!query.trim()) return;
    setLoading(true);
    // Simulate brief delay for feel
    setTimeout(() => {
      const result = answerQuestion(query.trim(), bookings);
      setAnswer(result);
      setLoading(false);
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAsk();
  };

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        size="sm"
        className="gap-1.5 text-sm border-china-red text-china-red hover:bg-china-red hover:text-white"
        title="Quick answers — ask one question"
      >
        <Sparkles className="h-4 w-4" />
        Ask AI
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about the trip..."
          className="text-base"
          autoFocus
        />
        <Button onClick={handleAsk} disabled={loading || !query.trim()} size="sm">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ask"}
        </Button>
        <Button
          onClick={() => { setOpen(false); setAnswer(null); setQuery(""); }}
          variant="ghost"
          size="sm"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground">Quick answers — ask one question</p>

      {answer && (
        <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm shadow-sm">
          <div className="flex justify-between items-start mb-1">
            <span className="text-xs text-china-red font-semibold flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> AI Answer
            </span>
            <button onClick={() => setAnswer(null)} className="text-muted-foreground hover:text-near-black">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="whitespace-pre-wrap text-near-black leading-relaxed">
            {answer.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return <strong key={i}>{part.slice(2, -2)}</strong>;
              }
              if (part.includes("`")) {
                return (
                  <span key={i}>
                    {part.split(/(`[^`]+`)/g).map((s, j) =>
                      s.startsWith("`") && s.endsWith("`") ? (
                        <code key={j} className="bg-muted px-1 py-0.5 rounded font-mono text-xs">{s.slice(1, -1)}</code>
                      ) : (
                        s
                      )
                    )}
                  </span>
                );
              }
              return part;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
