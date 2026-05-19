/**
 * Hand-rolled Stripe event fixtures for webhook tests. These are NOT the
 * full Stripe schema — just the minimum shape our handler reads. Keep in
 * sync with src/routes/webhooks.ts as the handler grows.
 */
import type Stripe from 'stripe';

function baseEvent<T extends string, D>(
  type: T,
  data: D,
  overrides: Partial<Stripe.Event> = {},
): Stripe.Event {
  return {
    id: overrides.id ?? `evt_${Math.random().toString(36).slice(2, 12)}`,
    object: 'event',
    api_version: '2024-09-30',
    created: Math.floor(Date.now() / 1000),
    data: { object: data as unknown as Record<string, unknown>, previous_attributes: undefined },
    livemode: false,
    pending_webhooks: 0,
    request: { id: null, idempotency_key: null },
    type,
    ...overrides,
  } as unknown as Stripe.Event;
}

export function checkoutSessionCompletedForOrder(orderId: string, userId: string, paymentIntentId = 'pi_test_123') {
  return baseEvent('checkout.session.completed', {
    id: 'cs_test_order_001',
    object: 'checkout.session',
    payment_intent: paymentIntentId,
    amount_total: 4999, // $49.99
    metadata: { orderId, userId },
    mode: 'payment',
  });
}

export function checkoutSessionCompletedForAppointment(appointmentId: string, userId: string) {
  return baseEvent('checkout.session.completed', {
    id: 'cs_test_appt_001',
    object: 'checkout.session',
    payment_intent: 'pi_appt_001',
    amount_total: 5000,
    metadata: { appointmentId, userId },
    mode: 'payment',
  });
}

export function checkoutSessionCompletedForCourse(courseId: string, userId: string, courseSlug = 'restoration-101') {
  return baseEvent('checkout.session.completed', {
    id: 'cs_test_course_001',
    object: 'checkout.session',
    payment_intent: 'pi_course_001',
    amount_total: 19900,
    metadata: { courseId, userId, courseSlug },
    mode: 'payment',
  });
}

export function checkoutSessionCompletedForSubscription(
  subscriptionId: string,
  userId: string,
  planId: string,
  planTier: 'vip' | 'inner_circle' = 'vip',
) {
  return baseEvent('checkout.session.completed', {
    id: 'cs_test_sub_001',
    object: 'checkout.session',
    subscription: subscriptionId,
    metadata: { userId, planId, planTier },
    mode: 'subscription',
    payment_intent: null,
    amount_total: 0,
  });
}

export function chargeRefunded(paymentIntentId: string, amountRefunded = 4999) {
  return baseEvent('charge.refunded', {
    id: 'ch_test_001',
    object: 'charge',
    payment_intent: paymentIntentId,
    amount_refunded: amountRefunded,
    refunded: true,
  });
}

export function paymentIntentFailed(paymentIntentId: string, message = 'Card declined') {
  return baseEvent('payment_intent.payment_failed', {
    id: paymentIntentId,
    object: 'payment_intent',
    last_payment_error: { message },
  });
}

export function subscriptionUpdated(
  stripeSubId: string,
  status: Stripe.Subscription.Status = 'active',
  cancelAtPeriodEnd = false,
) {
  return baseEvent('customer.subscription.updated', {
    id: stripeSubId,
    object: 'subscription',
    status,
    cancel_at_period_end: cancelAtPeriodEnd,
    current_period_start: Math.floor(Date.now() / 1000),
    current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
  });
}

export function subscriptionDeleted(stripeSubId: string) {
  return baseEvent('customer.subscription.deleted', {
    id: stripeSubId,
    object: 'subscription',
    status: 'canceled',
  });
}
