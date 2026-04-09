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

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  isLoading?: boolean;
}

export function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  isLoading = false,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription className="text-base">
            This will remove <strong>&ldquo;{title}&rdquo;</strong> from your itinerary. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-3 sm:gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="flex-1 sm:flex-initial">
            No, Keep It
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 sm:flex-initial"
          >
            {isLoading ? "Deleting..." : "Yes, Delete It"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
