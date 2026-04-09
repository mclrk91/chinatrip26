import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getServiceClient } from "@/lib/supabase/server";
import { updateBookingRow, appendBookingRow } from "@/lib/google/sheets";
import type { Booking } from "@/lib/supabase/types";

const TOOL_DEFINITIONS: Anthropic.Messages.Tool[] = [
  {
    name: "search_bookings",
    description:
      "Search bookings by any criteria. Returns matching bookings. Use this to find bookings before modifying them.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "Search query string to match against booking titles, providers, confirmation codes, cities, notes",
        },
        filters: {
          type: "object",
          properties: {
            type: { type: "string", description: "Booking type: flight, hotel, tour, activity, transport, restaurant, other" },
            status: { type: "string", description: "Booking status: confirmed, cancelled, pending, modified" },
            date_range: {
              type: "object",
              properties: {
                start: { type: "string", description: "ISO date string for range start" },
                end: { type: "string", description: "ISO date string for range end" },
              },
            },
            traveler: { type: "string", description: "Traveler name to filter by" },
          },
        },
      },
      required: ["query"],
    },
  },
  {
    name: "cancel_booking",
    description:
      "Mark a booking as cancelled. Updates Supabase status to 'cancelled', updates Google Sheets row, and notes the cancellation. IMPORTANT: Always confirm with the user before calling this tool.",
    input_schema: {
      type: "object" as const,
      properties: {
        booking_id: { type: "string", description: "UUID of the booking to cancel" },
        reason: { type: "string", description: "Optional reason for cancellation" },
      },
      required: ["booking_id"],
    },
  },
  {
    name: "update_booking",
    description:
      "Update fields on an existing booking. Can change dates, notes, confirmation codes, traveler list, etc.",
    input_schema: {
      type: "object" as const,
      properties: {
        booking_id: { type: "string", description: "UUID of the booking to update" },
        fields: {
          type: "object",
          description: "Object of field:value pairs to update. Valid fields: title, date_start, date_end, provider, confirmation_code, alt_codes, travelers, details, payment_method, cost, cancellation_policy, booking_url, notes, status",
        },
      },
      required: ["booking_id", "fields"],
    },
  },
  {
    name: "add_booking",
    description:
      "Create a new booking manually from conversational input. Used when user says something like 'Add a hotel in Shenzhen for Oct 13-16'.",
    input_schema: {
      type: "object" as const,
      properties: {
        type: { type: "string", enum: ["flight", "hotel", "tour", "activity", "transport", "restaurant", "other"] },
        title: { type: "string", description: "Brief descriptive title" },
        status: { type: "string", enum: ["confirmed", "cancelled", "pending", "modified"], description: "Default: confirmed" },
        date_start: { type: "string", description: "ISO 8601 datetime" },
        date_end: { type: "string", description: "ISO 8601 datetime or null" },
        provider: { type: "string" },
        confirmation_code: { type: "string" },
        alt_codes: { type: "object" },
        travelers: { type: "array", items: { type: "string" } },
        details: { type: "object" },
        payment_method: { type: "string" },
        cost: { type: "object" },
        cancellation_policy: { type: "string" },
        notes: { type: "string" },
      },
      required: ["type", "title"],
    },
  },
];

const SYSTEM_PROMPT = `You are an AI travel assistant for a family trip to Thailand and China in October 2026. The travelers are Mike Clark, Tonya Clark, David P, and Amanda Ford.

Trip dates: October 5-24, 2026
Route: Tampa → New York → Cairo → Beijing → Bangkok → Koh Samui → Chiang Mai → Shenzhen → Tianjin → Xi'an → Chongqing → Hong Kong → Doha → Dallas → Tampa

You have access to tools to search, create, update, and cancel bookings. Use them when the user asks to make changes.

CRITICAL RULES FOR DESTRUCTIVE ACTIONS:
- Before calling cancel_booking, you MUST first ask the user to confirm. Describe exactly what will be cancelled (title, confirmation code, etc.) and ask "Should I go ahead?"
- Only call cancel_booking AFTER the user explicitly confirms with "yes", "go ahead", "do it", etc.
- For updates and additions, proceed directly but confirm after completion.

When searching, always use search_bookings first to find the relevant booking before modifying it.

After any modification, summarize what was changed and note that Google Sheets has been synced.

Be helpful, concise, and proactive. If you notice issues (missing hotels, tight connections), mention them. Format responses with markdown for readability.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

async function executeSearchBookings(input: { query: string; filters?: { type?: string; status?: string; date_range?: { start?: string; end?: string }; traveler?: string } }) {
  const supabase = getServiceClient();
  let query = supabase.from("bookings").select("*");

  if (input.filters?.type) {
    query = query.eq("type", input.filters.type);
  }
  if (input.filters?.status) {
    query = query.eq("status", input.filters.status);
  }
  if (input.filters?.date_range?.start) {
    query = query.gte("date_start", input.filters.date_range.start);
  }
  if (input.filters?.date_range?.end) {
    query = query.lte("date_start", input.filters.date_range.end);
  }

  const { data, error } = await query.order("date_start", { ascending: true });
  if (error) return { error: error.message };

  let results = data || [];

  // Text search across multiple fields
  if (input.query && input.query.trim()) {
    const q = input.query.toLowerCase();
    results = results.filter((b: Booking) => {
      const details = b.details as Record<string, string>;
      const searchable = [
        b.title,
        b.provider,
        b.confirmation_code,
        b.notes,
        details?.city,
        details?.departure_airport,
        details?.arrival_airport,
        ...(b.travelers || []),
        ...(Object.values(b.alt_codes || {})),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return searchable.includes(q);
    });
  }

  if (input.filters?.traveler) {
    results = results.filter((b: Booking) =>
      b.travelers?.some((t: string) => t.toLowerCase().includes(input.filters!.traveler!.toLowerCase()))
    );
  }

  return {
    count: results.length,
    bookings: results.map((b: Booking) => ({
      id: b.id,
      type: b.type,
      status: b.status,
      title: b.title,
      date_start: b.date_start,
      date_end: b.date_end,
      provider: b.provider,
      confirmation_code: b.confirmation_code,
      alt_codes: b.alt_codes,
      travelers: b.travelers,
      details: b.details,
      cost: b.cost,
      payment_method: b.payment_method,
      notes: b.notes,
    })),
  };
}

async function executeCancelBooking(input: { booking_id: string; reason?: string }) {
  const supabase = getServiceClient();
  const notes = input.reason ? `Cancelled: ${input.reason}` : "Cancelled via AI chat";

  const { data: existing } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", input.booking_id)
    .single();

  if (!existing) return { error: "Booking not found" };

  const { data, error } = await supabase
    .from("bookings")
    .update({
      status: "cancelled",
      notes: existing.notes ? `${existing.notes}\n${notes}` : notes,
    })
    .eq("id", input.booking_id)
    .select()
    .single();

  if (error) return { error: error.message };

  try {
    await updateBookingRow(data);
  } catch (e) {
    console.error("Google Sheets sync error:", e);
  }

  return {
    success: true,
    booking: {
      id: data.id,
      title: data.title,
      status: data.status,
      confirmation_code: data.confirmation_code,
    },
    message: `Booking "${data.title}" has been cancelled. Google Sheet updated.`,
  };
}

async function executeUpdateBooking(input: { booking_id: string; fields: Record<string, unknown> }) {
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("bookings")
    .update(input.fields)
    .eq("id", input.booking_id)
    .select()
    .single();

  if (error) return { error: error.message };

  try {
    await updateBookingRow(data);
  } catch (e) {
    console.error("Google Sheets sync error:", e);
  }

  return {
    success: true,
    booking: {
      id: data.id,
      title: data.title,
      status: data.status,
      date_start: data.date_start,
      date_end: data.date_end,
      confirmation_code: data.confirmation_code,
    },
    message: `Booking "${data.title}" has been updated. Google Sheet synced.`,
  };
}

async function executeAddBooking(input: Record<string, unknown>) {
  const supabase = getServiceClient();

  const booking = {
    type: input.type || "other",
    title: input.title || "New Booking",
    status: input.status || "confirmed",
    date_start: input.date_start || null,
    date_end: input.date_end || null,
    provider: input.provider || null,
    confirmation_code: input.confirmation_code || null,
    alt_codes: input.alt_codes || {},
    travelers: input.travelers || ["Mike Clark", "Tonya Clark", "David P", "Amanda Ford"],
    details: input.details || {},
    payment_method: input.payment_method || null,
    cost: input.cost || {},
    cancellation_policy: input.cancellation_policy || null,
    notes: input.notes || "Added via AI chat",
  };

  const { data, error } = await supabase
    .from("bookings")
    .insert(booking)
    .select()
    .single();

  if (error) return { error: error.message };

  try {
    await appendBookingRow(data);
  } catch (e) {
    console.error("Google Sheets sync error:", e);
  }

  return {
    success: true,
    booking: {
      id: data.id,
      title: data.title,
      type: data.type,
      status: data.status,
      date_start: data.date_start,
      date_end: data.date_end,
    },
    message: `New booking "${data.title}" created. Google Sheet updated.`,
  };
}

async function executeTool(name: string, input: Record<string, unknown>): Promise<string> {
  let result;
  switch (name) {
    case "search_bookings":
      result = await executeSearchBookings(input as Parameters<typeof executeSearchBookings>[0]);
      break;
    case "cancel_booking":
      result = await executeCancelBooking(input as Parameters<typeof executeCancelBooking>[0]);
      break;
    case "update_booking":
      result = await executeUpdateBooking(input as Parameters<typeof executeUpdateBooking>[0]);
      break;
    case "add_booking":
      result = await executeAddBooking(input);
      break;
    default:
      result = { error: `Unknown tool: ${name}` };
  }
  return JSON.stringify(result);
}

export async function POST(request: Request) {
  try {
    const { messages, bookings_context } = (await request.json()) as {
      messages: ChatMessage[];
      bookings_context?: string;
    };

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // Build system prompt with bookings context
    let systemPrompt = SYSTEM_PROMPT;
    if (bookings_context) {
      systemPrompt += `\n\nCurrent bookings summary:\n${bookings_context}`;
    }

    // Convert chat messages to Anthropic format
    const anthropicMessages: Anthropic.Messages.MessageParam[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Call Claude with tools - loop to handle multi-turn tool use
    let response = await client.messages.create({
      model: "claude-sonnet-4-5-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      tools: TOOL_DEFINITIONS,
      messages: anthropicMessages,
    });

    // Handle tool use loop
    const allMessages = [...anthropicMessages];
    const toolResults: Array<{ booking?: Record<string, unknown>; action?: string }> = [];

    while (response.stop_reason === "tool_use") {
      const assistantContent = response.content;
      allMessages.push({ role: "assistant", content: assistantContent });

      const toolUseBlocks = assistantContent.filter(
        (block): block is Anthropic.Messages.ToolUseBlock => block.type === "tool_use"
      );

      const toolResultBlocks: Anthropic.Messages.ToolResultBlockParam[] = [];

      for (const toolUse of toolUseBlocks) {
        const result = await executeTool(toolUse.name, toolUse.input as Record<string, unknown>);
        toolResultBlocks.push({
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: result,
        });

        // Track tool results for the response
        try {
          const parsed = JSON.parse(result);
          if (parsed.booking) {
            toolResults.push({ booking: parsed.booking, action: toolUse.name });
          }
        } catch {
          // ignore parse errors
        }
      }

      allMessages.push({ role: "user", content: toolResultBlocks });

      response = await client.messages.create({
        model: "claude-sonnet-4-5-20250514",
        max_tokens: 4096,
        system: systemPrompt,
        tools: TOOL_DEFINITIONS,
        messages: allMessages,
      });
    }

    // Extract final text response
    const textBlocks = response.content.filter(
      (block): block is Anthropic.Messages.TextBlock => block.type === "text"
    );
    const responseText = textBlocks.map((b) => b.text).join("\n");

    return NextResponse.json({
      response: responseText,
      tool_results: toolResults,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Chat failed" },
      { status: 500 }
    );
  }
}
