import app from "./app.js";
import { ENV } from "./config/env.js";
import { prisma } from "./config/db.js";

// Connect to Database and start server
const startServer = async () => {
  try {
    // Test the database connection
    await prisma.$connect();
    console.log("📦 Successfully connected to the database.");

    const PORT = ENV.PORT;
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running in ${ENV.NODE_ENV} mode on port ${PORT}`);
    });

    // Handle Unhandled Rejections (e.g., failed DB connection outside of this block)
    process.on("unhandledRejection", (err) => {
      console.error("UNHANDLED REJECTION! 💥 Shutting down...");
      console.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

  } catch (error) {
    console.error("Failed to start server due to database connection error:");
    console.error(error);
    process.exit(1);
  }
};

// Handle Uncaught Exceptions
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

startServer();
