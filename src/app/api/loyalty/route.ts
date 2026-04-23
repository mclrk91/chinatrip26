import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";

const VALID_CATEGORIES = new Set([
  "airline",
  "hotel",
  "known_traveler",
  "credit_card",
  "other",
]);

export async function GET() {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("loyalty_numbers")
      .select("*")
      .order("traveler_name", { ascending: true })
      .order("category", { ascending: true })
      .order("program_name", { ascending: true });

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
            : "Failed to fetch loyalty numbers",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const traveler_name = String(body?.traveler_name || "").trim();
    const category = String(body?.category || "").trim();
    const program_name = String(body?.program_name || "").trim();

    if (!traveler_name || !program_name) {
      return NextResponse.json(
        { error: "traveler_name and program_name are required" },
        { status: 400 }
      );
    }
    if (!VALID_CATEGORIES.has(category)) {
      return NextResponse.json(
        { error: `category must be one of ${Array.from(VALID_CATEGORIES).join(", ")}` },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("loyalty_numbers")
      .insert({
        traveler_name,
        category,
        program_name,
        number: body?.number ? String(body.number).trim() : null,
        notes: body?.notes ? String(body.notes).trim() : null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create loyalty number",
      },
      { status: 500 }
    );
  }
}
