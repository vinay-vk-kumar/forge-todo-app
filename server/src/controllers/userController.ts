import { type Request, type Response } from "express";
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import prisma from "../lib/prisma.js";
import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_USER_SECRET || "userSecret";
const bcryptSaltRounds = 10;


// Signup route
export const signUp = async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.', success : false });
        }
        const checkUser = await prisma.user.findUnique({
            where: { email },
            select: { id: true }
        });
        if (checkUser) {
            return res.status(409).json({ error: 'A user with this email already exists.', success : false });
        }
        
        const hashedPassword = await bcrypt.hash(password, bcryptSaltRounds);
        
        const newUser = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
            },
        });

        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
            // The 'target' field in the error meta tells which field failed the constraint.
            const target = (error.meta?.target as string[]) || ['field'];
            return res.status(409).json({ error: `A user with this ${target[0]} already exists.`, success: false });
        }
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error', success : false });
    }
};

// Signin route
export const singIn = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ success: false, error: "Email and password are required" });
        }

        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true, password: true, name: true }
        });

        if (!user) {
            return res.status(401).json({ success: false, error: "Incorrect Credentials" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ success: false, error: "Incorrect Credentials" });
        }

        const token = jsonwebtoken.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1d" });

        res.json({ success: true, token: token, message: "Successfully signed in", email: user.email  });
    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({ 
            success: false, 
            message: "Something went wrong", 
            error: error instanceof Error ? error.message : 'Unknown error' 
        });
    }
};

export const me = async (req: Request, res: Response) => {
    return res.status(200).json({ message: "user exist", success: true });
}