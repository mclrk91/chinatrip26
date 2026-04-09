import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getServiceClient } from "@/lib/supabase/server";

const ANALYSIS_PROMPT = `You are analyzing travel bookings for a family trip to Thailand and China (Oct 5-24, 2026).
Travelers: Mike Clark, Tonya Clark, David P, Amanda Ford.

Analyze the bookings and identify issues. Return a JSON array of insights, each with:
- "content": Clear description of the issue or observation
- "type": One of: missing_accommodation, tight_connection, missing_booking, status_alert, traveler_gap, conflict, general
- "severity": "red" (action needed), "yellow" (heads up), or "green" (all good)
- "related_booking_ids": Array of booking UUIDs related to this insight (can be empty)
- "related_dates": Array of date strings (YYYY-MM-DD) related to this insight

Check for:
1. Missing accommodations: Every night Oct 5-23 should have a hotel. Flag any night without one.
2. Tight connections: If arrival time + 2 hours > next departure on same day, flag it.
3. Missing/TBD bookings: Flights or transport that seem needed but aren't booked.
4. Status alerts: Any booking with issues, unusual status, or concerns.
5. Traveler gaps: Amanda Ford has separate routing - flag where she joins/diverges.
6. General tips or observations about the itinerary.

Return ONLY valid JSON array. No markdown code fences.`;

export async function GET() {
  try {
    const supabase = getServiceClient();

    // Check for cached insights (max 1 hour old)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: cached } = await supabase
      .from("insights")
      .select("*")
      .gte("created_at", oneHourAgo)
      .order("created_at", { ascending: false });

    if (cached && cached.length > 0) {
      return NextResponse.json(cached);
    }

    // No cache - generate fresh insights
    return NextResponse.json({ stale: true, message: "No cached insights. POST to refresh." });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch insights" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const supabase = getServiceClient();

    // Fetch all bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("*")
      .order("date_start", { ascending: true });

    if (bookingsError) {
      return NextResponse.json({ error: bookingsError.message }, { status: 500 });
    }

    // Build bookings summary for Claude
    const bookingsSummary = (bookings || []).map((b) => ({
      id: b.id,
      type: b.type,
      status: b.status,
      title: b.title,
      date_start: b.date_start,
      date_end: b.date_end,
      provider: b.provider,
      confirmation_code: b.confirmation_code,
      travelers: b.travelers,
      details: b.details,
      notes: b.notes,
    }));

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await client.messages.create({
      model: "claude-sonnet-4-5-20250514",
      max_tokens: 4096,
      system: ANALYSIS_PROMPT,
      messages: [
        {
          role: "user",
          content: `Here are the current bookings:\n\n${JSON.stringify(bookingsSummary, null, 2)}\n\nAnalyze these bookings and return insights as a JSON array.`,
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from analysis");
    }

    let jsonStr = textBlock.text.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const insights = JSON.parse(jsonStr) as Array<{
      content: string;
      type: string;
      severity: string;
      related_booking_ids?: string[];
      related_dates?: string[];
    }>;

    // Clear old insights
    await supabase.from("insights").delete().lt("created_at", new Date().toISOString());

    // Insert new insights
    const insightRows = insights.map((i) => ({
      content: i.content,
      type: i.type,
      severity: i.severity,
      related_booking_ids: i.related_booking_ids || [],
      related_dates: i.related_dates || [],
    }));

    const { data: inserted, error: insertError } = await supabase
      .from("insights")
      .insert(insightRows)
      .select();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(inserted);
  } catch (error) {
    console.error("Insights generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate insights" },
      { status: 500 }
    );
  }
}
