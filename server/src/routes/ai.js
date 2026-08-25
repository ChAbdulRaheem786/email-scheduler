import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { generateEmailDraft } from "../services/gemini.js";

const router = Router();

router.post("/generate-draft", requireAuth, async (req, res) => {
  const { instructions, recipient, tone } = req.body;
  if (!instructions || !instructions.trim()) {
    return res.status(400).json({ error: "instructions is required" });
  }

  try {
    const draft = await generateEmailDraft({ instructions, recipient, tone });
    res.json(draft);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate draft" });
  }
});

export default router;
