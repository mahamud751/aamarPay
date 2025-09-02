// src/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  const permissions = [
    { name: 'event.create' },
    { name: 'event.update.own' },
    { name: 'event.update.all' },
    { name: 'event.delete.own' },
    { name: 'event.delete.all' },
    { name: 'event.rsvp' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }

  // Get all permissions with their IDs
  const allPermissions = await prisma.permission.findMany();
  const permissionMap = allPermissions.reduce(
    (acc, perm) => {
      acc[perm.name] = perm.id;
      return acc;
    },
    {} as Record<string, string>,
  );

  // Assign permissions to superAdmin users
  const superAdmins = await prisma.user.findMany({
    where: { role: 'superAdmin' },
  });

  for (const user of superAdmins) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        permissions: {
          set: allPermissions.map((perm) => ({ id: perm.id })),
        },
      },
    });
  }

  // Assign permissions to admin users
  const admins = await prisma.user.findMany({
    where: { role: 'admin' },
  });

  for (const user of admins) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        permissions: {
          set: allPermissions.map((perm) => ({ id: perm.id })),
        },
      },
    });
  }

  // Assign specific permissions to user role
  const users = await prisma.user.findMany({
    where: { role: 'user' },
  });

  const userPermissionIds = [
    permissionMap['event.create'],
    permissionMap['event.update.own'],
    permissionMap['event.delete.own'],
    permissionMap['event.rsvp'],
  ].filter((id) => id); // Filter out any undefined IDs

  for (const user of users) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        permissions: {
          set: userPermissionIds.map((id) => ({ id })),
        },
      },
    });
  }

  console.log('Permissions seeded successfully');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
