import { google } from "googleapis";
import { decrypt } from "../utils/crypto.js";
import { stripHeaderInjection } from "../utils/validation.js";

function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );
}

function base64UrlEncode(str) {
  return Buffer.from(str, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function buildRawMessage({ from, to, cc, bcc, subject, body }) {
  const headers = [
    `From: ${stripHeaderInjection(from)}`,
    `To: ${stripHeaderInjection(to)}`,
    cc ? `Cc: ${stripHeaderInjection(cc)}` : null,
    bcc ? `Bcc: ${stripHeaderInjection(bcc)}` : null,
    `Subject: ${stripHeaderInjection(subject)}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
  ]
    .filter(Boolean)
    .join("\r\n");

  return base64UrlEncode(`${headers}\r\n\r\n${body}`);
}

// Sends on behalf of the user identified by their (decrypted) refresh token.
// googleapis automatically exchanges it for a fresh access token as needed.
export async function sendGmail({ encryptedRefreshToken, from, to, cc, bcc, subject, body }) {
  const refreshToken = decrypt(encryptedRefreshToken);

  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  const raw = buildRawMessage({ from, to, cc, bcc, subject, body });

  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });
}
