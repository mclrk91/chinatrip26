"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingForm, type BookingFormData } from "@/components/booking-form";
import { PageWrapper } from "@/components/page-wrapper";

function ReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draft");

  const [extractedData, setExtractedData] = useState<Record<string, unknown> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadDraft() {
      // Try server-side draft first
      if (draftId) {
        try {
          const res = await fetch(`/api/drafts/${draftId}`);
          if (res.ok) {
            const draft = await res.json();
            setExtractedData(draft.data || draft);
            return;
          }
        } catch {
          // Fall through to sessionStorage
        }
      }

      // Fallback: sessionStorage
      const stored = sessionStorage.getItem("extractedBooking");
      if (stored) {
        try {
          setExtractedData(JSON.parse(stored));
        } catch {
          router.push("/upload");
        }
      } else {
        router.push("/upload");
      }
    }

    loadDraft();
  }, [router, draftId]);

  const handleSubmit = async (data: BookingFormData) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to save booking");
      }

      // Clean up draft
      sessionStorage.removeItem("extractedBooking");
      if (draftId) {
        fetch(`/api/drafts/${draftId}`, { method: "DELETE" }).catch(() => {});
      }

      toast.success("Booking saved successfully!");
      router.push("/");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    sessionStorage.removeItem("extractedBooking");
    if (draftId) {
      fetch(`/api/drafts/${draftId}`, { method: "DELETE" }).catch(() => {});
    }
    router.push("/upload");
  };

  if (!extractedData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-china-red" />
      </div>
    );
  }

  return (
    <PageWrapper>
      <h1 className="text-2xl font-bold mb-2 pt-2">Review Booking Details</h1>
      <p className="text-muted-foreground mb-4">
        We extracted these details from your file. Please check everything looks
        right and make any corrections before saving.
      </p>

      <Button
        variant="outline"
        className="mb-4 w-full active:scale-95 active:opacity-80 transition-all"
        onClick={handleCancel}
      >
        Upload a Different File
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Extracted Information</CardTitle>
        </CardHeader>
        <CardContent>
          <BookingForm
            initialData={extractedData as Record<string, unknown>}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="Looks Good — Save It"
            isLoading={isSaving}
          />
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-china-red" />
        </div>
      }
    >
      <ReviewContent />
    </Suspense>
  );
}
