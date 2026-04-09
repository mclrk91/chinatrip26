import Anthropic from "@anthropic-ai/sdk";
import { getServiceClient } from "@/lib/supabase/server";
import type { Booking } from "@/lib/supabase/types";

function formatBookingForContext(b: Booking): string {
  const details = b.details as Record<string, string>;
  const cost = b.cost as Record<string, unknown>;
  const altCodes = b.alt_codes || {};

  let text = `[${b.type.toUpperCase()}] ${b.title}`;
  text += `\n  Status: ${b.status}`;
  if (b.date_start) text += `\n  Start: ${b.date_start}`;
  if (b.date_end) text += `\n  End: ${b.date_end}`;
  if (b.provider) text += `\n  Provider: ${b.provider}`;
  if (b.confirmation_code) text += `\n  Confirmation Code: ${b.confirmation_code}`;
  if (Object.keys(altCodes).length > 0) {
    text += `\n  Alt Codes: ${Object.entries(altCodes).map(([k, v]) => `${k}: ${v}`).join(", ")}`;
  }
  if (b.travelers?.length) text += `\n  Travelers: ${b.travelers.join(", ")}`;
  if (details?.flight_number) text += `\n  Flight Number: ${details.flight_number}`;
  if (details?.departure_airport) text += `\n  Departure: ${details.departure_airport}`;
  if (details?.arrival_airport) text += `\n  Arrival: ${details.arrival_airport}`;
  if (details?.seats) text += `\n  Seats: ${details.seats}`;
  if (details?.city) text += `\n  City: ${details.city}`;
  if (details?.room_type) text += `\n  Room Type: ${details.room_type}`;
  if (details?.check_in) text += `\n  Check-in: ${details.check_in}`;
  if (details?.check_out) text += `\n  Check-out: ${details.check_out}`;
  if (details?.address) text += `\n  Address: ${details.address}`;
  if (b.payment_method) text += `\n  Payment: ${b.payment_method}`;
  if (cost?.amount != null) text += `\n  Cost: ${cost.currency || "USD"} ${cost.amount}`;
  if (b.cancellation_policy) text += `\n  Cancellation Policy: ${b.cancellation_policy}`;
  if (b.booking_url) text += `\n  Booking URL: ${b.booking_url}`;
  if (b.notes) text += `\n  Notes: ${b.notes}`;
  if (b.wanderlog_synced) text += `\n  Wanderlog Synced: Yes`;

  return text;
}

async function searchExtractedText(query: string): Promise<{ booking_id: string; title: string; snippet: string }[]> {
  const supabase = getServiceClient();

  // Build a tsquery from the user's words
  const words = query.split(/\s+/).filter(w => w.length > 2).map(w => w.replace(/[^a-zA-Z0-9]/g, "")).filter(Boolean);
  if (words.length === 0) return [];

  const tsquery = words.join(" | ");

  const { data, error } = await supabase
    .from("bookings")
    .select("id, title, extracted_text")
    .not("extracted_text", "is", null)
    .textSearch("extracted_text", tsquery, { type: "plain" });

  if (error || !data) return [];

  return data.map((row: { id: string; title: string; extracted_text: string }) => ({
    booking_id: row.id,
    title: row.title,
    snippet: row.extracted_text.substring(0, 500),
  }));
}

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json();

    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch all bookings
    const supabase = getServiceClient();
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("*")
      .order("date_start", { ascending: true, nullsFirst: false });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Search extracted text for RAG
    const ragResults = await searchExtractedText(message);
    let ragContext = "";
    if (ragResults.length > 0) {
      ragContext = "\n\n--- ADDITIONAL DOCUMENT TEXT (from uploaded booking confirmations) ---\n";
      ragContext += ragResults.map(r => `[From: ${r.title}]\n${r.snippet}`).join("\n\n");
    }

    // Format all bookings
    const bookingsContext = (bookings as Booking[]).map(formatBookingForContext).join("\n\n");

    const systemPrompt = `You are a helpful travel assistant for a family trip. Here are the trip details:

TRIP: Thailand & China, October 5-24, 2026
TRAVELERS: Mike Clark, Tonya Clark, David P, Amanda Ford
ROUTE: Tampa → Cairo → Beijing → Bangkok → Koh Samui → Chiang Mai → Shenzhen → Tianjin → Xi'an → Chongqing → Hong Kong → Tampa

Below are ALL current bookings for this trip:

${bookingsContext}
${ragContext}

INSTRUCTIONS:
- Answer conversationally and be specific with confirmation numbers, dates, times, and details
- When asked about a specific booking, include the confirmation code and key details
- When asked about a specific traveler, show their bookings and any traveler-specific confirmation codes from alt_codes
- If asked "what's left to book?" or similar, look for gaps in the itinerary — cities without hotel bookings, missing transport between cities, etc.
- If the data doesn't contain the requested information, say "I don't have that information yet — it may not have been uploaded."
- Keep responses concise but complete
- Format dates in a friendly way (e.g., "Tuesday, Oct 8" not "2026-10-08T00:00:00Z")
- Use bullet points for lists of bookings`;

    // Build conversation history (last 10 messages)
    const conversationHistory: { role: "user" | "assistant"; content: string }[] = [];
    if (Array.isArray(history)) {
      const recentHistory = history.slice(-10);
      for (const msg of recentHistory) {
        if (msg.role === "user" || msg.role === "assistant") {
          conversationHistory.push({ role: msg.role, content: msg.content });
        }
      }
    }
    conversationHistory.push({ role: "user", content: message });

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // Stream the response
    const stream = await client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages: conversationHistory,
    });

    // Create a ReadableStream from the Anthropic stream
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: String(err) })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Chat failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
