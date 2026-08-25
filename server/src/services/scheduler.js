import Agenda from "agenda";
import mongoose from "mongoose";
import Draft from "../models/Draft.js";
import User from "../models/User.js";
import { sendGmail } from "./gmail.js";

export const agenda = new Agenda({
  db: { address: process.env.MONGODB_URI, collection: "agendaJobs" },
  processEvery: "10 seconds",
});

agenda.define("send-scheduled-email", async (job) => {
  const { draftId } = job.attrs.data;

  const draft = await Draft.findById(draftId);
  if (!draft) return; // draft was deleted after scheduling — nothing to do
  if (draft.status === "sent") return;

  try {
    const user = await User.findById(draft.userId);
    if (!user?.encryptedRefreshToken) {
      throw new Error("User has not granted Gmail access");
    }

    await sendGmail({
      encryptedRefreshToken: user.encryptedRefreshToken,
      from: user.email,
      to: draft.to,
      cc: draft.cc,
      bcc: draft.bcc,
      subject: draft.subject,
      body: draft.body,
    });

    draft.status = "sent";
    draft.sentAt = new Date();
    draft.error = null;
    await draft.save();
  } catch (err) {
    console.error("Failed to send scheduled email", draftId, err.message);
    draft.status = "failed";
    draft.error = err.message;
    await draft.save();
    // Don't rethrow — a permanent failure (e.g. revoked access) shouldn't retry forever.
    // The user sees the failure and error message in the dashboard.
  }
});

export async function startAgenda() {
  await agenda.start();
  console.log("Agenda scheduler started");
}

// Schedules (or re-schedules) a draft to send at an exact Date, returning the job id.
export async function scheduleDraftSend(draftId, sendAt) {
  const job = await agenda.schedule(sendAt, "send-scheduled-email", { draftId: String(draftId) });
  return job.attrs._id;
}

export async function cancelJob(jobId) {
  if (!jobId) return;
  await agenda.cancel({ _id: new mongoose.Types.ObjectId(jobId) });
}
