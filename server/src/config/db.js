import mongoose from "mongoose";

// Cached across warm serverless invocations (and a no-op on repeat calls in
// the long-running local dev process) so we don't reconnect on every request.
let connPromise = null;

export function connectDb() {
  if (!connPromise) {
    mongoose.set("strictQuery", true);
    connPromise = mongoose.connect(process.env.MONGODB_URI).then(() => {
      console.log("MongoDB connected");
    });
  }
  return connPromise;
}
