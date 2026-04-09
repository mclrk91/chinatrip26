"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatButton() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      // Get bookings for context
      const bookingsRes = await fetch("/api/bookings");
      const bookings = await bookingsRes.json();

      const context = Array.isArray(bookings)
        ? bookings
            .map((b: Record<string, unknown>) => {
              const details = b.details as Record<string, string>;
              return `${b.type}: ${b.title} | ${b.provider || ""} | ${b.status} | ${b.date_start || ""} | ${b.confirmation_code || ""} | Travelers: ${(b.travelers as string[] || []).join(", ")} | ${details?.departure_airport || ""} → ${details?.arrival_airport || ""} | ${details?.city || ""}`;
            })
            .join("\n")
        : "";

      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aiQuestion: userMsg,
          tripContext: context,
          chatHistory: messages,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.answer || "I couldn't find an answer." },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Sorry, something went wrong. Please try again." },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't connect. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-20 right-4 z-40 w-14 h-14 bg-china-red text-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-700 active:scale-95 transition-all"
          style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat drawer */}
      {open && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-white">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-cream">
            <h2 className="text-lg font-bold text-china-red">Trip Assistant</h2>
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-10">
                <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>Ask me anything about your trip!</p>
                <p className="text-sm mt-1">I know all your bookings and itinerary details.</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl text-base ${
                    msg.role === "user"
                      ? "bg-china-red text-white rounded-br-md"
                      : "bg-muted text-near-black rounded-bl-md"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted px-4 py-2 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 px-4 py-3 bg-white" style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom, 12px))" }}>
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about your trip..."
                className="flex-1 px-4 py-2.5 text-base rounded-full border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-china-red/30 focus:border-china-red"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="p-2.5 bg-china-red text-white rounded-full hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
