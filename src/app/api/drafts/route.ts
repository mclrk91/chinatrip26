import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = getServiceClient();

    const { data, error } = await supabase
      .from("booking_drafts")
      .insert({ data: body })
      .select()
      .single();

    if (error) {
      // If the table doesn't exist, fall back gracefully
      console.error("Draft save error:", error);
      return NextResponse.json({ id: null, data: body }, { status: 200 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save draft" },
      { status: 500 }
    );
  }
}
