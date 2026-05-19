import { describe, expect, it } from 'vitest';
import { isEventAtCapacity } from '../../src/test-utils/state-machines';

/**
 * Event capacity is checked at two points:
 *   1. POST /api/events/:slug/register — pre-checkout, returns 409 if full
 *   2. POST /api/webhooks/stripe checkout.session.completed — last-mile guard
 *      to avoid double-counting attendees while a checkout is in flight.
 */

describe('isEventAtCapacity', () => {
  it('returns false when maxAttendees is null (uncapped event)', () => {
    expect(isEventAtCapacity({ maxAttendees: null, currentAttendees: 1000 })).toBe(false);
  });

  it('returns false when there is still room', () => {
    expect(isEventAtCapacity({ maxAttendees: 50, currentAttendees: 49 })).toBe(false);
    expect(isEventAtCapacity({ maxAttendees: 50, currentAttendees: 0 })).toBe(false);
  });

  it('returns true when current attendees == max attendees', () => {
    expect(isEventAtCapacity({ maxAttendees: 50, currentAttendees: 50 })).toBe(true);
  });

  it('returns true when current attendees > max attendees (overshoot defensive)', () => {
    expect(isEventAtCapacity({ maxAttendees: 50, currentAttendees: 51 })).toBe(true);
  });

  it('treats null currentAttendees as 0', () => {
    expect(isEventAtCapacity({ maxAttendees: 1, currentAttendees: null })).toBe(false);
  });
});
