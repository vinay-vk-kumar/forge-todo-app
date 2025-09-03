/**
 * ----------------------------------------------------------------
 * |                      App Dependencies                        |
 * ----------------------------------------------------------------
 * * Import necessary packages and modules.
 * * - 'dotenv/config': Loads environment variables from a .env file into process.env.
 * It's important to import this at the very top of the file.
 * - 'express': The core framework for building the web server.
 * - 'cors': Middleware to enable Cross-Origin Resource Sharing.
 * - 'helmet': Middleware to help secure Express apps by setting various HTTP headers.
 * - './lib/prisma.js': The Prisma Client instance for database interaction.
 * - './routes/*': Routers for handling specific API endpoints.
 */
import 'dotenv/config';
import express from "express";
import cors from "cors";
import prisma from "./lib/prisma.js"
import userRouter from './routes/user.js';
import todoRouter from './routes/todo.js';

// ----------------------------------------------------------------
// |                 Application Configuration                    |
// ----------------------------------------------------------------

const app: express.Application = express();
const PORT = process.env.PORT || 3000;
/**
 * Define allowed origins for CORS. It's a best practice to manage this
 * via environment variables for different environments (development, production).
 */
const allowedOrigins = [
  process.env.FRONT_END_URL || 'http://localhost:5173',
  // You can add more origins here if needed
];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    // or if the origin is in the allowed list.
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
};

// Enable CORS with the specified options.
app.use(cors(corsOptions));
// Parse incoming JSON payloads. This is a built-in Express middleware.
app.use(express.json());

// ----------------------------------------------------------------
// |                         API Routing                          |
// ----------------------------------------------------------------

/**
 * Mount the routers for different parts of the API.
 * Versioning the API (e.g., /api/v1) is a good practice for maintainability.
 */
app.use("/api/v1/user", userRouter);
app.use("/api/v1/todo", todoRouter);

// export default app;
// ----------------------------------------------------------------
// |                 Server and Database Startup                  |
// ----------------------------------------------------------------

/**
 * The main function to initialize the application.
 * It first connects to the database and then starts the Express server.
 */
async function main() {
  try {
    // 1. Connect to the database using Prisma Client.
    await prisma.$connect();
    console.log('✅ Successfully connected to the database.');

    // 2. If the database connection is successful, start the Express server.
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is running and listening on port ${PORT}`);
      console.log(`🔗 Live at http://localhost:${PORT}`);
    });

    return server;

  } catch (error) {
    // 3. If the database connection fails, log the error and exit the process.
    console.error('❌ Failed to connect to the database.');
    console.error(error);
    process.exit(1); // Exit with a failure code
  }
}

main()
  .then(server => {
    console.log('✅ Main function has completed successfully.');
    // The server is already running at this point from inside main().
  })
  .catch(error => {
    // This is also unlikely to be hit because of the internal try/catch in main,
    // which calls process.exit(1).
    console.error('❌ An unhandled error occurred outside the main try/catch block.');
    console.error(error);
    process.exit(1);
  });

// // ----------------------------------------------------------------
// // |                    Graceful Shutdown Logic                   |
// // ----------------------------------------------------------------

// /**
//  * Handles graceful shutdown of the server. This is crucial for production
//  * environments to ensure that all ongoing requests are finished and resources
//  * (like the database connection) are released properly before the process exits.
//  * * We listen for 'SIGTERM' (e.g., from Docker, Kubernetes) and 'SIGINT' (e.g., Ctrl+C).
//  */
// const gracefulShutdown = async (signal: string) => {
//   console.log(`\n🚨 Received ${signal}. Starting graceful shutdown...`);

//   // 1. Stop the server from accepting new connections.
//   server.close(async () => {
//     console.log('✅ HTTP server closed.');

//     // 2. Disconnect from the database.
//     await prisma.$disconnect();
//     console.log('🔌 Prisma Client disconnected.');

//     // 3. Exit the process.
//     process.exit(0);
//   });

//   // If the server hasn't closed after a timeout, force exit.
//   setTimeout(() => {
//     console.error('❌ Could not close connections in time, forcing shutdown.');
//     process.exit(1);
//   }, 10000); // 10-second timeout
// };

// process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
// process.on('SIGINT', () => gracefulShutdown('SIGINT'));
