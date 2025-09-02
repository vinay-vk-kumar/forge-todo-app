/**
 * ----------------------------------------------------------------
 * |                         Todo Router                          |
 * ----------------------------------------------------------------
 * * This file defines the API routes for CRUD (Create, Read, Update, Delete)
 * operations on todos.
 *
 * * All routes are protected by an `authenticate` middleware, ensuring that
 * only authenticated users can access and manage their own todos.
 *
 * * It uses `express-validator` to validate and sanitize incoming data
 * for creating and updating todos, ensuring data integrity.
 */
import { Router } from 'express';
import { createTodo, getTodos, updateTodo, deleteTodo } from '../controllers/todoController.js';
import authenticate from '../middleware/authentication.js';

// ----------------------------------------------------------------
// |                   Router Initialization                      |
// ----------------------------------------------------------------
const todoRouter: Router= Router();

// ----------------------------------------------------------------
// |                         Route Definitions                    |
// ----------------------------------------------------------------

/**
 * @route   POST /api/v1/todo
 * @desc    Create a new todo for the authenticated user.
 * @access  Private
 * @body    { "title": "string", "description"?: "string" }
 * @returns { "id": "string", "title": "string", ... } the created todo object.
 */
todoRouter.post('/', authenticate, createTodo);

/**
 * @route   GET /api/v1/todo
 * @desc    Get all todos for the authenticated user.
 * @access  Private
 * @returns [{ "id": "string", "title": "string", ... }] an array of todo objects.
 */
todoRouter.get('/', authenticate, getTodos);

/**
 * @route   PUT /api/v1/todo/:id
 * @desc    Update an existing todo by its ID.
 * @access  Private
 * @param   id - The ID of the todo to update.
 * @body    { "title"?: "string", "description"?: "string", "completed"?: boolean }
 * @returns { "id": "string", "title": "string", ... } the updated todo object.
 */
todoRouter.put('/', authenticate, updateTodo);

/**
 * @route   DELETE /api/v1/todo/:id
 * @desc    Delete a todo by its ID.
 * @access  Private
 * @param   id - The ID of the todo to delete.
 * @returns { "message": "Todo deleted successfully" }
 */
todoRouter.delete('/', authenticate, deleteTodo);

// ----------------------------------------------------------------
// |                           Exports                            |
// ----------------------------------------------------------------
export default todoRouter;