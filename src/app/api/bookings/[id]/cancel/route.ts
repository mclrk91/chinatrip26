import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { updateBookingRow } from "@/lib/google/sheets";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getServiceClient();

    const { data, error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Sync to Google Sheets
    try {
      await updateBookingRow(data);
    } catch (syncErr) {
      console.error("Google Sheets sync error:", syncErr);
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to cancel booking" },
      { status: 500 }
    );
  }
}
