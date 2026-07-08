import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { ENV } from "./config/env.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from "./modules/auth/auth.routes.js";
import usersRoutes from "./modules/users/users.routes.js";
import rolesRoutes from "./modules/roles/roles.routes.js";
import permissionsRoutes from "./modules/permissions/permissions.routes.js";
import hospitalRoutes from "./modules/createHospital/hospital.routes.js";
import hospitalAdminRoutes from "./modules/ManageHospAdmin/hospitalAdmin.routes.js";

const app = express();

// ==========================================
// GLOBAL MIDDLEWARES
// ==========================================
app.use(helmet()); // Security headers
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (ENV.CORS_ORIGIN.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'));
      }
    },
    credentials: true,
  })
);
app.use(morgan("dev")); // HTTP request logger
app.use(express.json()); // Parse JSON payloads
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded payloads
app.use(cookieParser()); // Parse cookies

// Serve static files from the public directory (for uploaded images)
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// ==========================================
// ROUTES
// ==========================================
// Health check endpoint
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Enterprise HMS Backend is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/roles", rolesRoutes);
app.use("/api/v1/permissions", permissionsRoutes);
app.use("/api/v1/hospitals", hospitalRoutes);
app.use("/api/v1/hospital-admins", hospitalAdminRoutes);

// Define other routes here...
// app.use("/api/v1/users", userRoutes);

// ==========================================
// ERROR HANDLING
// ==========================================
// 404 Handler for unmatched routes
app.use((req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `Cannot find ${req.originalUrl} on this server!`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  console.error(`[Global Error Handler] Route: ${req.originalUrl}, Status: ${err.statusCode}, Message: ${err.message}`);

  if (ENV.NODE_ENV === "development") {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  } else {
    // Production: Don't leak stack traces
    res.status(err.statusCode).json({
      status: err.status,
      message: err.isOperational ? err.message : "Something went very wrong!",
    });
  }
});

export default app;
