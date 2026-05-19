/**
 * Compute a Stripe-compatible webhook signature for test payloads.
 *
 * Stripe signs `${timestamp}.${payload}` with HMAC-SHA256 using the
 * webhook secret and packages it as `t={ts},v1={hex}`. This helper
 * mirrors that format so we can call `stripe.webhooks.constructEventAsync`
 * with a valid signature in tests.
 */

async function hmacSha256(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function signStripeWebhook(
  payload: string,
  secret: string,
  timestampSeconds: number = Math.floor(Date.now() / 1000),
): Promise<string> {
  const signed = `${timestampSeconds}.${payload}`;
  const v1 = await hmacSha256(secret, signed);
  return `t=${timestampSeconds},v1=${v1}`;
}
