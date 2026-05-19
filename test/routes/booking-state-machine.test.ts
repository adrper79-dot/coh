import { describe, expect, it } from 'vitest';
import {
  canTransitionAppointment,
  appointmentTransition,
  findCollision,
  isOverlapping,
  type BookingWindow,
} from '../../src/test-utils/state-machines';

/**
 * The booking state-machine helper in src/test-utils/state-machines.ts mirrors
 * the UX-level transitions for appointments. The current admin PATCH handler
 * does NOT enforce these transitions server-side (see TODO in PR body); these
 * tests pin the desired semantics so a follow-up PR can wire them up.
 */

describe('canTransitionAppointment', () => {
  it('allows pending → confirmed (happy path)', () => {
    expect(canTransitionAppointment('pending', 'confirmed')).toBe(true);
  });

  it('allows confirmed → completed', () => {
    expect(canTransitionAppointment('confirmed', 'completed')).toBe(true);
  });

  it('allows any-state → cancelled (except terminal states)', () => {
    expect(canTransitionAppointment('pending', 'cancelled')).toBe(true);
    expect(canTransitionAppointment('confirmed', 'cancelled')).toBe(true);
    expect(canTransitionAppointment('in_progress', 'cancelled')).toBe(true);
  });

  it('rejects completed → pending (cannot un-complete)', () => {
    expect(canTransitionAppointment('completed', 'pending')).toBe(false);
  });

  it('rejects completed → confirmed (terminal)', () => {
    expect(canTransitionAppointment('completed', 'confirmed')).toBe(false);
  });

  it('rejects cancelled → confirmed (terminal)', () => {
    expect(canTransitionAppointment('cancelled', 'confirmed')).toBe(false);
  });

  it('rejects no_show → in_progress (terminal)', () => {
    expect(canTransitionAppointment('no_show', 'in_progress')).toBe(false);
  });

  it('rejects pending → completed (must confirm first)', () => {
    expect(canTransitionAppointment('pending', 'completed')).toBe(false);
  });

  it('rejects in_progress → pending (cannot rewind)', () => {
    expect(canTransitionAppointment('in_progress', 'pending')).toBe(false);
  });
});

describe('appointmentTransition', () => {
  it('returns { ok: true, patch } on a valid transition', () => {
    const now = new Date('2026-06-01T10:00:00Z');
    const result = appointmentTransition('pending', 'confirmed', now);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.patch.status).toBe('confirmed');
      expect(result.patch.completedAt).toBeUndefined();
    }
  });

  it('sets completedAt when transitioning to completed', () => {
    const now = new Date('2026-06-01T10:00:00Z');
    const result = appointmentTransition('confirmed', 'completed', now);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.patch.status).toBe('completed');
      expect(result.patch.completedAt).toBe(now);
    }
  });

  it('returns { ok: false, reason } for invalid transitions', () => {
    const result = appointmentTransition('completed', 'pending', new Date());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toMatch(/Invalid transition/);
    }
  });
});

describe('isOverlapping (slot collision)', () => {
  const make = (start: string, end: string): BookingWindow => ({
    scheduledAt: new Date(start),
    endAt: new Date(end),
  });

  it('detects an exact overlap', () => {
    const a = make('2026-06-01T10:00:00', '2026-06-01T11:00:00');
    const b = make('2026-06-01T10:00:00', '2026-06-01T11:00:00');
    expect(isOverlapping(a, b)).toBe(true);
  });

  it('detects partial overlap (a starts inside b)', () => {
    const a = make('2026-06-01T10:30:00', '2026-06-01T11:30:00');
    const b = make('2026-06-01T10:00:00', '2026-06-01T11:00:00');
    expect(isOverlapping(a, b)).toBe(true);
  });

  it('detects partial overlap (b starts inside a)', () => {
    const a = make('2026-06-01T10:00:00', '2026-06-01T11:00:00');
    const b = make('2026-06-01T10:30:00', '2026-06-01T11:30:00');
    expect(isOverlapping(a, b)).toBe(true);
  });

  it('treats back-to-back slots as NOT overlapping', () => {
    const a = make('2026-06-01T10:00:00', '2026-06-01T11:00:00');
    const b = make('2026-06-01T11:00:00', '2026-06-01T12:00:00');
    expect(isOverlapping(a, b)).toBe(false);
  });

  it('treats fully disjoint slots as NOT overlapping', () => {
    const a = make('2026-06-01T10:00:00', '2026-06-01T11:00:00');
    const b = make('2026-06-01T14:00:00', '2026-06-01T15:00:00');
    expect(isOverlapping(a, b)).toBe(false);
  });
});

describe('findCollision', () => {
  const make = (start: string, end: string): BookingWindow => ({
    scheduledAt: new Date(start),
    endAt: new Date(end),
  });

  it('returns null when there are no existing bookings', () => {
    const candidate = make('2026-06-01T10:00:00', '2026-06-01T11:00:00');
    expect(findCollision(candidate, [])).toBeNull();
  });

  it('returns null when no existing booking overlaps', () => {
    const candidate = make('2026-06-01T10:00:00', '2026-06-01T11:00:00');
    const existing = [
      make('2026-06-01T09:00:00', '2026-06-01T10:00:00'),
      make('2026-06-01T11:00:00', '2026-06-01T12:00:00'),
    ];
    expect(findCollision(candidate, existing)).toBeNull();
  });

  it('returns the first overlapping window when one exists', () => {
    const candidate = make('2026-06-01T10:30:00', '2026-06-01T11:30:00');
    const conflicting = make('2026-06-01T11:00:00', '2026-06-01T12:00:00');
    const existing = [
      make('2026-06-01T09:00:00', '2026-06-01T10:00:00'),
      conflicting,
    ];
    expect(findCollision(candidate, existing)).toBe(conflicting);
  });
});
