"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, PlusCircle, MessageCircle } from "lucide-react";
import { ItineraryTimeline } from "@/components/itinerary-timeline";
import { BookingDetail } from "@/components/booking-detail";
import { EditBookingDialog } from "@/components/edit-booking-dialog";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { CancelConfirmDialog } from "@/components/cancel-confirm-dialog";
import { BottomNav } from "@/components/bottom-nav";
import type { Booking } from "@/lib/supabase/types";
import type { BookingFormData } from "@/components/booking-form";

export default function HomePage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteBooking, setDeleteBooking] = useState<Booking | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [cancelBooking, setCancelBooking] = useState<Booking | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [askAiOpen, setAskAiOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/bookings");
      const data = await res.json();
      if (res.ok) {
        setBookings(data);
      } else {
        setError(data.error || `API returned ${res.status}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Filter bookings by search query
  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) return bookings;
    const q = searchQuery.toLowerCase();
    return bookings.filter((b) => {
      const details = b.details as Record<string, string>;
      return (
        b.title.toLowerCase().includes(q) ||
        (b.provider && b.provider.toLowerCase().includes(q)) ||
        (b.confirmation_code && b.confirmation_code.toLowerCase().includes(q)) ||
        b.type.toLowerCase().includes(q) ||
        (details?.city && details.city.toLowerCase().includes(q)) ||
        (details?.departure_airport && details.departure_airport.toLowerCase().includes(q)) ||
        (details?.arrival_airport && details.arrival_airport.toLowerCase().includes(q)) ||
        (b.travelers && b.travelers.some((t) => t.toLowerCase().includes(q)))
      );
    });
  }, [bookings, searchQuery]);

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setDetailOpen(true);
  };

  const handleEdit = (booking: Booking) => {
    setDetailOpen(false);
    setEditBooking(booking);
    setEditOpen(true);
  };

  const handleEditSave = async (data: BookingFormData) => {
    if (!editBooking) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/bookings/${editBooking.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success("Booking updated!");
        setEditOpen(false);
        setEditBooking(null);
        fetchBookings();
      } else {
        throw new Error("Failed to update");
      }
    } catch {
      toast.error("Failed to update booking. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

  // Cancel flow — Step 1: open confirmation dialog
  const handleCancelClick = (booking: Booking) => {
    setDetailOpen(false);
    setCancelBooking(booking);
    setCancelOpen(true);
  };

  // Cancel flow — Step 2: confirm and execute
  const handleCancelConfirm = async () => {
    if (!cancelBooking) return;
    setCancelLoading(true);
    const bookingId = cancelBooking.id;

    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to cancel");

      setCancelOpen(false);
      setCancelBooking(null);
      fetchBookings();

      // Toast with undo action
      toast("Booking cancelled. It will still appear in your itinerary for reference.", {
        action: {
          label: "Undo",
          onClick: () => handleUndoCancel(bookingId),
        },
        duration: 10000,
      });

      // Clear any existing undo timer
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      undoTimerRef.current = setTimeout(() => {
        undoTimerRef.current = null;
      }, 10000);
    } catch {
      toast.error("Failed to cancel booking. Please try again.");
    } finally {
      setCancelLoading(false);
    }
  };

  // Cancel flow — Step 4: undo
  const handleUndoCancel = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "confirmed" }),
      });
      if (res.ok) {
        toast.success("Booking restored to confirmed.");
        fetchBookings();
      } else {
        throw new Error("Failed to undo");
      }
    } catch {
      toast.error("Failed to undo cancellation. Please try again.");
    }
  };

  const handleDeleteClick = (booking: Booking) => {
    setDetailOpen(false);
    setDeleteBooking(booking);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteBooking) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/bookings/${deleteBooking.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Booking deleted.");
        setDeleteOpen(false);
        setDeleteBooking(null);
        fetchBookings();
      } else {
        throw new Error("Failed to delete");
      }
    } catch {
      toast.error("Failed to delete booking. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAskAi = async () => {
    if (!aiQuestion.trim()) return;
    setAiLoading(true);
    setAiAnswer(null);
    try {
      // Simple client-side answer based on bookings data
      const q = aiQuestion.toLowerCase();
      let answer = "";

      if (q.includes("how many") && q.includes("booking")) {
        const confirmed = bookings.filter((b) => b.status === "confirmed").length;
        answer = `You have ${bookings.length} total bookings, ${confirmed} confirmed.`;
      } else if (q.includes("hotel") && (q.includes("which") || q.includes("list") || q.includes("where"))) {
        const hotels = bookings.filter((b) => b.type === "hotel" && b.status !== "cancelled");
        answer = hotels.length > 0
          ? `Your hotels:\n${hotels.map((h) => `- ${h.title} (${(h.details as Record<string, string>)?.city || ""})`).join("\n")}`
          : "No hotel bookings found.";
      } else if (q.includes("flight") && (q.includes("which") || q.includes("list"))) {
        const flights = bookings.filter((b) => b.type === "flight" && b.status !== "cancelled");
        answer = flights.length > 0
          ? `Your flights:\n${flights.map((f) => {
              const d = f.details as Record<string, string>;
              return `- ${f.title} (${d?.departure_airport || ""} → ${d?.arrival_airport || ""})`;
            }).join("\n")}`
          : "No flight bookings found.";
      } else if (q.includes("cancel")) {
        const cancelled = bookings.filter((b) => b.status === "cancelled");
        answer = cancelled.length > 0
          ? `Cancelled bookings:\n${cancelled.map((b) => `- ${b.title}`).join("\n")}`
          : "No cancelled bookings.";
      } else {
        // Search bookings for relevant info
        const matches = bookings.filter((b) =>
          b.title.toLowerCase().includes(q) ||
          (b.provider && b.provider.toLowerCase().includes(q)) ||
          (b.notes && b.notes.toLowerCase().includes(q))
        );
        if (matches.length > 0) {
          answer = `Found ${matches.length} matching booking(s):\n${matches.map((b) => `- ${b.title} (${b.type}, ${b.status})`).join("\n")}`;
        } else {
          answer = "I can answer questions about your bookings — try asking about flights, hotels, or specific destinations.";
        }
      }

      setAiAnswer(answer);
    } catch {
      setAiAnswer("Sorry, I couldn't process that question. Try again.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-cream/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-bold">
          <span className="text-china-red">Thailand & China</span>{" "}
          <span className="text-muted-foreground font-normal">Oct 2026</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          {bookings.filter((b) => b.status === "confirmed").length} confirmed bookings
        </p>
      </header>

      {/* Action Bar */}
      <div className="sticky top-[68px] z-10 bg-cream/95 backdrop-blur-sm px-4 py-3 border-b border-gray-200">
        <div className="max-w-2xl mx-auto space-y-2">
          {/* Desktop: single row / Mobile: stacked */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex gap-2 sm:order-1">
              <button
                onClick={() => router.push("/upload")}
                className="flex items-center justify-center gap-2 h-12 px-4 rounded-lg font-semibold text-white flex-1 sm:flex-initial"
                style={{ backgroundColor: "#C41E3A" }}
              >
                <PlusCircle className="h-5 w-5" />
                <span>Upload New Booking</span>
              </button>
              <button
                onClick={() => setAskAiOpen(!askAiOpen)}
                className="flex items-center justify-center gap-2 h-12 px-4 rounded-lg font-semibold flex-1 sm:flex-initial"
                style={{ backgroundColor: "#D4AF37", color: "#1A1A2E" }}
              >
                <MessageCircle className="h-5 w-5" />
                <span>Ask AI</span>
              </button>
            </div>
            <div className="relative flex-1 sm:order-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-10 pr-4 rounded-lg border border-gray-300 bg-white text-base focus:outline-none focus:ring-2 focus:ring-china-red/50 focus:border-china-red"
              />
            </div>
          </div>

          {/* Ask AI inline panel */}
          {askAiOpen && (
            <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask about your trip..."
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAskAi()}
                  className="flex-1 h-10 px-3 rounded-lg border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-gold/50"
                />
                <button
                  onClick={handleAskAi}
                  disabled={aiLoading || !aiQuestion.trim()}
                  className="h-10 px-4 rounded-lg font-medium text-white disabled:opacity-50"
                  style={{ backgroundColor: "#D4AF37" }}
                >
                  {aiLoading ? "..." : "Ask"}
                </button>
              </div>
              {aiAnswer && (
                <div className="text-sm bg-cream rounded-lg p-3 whitespace-pre-line">
                  {aiAnswer}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <main className="px-4 pt-4 max-w-2xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-china-red" />
            <p className="mt-4 text-muted-foreground">Loading your itinerary...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-xl font-semibold mb-2 text-red-600">Something went wrong</p>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={() => { setLoading(true); fetchBookings(); }}
              className="text-china-red underline text-lg"
            >
              Try again
            </button>
          </div>
        ) : filteredBookings.length === 0 && bookings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl font-semibold mb-2">No bookings yet</p>
            <p className="text-muted-foreground mb-2">
              Tap &ldquo;Upload New Booking&rdquo; above to get started
            </p>
            <p className="text-sm text-muted-foreground">
              Or go to Settings and tap &ldquo;Reload Sample Bookings&rdquo;
            </p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg font-semibold mb-2">No bookings match &ldquo;{searchQuery}&rdquo;</p>
            <button onClick={() => setSearchQuery("")} className="text-china-red underline">
              Clear search
            </button>
          </div>
        ) : (
          <ItineraryTimeline
            bookings={filteredBookings}
            onBookingClick={handleBookingClick}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Booking Detail Sheet */}
      <BookingDetail
        booking={selectedBooking}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onEdit={handleEdit}
        onCancel={handleCancelClick}
        onDelete={handleDeleteClick}
      />

      {/* Cancel Confirmation */}
      <CancelConfirmDialog
        open={cancelOpen}
        onClose={() => {
          setCancelOpen(false);
          setCancelBooking(null);
        }}
        onConfirm={handleCancelConfirm}
        title={cancelBooking?.title || ""}
        confirmationCode={cancelBooking?.confirmation_code || null}
        isLoading={cancelLoading}
      />

      {/* Edit Dialog */}
      <EditBookingDialog
        booking={editBooking}
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditBooking(null);
        }}
        onSave={handleEditSave}
        isLoading={editLoading}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteBooking(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={deleteBooking?.title || ""}
        isLoading={deleteLoading}
      />
    </div>
  );
}
