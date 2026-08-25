import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "./config/passport.js";
import { connectDb } from "./config/db.js";
import { startAgenda } from "./services/scheduler.js";

import authRoutes from "./routes/auth.js";
import draftRoutes from "./routes/drafts.js";
import aiRoutes from "./routes/ai.js";
import scheduleRoutes from "./routes/schedule.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/drafts", draftRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/schedule", scheduleRoutes);

// Central error handler as a safety net for anything unhandled above.
app.use((err, req, res, next) => {
  console.error(err);
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
