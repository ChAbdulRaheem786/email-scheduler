import { Router } from "express";
import mongoose from "mongoose";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import Draft from "../models/Draft.js";
import { cancelJob } from "../services/qstash.js";
import { isValidEmailList, LIMITS } from "../utils/validation.js";

const router = Router();

function validDraftId(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ error: "Invalid draft id" });
    return false;
  }
  return true;
}

function validateContent({ to, cc, bcc, subject, text }) {
  if (to !== undefined) {
    if (!to || !isValidEmailList(to) || to.length > LIMITS.ADDRESS) {
      return "A valid 'to' address is required";
    }
  }
  if (cc !== undefined && cc && (!isValidEmailList(cc) || cc.length > LIMITS.ADDRESS)) {
    return "Cc contains an invalid address";
  }
  if (bcc !== undefined && bcc && (!isValidEmailList(bcc) || bcc.length > LIMITS.ADDRESS)) {
    return "Bcc contains an invalid address";
  }
  if (subject !== undefined && (!subject || subject.length > LIMITS.SUBJECT)) {
    return `Subject is required and must be under ${LIMITS.SUBJECT} characters`;
  }
  if (text !== undefined && (!text || text.length > LIMITS.BODY)) {
    return `Body is required and must be under ${LIMITS.BODY} characters`;
  }
  return null;
}

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const drafts = await Draft.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(drafts);
  })
);

router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { to, cc, bcc, subject, text } = req.body;
    const validationError = validateContent({ to, cc, bcc, subject, text });
    if (validationError) return res.status(400).json({ error: validationError });

    const draft = await Draft.create({
      userId: req.userId,
      to,
      cc: cc || null,
      bcc: bcc || null,
      subject,
      body: text,
      status: "draft",
    });

    res.status(201).json(draft);
  })
);

router.patch(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!validDraftId(req, res)) return;

    const draft = await Draft.findOne({ _id: req.params.id, userId: req.userId });
    if (!draft) return res.status(404).json({ error: "Draft not found" });
    if (draft.status === "sent") {
      return res.status(400).json({ error: "Cannot edit an already-sent email" });
    }

    const { to, cc, bcc, subject, text } = req.body;
    const validationError = validateContent({ to, cc, bcc, subject, text });
    if (validationError) return res.status(400).json({ error: validationError });

    const isContentEdit = to !== undefined || subject !== undefined || text !== undefined;

    // Editing content of a scheduled draft cancels the pending send so it doesn't
    // go out with stale content; user must re-schedule.
    if (draft.status === "scheduled" && isContentEdit) {
      await cancelJob(draft.qstashMessageId);
      draft.status = "draft";
      draft.scheduledAt = null;
      draft.qstashMessageId = null;
    }

    if (to !== undefined) draft.to = to;
    if (cc !== undefined) draft.cc = cc;
    if (bcc !== undefined) draft.bcc = bcc;
    if (subject !== undefined) draft.subject = subject;
    if (text !== undefined) draft.body = text;

    await draft.save();
    res.json(draft);
  })
);

router.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!validDraftId(req, res)) return;

    const draft = await Draft.findOne({ _id: req.params.id, userId: req.userId });
    if (!draft) return res.status(404).json({ error: "Draft not found" });

    if (draft.status === "scheduled") {
      await cancelJob(draft.qstashMessageId);
    }

    await draft.deleteOne();
    res.json({ ok: true });
  })
);

export default router;
