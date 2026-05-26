import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { updateBookingRow, deleteBookingRow } from "@/lib/google/sheets";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    // Coerce "" -> null so timestamptz / nullable columns don't reject the write.
    const clean = Object.fromEntries(
      Object.entries(body).map(([k, v]) => [k, v === "" ? null : v])
    );
    const supabase = getServiceClient();

    const { data, error } = await supabase
      .from("bookings")
      .update(clean)
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
      { error: error instanceof Error ? error.message : "Failed to update booking" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getServiceClient();

    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Sync to Google Sheets
    try {
      await deleteBookingRow(params.id);
    } catch (syncErr) {
      console.error("Google Sheets sync error:", syncErr);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete booking" },
      { status: 500 }
    );
  }
}
