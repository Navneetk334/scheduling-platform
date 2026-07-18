/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** Global permission catalog. */
const PERMISSIONS = [
  { key: 'org.manage', category: 'organization', description: 'Manage organization settings' },
  { key: 'member.invite', category: 'members', description: 'Invite members' },
  { key: 'member.manage', category: 'members', description: 'Manage members and roles' },
  { key: 'meetingtype.manage', category: 'scheduling', description: 'Create/edit meeting types' },
  { key: 'availability.manage', category: 'scheduling', description: 'Manage availability' },
  { key: 'booking.read', category: 'bookings', description: 'View bookings' },
  { key: 'booking.write', category: 'bookings', description: 'Create/modify bookings' },
  { key: 'booking.cancel', category: 'bookings', description: 'Cancel bookings' },
  { key: 'billing.manage', category: 'billing', description: 'Manage billing and plans' },
];

/** System role → permission keys. `*` means all permissions. */
const ROLE_PERMISSIONS: Record<string, string[]> = {
  owner: ['*'],
  admin: [
    'member.invite',
    'member.manage',
    'meetingtype.manage',
    'availability.manage',
    'booking.read',
    'booking.write',
    'booking.cancel',
  ],
  member: ['meetingtype.manage', 'availability.manage', 'booking.read', 'booking.write'],
};

const PLANS = [
  { key: 'free', name: 'Free', priceAmount: 0, interval: 'MONTH' as const, sortOrder: 0 },
  { key: 'pro', name: 'Pro', priceAmount: 1500, interval: 'MONTH' as const, sortOrder: 1 },
  { key: 'team', name: 'Team', priceAmount: 4900, interval: 'MONTH' as const, sortOrder: 2 },
  {
    key: 'enterprise',
    name: 'Enterprise',
    priceAmount: 0,
    interval: 'MONTH' as const,
    isPublic: false,
    sortOrder: 3,
  },
];

async function main(): Promise<void> {
  // --- Global catalogs ---
  for (const permission of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: { description: permission.description, category: permission.category },
      create: permission,
    });
  }
  for (const plan of PLANS) {
    await prisma.plan.upsert({
      where: { key: plan.key },
      update: { name: plan.name, priceAmount: plan.priceAmount },
      create: plan,
    });
  }
  const allPermissions = await prisma.permission.findMany();

  // --- Demo user + organization ---
  const owner = await prisma.user.upsert({
    where: { email: 'founder@invinciblepros.dev' },
    update: {},
    create: {
      email: 'founder@invinciblepros.dev',
      name: 'Demo Founder',
      emailVerified: true,
      timeZone: 'America/New_York',
    },
  });

  const organization = await prisma.organization.upsert({
    where: { slug: 'invincible-pros' },
    update: {},
    create: { name: 'Invincible Pros', slug: 'invincible-pros', timeZone: 'America/New_York' },
  });

  // --- System roles + permissions ---
  const roleIdByKey = new Map<string, string>();
  for (const key of Object.keys(ROLE_PERMISSIONS)) {
    const role = await prisma.role.upsert({
      where: { organizationId_key: { organizationId: organization.id, key } },
      update: {},
      create: {
        organizationId: organization.id,
        key,
        name: key.charAt(0).toUpperCase() + key.slice(1),
        isSystem: true,
      },
    });
    roleIdByKey.set(key, role.id);

    const keys = ROLE_PERMISSIONS[key]!;
    const granted = keys.includes('*')
      ? allPermissions
      : allPermissions.filter((p) => keys.includes(p.key));
    for (const permission of granted) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }
  }

  await prisma.membership.upsert({
    where: { organizationId_userId: { organizationId: organization.id, userId: owner.id } },
    update: { roleId: roleIdByKey.get('owner')! },
    create: {
      organizationId: organization.id,
      userId: owner.id,
      roleId: roleIdByKey.get('owner')!,
      status: 'ACTIVE',
    },
  });

  // --- Availability (Mon–Fri 09:00–17:00) ---
  let availability = await prisma.availability.findFirst({
    where: { organizationId: organization.id, ownerId: owner.id, isDefault: true },
  });
  if (!availability) {
    availability = await prisma.availability.create({
      data: {
        organizationId: organization.id,
        ownerId: owner.id,
        name: 'Working Hours',
        timeZone: 'America/New_York',
        isDefault: true,
        workingHours: {
          create: [1, 2, 3, 4, 5].map((weekday) => ({
            weekday,
            startMinute: 9 * 60,
            endMinute: 17 * 60,
          })),
        },
      },
    });
  }

  // --- Location + Meeting type ---
  let location = await prisma.location.findFirst({
    where: { organizationId: organization.id, kind: 'GOOGLE_MEET' },
  });
  location ??= await prisma.location.create({
    data: { organizationId: organization.id, kind: 'GOOGLE_MEET', label: 'Google Meet' },
  });

  const existingMeetingType = await prisma.meetingType.findUnique({
    where: { organizationId_slug: { organizationId: organization.id, slug: 'intro-call' } },
  });
  if (!existingMeetingType) {
    await prisma.meetingType.create({
      data: {
        organizationId: organization.id,
        ownerId: owner.id,
        availabilityId: availability.id,
        kind: 'ONE_ON_ONE',
        title: 'Intro Call',
        slug: 'intro-call',
        description: 'A quick 30-minute introductory call.',
        durationMinutes: 30,
        minimumNoticeMinutes: 120,
        bookingWindowDays: 45,
        slotIntervalMinutes: 15,
        hosts: { create: [{ userId: owner.id, role: 'ORGANIZER' }] },
        locationLinks: { create: [{ locationId: location.id }] },
      },
    });
  }

  console.log(`Seeded organization "${organization.slug}" with roles, availability, and a meeting type.`);
}

main()
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
