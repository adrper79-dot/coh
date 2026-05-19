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

async function getSubsApp() {
  const mod = await import('../../src/routes/subscriptions');
  const app = new Hono<{ Bindings: Env; Variables: Variables }>();
  app.route('/api/subscriptions', mod.default);
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

describe('GET /api/subscriptions/plans', () => {
  it('returns the list of active plans', async () => {
    currentDb.select = vi.fn().mockReturnValueOnce(selectChain([
      { id: 'p1', name: 'VIP', tier: 'vip', monthlyPrice: '29.00', isActive: true },
    ]));

    const app = await getSubsApp();
    const res = await app.request('/api/subscriptions/plans', {}, makeMockEnv());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.plans).toHaveLength(1);
    expect(body.plans[0].tier).toBe('vip');
  });
});

describe('GET /api/subscriptions/my-subscription', () => {
  it('requires authentication', async () => {
    const app = await getSubsApp();
    const res = await app.request('/api/subscriptions/my-subscription', {}, makeMockEnv());
    expect(res.status).toBe(401);
  });

  it('returns null when no active subscription exists', async () => {
    currentDb.select = vi.fn().mockReturnValueOnce(selectChain([]));

    const token = await createToken({ userId: 'u1', email: 'a@b.com', role: 'client' }, TEST_JWT_SECRET);
    const app = await getSubsApp();
    const res = await app.request('/api/subscriptions/my-subscription', {
      headers: { Authorization: `Bearer ${token}` },
    }, makeMockEnv());

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.subscription).toBeNull();
  });

  it('returns the subscription record when one exists', async () => {
    const sub = { id: 's1', userId: 'u1', planId: 'p1', status: 'active', stripeSubscriptionId: 'sub_xyz' };
    currentDb.select = vi.fn().mockReturnValueOnce(selectChain([sub]));

    const token = await createToken({ userId: 'u1', email: 'a@b.com', role: 'client' }, TEST_JWT_SECRET);
    const app = await getSubsApp();
    const res = await app.request('/api/subscriptions/my-subscription', {
      headers: { Authorization: `Bearer ${token}` },
    }, makeMockEnv());

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.subscription.id).toBe('s1');
    expect(body.subscription.stripeSubscriptionId).toBe('sub_xyz');
  });
});

describe('POST /api/subscriptions/subscribe', () => {
  it('requires authentication', async () => {
    const app = await getSubsApp();
    const res = await app.request('/api/subscriptions/subscribe', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ planId: '00000000-0000-0000-0000-000000000000' }),
    }, makeMockEnv());
    expect(res.status).toBe(401);
  });

  it('returns 404 when planId is unknown', async () => {
    currentDb.select = vi.fn().mockReturnValueOnce(selectChain([]));

    const token = await createToken({ userId: 'u1', email: 'a@b.com', role: 'client' }, TEST_JWT_SECRET);
    const app = await getSubsApp();
    const res = await app.request('/api/subscriptions/subscribe', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ planId: '00000000-0000-0000-0000-000000000000' }),
    }, makeMockEnv());

    expect(res.status).toBe(404);
  });

  it('returns 409 when user already has an active subscription', async () => {
    const PLAN_ID = '11111111-1111-1111-1111-111111111111';
    const plan = { id: PLAN_ID, tier: 'vip', stripePriceIdMonthly: 'price_xyz', stripePriceIdAnnual: null };
    const user = { id: 'u1', email: 'a@b.com', name: 'A', stripeCustomerId: 'cus_existing', phone: null };
    const existing = { id: 's1' };

    currentDb.select = vi.fn()
      .mockReturnValueOnce(selectChain([plan]))
      .mockReturnValueOnce(selectChain([user]))
      .mockReturnValueOnce(selectChain([existing]));

    const token = await createToken({ userId: 'u1', email: 'a@b.com', role: 'client' }, TEST_JWT_SECRET);
    const app = await getSubsApp();
    const res = await app.request('/api/subscriptions/subscribe', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ planId: PLAN_ID }),
    }, makeMockEnv());

    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toMatch(/already have an active subscription/i);
  });

  it('returns 422 when the plan is missing the requested Stripe price ID', async () => {
    const PLAN_ID = '22222222-2222-2222-2222-222222222222';
    const plan = { id: PLAN_ID, tier: 'vip', stripePriceIdMonthly: null, stripePriceIdAnnual: null };
    currentDb.select = vi.fn().mockReturnValueOnce(selectChain([plan]));

    const token = await createToken({ userId: 'u1', email: 'a@b.com', role: 'client' }, TEST_JWT_SECRET);
    const app = await getSubsApp();
    const res = await app.request('/api/subscriptions/subscribe', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ planId: PLAN_ID, interval: 'monthly' }),
    }, makeMockEnv());

    expect(res.status).toBe(422);
  });
});

describe('POST /api/subscriptions/cancel', () => {
  it('requires authentication', async () => {
    const app = await getSubsApp();
    const res = await app.request('/api/subscriptions/cancel', {
      method: 'POST',
    }, makeMockEnv());
    expect(res.status).toBe(401);
  });

  it('returns 404 when no active subscription exists', async () => {
    currentDb.select = vi.fn().mockReturnValueOnce(selectChain([]));

    const token = await createToken({ userId: 'u1', email: 'a@b.com', role: 'client' }, TEST_JWT_SECRET);
    const app = await getSubsApp();
    const res = await app.request('/api/subscriptions/cancel', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }, makeMockEnv());

    expect(res.status).toBe(404);
  });
});
