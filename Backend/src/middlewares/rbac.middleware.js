import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import { getGrantingScopes, isAuthorizedForScope } from "../utils/authz.js";

/**
 * Middleware factory for scope-aware Role-Based Access Control (RBAC).
 *
 * Evaluates whether the authenticated user holds `requiredPermission` in a
 * scope that covers the resource this specific request targets. Holding a
 * permission "somewhere" is never enough on its own — a Branch Admin's
 * grant is bounded to their branch, a Hospital Admin's grant to their
 * hospital, and only a GLOBAL (Platform Admin) grant is unbounded.
 *
 * @param {string} requiredPermission - The permission action (e.g. 'branch:manage')
 * @param {object} [options]
 * @param {(req) => Promise<{hospitalId: string|null, branchId: string|null}|null>} [options.resolveScope]
 *   Resolves the ACTUAL scope of the resource this request targets, by
 *   reading it back from the database (never trust client-supplied IDs for
 *   this). Omit for routes that aren't about a single scoped resource
 *   (e.g. the caller filters a list themselves) — in that case
 *   `req.authorizedScopes` is still attached so the handler can filter its
 *   query by it.
 */
export const requirePermission = (requiredPermission, options = {}) => {
  return catchAsync(async (req, res, next) => {
    const user = req.user; // Set by auth.middleware.js

    if (!user) {
      return next(new AppError("Authentication required.", 401));
    }

    const grantingScopes = getGrantingScopes(user, requiredPermission);

    if (grantingScopes.length === 0) {
      return next(new AppError("You do not have permission to perform this action.", 403));
    }

    req.authorizedScopes = grantingScopes;

    if (!options.resolveScope) {
      return next();
    }

    const targetScope = await options.resolveScope(req);
    if (!targetScope) {
      // Resource doesn't exist (or its scope couldn't be resolved) — 404,
      // not 403, so we don't leak whether a foreign-tenant ID exists.
      return next(new AppError("Resource not found.", 404));
    }

    if (!isAuthorizedForScope(grantingScopes, targetScope)) {
      return next(new AppError("You do not have permission to access this resource.", 403));
    }

    req.resolvedScope = targetScope;
    next();
  });
};
