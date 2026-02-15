import passport from 'passport';
import { Strategy as GoogleStrategy, type Profile, type VerifyCallback } from 'passport-google-oauth20';
import prisma from '../lib/prisma.js';
import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:3001/api/v1/user/auth/google/callback";

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.warn("Missing Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET). Google Auth will not work.");
}

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID || "dummy",
    clientSecret: GOOGLE_CLIENT_SECRET || "dummy",
    callbackURL: GOOGLE_CALLBACK_URL
}, async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
    try {
        const email = profile.emails?.[0]?.value;
        const googleId = profile.id;
        const name = profile.displayName || email?.split('@')[0] || "User";

        if (!email) {
            return done(new Error("No email found in Google profile"), undefined);
        }

        // 1. Check if user exists by googleId
        let user = await prisma.user.findUnique({
            where: { googleId }
        });

        if (user) {
            return done(null, user);
        }

        // 2. Check if user exists by email (if so, link accounts)
        user = await prisma.user.findUnique({
            where: { email }
        });

        if (user) {
            // Link account
            user = await prisma.user.update({
                where: { email },
                data: { googleId, isVerified: true } // If they have google, verify them
            });
            return done(null, user);
        }

        // 3. Create new user
        user = await prisma.user.create({
            data: {
                email,
                name,
                googleId,
                isVerified: true,
                // No password for Google users initially
            }
        });

        return done(null, user);

    } catch (error) {
        return done(error as any, undefined);
    }
}));

// Serialize/Deserialize user (not strictly needed since we use JWT, but good practice for session middleware if used)
passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

export default passport;
