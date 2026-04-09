import { google } from "googleapis";
import { getGoogleAuth } from "./auth";
import type { Booking } from "@/lib/supabase/types";

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || "1ZUnI2iQUPp4R7CZ49BRXxPURK0UwaWJp";
const SHEET_NAME = "Trip Bookings Master";

let cachedSpreadsheetId: string | null = null;

async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Retry failed");
}

export async function getOrCreateSheet(): Promise<string> {
  if (cachedSpreadsheetId) return cachedSpreadsheetId;

  const auth = getGoogleAuth();
  const drive = google.drive({ version: "v3", auth });
  const sheets = google.sheets({ version: "v4", auth });

  // Search for existing sheet
  const searchResult = await drive.files.list({
    q: `name='${SHEET_NAME}' and '${FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
    fields: "files(id, name)",
  });

  if (searchResult.data.files && searchResult.data.files.length > 0) {
    cachedSpreadsheetId = searchResult.data.files[0].id!;
    return cachedSpreadsheetId;
  }

  // Create new spreadsheet
  const spreadsheet = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: SHEET_NAME },
      sheets: [
        {
          properties: { title: "Bookings" },
        },
      ],
    },
  });

  const spreadsheetId = spreadsheet.data.spreadsheetId!;

  // Move to the target folder
  await drive.files.update({
    fileId: spreadsheetId,
    addParents: FOLDER_ID,
    fields: "id, parents",
  });

  // Add header row
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "Bookings!A1:S1",
    valueInputOption: "RAW",
    requestBody: {
      values: [
        [
          "ID",
          "Type",
          "Status",
          "Date",
          "Title",
          "Provider",
          "Confirmation #",
          "Alt Confirmations",
          "Travelers",
          "Departure",
          "Arrival",
          "Seats",
          "Payment Method",
          "Cost",
          "Cancellation Policy",
          "Booking Platform URL",
          "Notes",
          "Raw File Link",
          "Last Updated",
        ],
      ],
    },
  });

  cachedSpreadsheetId = spreadsheetId;
  return spreadsheetId;
}

function bookingToRow(booking: Booking): string[] {
  const details = booking.details as Record<string, string>;
  return [
    booking.id,
    booking.type,
    booking.status,
    booking.date_start ? new Date(booking.date_start).toLocaleDateString() : "",
    booking.title,
    booking.provider || "",
    booking.confirmation_code || "",
    booking.alt_codes ? JSON.stringify(booking.alt_codes) : "",
    booking.travelers?.join(", ") || "",
    details?.departure_airport || "",
    details?.arrival_airport || "",
    details?.seats || "",
    booking.payment_method || "",
    booking.cost ? JSON.stringify(booking.cost) : "",
    booking.cancellation_policy || "",
    booking.booking_url || "",
    booking.notes || "",
    booking.raw_file_url || "",
    new Date().toISOString(),
  ];
}

export async function appendBookingRow(booking: Booking): Promise<void> {
  await withRetry(async () => {
    const auth = getGoogleAuth();
    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = await getOrCreateSheet();

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Bookings!A:S",
      valueInputOption: "RAW",
      requestBody: {
        values: [bookingToRow(booking)],
      },
    });
  });
}

export async function updateBookingRow(booking: Booking): Promise<void> {
  await withRetry(async () => {
    const auth = getGoogleAuth();
    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = await getOrCreateSheet();

    // Find the row with this booking ID
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Bookings!A:A",
    });

    const rows = result.data.values || [];
    const rowIndex = rows.findIndex((row) => row[0] === booking.id);

    if (rowIndex === -1) {
      // If row doesn't exist, append it
      await appendBookingRow(booking);
      return;
    }

    const rowNumber = rowIndex + 1; // 1-indexed
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Bookings!A${rowNumber}:S${rowNumber}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [bookingToRow(booking)],
      },
    });
  });
}

export async function deleteBookingRow(bookingId: string): Promise<void> {
  await withRetry(async () => {
    const auth = getGoogleAuth();
    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = await getOrCreateSheet();

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Bookings!A:A",
    });

    const rows = result.data.values || [];
    const rowIndex = rows.findIndex((row) => row[0] === bookingId);

    if (rowIndex === -1) return;

    // Get the sheet ID
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetId = spreadsheet.data.sheets?.[0]?.properties?.sheetId || 0;

    // Delete the row
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId,
                dimension: "ROWS",
                startIndex: rowIndex,
                endIndex: rowIndex + 1,
              },
            },
          },
        ],
      },
    });
  });
}
