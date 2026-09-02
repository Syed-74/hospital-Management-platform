/**
 * Scope-aware authorization helpers.
 *
 * A user's access is the union of their UserRoleAssignment rows. Each
 * assignment grants whatever permissions its Role carries, bounded to a
 * scope: GLOBAL (hospitalId = null, branchId = null), HOSPITAL (hospitalId
 * set, branchId = null — covers every branch of that hospital), or BRANCH
 * (hospitalId + branchId set — covers only that one branch).
 *
 * These helpers are the single source of truth for "does grant X cover
 * resource Y" and are used by both the RBAC middleware (route-level) and
 * service layers (query-level) so the two can never disagree.
 */

/**
 * Returns the list of {hospitalId, branchId} scopes, drawn from the user's
 * role assignments, that grant the given permission action.
 */
export function getGrantingScopes(user, action) {
  if (!user?.roleAssignments) return [];
  return user.roleAssignments
    .filter((a) => a.role?.rolePermissions?.some((rp) => rp.permission?.action === action))
    .map((a) => ({ hospitalId: a.hospitalId ?? null, branchId: a.branchId ?? null }));
}

/**
 * Does at least one granting scope cover the target resource's scope?
 * target: { hospitalId, branchId } — branchId may be null for hospital-level resources.
 */
export function isAuthorizedForScope(grantingScopes, target) {
  if (!target) return false;
  return grantingScopes.some((g) => {
    if (!g.hospitalId) return true; // GLOBAL grant covers everything
    if (g.hospitalId !== target.hospitalId) return false;
    if (!g.branchId) return true; // HOSPITAL grant covers every branch of this hospital
    if (!target.branchId) return false; // a BRANCH grant cannot cover a hospital-wide action
    return g.branchId === target.branchId;
  });
}

/** Does the user hold the permission at all, in any scope? */
export function hasPermission(user, action) {
  return getGrantingScopes(user, action).length > 0;
}

/**
 * Derives a backward-compatible flattened `roles` array (deduped Role
 * objects, each with its rolePermissions already included)
 * from a user's `roleAssignments`, and attaches it to the user object.
 * Existing code that flattens `user.roles` for permission checks
 * keeps working unchanged; `user.roleAssignments` remains available for
 * anything that needs the actual scope (hospitalId/branchId) behind a grant.
 */
export function attachDerivedRoleView(user) {
  const rolesById = new Map();
  for (const assignment of user.roleAssignments || []) {
    if (assignment.role && !rolesById.has(assignment.role.id)) {
      rolesById.set(assignment.role.id, assignment.role);
    }
  }
  user.roles = Array.from(rolesById.values());
  return user;
}

/**
 * Convenience: the set of hospitalIds the user holds ANY grant in
 * (GLOBAL grants are represented by including `null`, meaning "all").
 */
export function grantedHospitalIds(user, action) {
  const scopes = getGrantingScopes(user, action);
  return scopes.map((s) => s.hospitalId);
}
