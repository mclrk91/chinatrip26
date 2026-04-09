"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Search, Sparkles, ChevronDown } from "lucide-react";
import { format, addDays } from "date-fns";
import { ItineraryTimeline } from "@/components/itinerary-timeline";
import { CITIES_BY_DATE } from "@/lib/constants";
import { BookingDetail } from "@/components/booking-detail";
import { EditBookingDialog } from "@/components/edit-booking-dialog";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { ShowDriverModal } from "@/components/show-driver-modal";
import { BottomNav } from "@/components/bottom-nav";
import type { Booking } from "@/lib/supabase/types";
import type { BookingFormData } from "@/components/booking-form";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [driverBooking, setDriverBooking] = useState<Booking | null>(null);
  const [driverOpen, setDriverOpen] = useState(false);

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

  // Scroll to day when coming from calendar
  useEffect(() => {
    if (!loading && bookings.length > 0) {
      const scrollTo = searchParams.get("scrollTo");
      if (scrollTo) {
        // Small delay so the DOM is painted
        setTimeout(() => {
          const el = document.getElementById(scrollTo);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
      }
    }
  }, [loading, bookings.length, searchParams]);

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
    try {
      const res = await fetch(`/api/bookings/${booking.id}/cancel`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success("Booking cancelled.");
        fetchBookings();
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

  const handleShowDriver = (booking: Booking) => {
    setDetailOpen(false);
    setDriverBooking(booking);
    setDriverOpen(true);
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header with Search */}
      <header className="sticky top-0 z-20 bg-cream/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        {/* Search + Ask AI row */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className="flex-1 flex items-center gap-2 bg-white rounded-xl border border-gray-200 px-3 py-2.5 cursor-pointer hover:border-gray-300 transition-colors"
            onClick={() => router.push("/search")}
          >
            <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground text-base">Search bookings...</span>
          </div>
          <button
            onClick={() => router.push("/search?mode=ai")}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-china-red/10 text-china-red rounded-xl text-sm font-medium hover:bg-china-red/20 transition-colors flex-shrink-0"
          >
            <Sparkles className="h-4 w-4" />
            Ask AI
          </button>
        </div>

        {/* Title row + Jump to day */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">
              <span className="text-china-red">Thailand & China</span>{" "}
              <span className="text-muted-foreground font-normal text-base">Oct 2026</span>
            </h1>
          </div>
          {bookings.length > 0 && (
            <div className="relative">
              <select
                onChange={(e) => {
                  const el = document.getElementById(e.target.value);
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  e.target.value = "";
                }}
                defaultValue=""
                className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 text-sm font-medium text-near-black cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-china-red/30"
              >
                <option value="" disabled>Jump to day...</option>
                {Array.from({ length: 20 }, (_, i) => {
                  const date = addDays(new Date("2026-10-05T00:00:00"), i);
                  const dateStr = format(date, "yyyy-MM-dd");
                  const city = CITIES_BY_DATE[dateStr] || "";
                  return (
                    <option key={i} value={`day-${i + 1}`}>
                      Day {i + 1} — {format(date, "EEE, MMM d")} — {city}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          )}
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
              Tap &ldquo;Upload&rdquo; below to get started
            </p>
            <p className="text-sm text-muted-foreground">
              Or go to Settings and tap &ldquo;Reload Sample Bookings&rdquo;
            </p>
          </div>
        ) : (
          <ItineraryTimeline
            bookings={bookings}
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
        onShowDriver={handleShowDriver}
      />

      {/* Show to Driver Modal */}
      <ShowDriverModal
        booking={driverBooking}
        open={driverOpen}
        onClose={() => {
          setDriverOpen(false);
          setDriverBooking(null);
        }}
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

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-china-red" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
