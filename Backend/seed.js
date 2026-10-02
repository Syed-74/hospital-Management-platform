import { prisma } from './src/config/db.js';
import bcrypt from 'bcrypt';

async function main() {
  console.log("🌱 Seeding Enterprise Platform Admin permissions, role, and credentials...");

  // Platform Admin Permission Catalog (Grouped by Module)
  const platformAdminPermissions = [
    // PLATFORM & SYSTEM ADMINISTRATION
    { action: "platform:access", description: "Access Platform Admin panel", module: "Platform Administration" },
    { action: "platform_settings:manage", description: "Manage platform-wide configurations and global parameters", module: "Platform Administration" },
    { action: "system_health:read", description: "Monitor overall system health, server metrics, and uptime", module: "Platform Administration" },
    { action: "system_backups:manage", description: "Configure and trigger system-wide data backups", module: "Platform Administration" },
    { action: "api_keys:manage", description: "Manage global API keys and webhooks for external integrations", module: "Platform Administration" },
                                                                          
    // HOSPITAL MANAGEMENT
    { action: "hospitals:create", description: "Create and onboard new hospitals", module: "Hospital Management" },
    { action: "hospitals:read", description: "Read hospital details and statistics", module: "Hospital Management" },
    { action: "hospitals:update", description: "Update hospital configurations and limits", module: "Hospital Management" },
    { action: "hospitals:delete", description: "Suspend or deactivate hospitals", module: "Hospital Management" },
    { action: "hospital_themes:manage", description: "Configure custom branding and themes for hospitals", module: "Hospital Management" },

    // HOSPITAL ADMIN MANAGEMENT
    { action: "hospitalAdmins:create", description: "Create Hospital Admin accounts", module: "Hospital Admin Management" },
    { action: "hospitalAdmins:read", description: "View Hospital Admin accounts", module: "Hospital Admin Management" },
    { action: "hospitalAdmins:update", description: "Modify Hospital Admin accounts", module: "Hospital Admin Management" },
    { action: "hospitalAdmins:delete", description: "Deactivate Hospital Admin accounts", module: "Hospital Admin Management" },

    // SUBSCRIPTION & BILLING MANAGEMENT
    { action: "subscriptions:manage", description: "Manage hospital subscriptions, billing plans, and invoicing", module: "Subscription & Billing" },
    { action: "features:manage", description: "Control modules and features available to hospitals", module: "Subscription & Billing" },

    // PLATFORM IDENTITY & ACCESS MANAGEMENT (IAM)
    { action: "platform_users:manage", description: "Create, update, activate, and suspend platform-level support staff and admins", module: "Platform Identity & IAM" },
    { action: "roles:manage", description: "Define system-level roles and assign to users", module: "Platform Identity & IAM" },
    { action: "role_templates:manage", description: "Create and assign role templates to Hospital Admins", module: "Platform Identity & IAM" },
    { action: "permissions:manage", description: "Maintain the global permission catalog", module: "Platform Identity & IAM" },

    // SECURITY, AUDIT & COMPLIANCE
    { action: "security_policies:manage", description: "Configure authentication (MFA/SSO) and password policies", module: "Security & Compliance" },
    { action: "access_policies:manage", description: "Configure IP whitelisting and geo-blocking policies", module: "Security & Compliance" },
    { action: "audit_logs:read", description: "Review global security, audit, and compliance logs across all hospitals", module: "Security & Compliance" },

    // GLOBAL DATA MANAGEMENT
    { action: "global_data:manage", description: "Manage standard ICD codes, global medical terminology, and standard drug databases", module: "Global Data Management" },
    { action: "platform_announcements:manage", description: "Publish system-wide maintenance announcements to all hospitals", module: "Global Data Management" },
  ];

  // 1. Upsert Permissions into Global Catalog
  const upsertedPermissions = {};
  for (const perm of platformAdminPermissions) {
    const created = await prisma.permission.upsert({
      where: { action: perm.action },
      update: { description: perm.description, module: perm.module },
      create: { action: perm.action, description: perm.description, module: perm.module }
    });
    upsertedPermissions[perm.action] = created;
  }
  console.log(`✔ Seeded ${platformAdminPermissions.length} platform permissions with module classifications.`);

  // 2. Seed/Update PLATFORM_ADMIN Role (Global Scope, hospitalId = null)
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
        description: 'Platform Level Super Administrator governing access across all hospitals',
        scope: 'GLOBAL'
      }
    });
  } else {
    platformAdminRole = await prisma.role.create({
      data: {
        name: 'PLATFORM_ADMIN',
        description: 'Platform Level Super Administrator governing access across all hospitals',
        scope: 'GLOBAL'
      }
    });
  }
  console.log(`✔ Seeded global PLATFORM_ADMIN role (ID: ${platformAdminRole.id}).`);

  // 3. Grant All Platform Permissions to PLATFORM_ADMIN
  for (const actionName of Object.keys(upsertedPermissions)) {
    const permId = upsertedPermissions[actionName].id;
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: platformAdminRole.id, permissionId: permId } },
      update: {},
      create: { roleId: platformAdminRole.id, permissionId: permId }
    });
  }
  console.log("✔ Linked all platform permissions to PLATFORM_ADMIN role.");

  // 4. Seed Default Superadmin Identity (User)
  const superadmin = await prisma.user.upsert({
    where: { email: 'superadmin@gmail.com' },
    update: {
      firstName: 'Syed',
      lastName: 'Nusrath',
      hospitalId: null
    },
    create: {
      email: 'superadmin@gmail.com',
      firstName: 'Syed',
      lastName: 'Nusrath',
      hospitalId: null
    }
  });

  // 5. Seed Authentication Credentials (UserCredential & UserMfaSetting)
  const hashedPassword = await bcrypt.hash('Finesse@12345', 12);

  await prisma.userCredential.upsert({
    where: { userId: superadmin.id },
    update: {
      status: 'ACTIVE',
      isEmailVerified: true,
      isPhoneVerified: true
    },
    create: {
      userId: superadmin.id,
      passwordHash: hashedPassword,
      status: 'ACTIVE',
      isEmailVerified: true,
      isPhoneVerified: true
    }
  });

  await prisma.userMfaSetting.upsert({
    where: { userId: superadmin.id },
    update: {},
    create: {
      userId: superadmin.id,
      isEnabled: false
    }
  });

  // 6. Assign Global PLATFORM_ADMIN Role (hospitalId = null, branchId = null)
  const existingGlobalGrant = await prisma.userRoleAssignment.findFirst({
    where: { 
      userId: superadmin.id, 
      roleId: platformAdminRole.id, 
      hospitalId: null, 
      branchId: null 
    },
  });

  if (!existingGlobalGrant) {
    await prisma.userRoleAssignment.create({
      data: {
        userId: superadmin.id,
        roleId: platformAdminRole.id,
        hospitalId: null,
        branchId: null
      }
    });
  }

  console.log("✔ Assigned global PLATFORM_ADMIN role grant to superadmin@gmail.com.");
  console.log("🎉 Seeding complete. Platform Admin setup fully configured.");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
