import { prisma } from './src/config/db.js';

async function cleanRoles() {
  console.log("Starting role database cleanup...");

  // 1. Find PLATFORM_ADMIN role
  const platformAdminRole = await prisma.role.findFirst({
    where: { name: 'PLATFORM_ADMIN', hospitalId: null }
  });

  const platformAdminRoleId = platformAdminRole?.id;

  // 2. Delete non-PLATFORM_ADMIN role assignments
  const deletedAssignments = await prisma.userRoleAssignment.deleteMany({
    where: platformAdminRoleId ? {
      roleId: { not: platformAdminRoleId }
    } : {}
  });
  console.log(`✔ Deleted ${deletedAssignments.count} user role assignments.`);

  // 3. Delete non-PLATFORM_ADMIN role permissions
  const deletedRolePermissions = await prisma.rolePermission.deleteMany({
    where: platformAdminRoleId ? {
      roleId: { not: platformAdminRoleId }
    } : {}
  });
  console.log(`✔ Deleted ${deletedRolePermissions.count} role permissions.`);

  // 4. Delete non-PLATFORM_ADMIN roles
  const deletedRoles = await prisma.role.deleteMany({
    where: platformAdminRoleId ? {
      id: { not: platformAdminRoleId }
    } : {}
  });
  console.log(`✔ Deleted ${deletedRoles.count} custom roles.`);

  console.log("🎉 Database roles cleaned successfully! Standard PLATFORM_ADMIN role preserved.");
}

cleanRoles()
  .catch((err) => {
    console.error("Error cleaning database roles:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
