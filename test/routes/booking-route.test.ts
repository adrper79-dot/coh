import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { makeMockEnv, TEST_JWT_SECRET } from '../../src/test-utils/mock-env';
import { selectChain, insertChain, updateChain, type DbStub } from '../../src/test-utils/db-mock';
import { createToken } from '../../src/utils/auth';
import type { Env, Variables } from '../../src/types/env';

let currentDb: DbStub;

vi.mock('../../src/db', () => ({
  createDb: () => ({
    select: (...args: unknown[]) => currentDb.select(...args),
    insert: (...args: unknown[]) => currentDb.insert(...args),
    update: (...args: unknown[]) => currentDb.update(...args),
    delete: (...args: unknown[]) => currentDb.delete(...args),
    transaction: (...args: unknown[]) => currentDb.transaction(...args),
    execute: (...args: unknown[]) => currentDb.execute(...args),
  }),
}));

async function getBookingApp() {
  const mod = await import('../../src/routes/booking');
  const app = new Hono<{ Bindings: Env; Variables: Variables }>();
  app.route('/api/booking', mod.default);
  return app;
}

beforeEach(() => {
  currentDb = {
    select: vi.fn(() => selectChain([])),
    insert: vi.fn(() => insertChain([])),
    update: vi.fn(() => updateChain([])),
    delete: vi.fn(() => updateChain([])),
    transaction: vi.fn(),
    execute: vi.fn(),
  };
});

describe('GET /api/booking/services', () => {
  it('returns paginated active services', async () => {
    currentDb.select = vi.fn()
      .mockReturnValueOnce(selectChain([{ total: 2 }]))
      .mockReturnValueOnce(selectChain([
        { id: 's1', name: 'Cut', isActive: true, durationMinutes: 30, price: '50.00' },
        { id: 's2', name: 'Beard', isActive: true, durationMinutes: 45, price: '40.00' },
      ]));

    const app = await getBookingApp();
    const res = await app.request('/api/booking/services', {}, makeMockEnv());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(2);
  });

  it('returns empty array when no services are active', async () => {
    currentDb.select = vi.fn()
      .mockReturnValueOnce(selectChain([{ total: 0 }]))
      .mockReturnValueOnce(selectChain([]));

    const app = await getBookingApp();
    const res = await app.request('/api/booking/services', {}, makeMockEnv());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual([]);
    expect(body.pages).toBe(0);
  });
});

describe('GET /api/booking/availability', () => {
  it('returns 400 when date is in the wrong format', async () => {
    const app = await getBookingApp();
    const res = await app.request('/api/booking/availability?date=not-a-date&serviceId=00000000-0000-0000-0000-000000000000', {}, makeMockEnv());
    expect(res.status).toBe(400);
  });

  it('returns 400 when serviceId is not a UUID', async () => {
    const app = await getBookingApp();
    const res = await app.request('/api/booking/availability?date=2026-06-01&serviceId=nope', {}, makeMockEnv());
    expect(res.status).toBe(400);
  });

  it('returns 404 when serviceId does not exist', async () => {
    currentDb.select = vi.fn()
      .mockReturnValueOnce(selectChain([])) // slots
      .mockReturnValueOnce(selectChain([])); // service lookup (empty)

    const app = await getBookingApp();
    const res = await app.request(
      '/api/booking/availability?date=2026-06-01&serviceId=00000000-0000-0000-0000-000000000000',
      {},
      makeMockEnv(),
    );
    expect(res.status).toBe(404);
  });

  it('returns availability slots when service exists', async () => {
    currentDb.select = vi.fn()
      .mockReturnValueOnce(selectChain([
        { id: 'slot1', dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isActive: true },
      ]))
      .mockReturnValueOnce(selectChain([
        { id: 's1', name: 'Cut', durationMinutes: 30, price: '50.00' },
      ]))
      .mockReturnValueOnce(selectChain([])); // no existing appointments

    const app = await getBookingApp();
    // 2026-06-01 was a Monday so dayOfWeek=1 matches
    const res = await app.request(
      '/api/booking/availability?date=2026-06-01&serviceId=00000000-0000-0000-0000-000000000000',
      {},
      makeMockEnv(),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.date).toBe('2026-06-01');
    expect(Array.isArray(body.availableSlots)).toBe(true);
    expect(body.availableSlots.length).toBeGreaterThan(0);
  });
});

describe('Booking auth gates', () => {
  it('POST /appointments rejects unauthenticated request', async () => {
    const app = await getBookingApp();
    const res = await app.request('/api/booking/appointments', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        serviceId: '00000000-0000-0000-0000-000000000000',
        scheduledAt: new Date().toISOString(),
      }),
    }, makeMockEnv());
    expect(res.status).toBe(401);
  });

  it('GET /appointments rejects unauthenticated request', async () => {
    const app = await getBookingApp();
    const res = await app.request('/api/booking/appointments', {}, makeMockEnv());
    expect(res.status).toBe(401);
  });

  it('PATCH /appointments/:id/cancel rejects unauthenticated request', async () => {
    const app = await getBookingApp();
    const res = await app.request('/api/booking/appointments/00000000-0000-0000-0000-000000000000/cancel', {
      method: 'PATCH',
    }, makeMockEnv());
    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/booking/appointments/:id/cancel', () => {
  it('returns 404 when the appointment does not exist for this user', async () => {
    currentDb.update = vi.fn().mockReturnValueOnce(updateChain([])); // no rows matched

    const token = await createToken(
      { userId: 'u1', email: 'a@b.com', role: 'client' },
      TEST_JWT_SECRET,
    );
    const app = await getBookingApp();
    const res = await app.request(
      '/api/booking/appointments/00000000-0000-0000-0000-000000000000/cancel',
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      },
      makeMockEnv(),
    );

    expect(res.status).toBe(404);
  });

  it('cancels the appointment and returns the updated record', async () => {
    const cancelled = {
      id: 'appt-1', userId: 'u1', status: 'cancelled', updatedAt: new Date(),
    };
    currentDb.update = vi.fn().mockReturnValueOnce(updateChain([cancelled]));
    currentDb.insert = vi.fn().mockReturnValueOnce(insertChain([{ id: 'log-1' }]));

    const token = await createToken(
      { userId: 'u1', email: 'a@b.com', role: 'client' },
      TEST_JWT_SECRET,
    );
    const app = await getBookingApp();
    const res = await app.request(
      '/api/booking/appointments/appt-1/cancel',
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      },
      makeMockEnv(),
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.appointment.status).toBe('cancelled');
  });
});
