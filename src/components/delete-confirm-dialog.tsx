"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [confirmText, setConfirmText] = useState("");

  useEffect(() => {
    if (!open) setConfirmText("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Permanently delete this booking?</DialogTitle>
          <DialogDescription className="text-base">
            This will permanently remove <strong>&ldquo;{title}&rdquo;</strong> from your itinerary. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Type <strong className="text-foreground">DELETE</strong> to confirm:
          </p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            className="font-mono"
            autoComplete="off"
          />
        </div>
        <DialogFooter className="gap-3 sm:gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="flex-1 sm:flex-initial">
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading || confirmText !== "DELETE"}
            className="flex-1 sm:flex-initial"
          >
            {isLoading ? "Deleting..." : "Yes, Delete It"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
