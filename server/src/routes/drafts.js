import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import Draft from "../models/Draft.js";
import { cancelJob } from "../services/scheduler.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const drafts = await Draft.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(drafts);
});

router.post("/", requireAuth, async (req, res) => {
  const { to, cc, bcc, subject, text } = req.body;
  if (!to || !subject || !text) {
    return res.status(400).json({ error: "to, subject, and text are required" });
  }

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
});

router.patch("/:id", requireAuth, async (req, res) => {
  const draft = await Draft.findOne({ _id: req.params.id, userId: req.userId });
  if (!draft) return res.status(404).json({ error: "Draft not found" });
  if (draft.status === "sent") {
    return res.status(400).json({ error: "Cannot edit an already-sent email" });
  }

  const { to, cc, bcc, subject, text } = req.body;
  const isContentEdit = to !== undefined || subject !== undefined || text !== undefined;

  // Editing content of a scheduled draft cancels the pending send so it doesn't
  // go out with stale content; user must re-schedule.
  if (draft.status === "scheduled" && isContentEdit) {
    await cancelJob(draft.agendaJobId);
    draft.status = "draft";
    draft.scheduledAt = null;
    draft.agendaJobId = null;
  }

  if (to !== undefined) draft.to = to;
  if (cc !== undefined) draft.cc = cc;
  if (bcc !== undefined) draft.bcc = bcc;
  if (subject !== undefined) draft.subject = subject;
  if (text !== undefined) draft.body = text;

  await draft.save();
  res.json(draft);
});

router.delete("/:id", requireAuth, async (req, res) => {
  const draft = await Draft.findOne({ _id: req.params.id, userId: req.userId });
  if (!draft) return res.status(404).json({ error: "Draft not found" });

  if (draft.status === "scheduled") {
    await cancelJob(draft.agendaJobId);
  }

  await draft.deleteOne();
  res.json({ ok: true });
});

export default router;
