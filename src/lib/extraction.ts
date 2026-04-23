import Anthropic from "@anthropic-ai/sdk";

const TRAVELERS_LIST = "Mike Clark, Tonya Clark, David Ramos, Amanda Ford";

const SYSTEM_PROMPT = `You are an expert at extracting structured booking information from travel documents.
Given a travel document (PDF, image, or text), extract the following fields. Return ONLY valid JSON, no markdown.

The travelers on this trip are: ${TRAVELERS_LIST}

Return JSON with these fields:
{
  "type": "flight" | "hotel" | "tour" | "activity" | "transport" | "restaurant" | "other",
  "title": "Brief descriptive title",
  "provider": "Airline name, hotel chain, tour operator, etc.",
  "confirmation_code": "Primary confirmation/reservation number",
  "alt_codes": {"traveler name": "their specific confirmation code"} or {},
  "travelers": ["Array of traveler names from the list above"],
  "date_start": "ISO 8601 datetime with timezone",
  "date_end": "ISO 8601 datetime with timezone or null",
  "details": {
    "flight_number": "if applicable",
    "departure_airport": "if applicable",
    "arrival_airport": "if applicable",
    "seats": "seat assignments if found",
    "room_type": "if hotel",
    "check_in": "if hotel",
    "check_out": "if hotel",
    "city": "city name",
    "address": "if available",
    "phone": "hotel phone if available",
    "website": "official hotel website URL if hotel and present"
  },
  "cost": {"amount": number, "currency": "USD", "points_used": false} or {},
  "payment_method": "Credit card type or points program or null",
  "cancellation_policy": "Free-text cancellation terms or null",
  "booking_url": "URL to the booking platform or null",
  "notes": "Any other relevant information or null",
  "extracted_text": "Full raw text content from the document"
}

Important:
- Match traveler names exactly from the list: ${TRAVELERS_LIST}
- Use ISO 8601 format with timezone offsets for dates
- If information is not present, use null or empty values
- For hotel bookings, include the official hotel website URL in details.website when visible (not the booking platform URL — that goes in booking_url)
- Extract ALL text from the document for the extracted_text field`;

export async function extractBookingData(
  fileBuffer: Buffer,
  mimeType: string,
  textContent?: string
): Promise<Record<string, unknown>> {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const contentBlocks: Anthropic.Messages.ContentBlockParam[] = [];

  if (textContent) {
    // Manual text input
    contentBlocks.push({
      type: "text",
      text: `Extract booking information from this text:\n\n${textContent}`,
    });
  } else if (mimeType === "application/pdf") {
    contentBlocks.push({
      type: "document",
      source: {
        type: "base64",
        media_type: "application/pdf",
        data: fileBuffer.toString("base64"),
      },
    });
    contentBlocks.push({
      type: "text",
      text: "Extract all booking information from this PDF document.",
    });
  } else if (mimeType.startsWith("image/")) {
    const imageMediaType = mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
    contentBlocks.push({
      type: "image",
      source: {
        type: "base64",
        media_type: imageMediaType,
        data: fileBuffer.toString("base64"),
      },
    });
    contentBlocks.push({
      type: "text",
      text: "Extract all booking information from this image.",
    });
  } else {
    // Fallback: try to read as text
    contentBlocks.push({
      type: "text",
      text: `Extract booking information from this content:\n\n${fileBuffer.toString("utf-8")}`,
    });
  }

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: contentBlocks,
      },
    ],
  });

  const textResponse = response.content.find((block) => block.type === "text");
  if (!textResponse || textResponse.type !== "text") {
    throw new Error("No text response from extraction");
  }

  try {
    // Try to parse the JSON response, stripping any markdown code fences
    let jsonStr = textResponse.text.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    return JSON.parse(jsonStr);
  } catch {
    throw new Error(`Failed to parse extraction response: ${textResponse.text.substring(0, 200)}`);
  }
}
