import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import { encrypt } from "../utils/crypto.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const update = {
          email: profile.emails?.[0]?.value,
          name: profile.displayName,
          image: profile.photos?.[0]?.value,
        };

        // Google only issues a refresh_token when the user actually consents
        // (we force that with prompt=consent in the auth route), so this is
        // present on every sign-in.
        if (refreshToken) {
          update.encryptedRefreshToken = encrypt(refreshToken);
        }

        const user = await User.findOneAndUpdate(
          { googleId: profile.id },
          { $set: update, $setOnInsert: { googleId: profile.id } },
          { upsert: true, new: true }
        );

        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

export default passport;
