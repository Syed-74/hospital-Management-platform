import { prisma } from './src/config/db.js';

async function main() {
  console.log("Seeding system dashboards and permissions...");

  // Define Dashboards
  const dashboardsList = [
    { name: "Platform Admin Dashboard", path: "/platformAdmin/overview" }
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

  // Define Platform Admin Permissions based on Enterprise Architecture
  const platformAdminPermissions = [
    // Platform Access
    { action: "platform:access", description: "Access Platform Admin panel" },
    
    // Hospital & Tenant Management
    { action: "hospitals:create", description: "Create and onboard new hospital tenants" },
    { action: "hospitals:read", description: "Read hospital tenant details" },
    { action: "hospitals:update", description: "Update hospital tenant configurations" },
    { action: "hospitals:delete", description: "Suspend or deactivate hospital tenants" },
    
    // Hospital Admin Management
    { action: "hospitalAdmins:create", description: "Create Hospital Admin accounts" },
    { action: "hospitalAdmins:read", description: "View Hospital Admin accounts" },
    { action: "hospitalAdmins:update", description: "Modify Hospital Admin accounts" },
    { action: "hospitalAdmins:delete", description: "Deactivate Hospital Admin accounts" },
    
    // Subscription & Feature Management
    { action: "subscriptions:manage", description: "Manage hospital subscriptions and billing" },
    { action: "features:manage", description: "Control modules and features available to hospitals" },
    
    // Identity, Access & Role Management (Global)
    { action: "platform_users:manage", description: "Create, update, activate, and suspend platform-level users" },
    { action: "roles:manage", description: "Define system-level roles and assign to users" },
    { action: "role_templates:manage", description: "Assign role templates to Hospital Admins" },
    { action: "permissions:manage", description: "Maintain the global permission catalog" },
    
    // Security, Audit & Compliance
    { action: "security_policies:manage", description: "Configure authentication and security policies" },
    { action: "access_policies:manage", description: "Configure access policies and approval workflows" },
    { action: "audit_logs:read", description: "Review security, audit, and compliance logs" },
    
    // Platform Operations
    { action: "platform_settings:manage", description: "Manage platform-wide settings" },
    { action: "system_health:read", description: "Monitor overall system health and metrics" }
  ];

  // Upsert Permissions
  const upsertedPermissions = {};
  for (const perm of platformAdminPermissions) {
    const created = await prisma.permission.upsert({
      where: { action: perm.action },
      update: { description: perm.description },
      create: { action: perm.action, description: perm.description }
    });
    upsertedPermissions[perm.action] = created;
  }
  console.log(`✔ Seeded ${platformAdminPermissions.length} platform permissions.`);

  // Seed PLATFORM_ADMIN Role
  const platformAdminRole = await prisma.role.upsert({
    where: { name: 'PLATFORM_ADMIN' },
    update: { scope: 'GLOBAL' },
    create: {
      name: 'PLATFORM_ADMIN',
      description: 'Platform Level Super Administrator governing access across all hospital tenants',
      scope: 'GLOBAL',
    }
  });

  // Assign Dashboard
  await prisma.roleDashboard.upsert({
    where: { roleId_dashboardId: { roleId: platformAdminRole.id, dashboardId: upsertedDashboards["/platformAdmin/overview"].id } },
    update: {},
    create: { roleId: platformAdminRole.id, dashboardId: upsertedDashboards["/platformAdmin/overview"].id }
  });

  // Assign all Platform Permissions to PLATFORM_ADMIN
  for (const actionName of Object.keys(upsertedPermissions)) {
    const permId = upsertedPermissions[actionName].id;
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: platformAdminRole.id, permissionId: permId } },
      update: {},
      create: { roleId: platformAdminRole.id, permissionId: permId }
    });
  }
  console.log("✔ Seeded PLATFORM_ADMIN role with its required permissions.");

  console.log("🎉 Seeding complete. Enterprise Platform Admin ready.");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
