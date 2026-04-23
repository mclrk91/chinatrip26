import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";

const VALID_CATEGORIES = new Set([
  "airline",
  "hotel",
  "known_traveler",
  "credit_card",
  "other",
]);

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updates: Record<string, string | null> = {};

    if (typeof body?.program_name === "string") {
      const v = body.program_name.trim();
      if (!v) {
        return NextResponse.json(
          { error: "program_name cannot be empty" },
          { status: 400 }
        );
      }
      updates.program_name = v;
    }
    if (typeof body?.number !== "undefined") {
      const v = body.number == null ? null : String(body.number).trim();
      updates.number = v && v.length > 0 ? v : null;
    }
    if (typeof body?.notes !== "undefined") {
      const v = body.notes == null ? null : String(body.notes).trim();
      updates.notes = v && v.length > 0 ? v : null;
    }
    if (typeof body?.category === "string") {
      if (!VALID_CATEGORIES.has(body.category)) {
        return NextResponse.json(
          { error: `category must be one of ${Array.from(VALID_CATEGORIES).join(", ")}` },
          { status: 400 }
        );
      }
      updates.category = body.category;
    }
    if (typeof body?.traveler_name === "string") {
      const v = body.traveler_name.trim();
      if (!v) {
        return NextResponse.json(
          { error: "traveler_name cannot be empty" },
          { status: 400 }
        );
      }
      updates.traveler_name = v;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No updatable fields" }, { status: 400 });
    }

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("loyalty_numbers")
      .update(updates)
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update loyalty number",
      },
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
      .from("loyalty_numbers")
      .delete()
      .eq("id", params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete loyalty number",
      },
      { status: 500 }
    );
  }
}
