import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { makeMockEnv, TEST_JWT_SECRET } from '../../src/test-utils/mock-env';
import { selectChain, type DbStub } from '../../src/test-utils/db-mock';
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

vi.mock('../../src/utils/email', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/utils/email')>();
  return { ...actual, sendEmail: vi.fn(async () => ({ id: 'mock' })) };
});

async function getEventsApp() {
  const mod = await import('../../src/routes/events');
  const app = new Hono<{ Bindings: Env; Variables: Variables }>();
  app.route('/api/events', mod.default);
  return app;
}

beforeEach(() => {
  currentDb = {
    select: vi.fn(() => selectChain([])),
    insert: vi.fn(() => selectChain([])),
    update: vi.fn(() => selectChain([])),
    delete: vi.fn(() => selectChain([])),
    transaction: vi.fn(),
    execute: vi.fn(),
  };
});

describe('GET /api/events', () => {
  it('returns paginated upcoming events', async () => {
    currentDb.select = vi.fn()
      .mockReturnValueOnce(selectChain([{ total: 1 }]))
      .mockReturnValueOnce(selectChain([
        { id: 'e1', title: 'Webinar', slug: 'webinar-1', type: 'webinar', status: 'scheduled' },
      ]));

    const app = await getEventsApp();
    const res = await app.request('/api/events', {}, makeMockEnv());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
  });
});

describe('GET /api/events/:slug', () => {
  it('returns 404 when event slug does not exist', async () => {
    currentDb.select = vi.fn().mockReturnValueOnce(selectChain([]));
    const app = await getEventsApp();
    const res = await app.request('/api/events/missing', {}, makeMockEnv());
    expect(res.status).toBe(404);
  });

  it('hides meetingUrl for an unauthenticated viewer', async () => {
    const event = {
      id: 'e1', slug: 'public', title: 'Pub', type: 'webinar', status: 'scheduled',
      meetingUrl: 'https://zoom.us/j/12345',
    };
    currentDb.select = vi.fn().mockReturnValueOnce(selectChain([event]));

    const app = await getEventsApp();
    const res = await app.request('/api/events/public', {}, makeMockEnv());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.event.meetingUrl).toBeNull();
    expect(body.registration).toBeNull();
  });

  it('reveals meetingUrl for a registered viewer', async () => {
    const event = {
      id: 'e1', slug: 'public', title: 'Pub', type: 'webinar', status: 'scheduled',
      meetingUrl: 'https://zoom.us/j/12345',
    };
    const reg = { id: 'r1', eventId: 'e1', userId: 'u1' };
    currentDb.select = vi.fn()
      .mockReturnValueOnce(selectChain([event]))
      .mockReturnValueOnce(selectChain([reg]));

    const token = await createToken({ userId: 'u1', email: 'a@b.com', role: 'client' }, TEST_JWT_SECRET);

    const app = await getEventsApp();
    const res = await app.request('/api/events/public', {
      headers: { Authorization: `Bearer ${token}` },
    }, makeMockEnv());

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.event.meetingUrl).toBe('https://zoom.us/j/12345');
    expect(body.registration).not.toBeNull();
  });
});

describe('POST /api/events/:slug/register', () => {
  it('rejects unauthenticated request with 401', async () => {
    const app = await getEventsApp();
    const res = await app.request('/api/events/public/register', {
      method: 'POST',
    }, makeMockEnv());
    expect(res.status).toBe(401);
  });

  it('returns 404 when event slug does not exist', async () => {
    currentDb.select = vi.fn().mockReturnValueOnce(selectChain([]));

    const token = await createToken({ userId: 'u1', email: 'a@b.com', role: 'client' }, TEST_JWT_SECRET);
    const app = await getEventsApp();
    const res = await app.request('/api/events/missing/register', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }, makeMockEnv());

    expect(res.status).toBe(404);
  });

  it('returns 409 when event is at capacity', async () => {
    const event = {
      id: 'e1', slug: 'full', title: 'Full', type: 'webinar', status: 'scheduled',
      maxAttendees: 10, currentAttendees: 10, price: null, scheduledAt: new Date(),
    };
    const user = { id: 'u1', email: 'a@b.com', name: 'A', stripeCustomerId: null, phone: null };
    currentDb.select = vi.fn()
      .mockReturnValueOnce(selectChain([event]))
      .mockReturnValueOnce(selectChain([user]));

    const token = await createToken({ userId: 'u1', email: 'a@b.com', role: 'client' }, TEST_JWT_SECRET);
    const app = await getEventsApp();
    const res = await app.request('/api/events/full/register', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({}),
    }, makeMockEnv());

    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toMatch(/capacity/i);
  });

  it('returns 409 when user is already registered for the event', async () => {
    const event = {
      id: 'e1', slug: 'open', title: 'Open', type: 'webinar', status: 'scheduled',
      maxAttendees: null, currentAttendees: 0, price: null, scheduledAt: new Date(),
    };
    const user = { id: 'u1', email: 'a@b.com', name: 'A', stripeCustomerId: null, phone: null };
    const existing = { id: 'reg-1', eventId: 'e1', userId: 'u1' };

    currentDb.select = vi.fn()
      .mockReturnValueOnce(selectChain([event]))
      .mockReturnValueOnce(selectChain([user]))
      .mockReturnValueOnce(selectChain([existing]));

    const token = await createToken({ userId: 'u1', email: 'a@b.com', role: 'client' }, TEST_JWT_SECRET);
    const app = await getEventsApp();
    const res = await app.request('/api/events/open/register', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({}),
    }, makeMockEnv());

    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toMatch(/Already registered/i);
  });
});

describe('GET /api/events/my/registrations', () => {
  it('requires authentication', async () => {
    const app = await getEventsApp();
    const res = await app.request('/api/events/my/registrations', {}, makeMockEnv());
    expect(res.status).toBe(401);
  });
});
