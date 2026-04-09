"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileDropzone } from "@/components/file-dropzone";
import { BookingForm, type BookingFormData } from "@/components/booking-form";

export default function UploadPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleFileAccepted = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to process file");
      }

      const extracted = await res.json();

      // Store extracted data for review page
      sessionStorage.setItem("extractedBooking", JSON.stringify(extracted));
      router.push("/upload/review");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to process file. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleManualSubmit = async (data: BookingFormData) => {
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

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-serif font-bold mb-6 text-brand-text">Add a Booking</h1>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="upload" className="flex-1">
            Upload File
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex-1">
            Type It In
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload a Booking Confirmation</CardTitle>
              <p className="text-muted-foreground">
                Take a photo or upload a PDF of your booking confirmation. We&apos;ll read it and fill in the details for you.
              </p>
            </CardHeader>
            <CardContent>
              <FileDropzone
                onFileAccepted={handleFileAccepted}
                isUploading={isUploading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Enter Booking Details</CardTitle>
              <p className="text-muted-foreground">
                Fill in the details of your booking below.
              </p>
            </CardHeader>
            <CardContent>
              <BookingForm
                onSubmit={handleManualSubmit}
                onCancel={() => router.push("/")}
                isLoading={isSaving}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
