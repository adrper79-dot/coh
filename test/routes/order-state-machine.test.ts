import { describe, expect, it } from 'vitest';
import { canTransitionOrder } from '../../src/test-utils/state-machines';

/**
 * Order state-machine. Mirrors orderStatusEnum in src/db/schema.ts +
 * the inline updates in src/routes/webhooks.ts.
 *
 * Not enforced server-side today — see PR body for tracking.
 */

describe('canTransitionOrder', () => {
  it('allows pending → paid (Stripe checkout.session.completed)', () => {
    expect(canTransitionOrder('pending', 'paid')).toBe(true);
  });

  it('allows pending → cancelled (Stripe payment_intent.payment_failed)', () => {
    expect(canTransitionOrder('pending', 'cancelled')).toBe(true);
  });

  it('allows paid → refunded (Stripe charge.refunded)', () => {
    expect(canTransitionOrder('paid', 'refunded')).toBe(true);
  });

  it('allows the fulfillment chain paid → processing → shipped → delivered', () => {
    expect(canTransitionOrder('paid', 'processing')).toBe(true);
    expect(canTransitionOrder('processing', 'shipped')).toBe(true);
    expect(canTransitionOrder('shipped', 'delivered')).toBe(true);
  });

  it('allows refunds from any fulfillment stage', () => {
    expect(canTransitionOrder('processing', 'refunded')).toBe(true);
    expect(canTransitionOrder('shipped', 'refunded')).toBe(true);
    expect(canTransitionOrder('delivered', 'refunded')).toBe(true);
  });

  it('rejects cancelled → paid (terminal state)', () => {
    expect(canTransitionOrder('cancelled', 'paid')).toBe(false);
  });

  it('rejects refunded → paid (terminal state)', () => {
    expect(canTransitionOrder('refunded', 'paid')).toBe(false);
  });

  it('rejects shipped → pending (cannot rewind)', () => {
    expect(canTransitionOrder('shipped', 'pending')).toBe(false);
  });

  it('rejects pending → shipped (must take payment first)', () => {
    expect(canTransitionOrder('pending', 'shipped')).toBe(false);
  });
});
