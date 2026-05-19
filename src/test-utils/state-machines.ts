/**
 * Pure-function extractions of state-machine logic that lives inline inside
 * route handlers. These mirror the production behaviour so tests can assert
 * on transitions without spinning up a database. When a route is refactored
 * to extract its state machine, that route should call these helpers
 * directly so the test suite tracks reality.
 */

// ─── Appointment state machine ───
// Mirrors the appointmentStatusEnum + the admin PATCH route + cancel route
// in src/routes/booking.ts + src/routes/admin-booking.ts.
//
// Allowed transitions (per UX requirements; not enforced server-side today —
// see BLOCKED note in test file for the gap):
//
//   pending     → confirmed, cancelled, no_show
//   confirmed   → in_progress, completed, cancelled, no_show
//   in_progress → completed, cancelled
//   completed   → (terminal)
//   cancelled   → (terminal)
//   no_show     → (terminal)
export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

const APPOINTMENT_ALLOWED: Record<AppointmentStatus, ReadonlySet<AppointmentStatus>> = {
  pending: new Set(['confirmed', 'cancelled', 'no_show']),
  confirmed: new Set(['in_progress', 'completed', 'cancelled', 'no_show']),
  in_progress: new Set(['completed', 'cancelled']),
  completed: new Set(),
  cancelled: new Set(),
  no_show: new Set(),
};

export function canTransitionAppointment(from: AppointmentStatus, to: AppointmentStatus): boolean {
  return APPOINTMENT_ALLOWED[from]?.has(to) ?? false;
}

export function appointmentTransition(
  from: AppointmentStatus,
  to: AppointmentStatus,
  now: Date,
): { ok: true; patch: { status: AppointmentStatus; completedAt?: Date } } | { ok: false; reason: string } {
  if (!canTransitionAppointment(from, to)) {
    return { ok: false, reason: `Invalid transition: ${from} → ${to}` };
  }

  const patch: { status: AppointmentStatus; completedAt?: Date } = { status: to };
  if (to === 'completed') patch.completedAt = now;
  return { ok: true, patch };
}

// ─── Slot overlap (for availability collisions) ───
export interface BookingWindow {
  scheduledAt: Date;
  endAt: Date;
}

export function isOverlapping(a: BookingWindow, b: BookingWindow): boolean {
  return a.scheduledAt < b.endAt && a.endAt > b.scheduledAt;
}

export function findCollision(
  candidate: BookingWindow,
  existing: BookingWindow[],
): BookingWindow | null {
  return existing.find((slot) => isOverlapping(candidate, slot)) ?? null;
}

// ─── Order state machine (Stream 2: The Vault) ───
// Mirrors orderStatusEnum + webhooks.ts:
//   pending     → paid (on checkout.session.completed)
//   pending     → cancelled (on payment_intent.payment_failed)
//   paid        → processing/shipped/delivered (manual)
//   paid        → refunded (on charge.refunded)
//   delivered   → refunded (still possible; not a terminal restriction)
//   cancelled   → (terminal)
//   refunded    → (terminal)
export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'refunded'
  | 'cancelled';

const ORDER_ALLOWED: Record<OrderStatus, ReadonlySet<OrderStatus>> = {
  pending: new Set(['paid', 'cancelled']),
  paid: new Set(['processing', 'shipped', 'refunded']),
  processing: new Set(['shipped', 'refunded']),
  shipped: new Set(['delivered', 'refunded']),
  delivered: new Set(['refunded']),
  refunded: new Set(),
  cancelled: new Set(),
};

export function canTransitionOrder(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_ALLOWED[from]?.has(to) ?? false;
}

// ─── Stripe subscription status mapping ───
// Mirrors the logic in webhooks.ts (customer.subscription.updated).
// Stripe's `status` field has more variants than our DB enum, so the webhook
// folds them down. `cancel_at_period_end=true` overrides everything else
// because the user's intent is "stop billing me at period end".
export type StripeSubStatus =
  | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'paused';
export type LocalSubStatus = 'active' | 'past_due' | 'cancelled' | 'paused';

export function mapStripeSubscriptionStatus(
  stripeStatus: StripeSubStatus,
  cancelAtPeriodEnd: boolean,
): LocalSubStatus {
  if (cancelAtPeriodEnd) return 'cancelled';
  if (stripeStatus === 'active') return 'active';
  if (stripeStatus === 'past_due') return 'past_due';
  if (stripeStatus === 'paused') return 'paused';
  // Stripe's `canceled` (one l) → our `cancelled` (UK spelling)
  if (stripeStatus === 'canceled' || stripeStatus === 'incomplete_expired' || stripeStatus === 'unpaid') {
    return 'cancelled';
  }
  // Treat trialing / incomplete as active for our purposes (user has access).
  return 'active';
}

// ─── Coupon validity ───
// Mirrors the validation logic in src/routes/store.ts POST /validate-coupon
// and the inline pre-application check in POST /orders.
export interface CouponLike {
  isActive: boolean;
  expiresAt: Date | string | null;
  maxUses: number | null;
  currentUses: number | string | null;
  minPurchase: number | string | null;
  appliesToStream: string | null;
}

export interface CouponValidationInput {
  coupon: CouponLike | null;
  stream?: 'store' | 'courses' | 'events';
  subtotal?: number;
  now?: Date;
}

export type CouponValidationResult =
  | { valid: true }
  | { valid: false; reason: 'NOT_FOUND' | 'EXPIRED' | 'EXHAUSTED' | 'WRONG_STREAM' | 'BELOW_MIN_PURCHASE' };

export function validateCoupon(input: CouponValidationInput): CouponValidationResult {
  const { coupon, stream, subtotal, now = new Date() } = input;
  if (!coupon || !coupon.isActive) return { valid: false, reason: 'NOT_FOUND' };
  if (coupon.expiresAt && new Date(coupon.expiresAt) < now) return { valid: false, reason: 'EXPIRED' };
  if (coupon.maxUses && Number(coupon.currentUses ?? 0) >= coupon.maxUses) {
    return { valid: false, reason: 'EXHAUSTED' };
  }
  if (
    stream &&
    coupon.appliesToStream &&
    coupon.appliesToStream !== 'all' &&
    coupon.appliesToStream !== stream
  ) {
    return { valid: false, reason: 'WRONG_STREAM' };
  }
  if (
    coupon.minPurchase &&
    subtotal !== undefined &&
    subtotal < Number(coupon.minPurchase)
  ) {
    return { valid: false, reason: 'BELOW_MIN_PURCHASE' };
  }
  return { valid: true };
}

// ─── Event capacity ───
// Mirrors src/routes/events.ts POST /:slug/register capacity check.
export function isEventAtCapacity(event: { maxAttendees: number | null; currentAttendees: number | null }) {
  if (!event.maxAttendees) return false;
  return (event.currentAttendees ?? 0) >= event.maxAttendees;
}
