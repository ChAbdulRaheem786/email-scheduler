// Local development entry point — runs a normal long-lived Express server.
// In production on Vercel, api/index.js is the entry point instead (see
// vercel.json), since Vercel runs this as a serverless function rather than
// a persistent process.
import "dotenv/config";
import app from "./app.js";
import { connectDb } from "./config/db.js";

const PORT = process.env.PORT || 5000;

async function main() {
  await connectDb();
  app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
}

main().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});
