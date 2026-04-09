import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("booking_drafts")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch draft" },
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
    await supabase
      .from("booking_drafts")
      .delete()
      .eq("id", params.id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete draft" },
      { status: 500 }
    );
  }
}
