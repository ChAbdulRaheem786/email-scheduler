import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import passport from "./config/passport.js";
import { connectDb } from "./config/db.js";

import authRoutes from "./routes/auth.js";
import draftRoutes from "./routes/drafts.js";
import aiRoutes from "./routes/ai.js";
import scheduleRoutes from "./routes/schedule.js";
import sendEmailRoutes from "./routes/sendEmail.js";

const app = express();

app.set("trust proxy", 1); // accurate client IPs behind Vercel's proxy

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Capture the raw body alongside JSON parsing — the QStash webhook needs the
// exact raw bytes to verify its signature.
app.use(
  express.json({
    limit: "100kb",
    verify: (req, res, buf) => {
      req.rawBody = buf.toString("utf8");
    },
  })
);
app.use(cookieParser());
app.use(passport.initialize());

// Serverless functions can start "cold" with no DB connection yet — make sure
// one exists before handling any request. connectDb() caches its promise, so
// this is a no-op on warm invocations and in the long-running local dev server.
app.use((req, res, next) => {
  connectDb().then(() => next()).catch(next);
});

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
app.use("/api/send-email", sendEmailRoutes);

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

export default app;
