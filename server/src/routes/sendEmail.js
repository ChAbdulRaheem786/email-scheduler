import { Router } from "express";
import { Receiver } from "@upstash/qstash";
import mongoose from "mongoose";
import Draft from "../models/Draft.js";
import User from "../models/User.js";
import { sendGmail } from "../services/gmail.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY,
});

// Called by QStash at the exact scheduled time — not by the frontend, so
// there's no user session here. Trust is established via QStash's signature.
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const signature = req.headers["upstash-signature"];

    try {
      const isValid = await receiver.verify({
        signature,
        body: req.rawBody,
        url: `${process.env.APP_URL}/api/send-email`,
      });
      if (!isValid) return res.status(401).json({ error: "Invalid signature" });
    } catch (e) {
      console.error("QStash signature verification failed", e);
      return res.status(401).json({ error: "Invalid signature" });
    }

    const { draftId } = req.body;
    if (!draftId || !mongoose.isValidObjectId(draftId)) {
      return res.json({ ok: true, skipped: "invalid draftId" });
    }

    const draft = await Draft.findById(draftId);
    if (!draft) {
      // Draft was deleted after scheduling — ack so QStash doesn't retry.
      return res.json({ ok: true, skipped: "draft not found" });
    }
    if (draft.status === "sent") {
      return res.json({ ok: true, skipped: "already sent" });
    }

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

      res.json({ ok: true });
    } catch (err) {
      console.error("Failed to send scheduled email", draftId, err.message);
      draft.status = "failed";
      draft.error = err.message;
      await draft.save();
      // 200 so QStash doesn't retry a permanently-failing send (e.g. revoked
      // Gmail access) forever — the failure is visible in the dashboard instead.
      res.json({ ok: false, error: err.message });
    }
  })
);

export default router;
