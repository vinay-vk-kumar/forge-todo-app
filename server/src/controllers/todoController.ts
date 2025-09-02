import { type Request, type Response } from "express";
import prisma from "../lib/prisma.js"

// Create Todo
export const createTodo = async (req: Request, res: Response) => {
  try {
    const { title } = req.body;
    const userId = req.userId;

    if (!title || !userId) {
      return res.status(400).json({ error: 'Title and userId are required' });
    }

    const todo = await prisma.todo.create({
      data: {
        title,
        userId,
      },
    });

    res.status(201).json(todo);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get all todos for a user
export const getTodos = async (req: Request, res: Response) => {
  try {
       const userId = req.userId;

    const todos = await prisma.todo.findMany({
      where: { userId: Number(userId) },
      orderBy: { createdAt: 'desc' },
    });

    res.json(todos);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update Todo
export const updateTodo = async (req: Request, res: Response) => {
  try {
    const { title, completed, id } = req.body;

    const todo = await prisma.todo.update({
      where: { id: Number(id) },
      data: {
        title,
        completed,
      },
    });

    res.json(todo);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Todo
export const deleteTodo = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;

    await prisma.todo.delete({
      where: { id: Number(id) },
    });

    res.json({ message: 'Todo deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};