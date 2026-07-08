import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import { verifyToken } from "../utils/jwt.js";
import { ENV } from "../config/env.js";
import { prisma } from "../config/db.js";

/**
 * Middleware to protect routes.
 * Verifies JWT token and attaches the user (with roles/permissions) to req.user
 */
export const protect = catchAsync(async (req, res, next) => {
  let token;

  // 1. Check if token exists in headers
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("You are not logged in! Please log in to get access.", 401));
  }

  // 2. Verify token
  const decoded = await verifyToken(token, ENV.JWT_SECRET);

  // 3. Check if user still exists in DB
  const currentUser = await prisma.user.findUnique({
    where: { id: decoded.id },
    include: {
      hospital: true,
      roles: {
        include: {
          permissions: true,
        },
      },
    },
  });

  if (!currentUser) {
    return next(new AppError("The user belonging to this token no longer exists.", 401));
  }

  // 4. Check if user is active
  if (!currentUser.isActive) {
    return next(new AppError("Your account has been deactivated. Please contact support.", 401));
  }

  // Attach user to request for downstream middlewares and controllers
  req.user = currentUser;
  next();
});
