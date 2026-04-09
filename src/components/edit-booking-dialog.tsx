"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { BookingForm, type BookingFormData } from "@/components/booking-form";
import type { Booking } from "@/lib/supabase/types";

interface EditBookingDialogProps {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
  onSave: (data: BookingFormData) => Promise<void>;
  isLoading: boolean;
}

export function EditBookingDialog({
  booking,
  open,
  onClose,
  onSave,
  isLoading,
}: EditBookingDialogProps) {
  if (!booking) return null;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Edit Booking</SheetTitle>
          <SheetDescription>
            Make changes to this booking. All changes will be saved automatically.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 max-h-[70vh] overflow-y-auto">
          <BookingForm
            initialData={booking}
            onSubmit={onSave}
            onCancel={onClose}
            submitLabel="Save Changes"
            isLoading={isLoading}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
