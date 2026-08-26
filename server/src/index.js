import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import passport from "./config/passport.js";
import { connectDb } from "./config/db.js";
import { startAgenda } from "./services/scheduler.js";

import authRoutes from "./routes/auth.js";
import draftRoutes from "./routes/drafts.js";
import aiRoutes from "./routes/ai.js";
import scheduleRoutes from "./routes/schedule.js";

const app = express();

app.set("trust proxy", 1); // needed for correct client IPs behind Render/Railway/Vercel proxies

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use(passport.initialize());

// General API limiter — generous, mainly a backstop against abuse/DoS.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

// AI generation calls a paid third-party API — limit it more tightly per IP.
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many AI drafting requests. Please try again later." },
});
app.use("/api/ai", aiLimiter);

// Auth endpoints trigger a DB upsert per hit — keep this tighter than the
// general API limit even though real usage is infrequent.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth", authLimiter);

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/drafts", draftRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/schedule", scheduleRoutes);

// Any unmatched /api/* route gets a JSON 404 instead of Express's default HTML page.
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Central error handler — every async route is wrapped in asyncHandler so
// thrown/rejected errors land here instead of crashing the process.
app.use((err, req, res, next) => {
  console.error(err);
  if (err?.name === "CastError") {
    return res.status(400).json({ error: "Invalid id" });
  }
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

async function main() {
  await connectDb();
  await startAgenda();
  app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
}

main().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});

// Last-resort safety net: log instead of letting an unexpected rejection
// silently crash the process. The asyncHandler wrapper should prevent these
// in route handlers; this only catches truly unanticipated cases.
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});
