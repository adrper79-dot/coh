import { describe, expect, it } from 'vitest';
import { mapStripeSubscriptionStatus } from '../../src/test-utils/state-machines';

/**
 * The webhook handler folds Stripe's status field (more variants than our
 * enum) down to one of: 'active' | 'past_due' | 'cancelled' | 'paused'.
 *
 * Critical rule: `cancel_at_period_end=true` always wins over `status='active'`
 * because the customer has expressed intent to stop billing. Without this,
 * we'd incorrectly mark a soon-to-cancel subscription as active and downgrade
 * membership prematurely.
 */

describe('mapStripeSubscriptionStatus', () => {
  it('maps active → active', () => {
    expect(mapStripeSubscriptionStatus('active', false)).toBe('active');
  });

  it('maps past_due → past_due', () => {
    expect(mapStripeSubscriptionStatus('past_due', false)).toBe('past_due');
  });

  it('maps canceled (Stripe) → cancelled (UK spelling, our enum)', () => {
    expect(mapStripeSubscriptionStatus('canceled', false)).toBe('cancelled');
  });

  it('maps paused → paused', () => {
    expect(mapStripeSubscriptionStatus('paused', false)).toBe('paused');
  });

  it('treats trialing as active (user has access)', () => {
    expect(mapStripeSubscriptionStatus('trialing', false)).toBe('active');
  });

  it('treats incomplete_expired as cancelled (no longer recoverable)', () => {
    expect(mapStripeSubscriptionStatus('incomplete_expired', false)).toBe('cancelled');
  });

  it('treats unpaid as cancelled', () => {
    expect(mapStripeSubscriptionStatus('unpaid', false)).toBe('cancelled');
  });

  it('cancel_at_period_end overrides active', () => {
    expect(mapStripeSubscriptionStatus('active', true)).toBe('cancelled');
  });

  it('cancel_at_period_end overrides past_due', () => {
    expect(mapStripeSubscriptionStatus('past_due', true)).toBe('cancelled');
  });

  it('cancel_at_period_end overrides trialing', () => {
    expect(mapStripeSubscriptionStatus('trialing', true)).toBe('cancelled');
  });
});
