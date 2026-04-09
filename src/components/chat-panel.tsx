"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Loader2, Bot, User } from "lucide-react";
import type { Booking } from "@/lib/supabase/types";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  bookings: Booking[];
  onBookingsChanged: () => void;
}

export function ChatPanel({ bookings, onBookingsChanged }: ChatPanelProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const buildBookingsContext = useCallback(() => {
    if (!bookings.length) return "";
    return bookings
      .map((b) => {
        const details = b.details as Record<string, string>;
        const parts = [
          `[${b.id}] ${b.type.toUpperCase()}: ${b.title}`,
          `Status: ${b.status}`,
          b.date_start ? `Date: ${b.date_start}` : null,
          b.date_end ? `End: ${b.date_end}` : null,
          b.provider ? `Provider: ${b.provider}` : null,
          b.confirmation_code ? `Confirmation: ${b.confirmation_code}` : null,
          b.travelers?.length ? `Travelers: ${b.travelers.join(", ")}` : null,
          details?.city ? `City: ${details.city}` : null,
          details?.departure_airport ? `Route: ${details.departure_airport} → ${details.arrival_airport}` : null,
          b.cost && (b.cost as Record<string, unknown>).amount
            ? `Cost: $${(b.cost as Record<string, unknown>).amount}`
            : null,
          b.notes ? `Notes: ${b.notes}` : null,
        ];
        return parts.filter(Boolean).join(" | ");
      })
      .join("\n");
  }, [bookings]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          bookings_context: buildBookingsContext(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessages([...newMessages, { role: "assistant", content: data.response }]);
        // If any tools were executed, refresh bookings
        if (data.tool_results && data.tool_results.length > 0) {
          onBookingsChanged();
        }
      } else {
        setMessages([
          ...newMessages,
          { role: "assistant", content: `Sorry, something went wrong: ${data.error}` },
        ]);
      }
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Sorry, I couldn't connect to the server. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-20 right-4 z-40 bg-china-red text-white rounded-full p-4 shadow-lg hover:bg-red-700 transition-all hover:scale-105 active:scale-95 md:bottom-6"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div className="fixed inset-0 z-50 md:inset-auto md:bottom-6 md:right-6 md:w-[420px] md:h-[600px] md:rounded-2xl md:shadow-2xl flex flex-col bg-white overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-china-red text-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span className="font-semibold">Trip Assistant</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <Bot className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-muted-foreground text-sm">
                  I can help you manage your trip! Try:
                </p>
                <div className="mt-3 space-y-2">
                  {[
                    "What's left to book?",
                    "Cancel the Conrad Tianjin",
                    "Add a hotel in Shenzhen for Oct 13-16",
                    "Show me all flights",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setInput(suggestion);
                        inputRef.current?.focus();
                      }}
                      className="block w-full text-left px-3 py-2 text-sm bg-white rounded-lg border border-gray-200 hover:border-china-red hover:text-china-red transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-china-red/10 flex items-center justify-center mt-1">
                    <Bot className="h-4 w-4 text-china-red" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-china-red text-white rounded-br-md"
                      : "bg-white border border-gray-200 rounded-bl-md"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div
                      className="prose prose-sm max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:mb-2 [&>ol]:mb-2"
                      dangerouslySetInnerHTML={{
                        __html: formatMarkdown(msg.content),
                      }}
                    />
                  ) : (
                    msg.content
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center mt-1">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-china-red/10 flex items-center justify-center mt-1">
                  <Bot className="h-4 w-4 text-china-red" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Thinking...
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 border-t border-gray-200 p-3 bg-white">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your trip..."
                className="flex-1 px-4 py-2.5 rounded-full border border-gray-300 text-sm focus:outline-none focus:border-china-red focus:ring-1 focus:ring-china-red"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="p-2.5 rounded-full bg-china-red text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition-colors"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function formatMarkdown(text: string): string {
  return text
    // Bold
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    // Inline code
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded text-xs">$1</code>')
    // Line breaks
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>")
    // Wrap in paragraphs
    .replace(/^(.*)$/, "<p>$1</p>")
    // Bullet lists
    .replace(/<br>- /g, '</p><ul class="list-disc pl-4"><li>')
    .replace(/<\/li><br>- /g, "</li><li>")
    .replace(/<li>(.*?)(?=<\/p>|<br>(?!-))/g, "<li>$1</li></ul>");
}
