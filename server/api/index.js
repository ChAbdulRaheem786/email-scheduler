// Vercel invokes this file as a serverless function for every request
// (see ../vercel.json). An Express app is itself a valid (req, res) handler,
// so we can export it directly — no app.listen() here, Vercel handles that.
import "dotenv/config";
import app from "../src/app.js";

export default app;
