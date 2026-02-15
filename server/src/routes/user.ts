/**
 * ----------------------------------------------------------------
 * |                         User Router                          |
 * ----------------------------------------------------------------
 * * This file defines the API routes for user-related operations,
 * such as registration (signup) and authentication (signin).
 *
 * * It uses `express-validator` to validate and sanitize incoming data,
 * ensuring that the data conforms to the expected format before it
 * reaches the controllers. This is a crucial security measure to prevent
 * common vulnerabilities like NoSQL/SQL injection and to ensure data integrity.
 */
import { Router } from "express";
import { signUp, singIn, me, forgotPassword, resetPassword, verifyEmail } from "../controllers/userController.js";
import authenticate from "../middleware/authentication.js";
import passport from 'passport';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_USER_SECRET || "secret";

// ----------------------------------------------------------------
// |                   Router Initialization                      |
// ----------------------------------------------------------------
const userRouter: Router = Router();

// ----------------------------------------------------------------
// |                         Route Definitions                    |
// ----------------------------------------------------------------

/**
 * @route   POST /api/v1/user/signup
 * @desc    Register a new user
 * @access  Public
 * @body    { "name": "string", "email": "string", "password": "string" }
 * @returns { "token": "string" } on success (or user object)
 * @errors  400 - Validation error (e.g., invalid email, password too short)
 * 409 - Conflict (e.g., user with that email already exists)
 * 500 - Internal server error
 */
userRouter.post('/signup', signUp);

/**
 * @route   POST /api/v1/user/signin
 * @desc    Authenticate user & get token
 * @access  Public
 * @body    { "email": "string", "password": "string" }
 * @returns { "token": "string" } on success (or user object)
 * @errors  400 - Validation error (e.g., invalid email)
 * 401 - Unauthorized (e.g., invalid credentials)
 * 500 - Internal server error
 */
userRouter.post('/signin', singIn);
userRouter.post('/verify-email', verifyEmail);

userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/reset-password', resetPassword);

userRouter.get('/validate-token', authenticate, me);

// Google OAuth Routes
userRouter.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

userRouter.get('/auth/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    (req, res) => {
        // Successful authentication, redirect home.
        const user = (req as any).user;
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

        // Redirect to frontend with token
        const frontendUrl = process.env.FRONT_END_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/auth/google/callback?token=${token}&email=${user.email}&name=${encodeURIComponent(user.name || '')}&id=${user.id}`);
    }
);

// ----------------------------------------------------------------
// |                           Exports                            |
// ----------------------------------------------------------------
export default userRouter;