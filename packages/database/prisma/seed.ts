/* eslint-disable no-console */
import { randomUUID } from 'node:crypto';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Idempotent development seed: creates a demo organization, owner, a default
 * Mon–Fri 09:00–17:00 schedule, and a 30-minute one-on-one event type.
 */
async function main(): Promise<void> {
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
    create: {
      name: 'Invincible Pros',
      slug: 'invincible-pros',
      timeZone: 'America/New_York',
    },
  });

  await prisma.membership.upsert({
    where: {
      organizationId_userId: { organizationId: organization.id, userId: owner.id },
    },
    update: { role: 'OWNER', status: 'ACTIVE' },
    create: {
      organizationId: organization.id,
      userId: owner.id,
      role: 'OWNER',
      status: 'ACTIVE',
    },
  });

  const existingSchedule = await prisma.schedule.findFirst({
    where: { organizationId: organization.id, ownerId: owner.id, isDefault: true },
  });

  const schedule =
    existingSchedule ??
    (await prisma.schedule.create({
      data: {
        organizationId: organization.id,
        ownerId: owner.id,
        name: 'Working Hours',
        timeZone: 'America/New_York',
        isDefault: true,
        rules: {
          create: [1, 2, 3, 4, 5].map((weekday) => ({
            weekday,
            startMinute: 9 * 60,
            endMinute: 17 * 60,
          })),
        },
      },
    }));

  const existingEventType = await prisma.eventType.findFirst({
    where: { organizationId: organization.id, slug: 'intro-call' },
  });

  if (!existingEventType) {
    await prisma.eventType.create({
      data: {
        organizationId: organization.id,
        ownerId: owner.id,
        scheduleId: schedule.id,
        kind: 'ONE_ON_ONE',
        title: 'Intro Call',
        slug: 'intro-call',
        description: 'A quick 30-minute introductory call.',
        durationMinutes: 30,
        minimumNoticeMinutes: 120,
        bookingWindowDays: 45,
        slotIntervalMinutes: 15,
        locations: { create: [{ type: 'GOOGLE_MEET', value: null }] },
      },
    });
  }

  console.log(`Seeded organization "${organization.slug}" (${organization.id}).`);
  console.log(`Idempotency reference: ${randomUUID()}`);
}

main()
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
