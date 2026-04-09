import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { appendBookingRow } from "@/lib/google/sheets";
import { uploadToDrive } from "@/lib/google/drive";

export async function GET() {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("date_start", { ascending: true, nullsFirst: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = getServiceClient();

    // Insert into Supabase
    const { data, error } = await supabase
      .from("bookings")
      .insert(body)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Triple sync: Google Drive + Sheets (non-blocking)
    try {
      // Upload to Google Drive if there's a raw file
      if (data.raw_file_url && !data.gdrive_file_id) {
        try {
          const fileRes = await fetch(data.raw_file_url);
          const fileBuffer = Buffer.from(await fileRes.arrayBuffer());
          const fileName = `${data.type}_${data.provider || "unknown"}_${data.date_start?.split("T")[0] || "nodate"}_${data.confirmation_code || "nocode"}.pdf`;
          const { fileId } = await uploadToDrive(fileBuffer, fileName, "application/pdf");
          await supabase.from("bookings").update({ gdrive_file_id: fileId }).eq("id", data.id);
          data.gdrive_file_id = fileId;
        } catch (driveErr) {
          console.error("Google Drive upload error:", driveErr);
        }
      }

      // Append to Google Sheets
      await appendBookingRow(data);
    } catch (syncErr) {
      console.error("Google sync error:", syncErr);
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create booking" },
      { status: 500 }
    );
  }
}
