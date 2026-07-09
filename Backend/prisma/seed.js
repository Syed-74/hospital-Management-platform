import { prisma } from '../src/config/db.js';

async function main() {
  console.log("Seeding Theme permissions...");

  // 1. Upsert the new permissions safely (will not duplicate if they exist)
  const themesManage = await prisma.permission.upsert({
    where: { action: 'themes:manage' },
    update: {},
    create: {
      action: 'themes:manage',
      description: 'Manage UI branding and theme configurations',
    },
  });

  const themesRead = await prisma.permission.upsert({
    where: { action: 'themes:read' },
    update: {},
    create: {
      action: 'themes:read',
      description: 'View UI branding configurations',
    },
  });

  console.log("✔ Created 'themes:manage' and 'themes:read' permissions.");

  // 2. Fetch the existing Platform Admin role and attach the permission
  const platformAdminRole = await prisma.role.findUnique({
    where: { name: 'PLATFORM_ADMIN' }
  });

  if (platformAdminRole) {
    await prisma.role.update({
      where: { id: platformAdminRole.id },
      data: {
        permissions: {
          connect: [{ id: themesManage.id }, { id: themesRead.id }]
        }
      }
    });
    console.log("✔ Attached themes:manage to Platform Admin.");
  } else {
    console.log("⚠ Platform Admin role not found. Skipping.");
  }

  // 3. Fetch the existing Hospital Admin role and attach the permission
  const hospitalAdminRole = await prisma.role.findUnique({
    where: { name: 'HOSPITAL_ADMIN' }
  });

  if (hospitalAdminRole) {
    await prisma.role.update({
      where: { id: hospitalAdminRole.id },
      data: {
        permissions: {
          connect: [{ id: themesManage.id }, { id: themesRead.id }]
        }
      }
    });
    console.log("✔ Attached themes:manage to Hospital Admin.");
  } else {
    console.log("⚠ Hospital Admin role not found. Skipping.");
  }

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
