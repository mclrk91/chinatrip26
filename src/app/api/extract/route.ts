import { NextResponse } from "next/server";
import { extractBookingData } from "@/lib/extraction";
import { getServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const textContent = formData.get("text") as string | null;

    let fileBuffer: Buffer | undefined;
    let mimeType = "text/plain";
    let rawFileUrl: string | null = null;

    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
      mimeType = file.type || "application/octet-stream";

      // Handle HEIC files as images
      if (file.name.toLowerCase().endsWith(".heic") || file.name.toLowerCase().endsWith(".heif")) {
        mimeType = "image/jpeg"; // Anthropic doesn't support HEIC, treat as jpeg
      }

      // Upload to Supabase Storage
      const supabase = getServiceClient();
      const fileName = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("booking-files")
        .upload(fileName, fileBuffer, {
          contentType: mimeType,
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
      } else {
        const { data: urlData } = supabase.storage
          .from("booking-files")
          .getPublicUrl(fileName);
        rawFileUrl = urlData.publicUrl;
      }
    }

    // Extract booking data
    const extracted = await extractBookingData(
      fileBuffer || Buffer.from(""),
      mimeType,
      textContent || undefined
    );

    return NextResponse.json({
      ...extracted,
      raw_file_url: rawFileUrl,
    });
  } catch (error) {
    console.error("Extraction error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Extraction failed" },
      { status: 500 }
    );
  }
}
