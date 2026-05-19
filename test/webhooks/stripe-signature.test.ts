import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { signStripeWebhook } from '../__fixtures__/stripe/sign';
import { makeMockEnv } from '../../src/test-utils/mock-env';
import type { Env, Variables } from '../../src/types/env';

// Each Stripe HMAC verification step is a couple hundred ms in Worker crypto;
// give the suite a generous budget.
const TEST_TIMEOUT = 30_000;

/**
 * Tests for the Stripe webhook signature / idempotency guard. We mock the
 * DB module so an unknown event type that falls through to
 * `markStripeEventProcessed` does not actually touch Postgres.
 *
 * Each route-level test mounts the real `webhooks` router after vi.mock
 * has stubbed `createDb` and `drizzle-orm`. This pattern keeps the route
 * code under test while avoiding Hyperdrive/Neon dependencies.
 */

vi.mock('../../src/db', () => ({
  createDb: () => {
    // Return a no-op stub that proxies every chained call. The signature-
    // test path doesn't actually hit any of these methods, but we provide a
    // chainable thenable just in case the handler grows new code paths.
    const noop: any = new Proxy(() => noop, {
      get: (_target, prop) => {
        if (prop === 'then') return undefined; // not thenable
        return noop;
      },
      apply: () => noop,
    });
    return noop;
  },
}));

const STRIPE_WEBHOOK_SECRET = 'whsec_test_signature_secret';

async function getWebhooksApp() {
  // Import dynamically so vi.mock above takes effect first.
  const mod = await import('../../src/routes/webhooks');
  const app = new Hono<{ Bindings: Env; Variables: Variables }>();
  app.route('/api/webhooks', mod.default);
  return app;
}

function envWithSecret(): Env {
  return makeMockEnv({ STRIPE_WEBHOOK_SECRET });
}

describe('Stripe webhook signature handling', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns 400 when stripe-signature header is missing', async () => {
    const app = await getWebhooksApp();
    const res = await app.request('/api/webhooks/stripe', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: 'evt_x', type: 'ping' }),
    }, envWithSecret());

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Missing Stripe signature');
  }, TEST_TIMEOUT);

  it('returns 400 when signature does not verify against the secret', async () => {
    const app = await getWebhooksApp();
    const res = await app.request('/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'stripe-signature': 't=1700000000,v1=deadbeef',
      },
      body: JSON.stringify({ id: 'evt_invalid', type: 'ping' }),
    }, envWithSecret());

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid Stripe webhook signature');
  }, TEST_TIMEOUT);

  it('returns 400 when signature was computed with the wrong secret', async () => {
    const app = await getWebhooksApp();
    const payload = JSON.stringify({ id: 'evt_wrong', type: 'ping' });
    const wrongSig = await signStripeWebhook(payload, 'whsec_DIFFERENT_secret');

    const res = await app.request('/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'stripe-signature': wrongSig,
      },
      body: payload,
    }, envWithSecret());

    expect(res.status).toBe(400);
  }, TEST_TIMEOUT);

  it('accepts a valid signature on an unknown event type (200 received)', async () => {
    const app = await getWebhooksApp();
    const payload = JSON.stringify({
      id: 'evt_unknown_type_001',
      object: 'event',
      type: 'some.event.type.we.do.not.handle',
      created: Math.floor(Date.now() / 1000),
      api_version: '2024-09-30',
      data: { object: {} },
      livemode: false,
      pending_webhooks: 0,
      request: { id: null, idempotency_key: null },
    });
    const sig = await signStripeWebhook(payload, STRIPE_WEBHOOK_SECRET);

    const res = await app.request('/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'stripe-signature': sig,
      },
      body: payload,
    }, envWithSecret());

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.received).toBe(true);
  }, TEST_TIMEOUT);

  it('short-circuits on a duplicate event ID (idempotency guard)', async () => {
    const env = envWithSecret();
    const app = await getWebhooksApp();

    const payload = JSON.stringify({
      id: 'evt_duplicate_001',
      object: 'event',
      type: 'some.event.type.we.do.not.handle',
      created: Math.floor(Date.now() / 1000),
      api_version: '2024-09-30',
      data: { object: {} },
      livemode: false,
      pending_webhooks: 0,
      request: { id: null, idempotency_key: null },
    });
    const sig = await signStripeWebhook(payload, STRIPE_WEBHOOK_SECRET);
    const headers = { 'content-type': 'application/json', 'stripe-signature': sig };

    const first = await app.request('/api/webhooks/stripe', { method: 'POST', headers, body: payload }, env);
    expect(first.status).toBe(200);
    const firstBody = await first.json();
    expect(firstBody.duplicate).toBeUndefined();

    // Same payload → same event.id → idempotent
    const second = await app.request('/api/webhooks/stripe', { method: 'POST', headers, body: payload }, env);
    expect(second.status).toBe(200);
    const secondBody = await second.json();
    expect(secondBody.duplicate).toBe(true);
  }, TEST_TIMEOUT);
});
