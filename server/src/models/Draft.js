import mongoose from "mongoose";

const draftSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    to: { type: String, required: true },
    cc: { type: String, default: null },
    bcc: { type: String, default: null },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    status: {
      type: String,
      enum: ["draft", "scheduled", "sent", "failed"],
      default: "draft",
      index: true,
    },
    scheduledAt: { type: Date, default: null },
    // QStash message id, so we can cancel/reschedule the pending send.
    qstashMessageId: { type: String, default: null },
    sentAt: { type: Date, default: null },
    error: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Draft", draftSchema);
