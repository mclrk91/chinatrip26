import { google } from "googleapis";

let cachedAuth: ReturnType<typeof google.auth.GoogleAuth.prototype.getClient> | null = null;

export function getGoogleAuth() {
  const base64Creds = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!base64Creds) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON environment variable is not set");
  }

  const credentials = JSON.parse(Buffer.from(base64Creds, "base64").toString("utf-8"));

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });

  return auth;
}

export async function getGoogleClient() {
  if (!cachedAuth) {
    const auth = getGoogleAuth();
    cachedAuth = auth.getClient();
  }
  return cachedAuth;
}
