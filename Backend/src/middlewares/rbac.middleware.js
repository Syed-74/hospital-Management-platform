import AppError from "../utils/AppError.js";

/**
 * Middleware factory for Role-Based Access Control (RBAC).
 * Evaluates if the authenticated user has the required permission.
 * 
 * @param {string} requiredPermission - The permission action (e.g., 'users:create')
 */
export const requirePermission = (requiredPermission) => {
  return (req, res, next) => {
    const user = req.user; // Set by auth.middleware.js

    if (!user) {
      return next(new AppError("Authentication required.", 401));
    }

    // Extract all permissions from user's roles
    const userPermissions = new Set();
    user.roles.forEach((role) => {
      role.permissions.forEach((permission) => {
        userPermissions.add(permission.action);
      });
    });

    // Check if the user has the required permission (or is super admin if you build one)
    if (!userPermissions.has(requiredPermission)) {
      return next(new AppError("You do not have permission to perform this action.", 403));
    }

    next();
  };
};
