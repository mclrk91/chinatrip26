"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, Sparkles } from "lucide-react";
import { ItineraryTimeline } from "@/components/itinerary-timeline";
import { BookingDetail } from "@/components/booking-detail";
import { EditBookingDialog } from "@/components/edit-booking-dialog";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { BottomNav } from "@/components/bottom-nav";
import { CITIES_BY_DATE, TRIP_DAYS } from "@/lib/constants";
import type { Booking } from "@/lib/supabase/types";
import type { BookingFormData } from "@/components/booking-form";

export default function HomePage() {
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
  const [searchQuery, setSearchQuery] = useState("");
  const [jumpDay, setJumpDay] = useState("");
  const router = useRouter();

  const filteredBookings = bookings.filter((b) => {
    if (!searchQuery.trim()) return true;
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

  const handleJumpToDay = (dayStr: string) => {
    setJumpDay(dayStr);
    if (!dayStr) return;
    const el = document.getElementById(`day-${dayStr}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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

  const handleCancel = async (booking: Booking) => {
    setDetailOpen(false);

    // Confirmation dialog
    if (!window.confirm(`Cancel "${booking.title}"? This will mark it as cancelled.`)) return;

    try {
      const res = await fetch(`/api/bookings/${booking.id}/cancel`, {
        method: "POST",
      });
      if (res.ok) {
        fetchBookings();
        toast.success("Booking cancelled.", {
          action: {
            label: "Undo",
            onClick: async () => {
              // Restore by updating status back to confirmed
              await fetch(`/api/bookings/${booking.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...booking, status: "confirmed" }),
              });
              fetchBookings();
              toast.success("Booking restored!");
            },
          },
        });
      } else {
        throw new Error("Failed to cancel");
      }
    } catch {
      toast.error("Failed to cancel booking. Please try again.");
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

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-cream/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-bold">
          <span className="text-china-red">Thailand & China</span>{" "}
          <span className="text-muted-foreground font-normal">Oct 2026</span>
        </h1>

        {/* Search bar + Ask AI */}
        <div className="flex items-center gap-2 mt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-china-red/30 focus:border-china-red"
            />
          </div>
          <button
            onClick={() => router.push("/search")}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-china-red bg-white border border-china-red rounded-lg hover:bg-red-50 transition-colors whitespace-nowrap"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </div>

        {/* Jump to day dropdown */}
        <div className="mt-2">
          <select
            value={jumpDay}
            onChange={(e) => handleJumpToDay(e.target.value)}
            className="w-full text-sm py-1.5 px-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-china-red/30 focus:border-china-red"
          >
            <option value="">Jump to day...</option>
            {Array.from({ length: TRIP_DAYS }, (_, i) => {
              const date = new Date("2026-10-05");
              date.setDate(date.getDate() + i);
              const dateStr = date.toISOString().slice(0, 10);
              const city = CITIES_BY_DATE[dateStr] || "";
              return (
                <option key={i} value={dateStr}>
                  Day {i + 1} — {date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} {city ? `· ${city}` : ""}
                </option>
              );
            })}
          </select>
        </div>
      </header>

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
        ) : bookings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl font-semibold mb-2">No bookings yet</p>
            <p className="text-muted-foreground mb-2">
              Tap &ldquo;Add Booking&rdquo; below to get started
            </p>
            <p className="text-sm text-muted-foreground">
              Or go to Settings and tap &ldquo;Reload Sample Bookings&rdquo;
            </p>
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
        onCancel={handleCancel}
        onDelete={handleDeleteClick}
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
