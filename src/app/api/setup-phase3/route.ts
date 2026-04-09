import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = getServiceClient();

    // Try to create tables via RPC (may not be available)
    try {
      await supabase.rpc("exec_sql", {
        sql: `
          CREATE TABLE IF NOT EXISTS insights (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            content text NOT NULL,
            type text NOT NULL,
            severity text NOT NULL,
            related_booking_ids uuid[] DEFAULT '{}',
            related_dates text[] DEFAULT '{}',
            created_at timestamptz DEFAULT now()
          );
          ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
          DO $$ BEGIN
            CREATE POLICY "Allow all access on insights" ON insights FOR ALL USING (true) WITH CHECK (true);
          EXCEPTION WHEN duplicate_object THEN NULL;
          END $$;

          CREATE TABLE IF NOT EXISTS checklist (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            category text NOT NULL,
            item text NOT NULL,
            checked boolean DEFAULT false,
            notes text,
            created_at timestamptz DEFAULT now()
          );
          ALTER TABLE checklist ENABLE ROW LEVEL SECURITY;
          DO $$ BEGIN
            CREATE POLICY "Allow all access on checklist" ON checklist FOR ALL USING (true) WITH CHECK (true);
          EXCEPTION WHEN duplicate_object THEN NULL;
          END $$;

          CREATE TABLE IF NOT EXISTS points_balances (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            name text NOT NULL,
            category text NOT NULL,
            starting_balance numeric NOT NULL DEFAULT 0,
            unit text NOT NULL DEFAULT 'points',
            notes text,
            used boolean DEFAULT false,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
          );
          ALTER TABLE points_balances ENABLE ROW LEVEL SECURITY;
          DO $$ BEGIN
            CREATE POLICY "Allow all access on points_balances" ON points_balances FOR ALL USING (true) WITH CHECK (true);
          EXCEPTION WHEN duplicate_object THEN NULL;
          END $$;
        `,
      });
    } catch {
      // RPC may not be available - that's ok
    }

    // Test if tables exist by trying to query them
    const tests = await Promise.allSettled([
      supabase.from("insights").select("id").limit(1),
      supabase.from("checklist").select("id").limit(1),
      supabase.from("points_balances").select("id").limit(1),
    ]);

    const results = {
      insights: tests[0].status === "fulfilled" && !tests[0].value.error,
      checklist: tests[1].status === "fulfilled" && !tests[1].value.error,
      points_balances: tests[2].status === "fulfilled" && !tests[2].value.error,
      message: "Check table status above. If any are missing, run schema-phase3.sql in Supabase SQL Editor.",
    };

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Setup failed",
        message: "Please run supabase/schema-phase3.sql in the Supabase SQL Editor to create Phase 3 tables",
      },
      { status: 500 }
    );
  }
}
