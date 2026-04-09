import { NextResponse } from "next/server";
import sharp from "sharp";
import { extractBookingData } from "@/lib/extraction";
import { getServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const textContent = formData.get("text") as string | null;

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    let fileBuffer: Buffer | undefined;
    let mimeType = "text/plain";
    let rawFileUrl: string | null = null;

    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum size is 10MB.` },
          { status: 413 }
        );
      }
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
      mimeType = file.type || "application/octet-stream";

      // Convert HEIC/HEIF to JPEG since Claude API doesn't support HEIC
      if (
        mimeType === "image/heic" ||
        mimeType === "image/heif" ||
        file.name.toLowerCase().endsWith(".heic") ||
        file.name.toLowerCase().endsWith(".heif")
      ) {
        fileBuffer = Buffer.from(await sharp(fileBuffer).jpeg({ quality: 90 }).toBuffer());
        mimeType = "image/jpeg";
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
