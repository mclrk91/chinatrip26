"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CancelConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  confirmationCode: string | null;
  isLoading?: boolean;
}

export function CancelConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  confirmationCode,
  isLoading = false,
}: CancelConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel this booking?</DialogTitle>
          <DialogDescription className="text-base space-y-2">
            <span className="block font-semibold text-foreground">{title}</span>
            {confirmationCode && (
              <span className="block font-mono text-sm bg-muted px-2 py-1 rounded inline-block">
                Confirmation: {confirmationCode}
              </span>
            )}
            <span className="block text-sm mt-2">
              This will mark the booking as cancelled. It will still appear in your itinerary for reference.
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-3 sm:gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="flex-1 sm:flex-initial">
            Never Mind
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 sm:flex-initial bg-coral hover:bg-coral/90 text-white"
          >
            {isLoading ? "Cancelling..." : "Yes, Cancel It"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
