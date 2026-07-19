import { describe, expect, it, vi } from 'vitest';

import { SdkError } from './errors';

import { createApiClient } from './index';

function mockResponse(body: unknown, init: { status?: number } = {}): Response {
  const status = init.status ?? 200;
  return new Response(body === undefined ? '' : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('HttpClient via createApiClient', () => {
  it('builds URLs, forwards org header, and returns parsed data', async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockResponse([{ id: 's1' }]));
    const client = createApiClient({ baseUrl: 'http://api.test', fetch: fetchMock });

    const result = await client.schedules.list({ organizationId: 'org_1' });

    expect(result).toEqual([{ id: 's1' }]);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe('http://api.test/api/v1/schedules');
    expect((init as RequestInit).method).toBe('GET');
    expect((init.headers as Record<string, string>)['x-organization-id']).toBe('org_1');
    expect((init as RequestInit).credentials).toBe('include');
  });

  it('serializes query params for availability', async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockResponse([]));
    const client = createApiClient({ baseUrl: 'http://api.test', fetch: fetchMock });

    await client.public.getAvailability('evt_1', {
      from: '2026-07-13',
      to: '2026-07-14',
      timeZone: 'UTC',
    });

    const [url] = fetchMock.mock.calls[0]!;
    expect(url).toContain('/public/event-types/evt_1/availability');
    expect(url).toContain('from=2026-07-13');
    expect(url).toContain('timeZone=UTC');
  });

  it('throws a typed SdkError on error responses', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockResponse(
        { code: 'SLOT_UNAVAILABLE', message: 'gone', statusCode: 409 },
        { status: 409 },
      ),
    );
    const client = createApiClient({ baseUrl: 'http://api.test', fetch: fetchMock });

    await expect(
      client.public.createBooking({
        eventTypeId: 'evt_1',
        startTime: '2026-07-13T13:00:00.000Z',
        invitee: { name: 'Ada', email: 'ada@example.com', timeZone: 'UTC' },
        guests: [],
      }),
    ).rejects.toSatisfy((error: unknown) => {
      return error instanceof SdkError && error.isSlotUnavailable && error.statusCode === 409;
    });
  });

  it('returns undefined for 204 responses', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    const client = createApiClient({ baseUrl: 'http://api.test', fetch: fetchMock });
    await expect(client.schedules.remove('s1', { organizationId: 'org_1' })).resolves.toBeUndefined();
  });
});
