import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    name: String,
    image: String,
    // AES-256-GCM encrypted Google OAuth refresh token — needed to send Gmail
    // on the user's behalf at an arbitrary future time, after their session ends.
    encryptedRefreshToken: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
