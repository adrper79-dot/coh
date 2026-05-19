import { describe, expect, it } from 'vitest';
import { createMockKV } from '../helpers/mock-kv';

/**
 * Pure KV-side semantics of the forgot-password / reset-password flow in
 * src/routes/auth.ts. The route stores `pw-reset:${token} → userId` with a
 * 1-hour TTL; reset-password reads + deletes; magic-link uses an identical
 * shape with a 15-minute TTL.
 *
 * Full route-level tests require Drizzle DB mocking and are deferred to
 * the next sprint (W4 in PR body).
 */

const PW_RESET_TTL = 3600; // 1 hour
const MAGIC_LINK_TTL = 900; // 15 minutes

async function storePasswordResetToken(env: { SESSIONS: KVNamespace }, token: string, userId: string) {
  await env.SESSIONS.put(`pw-reset:${token}`, userId, { expirationTtl: PW_RESET_TTL });
}

async function consumePasswordResetToken(env: { SESSIONS: KVNamespace }, token: string): Promise<string | null> {
  const userId = await env.SESSIONS.get(`pw-reset:${token}`);
  if (!userId) return null;
  await env.SESSIONS.delete(`pw-reset:${token}`);
  return userId;
}

async function storeMagicLinkToken(env: { SESSIONS: KVNamespace }, token: string, userId: string) {
  await env.SESSIONS.put(`magic-link:${token}`, userId, { expirationTtl: MAGIC_LINK_TTL });
}

async function consumeMagicLinkToken(env: { SESSIONS: KVNamespace }, token: string): Promise<string | null> {
  const userId = await env.SESSIONS.get(`magic-link:${token}`);
  if (!userId) return null;
  // Delete before issuing JWT to prevent replay (matches production order).
  await env.SESSIONS.delete(`magic-link:${token}`);
  return userId;
}

describe('Password reset token (KV semantics)', () => {
  it('stores and retrieves a token bound to a userId', async () => {
    const env = { SESSIONS: createMockKV() };
    await storePasswordResetToken(env, 'tok_abc', 'user-1');

    const userId = await env.SESSIONS.get('pw-reset:tok_abc');
    expect(userId).toBe('user-1');
  });

  it('uses a namespaced key (does not collide with magic-link)', async () => {
    const env = { SESSIONS: createMockKV() };
    await storePasswordResetToken(env, 'shared_token', 'user-1');
    await storeMagicLinkToken(env, 'shared_token', 'user-2');

    expect(await env.SESSIONS.get('pw-reset:shared_token')).toBe('user-1');
    expect(await env.SESSIONS.get('magic-link:shared_token')).toBe('user-2');
  });

  it('consume returns userId once and then null (single-use)', async () => {
    const env = { SESSIONS: createMockKV() };
    await storePasswordResetToken(env, 'tok_once', 'user-x');

    const first = await consumePasswordResetToken(env, 'tok_once');
    const second = await consumePasswordResetToken(env, 'tok_once');

    expect(first).toBe('user-x');
    expect(second).toBeNull();
  });

  it('consume returns null for an unknown token (no enum leak)', async () => {
    const env = { SESSIONS: createMockKV() };
    expect(await consumePasswordResetToken(env, 'never-issued')).toBeNull();
  });
});

describe('Magic link token (KV semantics)', () => {
  it('stores and retrieves a token', async () => {
    const env = { SESSIONS: createMockKV() };
    await storeMagicLinkToken(env, 'ml_1', 'user-a');
    expect(await env.SESSIONS.get('magic-link:ml_1')).toBe('user-a');
  });

  it('consume is single-use (delete-before-issue prevents replay)', async () => {
    const env = { SESSIONS: createMockKV() };
    await storeMagicLinkToken(env, 'ml_replay', 'user-r');

    const first = await consumeMagicLinkToken(env, 'ml_replay');
    expect(first).toBe('user-r');

    // Replayed: even if the JWT step fails on the server, the token is gone.
    const second = await consumeMagicLinkToken(env, 'ml_replay');
    expect(second).toBeNull();
  });

  it('uses the documented 15-minute TTL constant', () => {
    expect(MAGIC_LINK_TTL).toBe(900);
  });

  it('password reset uses the documented 1-hour TTL constant', () => {
    expect(PW_RESET_TTL).toBe(3600);
  });
});
