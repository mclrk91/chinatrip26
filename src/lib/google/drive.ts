import { google } from "googleapis";
import { Readable } from "stream";
import { getGoogleAuth } from "./auth";

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || "1ZUnI2iQUPp4R7CZ49BRXxPURK0UwaWJp";

export async function uploadToDrive(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{ fileId: string; webViewLink: string }> {
  const auth = getGoogleAuth();
  const drive = google.drive({ version: "v3", auth });

  const stream = new Readable();
  stream.push(fileBuffer);
  stream.push(null);

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [FOLDER_ID],
    },
    media: {
      mimeType,
      body: stream,
    },
    fields: "id, webViewLink",
  });

  // Make file readable by anyone with the link
  await drive.permissions.create({
    fileId: response.data.id!,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });

  return {
    fileId: response.data.id!,
    webViewLink: response.data.webViewLink || `https://drive.google.com/file/d/${response.data.id}/view`,
  };
}
