// State-machine helpers shared between production route handlers and the
// test suite. Keep these pure (no DB, no env) so they're trivial to assert.

// ─── Appointment state machine ───
// Allowed transitions (src/routes/booking.ts + src/routes/admin-booking.ts):
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
):
  | { ok: true; patch: { status: AppointmentStatus; completedAt?: Date } }
  | { ok: false; reason: string } {
  if (!canTransitionAppointment(from, to)) {
    return { ok: false, reason: `Invalid appointment transition: ${from} → ${to}` };
  }
  const patch: { status: AppointmentStatus; completedAt?: Date } = { status: to };
  if (to === 'completed') patch.completedAt = now;
  return { ok: true, patch };
}

// ─── Stripe subscription status mapping ───
// Stripe's `status` has more variants than our DB enum, so we fold them
// down. `cancel_at_period_end=true` overrides everything else because the
// user's stated intent is "stop billing me at period end".
//
// Stripe's spelling is `canceled` (one l); our DB enum is `cancelled`.
export type StripeSubStatus =
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'paused';

export type LocalSubStatus = 'active' | 'past_due' | 'cancelled' | 'paused';

export function mapStripeSubscriptionStatus(
  stripeStatus: StripeSubStatus | string,
  cancelAtPeriodEnd: boolean,
): LocalSubStatus {
  if (cancelAtPeriodEnd) return 'cancelled';
  if (stripeStatus === 'active') return 'active';
  if (stripeStatus === 'past_due') return 'past_due';
  if (stripeStatus === 'paused') return 'paused';
  if (
    stripeStatus === 'canceled' ||
    stripeStatus === 'incomplete_expired' ||
    stripeStatus === 'unpaid'
  ) {
    return 'cancelled';
  }
  // trialing / incomplete → treat as active (user retains access)
  return 'active';
}
