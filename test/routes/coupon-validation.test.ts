import { describe, expect, it } from 'vitest';
import { validateCoupon, type CouponLike } from '../../src/test-utils/state-machines';

/**
 * Coupon validity logic mirrors POST /api/store/validate-coupon and the
 * inline pre-application check in POST /api/store/orders.
 */

const baseCoupon = (overrides: Partial<CouponLike> = {}): CouponLike => ({
  isActive: true,
  expiresAt: null,
  maxUses: null,
  currentUses: 0,
  minPurchase: null,
  appliesToStream: 'all',
  ...overrides,
});

describe('validateCoupon', () => {
  it('returns valid for an active, unbounded coupon', () => {
    expect(validateCoupon({ coupon: baseCoupon() })).toEqual({ valid: true });
  });

  it('returns NOT_FOUND when coupon is null', () => {
    expect(validateCoupon({ coupon: null })).toEqual({
      valid: false,
      reason: 'NOT_FOUND',
    });
  });

  it('returns NOT_FOUND when coupon is inactive', () => {
    expect(validateCoupon({ coupon: baseCoupon({ isActive: false }) })).toEqual({
      valid: false,
      reason: 'NOT_FOUND',
    });
  });

  it('returns EXPIRED when expiresAt is in the past', () => {
    const past = new Date('2020-01-01T00:00:00Z');
    expect(validateCoupon({
      coupon: baseCoupon({ expiresAt: past }),
      now: new Date('2026-06-01'),
    })).toEqual({ valid: false, reason: 'EXPIRED' });
  });

  it('returns valid when expiresAt is in the future', () => {
    const future = new Date('2030-01-01T00:00:00Z');
    expect(validateCoupon({
      coupon: baseCoupon({ expiresAt: future }),
      now: new Date('2026-06-01'),
    })).toEqual({ valid: true });
  });

  it('returns EXHAUSTED when currentUses >= maxUses', () => {
    expect(validateCoupon({
      coupon: baseCoupon({ maxUses: 5, currentUses: 5 }),
    })).toEqual({ valid: false, reason: 'EXHAUSTED' });

    expect(validateCoupon({
      coupon: baseCoupon({ maxUses: 5, currentUses: 99 }),
    })).toEqual({ valid: false, reason: 'EXHAUSTED' });
  });

  it('returns valid when currentUses < maxUses', () => {
    expect(validateCoupon({
      coupon: baseCoupon({ maxUses: 5, currentUses: 4 }),
    })).toEqual({ valid: true });
  });

  it('returns WRONG_STREAM when stream-scoped coupon used elsewhere', () => {
    expect(validateCoupon({
      coupon: baseCoupon({ appliesToStream: 'courses' }),
      stream: 'store',
    })).toEqual({ valid: false, reason: 'WRONG_STREAM' });
  });

  it('returns valid when stream matches or coupon applies to all', () => {
    expect(validateCoupon({
      coupon: baseCoupon({ appliesToStream: 'store' }),
      stream: 'store',
    })).toEqual({ valid: true });

    expect(validateCoupon({
      coupon: baseCoupon({ appliesToStream: 'all' }),
      stream: 'store',
    })).toEqual({ valid: true });
  });

  it('returns BELOW_MIN_PURCHASE when subtotal is below threshold', () => {
    expect(validateCoupon({
      coupon: baseCoupon({ minPurchase: '50' }),
      subtotal: 25,
    })).toEqual({ valid: false, reason: 'BELOW_MIN_PURCHASE' });
  });

  it('returns valid when subtotal meets the minimum', () => {
    expect(validateCoupon({
      coupon: baseCoupon({ minPurchase: 50 }),
      subtotal: 50,
    })).toEqual({ valid: true });

    expect(validateCoupon({
      coupon: baseCoupon({ minPurchase: 50 }),
      subtotal: 75,
    })).toEqual({ valid: true });
  });

  it('handles numeric strings in currentUses / minPurchase (Drizzle decimals)', () => {
    expect(validateCoupon({
      coupon: baseCoupon({ maxUses: 10, currentUses: '7' as unknown as number }),
    })).toEqual({ valid: true });
    expect(validateCoupon({
      coupon: baseCoupon({ maxUses: 10, currentUses: '10' as unknown as number }),
    })).toEqual({ valid: false, reason: 'EXHAUSTED' });
  });
});
