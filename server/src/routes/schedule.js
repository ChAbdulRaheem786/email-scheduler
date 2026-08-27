import { Router } from "express";
import mongoose from "mongoose";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import Draft from "../models/Draft.js";
import User from "../models/User.js";
import { scheduleDraftSend, cancelJob } from "../services/qstash.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { draftId, scheduledAt } = req.body;
    if (!draftId || !scheduledAt) {
      return res.status(400).json({ error: "draftId and scheduledAt are required" });
    }
    if (!mongoose.isValidObjectId(draftId)) {
      return res.status(400).json({ error: "Invalid draft id" });
    }

    const sendAt = new Date(scheduledAt);
    if (Number.isNaN(sendAt.getTime()) || sendAt.getTime() <= Date.now()) {
      return res.status(400).json({ error: "scheduledAt must be a valid future date/time" });
    }

    const user = await User.findById(req.userId);
    if (!user?.encryptedRefreshToken) {
      return res.status(400).json({
        error: "Gmail access not granted. Please sign out and sign in again, granting Gmail permission.",
      });
    }

    const draft = await Draft.findOne({ _id: draftId, userId: req.userId });
    if (!draft) return res.status(404).json({ error: "Draft not found" });

    // If it was already scheduled, cancel the old job before creating the new one.
    if (draft.status === "scheduled" && draft.qstashMessageId) {
      await cancelJob(draft.qstashMessageId);
    }

    let jobId;
    try {
      jobId = await scheduleDraftSend(draft._id, sendAt);
    } catch (err) {
      console.error("Failed to schedule with QStash:", err.message);
      return res.status(502).json({
        error: "Failed to schedule the send — check the scheduling service configuration.",
      });
    }

    draft.status = "scheduled";
    draft.scheduledAt = sendAt;
    draft.qstashMessageId = jobId;
    draft.error = null;
    await draft.save();

    res.json(draft);
  })
);

export default router;
