"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
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
      const res = await fetch("/api/bookings");
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
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
          {bookings.filter((b) => b.status === "confirmed").length} confirmed bookings
        </p>
      </header>

      {/* Content */}
      <main className="px-4 pt-4 max-w-2xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-china-red" />
            <p className="mt-4 text-muted-foreground">Loading your itinerary...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl font-semibold mb-2">No bookings yet</p>
            <p className="text-muted-foreground">
              Tap &ldquo;Add Booking&rdquo; below to get started
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
