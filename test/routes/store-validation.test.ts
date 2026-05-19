import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { makeMockEnv } from '../../src/test-utils/mock-env';
import { selectChain, type DbStub } from '../../src/test-utils/db-mock';
import type { Env, Variables } from '../../src/types/env';

/**
 * Store route tests — public paths only. Order-creation requires a Stripe
 * customer + checkout.session.create call, which is covered indirectly by
 * the webhook tests (the "happy" creation path is tested via the
 * checkoutSessionCompletedForOrder fixture).
 */

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

async function getStoreApp() {
  const mod = await import('../../src/routes/store');
  const app = new Hono<{ Bindings: Env; Variables: Variables }>();
  app.route('/api/store', mod.default);
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

describe('GET /api/store/products', () => {
  it('returns paginated products', async () => {
    currentDb.select = vi.fn()
      .mockReturnValueOnce(selectChain([{ total: 2 }]))
      .mockReturnValueOnce(selectChain([
        { id: 'p1', name: 'Oil', slug: 'oil', isActive: true },
        { id: 'p2', name: 'Wax', slug: 'wax', isActive: true },
      ]));

    const app = await getStoreApp();
    const res = await app.request('/api/store/products', {}, makeMockEnv());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(2);
    expect(body.total).toBe(2);
  });

  it('returns empty array when no products exist', async () => {
    currentDb.select = vi.fn()
      .mockReturnValueOnce(selectChain([{ total: 0 }]))
      .mockReturnValueOnce(selectChain([]));

    const app = await getStoreApp();
    const res = await app.request('/api/store/products', {}, makeMockEnv());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual([]);
  });
});

describe('GET /api/store/products/:slug', () => {
  it('returns 404 when product is not found', async () => {
    currentDb.select = vi.fn().mockReturnValueOnce(selectChain([]));
    const app = await getStoreApp();
    const res = await app.request('/api/store/products/missing', {}, makeMockEnv());
    expect(res.status).toBe(404);
  });

  it('returns the product when slug matches', async () => {
    const product = { id: 'p1', slug: 'oil', name: 'Healing Oil' };
    currentDb.select = vi.fn().mockReturnValueOnce(selectChain([product]));

    const app = await getStoreApp();
    const res = await app.request('/api/store/products/oil', {}, makeMockEnv());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.product.slug).toBe('oil');
  });
});

describe('POST /api/store/validate-coupon', () => {
  it('returns 404 when coupon does not exist', async () => {
    currentDb.select = vi.fn().mockReturnValueOnce(selectChain([]));
    const app = await getStoreApp();
    const res = await app.request('/api/store/validate-coupon', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code: 'NOPE' }),
    }, makeMockEnv());

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.valid).toBe(false);
  });

  it('returns 410 when coupon has expired', async () => {
    const past = new Date(Date.now() - 86400 * 1000).toISOString();
    currentDb.select = vi.fn().mockReturnValueOnce(selectChain([
      { code: 'OLD', isActive: true, expiresAt: past, maxUses: null, currentUses: 0, discountType: 'percentage', discountValue: '10', minPurchase: null, description: null, appliesToStream: 'all' },
    ]));

    const app = await getStoreApp();
    const res = await app.request('/api/store/validate-coupon', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code: 'OLD' }),
    }, makeMockEnv());

    expect(res.status).toBe(410);
    const body = await res.json();
    expect(body.error).toMatch(/expired/i);
  });

  it('returns 410 when coupon has reached its usage limit', async () => {
    currentDb.select = vi.fn().mockReturnValueOnce(selectChain([
      { code: 'FULL', isActive: true, expiresAt: null, maxUses: 5, currentUses: 5, discountType: 'percentage', discountValue: '10', minPurchase: null, description: null, appliesToStream: 'all' },
    ]));

    const app = await getStoreApp();
    const res = await app.request('/api/store/validate-coupon', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code: 'FULL' }),
    }, makeMockEnv());

    expect(res.status).toBe(410);
    const body = await res.json();
    expect(body.error).toMatch(/usage limit/i);
  });

  it('returns valid:true for an active coupon', async () => {
    currentDb.select = vi.fn().mockReturnValueOnce(selectChain([
      { code: 'WELCOME', isActive: true, expiresAt: null, maxUses: null, currentUses: 0, discountType: 'percentage', discountValue: '10', minPurchase: '20', description: 'Welcome', appliesToStream: 'all' },
    ]));

    const app = await getStoreApp();
    const res = await app.request('/api/store/validate-coupon', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code: 'WELCOME' }),
    }, makeMockEnv());

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.valid).toBe(true);
    expect(body.code).toBe('WELCOME');
  });

  it('returns 422 when coupon is scoped to a different stream', async () => {
    currentDb.select = vi.fn().mockReturnValueOnce(selectChain([
      { code: 'COURSES10', isActive: true, expiresAt: null, maxUses: null, currentUses: 0, discountType: 'percentage', discountValue: '10', minPurchase: null, description: null, appliesToStream: 'courses' },
    ]));

    const app = await getStoreApp();
    const res = await app.request('/api/store/validate-coupon', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code: 'COURSES10', stream: 'store' }),
    }, makeMockEnv());

    expect(res.status).toBe(422);
  });
});

describe('Store auth gate', () => {
  it('GET /orders requires authentication', async () => {
    const app = await getStoreApp();
    const res = await app.request('/api/store/orders', {}, makeMockEnv());
    expect(res.status).toBe(401);
  });

  it('POST /orders requires authentication', async () => {
    const app = await getStoreApp();
    const res = await app.request('/api/store/orders', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ items: [{ productId: '00000000-0000-0000-0000-000000000000', quantity: 1 }] }),
    }, makeMockEnv());
    expect(res.status).toBe(401);
  });
});
