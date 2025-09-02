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
import { signUp, singIn, me } from "../controllers/userController.js";
import authenticate from "../middleware/authentication.js";

// ----------------------------------------------------------------
// |                   Router Initialization                      |
// ----------------------------------------------------------------
const userRouter : Router = Router();

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

userRouter.get('/validate-token', authenticate, me);

// ----------------------------------------------------------------
// |                           Exports                            |
// ----------------------------------------------------------------
export default userRouter;