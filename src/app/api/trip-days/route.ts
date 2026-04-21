import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("trip_days")
      .select("*")
      .order("date", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch trip days" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      date: string;
      city?: string;
      flag?: string;
    };

    if (!body.date) {
      return NextResponse.json({ error: "Missing date" }, { status: 400 });
    }

    const row: { date: string; city?: string; flag?: string } = { date: body.date };
    if (body.city !== undefined) row.city = body.city;
    if (body.flag !== undefined) row.flag = body.flag;

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("trip_days")
      .upsert(row, { onConflict: "date" })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update trip day" },
      { status: 500 }
    );
  }
}
