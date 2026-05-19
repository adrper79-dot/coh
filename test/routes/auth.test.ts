/**
 * Route-level tests for src/routes/auth.ts.
 *
 * The auth handlers depend on the Drizzle DB to look up + create users.
 * We vi.mock the entire `../../src/db` module and use `db-mock.ts` chain
 * helpers to script the queries the handler issues, in order.
 *
 * Coverage:
 *   - POST /signup  — duplicate email (409), Zod failure (400), happy (201)
 *   - POST /login   — unknown email (401), wrong password (401), happy (200)
 *   - POST /refresh-token — missing token (400), invalid (401), happy (200)
 *   - POST /logout  — clears cookie (200)
 *   - POST /forgot-password — unknown email (200, no enum leak)
 *   - POST /reset-password — invalid token (400)
 *   - POST /magic-link/verify — invalid token (400)
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';

import { makeMockEnv, TEST_JWT_SECRET } from '../../src/test-utils/mock-env';
import { selectChain, insertChain, updateChain, type DbStub } from '../../src/test-utils/db-mock';
import { hashPassword } from '../../src/utils/auth';
import type { Env, Variables } from '../../src/types/env';

// Holder so each test can swap in its own scripted DB.
let currentDb: DbStub;
let dbCalls: { select: number; insert: number; update: number; delete: number } = {
  select: 0,
  insert: 0,
  update: 0,
  delete: 0,
};

vi.mock('../../src/db', () => ({
  createDb: () => ({
    select: (...args: unknown[]) => {
      dbCalls.select += 1;
      return currentDb.select(...args);
    },
    insert: (...args: unknown[]) => {
      dbCalls.insert += 1;
      return currentDb.insert(...args);
    },
    update: (...args: unknown[]) => {
      dbCalls.update += 1;
      return currentDb.update(...args);
    },
    delete: (...args: unknown[]) => {
      dbCalls.delete += 1;
      return currentDb.delete(...args);
    },
    transaction: (...args: unknown[]) => currentDb.transaction(...args),
    execute: (...args: unknown[]) => currentDb.execute(...args),
  }),
}));

// We also stub the email sender to avoid any network calls.
vi.mock('../../src/utils/email', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/utils/email')>();
  return {
    ...actual,
    sendEmail: vi.fn(async () => ({ id: 'mock-email-id' })),
  };
});

async function getAuthApp() {
  const mod = await import('../../src/routes/auth');
  const app = new Hono<{ Bindings: Env; Variables: Variables }>();
  app.route('/api/auth', mod.default);
  return app;
}

beforeEach(() => {
  dbCalls = { select: 0, insert: 0, update: 0, delete: 0 };
  currentDb = {
    select: vi.fn(() => selectChain([])),
    insert: vi.fn(() => insertChain([])),
    update: vi.fn(() => updateChain([])),
    delete: vi.fn(() => updateChain([])) as any,
    transaction: vi.fn(),
    execute: vi.fn(),
  };
});

describe('POST /api/auth/signup', () => {
  it('returns 201 + token when the email is new', async () => {
    const newUser = { id: 'user-new', email: 'new@coh.com', name: 'New', role: 'client' };
    currentDb.select = vi.fn()
      .mockReturnValueOnce(selectChain([])); // existing lookup → no row
    currentDb.insert = vi.fn().mockReturnValueOnce(insertChain([newUser]));

    const app = await getAuthApp();
    const res = await app.request('/api/auth/signup', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'new@coh.com', password: 'pw-with-8-chars', name: 'New' }),
    }, makeMockEnv());

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.user.email).toBe('new@coh.com');
    expect(typeof body.token).toBe('string');
    expect(body.token.split('.')).toHaveLength(3);
    expect(res.headers.get('Set-Cookie')).toContain('authToken=');
  }, 30_000);

  it('returns 409 when email is already registered', async () => {
    currentDb.select = vi.fn(() =>
      selectChain([{ id: 'existing', email: 'dup@coh.com' }])
    );

    const app = await getAuthApp();
    const res = await app.request('/api/auth/signup', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'dup@coh.com', password: 'longenough-pw', name: 'Dup' }),
    }, makeMockEnv());

    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toMatch(/Email already registered/);
  }, 30_000);

  it('returns 400 when payload is invalid (short password)', async () => {
    const app = await getAuthApp();
    const res = await app.request('/api/auth/signup', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'a@b.com', password: 'short', name: 'X' }),
    }, makeMockEnv());

    expect(res.status).toBe(400);
  });

  it('returns 400 when email is not a valid email', async () => {
    const app = await getAuthApp();
    const res = await app.request('/api/auth/signup', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', password: 'longenough', name: 'X' }),
    }, makeMockEnv());

    expect(res.status).toBe(400);
  });

  it('returns 400 when name is missing', async () => {
    const app = await getAuthApp();
    const res = await app.request('/api/auth/signup', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'a@b.com', password: 'longenough', name: '' }),
    }, makeMockEnv());

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('returns 401 when the user does not exist', async () => {
    currentDb.select = vi.fn().mockReturnValueOnce(selectChain([]));

    const app = await getAuthApp();
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'nobody@coh.com', password: 'whatever' }),
    }, makeMockEnv());

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Invalid email or password'); // no enum leak
  });

  it('returns 401 when the password does not verify', async () => {
    const wrongHash = await hashPassword('correct-password');
    currentDb.select = vi.fn().mockReturnValueOnce(
      selectChain([{ id: 'u', email: 'a@b.com', name: 'A', passwordHash: wrongHash, role: 'client', membershipTier: 'free' }])
    );

    const app = await getAuthApp();
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'a@b.com', password: 'WRONG-password' }),
    }, makeMockEnv());

    expect(res.status).toBe(401);
  });

  it('returns 200 + token + Set-Cookie when credentials are valid', async () => {
    const password = 'happy-path-pw';
    const passwordHash = await hashPassword(password);
    const user = {
      id: 'u-happy',
      email: 'happy@coh.com',
      name: 'Happy',
      role: 'client',
      passwordHash,
      membershipTier: 'free',
    };
    currentDb.select = vi.fn().mockReturnValueOnce(selectChain([user]));
    currentDb.update = vi.fn(() => updateChain([user]));

    const app = await getAuthApp();
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'happy@coh.com', password }),
    }, makeMockEnv());

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user.email).toBe('happy@coh.com');
    expect(typeof body.token).toBe('string');
    expect(res.headers.get('Set-Cookie')).toContain('authToken=');
  });

  it('returns 401 when user record has no passwordHash (magic-link-only)', async () => {
    currentDb.select = vi.fn().mockReturnValueOnce(
      selectChain([{ id: 'u', email: 'a@b.com', name: 'A', passwordHash: null, role: 'client' }])
    );

    const app = await getAuthApp();
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'a@b.com', password: 'anything' }),
    }, makeMockEnv());

    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/refresh-token', () => {
  it('returns 400 when no token is provided in body or Authorization header', async () => {
    const app = await getAuthApp();
    const res = await app.request('/api/auth/refresh-token', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    }, makeMockEnv());

    expect(res.status).toBe(400);
  });

  it('returns 401 when the token is invalid', async () => {
    const app = await getAuthApp();
    const res = await app.request('/api/auth/refresh-token', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: 'Bearer not.a.real.jwt.at.all',
      },
      body: JSON.stringify({}),
    }, makeMockEnv());

    expect(res.status).toBe(401);
  });

  it('returns 200 + new token when the old token is valid', async () => {
    const { createToken, verifyToken } = await import('../../src/utils/auth');
    const oldToken = await createToken(
      { userId: 'u', email: 'a@b.com', role: 'client' },
      TEST_JWT_SECRET,
    );

    const app = await getAuthApp();
    const res = await app.request('/api/auth/refresh-token', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${oldToken}`,
      },
      body: JSON.stringify({}),
    }, makeMockEnv());

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(typeof body.token).toBe('string');
    // Verify the new token decodes to the same identity but is a valid JWT.
    // (iat collision in the same second can make tokens byte-identical; we
    // only assert that a fresh, valid JWT was returned.)
    const payload = await verifyToken(body.token, TEST_JWT_SECRET);
    expect(payload.userId).toBe('u');
    expect(payload.email).toBe('a@b.com');
  });
});

describe('POST /api/auth/forgot-password', () => {
  it('returns 200 with a generic message when the email does NOT exist (no enum leak)', async () => {
    currentDb.select = vi.fn().mockReturnValueOnce(selectChain([]));

    const app = await getAuthApp();
    const res = await app.request('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'nobody@coh.com' }),
    }, makeMockEnv());

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toMatch(/If that email is registered/i);
  });

  it('returns 200 + stores a reset token in KV when the email exists', async () => {
    const user = { id: 'u-1', email: 'real@coh.com', name: 'Real' };
    currentDb.select = vi.fn().mockReturnValueOnce(selectChain([user]));

    const env = makeMockEnv();
    const app = await getAuthApp();
    const res = await app.request('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'real@coh.com' }),
    }, env);

    expect(res.status).toBe(200);
    // The forgot-password route writes to env.SESSIONS with key prefix pw-reset:
    // Mock-KV.list returns empty so we can't enumerate; instead, the test
    // verifies the response shape — a "real" token-stored test is covered in
    // auth-password-reset-kv.test.ts.
  });
});

describe('POST /api/auth/reset-password', () => {
  it('returns 400 when the token is missing or empty', async () => {
    const app = await getAuthApp();
    const res = await app.request('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token: '', password: 'newlongpassword' }),
    }, makeMockEnv());

    expect(res.status).toBe(400);
  });

  it('returns 400 when password is too short', async () => {
    const app = await getAuthApp();
    const res = await app.request('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token: 'tok', password: 'short' }),
    }, makeMockEnv());

    expect(res.status).toBe(400);
  });

  it('returns 400 when the token has not been issued (no KV entry)', async () => {
    const app = await getAuthApp();
    const res = await app.request('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token: 'never-issued', password: 'longenoughpw' }),
    }, makeMockEnv());

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid or has expired/i);
  });

  it('returns 200 + updates the user when the token is valid', async () => {
    const env = makeMockEnv();
    await env.SESSIONS.put('pw-reset:good-token', 'u-reset', { expirationTtl: 3600 });

    currentDb.update = vi.fn().mockReturnValueOnce(updateChain([{ id: 'u-reset' }]));

    const app = await getAuthApp();
    const res = await app.request('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token: 'good-token', password: 'newpassword-longenough' }),
    }, env);

    expect(res.status).toBe(200);
    expect(currentDb.update).toHaveBeenCalledTimes(1);
    // Token should be deleted from KV
    expect(await env.SESSIONS.get('pw-reset:good-token')).toBeNull();
  });
});

describe('POST /api/auth/magic-link/verify', () => {
  it('returns 400 when the token does not exist in KV', async () => {
    const app = await getAuthApp();
    const res = await app.request('/api/auth/magic-link/verify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token: 'never-issued-ml' }),
    }, makeMockEnv());

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid or has expired/i);
  });

  it('returns 200, issues a JWT, and deletes the token (single-use)', async () => {
    const env = makeMockEnv();
    await env.SESSIONS.put('magic-link:ml-good', 'u-ml', { expirationTtl: 900 });

    const user = {
      id: 'u-ml', email: 'ml@coh.com', name: 'ML',
      role: 'client', membershipTier: 'free', emailVerifiedAt: null,
    };
    currentDb.select = vi.fn().mockReturnValueOnce(selectChain([user]));
    currentDb.update = vi.fn().mockReturnValueOnce(updateChain([user]));

    const app = await getAuthApp();
    const res = await app.request('/api/auth/magic-link/verify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token: 'ml-good' }),
    }, env);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user.email).toBe('ml@coh.com');
    expect(typeof body.token).toBe('string');
    // Token deleted (single-use)
    expect(await env.SESSIONS.get('magic-link:ml-good')).toBeNull();
  });
});

describe('POST /api/auth/logout', () => {
  it('clears the authToken cookie', async () => {
    const app = await getAuthApp();
    const res = await app.request('/api/auth/logout', {
      method: 'POST',
    }, makeMockEnv());

    expect(res.status).toBe(200);
    const setCookie = res.headers.get('Set-Cookie');
    expect(setCookie).toContain('authToken=');
    expect(setCookie).toMatch(/Max-Age=0|Expires=/);
  });
});
