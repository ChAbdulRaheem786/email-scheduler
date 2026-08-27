import { Client } from "@upstash/qstash";

let client;
function getClient() {
  if (!client) {
    if (!process.env.QSTASH_TOKEN) throw new Error("Missing QSTASH_TOKEN environment variable");
    client = new Client({ token: process.env.QSTASH_TOKEN });
  }
  return client;
}

// Schedules a one-off call to /api/send-email at the exact `sendAt` Date.
// Returns QStash's message id so it can be cancelled/rescheduled later.
export async function scheduleDraftSend(draftId, sendAt) {
  const appUrl = process.env.APP_URL;
  if (!appUrl) throw new Error("Missing APP_URL environment variable");

  const notBefore = Math.floor(sendAt.getTime() / 1000);

  const result = await getClient().publishJSON({
    url: `${appUrl}/api/send-email`,
    body: { draftId: String(draftId) },
    notBefore,
  });

  return result.messageId;
}

export async function cancelJob(messageId) {
  if (!messageId) return;
  try {
    await getClient().messages.delete(messageId);
  } catch (e) {
    // Message may have already fired or expired — safe to ignore.
    console.warn("Could not cancel QStash message", messageId, e.message);
  }
}
