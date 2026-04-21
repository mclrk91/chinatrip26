"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { ItineraryTimeline } from "@/components/itinerary-timeline";
import { BookingDetail } from "@/components/booking-detail";
import { EditBookingDialog } from "@/components/edit-booking-dialog";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { BottomNav } from "@/components/bottom-nav";
import type { Booking, DayNote } from "@/lib/supabase/types";
import type { BookingFormData } from "@/components/booking-form";

export default function HomePage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [dayNotes, setDayNotes] = useState<DayNote[]>([]);
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

  const fetchDayNotes = useCallback(async () => {
    try {
      const res = await fetch("/api/day-notes");
      if (res.ok) {
        const data = await res.json();
        setDayNotes(Array.isArray(data) ? data : []);
      }
    } catch {
      // Non-fatal; notes just won't render.
    }
  }, []);

  useEffect(() => {
    fetchBookings();
    fetchDayNotes();
  }, [fetchBookings, fetchDayNotes]);

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
    <div className="min-h-screen pb-32">
      {/* Content */}
      <main>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div
              className="animate-spin rounded-full h-10 w-10"
              style={{ border: "2px solid #C41E3A", borderBottomColor: "transparent" }}
            />
            <p className="mt-4 text-muted-foreground">Loading your itinerary…</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 px-4">
            <p
              className="font-display mb-2"
              style={{ fontSize: 28, fontWeight: 600, color: "#C41E3A" }}
            >
              Something went wrong
            </p>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                fetchBookings();
              }}
              className="text-china-red underline text-lg"
            >
              Try again
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 px-4">
            <p
              className="font-display mb-2"
              style={{ fontSize: 28, fontWeight: 600, color: "#6B3410" }}
            >
              No bookings yet
            </p>
            <p className="text-muted-foreground mb-2" style={{ fontSize: 17 }}>
              Tap &ldquo;Add Booking&rdquo; below to get started
            </p>
            <p className="text-sm text-muted-foreground">
              Or go to Settings and tap &ldquo;Reload Sample Bookings&rdquo;
            </p>
          </div>
        ) : (
          <ItineraryTimeline
            bookings={bookings}
            dayNotes={dayNotes}
            onBookingClick={handleBookingClick}
            onDayNotesChange={fetchDayNotes}
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
