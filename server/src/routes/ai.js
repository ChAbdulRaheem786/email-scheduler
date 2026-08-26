import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { generateEmailDraft } from "../services/gemini.js";
import { LIMITS } from "../utils/validation.js";

const router = Router();

router.post(
  "/generate-draft",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { instructions, recipient, tone } = req.body;
    if (!instructions || !instructions.trim()) {
      return res.status(400).json({ error: "instructions is required" });
    }
    if (instructions.length > LIMITS.AI_INSTRUCTIONS) {
      return res.status(400).json({
        error: `instructions must be under ${LIMITS.AI_INSTRUCTIONS} characters`,
      });
    }

    try {
      const draft = await generateEmailDraft({ instructions, recipient, tone });
      res.json(draft);
    } catch (err) {
      console.error(err);
      res.status(502).json({ error: "Failed to generate draft" });
    }
  })
);

export default router;
