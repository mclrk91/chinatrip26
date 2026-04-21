import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { Booking } from "@/lib/supabase/types";

const TRAVELERS = "Mike Clark, Tonya Clark, David Ramos, Amanda Ford";

const SYSTEM_PROMPT = `You are the trip assistant for a 4-person trip to Thailand and China, October 5–24, 2026.
Travelers: ${TRAVELERS}.
Answer the user's question using ONLY the bookings provided below. If the answer isn't in the bookings, say so briefly.
Be concise (1–4 sentences). Use 12-hour clock with the booking-local timezone when visible (e.g., "4:20 PM ICT"). Cite the specific booking (flight number / hotel name) when useful.`;

function summarizeBooking(b: Booking): string {
  const d = (b.details || {}) as Record<string, unknown>;
  const parts: string[] = [];
  parts.push(`[${b.type}/${b.status}]`);
  parts.push(b.title);
  if (b.provider) parts.push(`· ${b.provider}`);
  if (b.confirmation_code) parts.push(`· ${b.confirmation_code}`);
  if (b.travelers?.length) parts.push(`· who: ${b.travelers.join("/")}`);
  if (b.date_start) parts.push(`· start: ${b.date_start}`);
  if (b.date_end) parts.push(`· end: ${b.date_end}`);
  const tz = d.timezone as string | undefined;
  if (tz) parts.push(`· tz: ${tz}`);
  const flight = d.flight_number as string | undefined;
  const dep = d.departure_airport as string | undefined;
  const arr = d.arrival_airport as string | undefined;
  if (flight || dep || arr) {
    parts.push(`· ${flight || ""} ${dep || "?"}→${arr || "?"}`.trim());
  }
  if (d.city) parts.push(`· city: ${d.city}`);
  if (d.room || d.room_type) parts.push(`· room: ${d.room || d.room_type}`);
  if (d.address) parts.push(`· addr: ${d.address}`);
  if (d.phone) parts.push(`· tel: ${d.phone}`);
  if (b.notes) parts.push(`· notes: ${b.notes.slice(0, 200)}`);
  return parts.join(" ");
}

export async function POST(request: Request) {
  try {
    const { question, bookings } = (await request.json()) as {
      question: string;
      bookings: Booking[];
    };

    if (!question?.trim()) {
      return NextResponse.json({ error: "Missing question" }, { status: 400 });
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    const context = (bookings || [])
      .map(summarizeBooking)
      .join("\n");

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Question: ${question.trim()}\n\nBookings:\n${context}`,
        },
      ],
    });

    const text = response.content.find((b) => b.type === "text");
    const answer =
      text && text.type === "text"
        ? text.text.trim()
        : "Sorry, I couldn't answer that.";

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Ask AI error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ask failed" },
      { status: 500 }
    );
  }
}
