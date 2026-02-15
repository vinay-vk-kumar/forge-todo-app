
import { type Request, type Response } from "express";
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendVerificationEmail, sendPasswordResetEmail } from "../lib/email.js";

const JWT_SECRET = process.env.JWT_USER_SECRET || "secret";
const bcryptSaltRounds = 10;


// Helper to check and update email rate limit
const checkRateLimit = async (user: any) => {
    const today = new Date();
    const lastEmailDate = user.lastEmailDate ? new Date(user.lastEmailDate) : null;

    let newCount = 1;

    // Check if same day
    if (lastEmailDate &&
        lastEmailDate.getDate() === today.getDate() &&
        lastEmailDate.getMonth() === today.getMonth() &&
        lastEmailDate.getFullYear() === today.getFullYear()) {

        if (user.dailyEmailCount >= 5) {
            return false;
        }
        newCount = user.dailyEmailCount + 1;
    }

    return newCount;
};

// Signup route
export const signUp = async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.', success: false });
        }
        const checkUser = await prisma.user.findUnique({
            where: { email },
            select: { id: true }
        });
        if (checkUser) {
            return res.status(409).json({ error: 'A user with this email already exists.', success: false });
        }

        const hashedPassword = await bcrypt.hash(password, bcryptSaltRounds);

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const newUser = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                otp,
                otpExpiry,
                isVerified: false,
                lastEmailDate: new Date(),
                dailyEmailCount: 1
            },
        });

        if (process.env.NODE_ENV !== 'production') {
            console.log(`[DEV] Verification OTP for ${email}: ${otp}`);
        }

        await sendVerificationEmail(email, otp);

        res.status(201).json({ message: "Verification email sent", email });
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
            const target = (error.meta?.target as string[]) || ['field'];
            return res.status(409).json({ error: `A user with this ${target[0]} already exists.`, success: false });
        }
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error', success: false });
    }
};

export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) return res.status(404).json({ error: "User not found" });

        if (user.isVerified) return res.status(400).json({ error: "User already verified" });

        if (!user.otp || user.otp !== otp) {
            return res.status(400).json({ error: "Invalid OTP" });
        }

        if (!user.otpExpiry || new Date() > user.otpExpiry) {
            return res.status(400).json({ error: "OTP expired" });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { isVerified: true, otp: null, otpExpiry: null }
        });

        // Auto-login after verification
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

        const { password: _, ...userWithoutPassword } = user;
        res.json({ token, user: userWithoutPassword, message: "Email verified successfully" });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

// Signin route
export const singIn = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: "Email and password are required" });
        }

        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true, password: true, name: true, isVerified: true }
        });

        if (!user) {
            return res.status(401).json({ success: false, error: "Incorrect Credentials" });
        }

        if (!user.isVerified) {
            return res.status(403).json({ error: "Email not verified", notVerified: true });
        }

        if (!user.password) {
            return res.status(400).json({ error: "Please sign in with Google", success: false });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

        const { password: _, ...userWithoutPassword } = user;
        res.json({ token, user: userWithoutPassword });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const me = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const user = await prisma.user.findUnique({
            where: { id: Number(userId) },
            select: { id: true, email: true, name: true }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ success: true, user });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const newCount = await checkRateLimit(user);
        if (newCount === false) {
            return res.status(429).json({ error: "Daily email limit reached (5). Try again tomorrow." });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await prisma.user.update({
            where: { id: user.id },
            data: {
                otp,
                otpExpiry,
                lastEmailDate: new Date(),
                dailyEmailCount: newCount as number
            },
        });

        if (process.env.NODE_ENV !== 'production') {
            console.log(`[DEV] Password Reset OTP for ${email}: ${otp} `);
        }

        await sendPasswordResetEmail(email, otp);

        res.json({ message: 'OTP sent to email', email });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { email, otp, newPassword } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) return res.status(404).json({ error: "User not found" });

        if (!user.otp || user.otp !== otp) {
            return res.status(400).json({ error: "Invalid OTP" });
        }

        if (!user.otpExpiry || new Date() > user.otpExpiry) {
            return res.status(400).json({ error: "OTP expired" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                otp: null,
                otpExpiry: null,
            },
        });

        res.json({ message: 'Password updated successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};