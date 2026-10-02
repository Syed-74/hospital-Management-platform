import { prisma } from './src/config/db.js';

async function checkRoles() {
  console.log("Checking existing roles in database...");
  const roles = await prisma.role.findMany({
    include: {
      _count: {
        select: {
          assignments: true,
          rolePermissions: true
        }
      },
      hospital: {
        select: {
          hospitalName: true
        }
      }
    }
  });

  console.log(`Found ${roles.length} roles:`);
  roles.forEach(r => {
    console.log(`- ID: ${r.id} | Name: ${r.name} | Scope: ${r.scope} | Hospital: ${r.hospital?.hospitalName || 'GLOBAL'} | Assignments: ${r._count.assignments} | Permissions: ${r._count.rolePermissions}`);
  });
}

checkRoles()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
