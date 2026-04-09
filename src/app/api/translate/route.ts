import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

const LANGUAGE_MAP: Record<string, string> = {
  th: "Thai (ภาษาไทย)",
  zh: "Simplified Chinese (简体中文)",
  ar: "Arabic (العربية)",
};

export async function POST(req: NextRequest) {
  try {
    const { text, language } = await req.json();

    if (!text || !language) {
      return NextResponse.json({ error: "text and language are required" }, { status: 400 });
    }

    const langName = LANGUAGE_MAP[language] || language;

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `Translate the following English text to ${langName}. Return ONLY the translation, nothing else. No explanations, no romanization, just the translated text.

Text: "${text}"`,
        },
      ],
    });

    const translation =
      message.content[0].type === "text" ? message.content[0].text.trim() : "";

    return NextResponse.json({ translation });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: "Translation failed" },
      { status: 500 }
    );
  }
}
