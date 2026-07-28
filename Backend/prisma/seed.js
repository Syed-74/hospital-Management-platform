import { prisma } from '../src/config/db.js';

async function main() {
  console.log("Seeding system dashboards and permissions...");

  // Define Dashboards
  const dashboardsList = [
    { name: "Platform Admin Dashboard", path: "/platformAdmin/overview" },
    { name: "Hospital Admin Dashboard", path: "/hospital/overview" },
    { name: "Branch Dashboard", path: "/branch/dashboard" },
    { name: "Doctor Dashboard", path: "/doctor/dashboard" },
    { name: "Patient Portal", path: "/patient/dashboard" },
    { name: "Pharmacy Dashboard", path: "/pharmacy/dashboard" }
  ];

  const upsertedDashboards = {};
  for (const dash of dashboardsList) {
    const created = await prisma.dashboard.upsert({
      where: { path: dash.path },
      update: { name: dash.name },
      create: { name: dash.name, path: dash.path }
    });
    upsertedDashboards[dash.path] = created;
  }
  console.log(`✔ Seeded ${dashboardsList.length} dashboards.`);

  // Define all master permission definitions across the entire platform
  const permissionsList = [
    // 1. Platform Admin Level Permissions
    { action: "platform:access", description: "Access Platform Admin panel" },
    { action: "subscriptions:manage", description: "Manage hospital subscriptions" },
    { action: "hospitals:create", description: "Create new hospitals" },
    { action: "hospitals:read", description: "Read hospital details" },
    { action: "hospitals:update", description: "Update hospital details" },
    { action: "hospitals:delete", description: "Delete hospitals" },
    { action: "hospitalAdmins:create", description: "Create hospital admin accounts" },
    { action: "hospitalAdmins:read", description: "View hospital admin accounts" },
    { action: "hospitalAdmins:update", description: "Modify hospital admin accounts" },
    { action: "hospitalAdmins:delete", description: "Remove hospital admin accounts" },
    
    // Core Identity & Access Control management (Needed by Platform Admin to manage permissions)
    { action: "roles:manage", description: "Full control over role management" },
    { action: "permissions:manage", description: "Full control over permission mapping" },
    { action: "users:read", description: "View users registry" },
    { action: "users:assign_roles", description: "Assign roles to users" },

    // 2. Hospital Admin Level Permissions (Available in registry for dynamic assignment)
    { action: "hospital:access", description: "Access Hospital Admin dashboard" },
    { action: "branch:manage", description: "Create and update branches" },
    { action: "branch:read", description: "Read branch details" },
    { action: "hospitalUsers:manage", description: "Manage hospital staff members" },
    { action: "hospitalUsers:read", description: "Read hospital staff members list" },
    { action: "themes:manage", description: "Manage UI branding and theme configurations" },
    { action: "themes:read", description: "View UI branding configurations" },

    // 3. Branch / Department Level Permissions (Available in registry for dynamic assignment)
    { action: "billing:manage", description: "Manage financial invoices and tariffs" },
    { action: "billing:read", description: "View billing records" },
    { action: "patients:manage", description: "Manage patient admission and discharge" },
    { action: "patients:read", description: "Read patient files" },
    { action: "clinical:write", description: "Write clinical observations and prescriptions" },
    { action: "clinical:read", description: "View clinical notes" },
    { action: "inventory:manage", description: "Manage pharmacy stock and drug audits" },
    { action: "inventory:read", description: "View inventory levels" }
  ];

  // Upsert all permission definitions
  const upsertedPermissions = {};
  for (const perm of permissionsList) {
    const created = await prisma.permission.upsert({
      where: { action: perm.action },
      update: { description: perm.description },
      create: { action: perm.action, description: perm.description }
    });
    upsertedPermissions[perm.action] = created;
  }
  console.log(`✔ Seeded ${permissionsList.length} permission definitions.`);

  // Define Platform Admin permissions (to connect only to the Platform Admin role)
  const platformAdminPermActions = [
    "platform:access",
    "subscriptions:manage",
    "hospitals:create",
    "hospitals:read",
    "hospitals:update",
    "hospitals:delete",
    "hospitalAdmins:create",
    "hospitalAdmins:read",
    "hospitalAdmins:update",
    "hospitalAdmins:delete",
    "roles:manage",
    "permissions:manage",
    "users:read",
    "users:assign_roles",
    "themes:manage",
    "themes:read"
  ];

  // Map to DB IDs
  const platformRolePerms = platformAdminPermActions.map(action => ({
    id: upsertedPermissions[action].id
  }));

  // Seed / Upsert the PLATFORM_ADMIN role with these permissions connected via mapping
  const platformAdminRole = await prisma.role.upsert({
    where: { name: 'PLATFORM_ADMIN' },
    update: {
      scope: 'GLOBAL',
    },
    create: {
      name: 'PLATFORM_ADMIN',
      description: 'Platform Level Super Administrator',
      scope: 'GLOBAL',
    }
  });

  // Assign Dashboard
  await prisma.roleDashboard.upsert({
    where: { roleId_dashboardId: { roleId: platformAdminRole.id, dashboardId: upsertedDashboards["/platformAdmin/overview"].id } },
    update: {},
    create: { roleId: platformAdminRole.id, dashboardId: upsertedDashboards["/platformAdmin/overview"].id }
  });

  // Assign Permissions
  for (const perm of platformRolePerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: platformAdminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: platformAdminRole.id, permissionId: perm.id }
    });
  }
  console.log("✔ Seeded PLATFORM_ADMIN role with its required permissions.");

  // Seed / Upsert the HOSPITAL_ADMIN role with ZERO permissions
  // (leaving it completely unassigned, to be configured dynamically by the Platform Admin)
  const hospitalAdminRole = await prisma.role.upsert({
    where: { name: 'HOSPITAL_ADMIN' },
    update: {
      scope: 'TENANT',
    },
    create: {
      name: 'HOSPITAL_ADMIN',
      description: 'Hospital Tenant Administrator',
      scope: 'TENANT',
    }
  });
  
  // Assign default dashboard for HOSPITAL_ADMIN
  await prisma.roleDashboard.upsert({
    where: { roleId_dashboardId: { roleId: hospitalAdminRole.id, dashboardId: upsertedDashboards["/hospital/overview"].id } },
    update: {},
    create: { roleId: hospitalAdminRole.id, dashboardId: upsertedDashboards["/hospital/overview"].id }
  });
  console.log("✔ Seeded HOSPITAL_ADMIN role with empty permissions list.");

  console.log("🎉 Seeding complete.");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
