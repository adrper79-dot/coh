/**
 * End-to-end Stripe webhook handler tests using mocked DB + signed payloads.
 *
 * Covers:
 *   - checkout.session.completed → order paid + activityLog written
 *   - checkout.session.completed → enrollment created
 *   - charge.refunded → order marked refunded + access revoked
 *   - payment_intent.payment_failed → order/appointment cancelled
 *   - customer.subscription.deleted → membership downgraded to free
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { signStripeWebhook } from '../__fixtures__/stripe/sign';
import {
  checkoutSessionCompletedForOrder,
  checkoutSessionCompletedForCourse,
  chargeRefunded,
  paymentIntentFailed,
  subscriptionDeleted,
} from '../__fixtures__/stripe/events';
import { makeMockEnv } from '../../src/test-utils/mock-env';
import { selectChain, insertChain, updateChain, type DbStub } from '../../src/test-utils/db-mock';
import type { Env, Variables } from '../../src/types/env';

const STRIPE_WEBHOOK_SECRET = 'whsec_evt_test_secret';
const TEST_TIMEOUT = 30_000;

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
  return { ...actual, sendEmail: vi.fn(async () => ({ id: 'mock-email' })) };
});

async function getWebhooksApp() {
  const mod = await import('../../src/routes/webhooks');
  const app = new Hono<{ Bindings: Env; Variables: Variables }>();
  app.route('/api/webhooks', mod.default);
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

async function postEvent(payload: object, env: Env) {
  const app = await getWebhooksApp();
  const body = JSON.stringify(payload);
  const sig = await signStripeWebhook(body, STRIPE_WEBHOOK_SECRET);
  return app.request('/api/webhooks/stripe', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'stripe-signature': sig },
    body,
  }, env);
}

describe('checkout.session.completed → order paid', () => {
  it('updates the order to status=paid and writes an activity log entry', async () => {
    const env = makeMockEnv({ STRIPE_WEBHOOK_SECRET });
    const event = checkoutSessionCompletedForOrder('order-123', 'user-1');

    const orderRow = { id: 'order-123', userId: 'user-1', status: 'pending' };
    currentDb.select = vi.fn().mockReturnValueOnce(selectChain([orderRow]));
    currentDb.update = vi.fn(() => updateChain([{ ...orderRow, status: 'paid' }]));
    currentDb.insert = vi.fn(() => insertChain([{ id: 'log-1' }]));

    const res = await postEvent(event, env);
    expect(res.status).toBe(200);
    expect(currentDb.update).toHaveBeenCalledTimes(1);
    expect(currentDb.insert).toHaveBeenCalled();
  }, TEST_TIMEOUT);

  it('is a no-op when the order is already paid', async () => {
    const env = makeMockEnv({ STRIPE_WEBHOOK_SECRET });
    const event = checkoutSessionCompletedForOrder('order-already-paid', 'user-1');

    currentDb.select = vi.fn().mockReturnValueOnce(selectChain([
      { id: 'order-already-paid', userId: 'user-1', status: 'paid' },
    ]));

    const res = await postEvent(event, env);
    expect(res.status).toBe(200);
    expect(currentDb.update).not.toHaveBeenCalled();
  }, TEST_TIMEOUT);
});

describe('checkout.session.completed → course enrollment', () => {
  it('creates an enrollment when none exists', async () => {
    const env = makeMockEnv({ STRIPE_WEBHOOK_SECRET });
    const event = checkoutSessionCompletedForCourse('course-1', 'user-2', 'restoration');

    currentDb.select = vi.fn().mockReturnValueOnce(selectChain([])); // no existing enrollment
    const enrollmentInsert = vi.fn(() => insertChain([{ id: 'enroll-1' }]));
    const activityInsert = vi.fn(() => insertChain([{ id: 'log-2' }]));
    let insertCall = 0;
    currentDb.insert = vi.fn(() => {
      insertCall += 1;
      return insertCall === 1 ? enrollmentInsert() : activityInsert();
    });

    const res = await postEvent(event, env);
    expect(res.status).toBe(200);
    expect(currentDb.insert).toHaveBeenCalledTimes(2);
  }, TEST_TIMEOUT);

  it('is a no-op when the user is already enrolled', async () => {
    const env = makeMockEnv({ STRIPE_WEBHOOK_SECRET });
    const event = checkoutSessionCompletedForCourse('course-x', 'user-3');

    currentDb.select = vi.fn().mockReturnValueOnce(selectChain([{ id: 'existing-enroll' }]));

    const res = await postEvent(event, env);
    expect(res.status).toBe(200);
    expect(currentDb.insert).not.toHaveBeenCalled();
  }, TEST_TIMEOUT);
});

describe('charge.refunded', () => {
  it('marks the order as refunded and writes a refund activity log entry', async () => {
    const env = makeMockEnv({ STRIPE_WEBHOOK_SECRET });
    const event = chargeRefunded('pi_test_refund');

    const orderRow = { id: 'o-r', userId: 'u-r' };
    currentDb.select = vi.fn()
      .mockReturnValueOnce(selectChain([orderRow])) // order lookup
      .mockReturnValueOnce(selectChain([])); // no matching appointment

    currentDb.update = vi.fn(() => updateChain([{ ...orderRow, status: 'refunded' }]));
    currentDb.insert = vi.fn(() => insertChain([{ id: 'log-r' }]));

    const res = await postEvent(event, env);
    expect(res.status).toBe(200);
    expect(currentDb.update).toHaveBeenCalledTimes(1);
    expect(currentDb.insert).toHaveBeenCalledTimes(1);
  }, TEST_TIMEOUT);

  it('cancels the appointment when refund maps to an appointment record', async () => {
    const env = makeMockEnv({ STRIPE_WEBHOOK_SECRET });
    const event = chargeRefunded('pi_appt_refund');

    const appt = { id: 'a-r', userId: 'u-r' };
    currentDb.select = vi.fn()
      .mockReturnValueOnce(selectChain([])) // no order match
      .mockReturnValueOnce(selectChain([appt])); // appointment match

    currentDb.update = vi.fn(() => updateChain([{ ...appt, status: 'cancelled' }]));
    currentDb.insert = vi.fn(() => insertChain([{ id: 'log-a' }]));

    const res = await postEvent(event, env);
    expect(res.status).toBe(200);
    expect(currentDb.update).toHaveBeenCalledTimes(1);
  }, TEST_TIMEOUT);
});

describe('payment_intent.payment_failed', () => {
  it('cancels the matching order and writes a payment_failed log entry', async () => {
    const env = makeMockEnv({ STRIPE_WEBHOOK_SECRET });
    const event = paymentIntentFailed('pi_fail_001', 'Insufficient funds');

    const orderRow = { id: 'o-fail', userId: 'u-fail' };
    currentDb.select = vi.fn()
      .mockReturnValueOnce(selectChain([])) // no appointment
      .mockReturnValueOnce(selectChain([orderRow])); // order

    currentDb.update = vi.fn(() => updateChain([{ ...orderRow, status: 'cancelled' }]));
    currentDb.insert = vi.fn(() => insertChain([{ id: 'log-fail' }]));

    const res = await postEvent(event, env);
    expect(res.status).toBe(200);
    expect(currentDb.update).toHaveBeenCalledTimes(1);
  }, TEST_TIMEOUT);
});

describe('customer.subscription.deleted', () => {
  it('marks subscription cancelled and downgrades user membership to free', async () => {
    const env = makeMockEnv({ STRIPE_WEBHOOK_SECRET });
    const event = subscriptionDeleted('sub_del_001');

    const sub = { id: 's-del', userId: 'u-del' };
    currentDb.select = vi.fn().mockReturnValueOnce(selectChain([sub]));
    let updateCall = 0;
    currentDb.update = vi.fn(() => {
      updateCall += 1;
      // Both calls return the updated rows (subscription, user)
      return updateChain([{ id: updateCall === 1 ? 's-del' : 'u-del' }]);
    });
    currentDb.insert = vi.fn(() => insertChain([{ id: 'log-del' }]));

    const res = await postEvent(event, env);
    expect(res.status).toBe(200);
    expect(currentDb.update).toHaveBeenCalledTimes(2); // subscription + user
    expect(currentDb.insert).toHaveBeenCalledTimes(1);
  }, TEST_TIMEOUT);
});

describe('Idempotency replay (full handler path)', () => {
  it('returns duplicate=true on second receipt of same event id', async () => {
    const env = makeMockEnv({ STRIPE_WEBHOOK_SECRET });
    const event = checkoutSessionCompletedForOrder('order-idem', 'u-idem');

    // First call — make sure update succeeds
    const orderRow = { id: 'order-idem', userId: 'u-idem', status: 'pending' };
    currentDb.select = vi.fn().mockReturnValue(selectChain([orderRow]));
    currentDb.update = vi.fn(() => updateChain([{ ...orderRow, status: 'paid' }]));
    currentDb.insert = vi.fn(() => insertChain([{ id: 'log-idem' }]));

    const r1 = await postEvent(event, env);
    expect(r1.status).toBe(200);

    // Second call — should short-circuit before touching DB again
    const updateCallCount = (currentDb.update as ReturnType<typeof vi.fn>).mock.calls.length;
    const r2 = await postEvent(event, env);
    expect(r2.status).toBe(200);
    const body = await r2.json();
    expect(body.duplicate).toBe(true);
    expect((currentDb.update as ReturnType<typeof vi.fn>).mock.calls.length).toBe(updateCallCount);
  }, TEST_TIMEOUT);
});
