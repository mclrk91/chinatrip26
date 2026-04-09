"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { ItineraryTimeline } from "@/components/itinerary-timeline";
import { BookingDetail } from "@/components/booking-detail";
import { EditBookingDialog } from "@/components/edit-booking-dialog";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { BottomNav } from "@/components/bottom-nav";
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
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      if (res.ok) {
        setBookings(data);
      }
    } catch {
      // silent on pull-to-refresh
    } finally {
      setRefreshing(false);
      setPullDistance(0);
    }
  }, []);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        touchStartY.current = e.touches[0].clientY;
        isPulling.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling.current || refreshing) return;
      const delta = e.touches[0].clientY - touchStartY.current;
      if (delta > 0 && window.scrollY === 0) {
        setPullDistance(Math.min(delta * 0.5, 80));
      }
    };

    const handleTouchEnd = () => {
      if (pullDistance > 60 && !refreshing) {
        handleRefresh();
      } else {
        setPullDistance(0);
      }
      isPulling.current = false;
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [pullDistance, refreshing, handleRefresh]);

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

  const confirmedCount = useMemo(
    () => bookings.filter((b) => b.status === "confirmed").length,
    [bookings]
  );

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

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-cream/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-bold">
          <span className="text-china-red">Thailand & China</span>{" "}
          <span className="text-muted-foreground font-normal">Oct 2026</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          {confirmedCount} confirmed bookings
        </p>
      </header>

      {/* Pull-to-refresh indicator */}
      {(pullDistance > 0 || refreshing) && (
        <div
          className="flex justify-center items-center overflow-hidden transition-all"
          style={{ height: refreshing ? 48 : pullDistance }}
        >
          <RefreshCw
            className={`h-5 w-5 text-china-red ${refreshing ? "animate-spin" : ""}`}
            style={{
              opacity: Math.min(pullDistance / 60, 1),
              transform: `rotate(${pullDistance * 3}deg)`,
            }}
          />
        </div>
      )}

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
