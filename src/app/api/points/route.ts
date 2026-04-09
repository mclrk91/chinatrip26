import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";

const DEFAULT_BALANCES = [
  // Points
  { name: "Chase Ultimate Rewards", category: "points", starting_balance: 151720, unit: "points", notes: null, used: false },
  { name: "Marriott Bonvoy", category: "points", starting_balance: 93908, unit: "points", notes: null, used: false },
  { name: "Amex Points (Dad)", category: "points", starting_balance: 1082, unit: "points", notes: null, used: false },
  { name: "Amex Points (Mom)", category: "points", starting_balance: 1433, unit: "points", notes: null, used: false },
  { name: "Delta SkyMiles (Dad)", category: "points", starting_balance: 5600, unit: "miles", notes: null, used: false },
  { name: "Delta SkyMiles (Mom)", category: "points", starting_balance: 24524, unit: "miles", notes: null, used: false },
  // Credits
  { name: "Chase Edit Credit", category: "credits", starting_balance: 250, unit: "USD", notes: "Prepaid 2-night stay via Jack's Chase Reserve", used: false },
  { name: "Delta Stays Credit", category: "credits", starting_balance: 250, unit: "USD", notes: "Via Delta Reserve Amex 31007", used: false },
  { name: "Amex THC/FHR Credit", category: "credits", starting_balance: 300, unit: "USD", notes: "Via Amex Platinum 61003", used: false },
  { name: "Amex THC/FHR Credit (Mom)", category: "credits", starting_balance: 300, unit: "USD", notes: "Mom's Platinum 92008", used: true },
];

export async function GET() {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("points_balances")
      .select("*")
      .order("category", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If no data, seed defaults
    if (!data || data.length === 0) {
      const { data: seeded, error: seedError } = await supabase
        .from("points_balances")
        .insert(DEFAULT_BALANCES)
        .select();

      if (seedError) {
        return NextResponse.json({ error: seedError.message }, { status: 500 });
      }
      return NextResponse.json(seeded);
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch points balances" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...fields } = await request.json();
    const supabase = getServiceClient();

    const { data, error } = await supabase
      .from("points_balances")
      .update(fields)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update points balance" },
      { status: 500 }
    );
  }
}
