import { describe, expect, it } from 'vitest';

import { createBookingSchema, availabilityQuerySchema } from './booking';
import { createMeetingTypeSchema } from './meeting-type';
import { createOrganizationSchema, inviteMemberSchema } from './organization';
import { calendarDateSchema, emailSchema, slugSchema, timeZoneSchema } from './primitives';
import { availabilityRuleSchema, createScheduleSchema } from './schedule';

describe('primitive schemas', () => {
  it('validates timezones', () => {
    expect(timeZoneSchema.safeParse('America/New_York').success).toBe(true);
    expect(timeZoneSchema.safeParse('Nowhere/Void').success).toBe(false);
  });
  it('validates calendar dates', () => {
    expect(calendarDateSchema.safeParse('2026-07-18').success).toBe(true);
    expect(calendarDateSchema.safeParse('2026-7-8').success).toBe(false);
  });
  it('normalizes emails', () => {
    const parsed = emailSchema.parse('  USER@Example.COM ');
    expect(parsed).toBe('user@example.com');
  });
  it('validates slugs', () => {
    expect(slugSchema.safeParse('my-event-1').success).toBe(true);
    expect(slugSchema.safeParse('My Event').success).toBe(false);
    expect(slugSchema.safeParse('-bad-').success).toBe(false);
  });
});

describe('organization schemas', () => {
  it('accepts a valid organization', () => {
    const result = createOrganizationSchema.safeParse({
      name: 'Invincible Pros',
      timeZone: 'UTC',
    });
    expect(result.success).toBe(true);
  });
  it('rejects short names', () => {
    expect(createOrganizationSchema.safeParse({ name: 'x', timeZone: 'UTC' }).success).toBe(false);
  });
  it('defaults invite role to MEMBER', () => {
    const parsed = inviteMemberSchema.parse({ email: 'a@b.com' });
    expect(parsed.role).toBe('MEMBER');
  });
});

describe('schedule schemas', () => {
  it('rejects inverted intervals', () => {
    const result = availabilityRuleSchema.safeParse({
      weekday: 1,
      startMinute: 600,
      endMinute: 540,
    });
    expect(result.success).toBe(false);
  });
  it('accepts a full schedule with defaults', () => {
    const parsed = createScheduleSchema.parse({ name: 'Default', timeZone: 'UTC' });
    expect(parsed.rules).toEqual([]);
    expect(parsed.isDefault).toBe(false);
  });
});

describe('meeting type schemas', () => {
  const base = {
    scheduleId: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Intro Call',
    durationMinutes: 30,
    locations: [{ type: 'GOOGLE_MEET' as const, value: null }],
  };
  it('accepts a valid one-on-one meeting type with defaults', () => {
    const parsed = createMeetingTypeSchema.parse(base);
    expect(parsed.slotIntervalMinutes).toBe(15);
    expect(parsed.seatsPerSlot).toBe(1);
    expect(parsed.color).toBe('#4F46E5');
  });
  it('rejects multi-seat non-group events', () => {
    const result = createMeetingTypeSchema.safeParse({ ...base, seatsPerSlot: 5 });
    expect(result.success).toBe(false);
  });
  it('accepts multi-seat GROUP events', () => {
    const result = createMeetingTypeSchema.safeParse({
      ...base,
      kind: 'GROUP',
      seatsPerSlot: 5,
    });
    expect(result.success).toBe(true);
  });
});

describe('booking schemas', () => {
  it('accepts a valid booking payload', () => {
    const result = createBookingSchema.safeParse({
      meetingTypeId: 'evt_1',
      startTime: '2026-07-18T13:00:00.000Z',
      invitee: { name: 'Ada', email: 'ada@example.com', timeZone: 'UTC' },
    });
    expect(result.success).toBe(true);
  });
  it('rejects invalid start times', () => {
    const result = createBookingSchema.safeParse({
      meetingTypeId: 'evt_1',
      startTime: 'not-a-date',
      invitee: { name: 'Ada', email: 'ada@example.com', timeZone: 'UTC' },
    });
    expect(result.success).toBe(false);
  });
  it('rejects reversed availability ranges', () => {
    const result = availabilityQuerySchema.safeParse({
      meetingTypeId: 'evt_1',
      from: '2026-07-20',
      to: '2026-07-18',
      timeZone: 'UTC',
    });
    expect(result.success).toBe(false);
  });
});
