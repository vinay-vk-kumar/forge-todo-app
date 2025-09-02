/**
 * ----------------------------------------------------------------
 * |                   Authentication Middleware                  |
 * ----------------------------------------------------------------
 * * This middleware is responsible for authenticating users by verifying
 * their JSON Web Token (JWT). It ensures that protected routes are
 * only accessible by users with a valid token.
 */

import type { Request, Response, NextFunction } from "express";
import jsonwebtoken from "jsonwebtoken";

// ----------------------------------------------------------------
// |                TypeScript Type Augmentation                  |
// ----------------------------------------------------------------
/**
 * To ensure type safety, we augment the global Express Request type.
 * This adds an optional `userId` property to the `Request` object.
 *
 * * Best Practice: For a larger project, this declaration should be
 * moved to a dedicated `types/custom.d.ts` or `express.d.ts` file
 * in your project's root or source directory.
 */
declare global {
  namespace Express {
    export interface Request {
      userId?: number; // Or whatever type your user ID is
    }
  }
}
// ----------------------------------------------------------------
// |                     Authentication Logic                     |
// ----------------------------------------------------------------
/**
 * An Express middleware function to authenticate requests using a JWT.
 * It checks for a 'Bearer' token in the Authorization header, verifies it,
 * and attaches the user's ID to the request object for use in subsequent
 * route handlers.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The callback to pass control to the next middleware.
 */
const authenticate = (req: Request, res: Response, next: NextFunction) => {
    // 1. Get the secret key from environment variables
    
    // 2. Check for the Authorization header and the 'Bearer' scheme
    
    try {
        const secret = process.env.JWT_USER_SECRET;
        if (!secret) {
            // This is a server configuration error, so we return a 500 status
            console.error("FATAL ERROR: JWT_USER_SECRET is not defined.");
            return res.status(500).json({ success: false, error: "Internal Server Error" });
        }
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, error: "Authorization token is missing or has an invalid format" });
        }
    
        // 3. Extract the token from the header
        const token = authHeader.split(' ')[1] || "";
        // 4. Verify the token
        const decoded = jsonwebtoken.verify(token, secret);

        // 5. Type-check the decoded payload to ensure it's not a string and has the 'id' property
        if (typeof decoded === 'string' || !decoded.id) {
             return res.status(401).json({ success: false, message: "Invalid token payload" });
        }
        
        // 6. Attach user ID to the request object for use in subsequent routes
        req.userId = decoded.id;
        
        next(); // Pass control to the next middleware/handler

    } catch (err) {
        // The verify function throws an error for expired or invalid tokens
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

export default authenticate;