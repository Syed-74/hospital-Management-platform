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
    // ------------------------------------
    // PLATFORM & SYSTEM ADMINISTRATION
    // ------------------------------------
    { action: "platform:access", description: "Access Platform Admin panel" },
    { action: "platform_settings:manage", description: "Manage platform-wide configurations and global parameters" },
    { action: "system_health:read", description: "Monitor overall system health, server metrics, and uptime" },
    { action: "system_backups:manage", description: "Configure and trigger system-wide data backups" },
    { action: "api_keys:manage", description: "Manage global API keys and webhooks for external integrations" },

    // ------------------------------------
    // TENANT (HOSPITAL) MANAGEMENT
    // ------------------------------------
    { action: "hospitals:create", description: "Create and onboard new hospital tenants" },
    { action: "hospitals:read", description: "Read hospital tenant details and statistics" },
    { action: "hospitals:update", description: "Update hospital tenant configurations and limits" },
    { action: "hospitals:delete", description: "Suspend or deactivate hospital tenants" },
    { action: "hospital_themes:manage", description: "Configure custom branding and themes for hospital tenants" },

    // ------------------------------------
    // HOSPITAL ADMIN MANAGEMENT
    // ------------------------------------
    { action: "hospitalAdmins:create", description: "Create Hospital Admin accounts" },
    { action: "hospitalAdmins:read", description: "View Hospital Admin accounts" },
    { action: "hospitalAdmins:update", description: "Modify Hospital Admin accounts" },
    { action: "hospitalAdmins:delete", description: "Deactivate Hospital Admin accounts" },

    // ------------------------------------
    // SUBSCRIPTION & BILLING MANAGEMENT
    // ------------------------------------
    { action: "subscriptions:manage", description: "Manage hospital subscriptions, billing plans, and invoicing" },
    { action: "features:manage", description: "Control modules and features available to hospitals" },

    // ------------------------------------
    // PLATFORM IDENTITY & ACCESS MANAGEMENT (IAM)
    // ------------------------------------
    { action: "platform_users:manage", description: "Create, update, activate, and suspend platform-level support staff and admins" },
    { action: "roles:manage", description: "Define system-level roles and assign to users" },
    { action: "role_templates:manage", description: "Create and assign role templates to Hospital Admins" },
    { action: "permissions:manage", description: "Maintain the global permission catalog" },

    // ------------------------------------
    // SECURITY, AUDIT & COMPLIANCE
    // ------------------------------------
    { action: "security_policies:manage", description: "Configure authentication (MFA/SSO) and password policies" },
    { action: "access_policies:manage", description: "Configure IP whitelisting and geo-blocking policies" },
    { action: "audit_logs:read", description: "Review global security, audit, and compliance logs across all tenants" },

    // ------------------------------------
    // GLOBAL DATA MANAGEMENT
    // ------------------------------------
    { action: "global_data:manage", description: "Manage standard ICD codes, global medical terminology, and standard drug databases" },
    { action: "platform_announcements:manage", description: "Publish system-wide maintenance announcements to all tenants" },
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
  let platformAdminRole = await prisma.role.findFirst({
    where: { 
      name: 'PLATFORM_ADMIN',
      hospitalId: null
    }
  });

  if (platformAdminRole) {
    platformAdminRole = await prisma.role.update({
      where: { id: platformAdminRole.id },
      data: {
        description: 'Platform Level Super Administrator governing access across all hospital tenants',
        scope: 'GLOBAL'
      }
    });
  } else {
    platformAdminRole = await prisma.role.create({
      data: {
        name: 'PLATFORM_ADMIN',
        description: 'Platform Level Super Administrator governing access across all hospital tenants',
        scope: 'GLOBAL'
      }
    });
  }

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

  // Seed default Platform Admin user and assign role
  const bcrypt = await import('bcrypt');
  const hashedPassword = await bcrypt.hash('Finesse@12345', 12);

  let superadmin = await prisma.user.upsert({
    where: { email: 'superadmin@gmail.com' },
    update: {},
    create: {
      email: 'superadmin@gmail.com',
      password: hashedPassword,
      firstName: 'Syed',
      lastName: 'Nusrath',
      isActive: true,
    }
  });

  // Assign PLATFORM_ADMIN role to superadmin globally (hospitalId = null, branchId = null)
  await prisma.userRoleAssignment.upsert({
    where: { 
      userId_roleId_hospitalId_branchId: { 
        userId: superadmin.id, 
        roleId: platformAdminRole.id, 
        hospitalId: '', 
        branchId: '' 
      } 
    },
    update: {},
    create: {
      userId: superadmin.id,
      roleId: platformAdminRole.id,
    }
  });
  console.log("✔ Assigned PLATFORM_ADMIN role to superadmin@gmail.com.");

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
