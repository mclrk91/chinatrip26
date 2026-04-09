import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { question, bookings } = await req.json();

    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    // Build a compact summary of bookings for context
    const bookingSummary = (bookings || [])
      .map((b: Record<string, unknown>) => {
        const details = (b.details || {}) as Record<string, string>;
        return `- ${b.type}: ${b.title} | ${b.status} | ${b.date_start || "no date"} to ${b.date_end || "?"} | Provider: ${b.provider || "?"} | Conf: ${b.confirmation_code || "?"} | Travelers: ${(b.travelers as string[] || []).join(", ")} | ${details.departure_airport ? `${details.departure_airport}→${details.arrival_airport}` : ""} ${details.city || ""} ${details.flight_number || ""}`;
      })
      .join("\n");

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `You are a helpful travel assistant for a family trip to Thailand & China in October 2026. Answer the question using the booking data below. Be concise and helpful. If you don't know, say so.

BOOKINGS:
${bookingSummary}

QUESTION: ${question}`,
        },
      ],
    });

    const answer =
      message.content[0].type === "text" ? message.content[0].text : "Sorry, I couldn't answer that.";

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Ask AI error:", error);
    return NextResponse.json(
      { answer: "Sorry, something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
