"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingForm, type BookingFormData } from "@/components/booking-form";

export default function ReviewPage() {
  const router = useRouter();
  const [extractedData, setExtractedData] = useState<Record<string, unknown> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
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
  }, [router]);

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

      sessionStorage.removeItem("extractedBooking");
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

  if (!extractedData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-china-red" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Review Booking Details</h1>
      <p className="text-muted-foreground mb-6">
        We extracted these details from your file. Please check everything looks
        right and make any corrections before saving.
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Extracted Information</CardTitle>
        </CardHeader>
        <CardContent>
          <BookingForm
            initialData={extractedData as Record<string, unknown>}
            onSubmit={handleSubmit}
            onCancel={() => {
              sessionStorage.removeItem("extractedBooking");
              router.push("/upload");
            }}
            submitLabel="Looks Good — Save It"
            isLoading={isSaving}
          />
        </CardContent>
      </Card>
    </div>
  );
}
