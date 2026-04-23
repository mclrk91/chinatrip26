import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

interface Translation {
  name: string;
  address: string;
  greeting: string;
}

const SYSTEM_PROMPT = `You translate hotel names and addresses for a traveler to show to a local taxi driver or hotel staff.

For each requested language tag in the input:
- Translate the hotel name into the target language's native script. Keep widely-recognized brand prefixes in their canonical local form (e.g., "Westin" stays "Westin" in Latin script when that's standard locally; Chinese hotel chains use their official Chinese names).
- Translate the full address into the target language's native script, preserving street numbers, postal codes, and country.
- Produce a one-sentence greeting using exactly this template, translated naturally:
  "Hi! We are going to {hotel name and address}, please. Thank you!"

Return ONLY valid minified JSON (no markdown, no commentary) with this exact shape:
{
  "translations": {
    "<lang-tag>": {
      "name": "...",
      "address": "...",
      "greeting": "..."
    }
  }
}

Use the lang-tags exactly as given in the input. If you cannot translate confidently, still return the field with the original English text.`;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      address?: string;
      languages?: string[];
    };
    const name = (body.name || "").trim();
    const address = (body.address || "").trim();
    const languages = (body.languages || []).filter(
      (l): l is string => typeof l === "string" && l.length > 0
    );

    if (!name || !address || languages.length === 0) {
      return NextResponse.json(
        { error: "name, address, and at least one language are required" },
        { status: 400 }
      );
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Languages: ${languages.join(", ")}
Hotel name (English): ${name}
Address (English): ${address}`,
        },
      ],
    });

    const text = response.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") {
      return NextResponse.json(
        { error: "Empty translation response" },
        { status: 502 }
      );
    }

    let raw = text.text.trim();
    if (raw.startsWith("```")) {
      raw = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    let parsed: { translations?: Record<string, Translation> };
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        {
          error: `Failed to parse translation: ${raw.slice(0, 200)}`,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ translations: parsed.translations || {} });
  } catch (error) {
    console.error("Translate error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Translation failed" },
      { status: 500 }
    );
  }
}
