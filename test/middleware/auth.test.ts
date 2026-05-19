import { describe, expect, it } from 'vitest';
import { Hono } from 'hono';
import { setCookie } from 'hono/cookie';
import { authMiddleware, optionalAuth, adminOnly } from '../../src/middleware/auth';
import { createToken } from '../../src/utils/auth';
import { makeMockEnv, TEST_JWT_SECRET } from '../../src/test-utils/mock-env';
import type { Env, Variables } from '../../src/types/env';

function makeProtectedApp() {
  const app = new Hono<{ Bindings: Env; Variables: Variables }>();
  app.use('/protected/*', authMiddleware);
  app.get('/protected/me', (c) => c.json({ userId: c.get('userId'), role: c.get('userRole') }));

  app.use('/admin/*', authMiddleware, adminOnly);
  app.get('/admin/dashboard', (c) => c.json({ ok: true }));

  app.use('/optional/*', optionalAuth);
  app.get('/optional/view', (c) => c.json({ userId: c.get('userId') ?? null }));

  return app;
}

describe('authMiddleware', () => {
  const env = makeMockEnv();

  it('rejects requests with no token (no cookie, no bearer)', async () => {
    const app = makeProtectedApp();
    const res = await app.request('/protected/me', {}, env);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Missing authorization token');
  });

  it('accepts a valid Bearer token and sets userId + role on context', async () => {
    const app = makeProtectedApp();
    const token = await createToken(
      { userId: 'user-1', email: 'a@b.com', role: 'client' },
      TEST_JWT_SECRET,
    );
    const res = await app.request('/protected/me', {
      headers: { Authorization: `Bearer ${token}` },
    }, env);

    expect(res.status).toBe(200);
    const body = await res.json();
    // `sub` is set by createToken; that takes precedence over userId.
    expect(body.userId).toBe('user-1');
    expect(body.role).toBe('client');
  });

  it('accepts a valid token from the authToken cookie', async () => {
    const app = makeProtectedApp();
    const token = await createToken(
      { userId: 'cookie-user', email: 'c@d.com', role: 'client' },
      TEST_JWT_SECRET,
    );
    const res = await app.request('/protected/me', {
      headers: { Cookie: `authToken=${token}` },
    }, env);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.userId).toBe('cookie-user');
  });

  it('prefers cookie token over Authorization header when both are present', async () => {
    const app = makeProtectedApp();
    const cookieToken = await createToken(
      { userId: 'cookie-wins', email: 'c@d.com', role: 'client' },
      TEST_JWT_SECRET,
    );
    const bearerToken = await createToken(
      { userId: 'bearer-loses', email: 'b@d.com', role: 'admin' },
      TEST_JWT_SECRET,
    );

    const res = await app.request('/protected/me', {
      headers: {
        Cookie: `authToken=${cookieToken}`,
        Authorization: `Bearer ${bearerToken}`,
      },
    }, env);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.userId).toBe('cookie-wins');
  });

  it('rejects a token signed with the wrong secret', async () => {
    const app = makeProtectedApp();
    const token = await createToken(
      { userId: 'u', email: 'a@b.com', role: 'client' },
      'a-different-secret-thirtytwo-chars-long-xx',
    );
    const res = await app.request('/protected/me', {
      headers: { Authorization: `Bearer ${token}` },
    }, env);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Invalid or expired token');
  });

  it('rejects a tampered token', async () => {
    const app = makeProtectedApp();
    const token = await createToken(
      { userId: 'u', email: 'a@b.com', role: 'client' },
      TEST_JWT_SECRET,
    );
    const tampered = token.slice(0, -6) + 'XXXXXX';

    const res = await app.request('/protected/me', {
      headers: { Authorization: `Bearer ${tampered}` },
    }, env);

    expect(res.status).toBe(401);
  });

  it('rejects an expired token', async () => {
    const app = makeProtectedApp();
    const expired = await createToken(
      { userId: 'u', email: 'a@b.com', role: 'client' },
      TEST_JWT_SECRET,
      Math.floor(Date.now() / 1000) - 60, // exp 1 minute ago
    );

    const res = await app.request('/protected/me', {
      headers: { Authorization: `Bearer ${expired}` },
    }, env);

    expect(res.status).toBe(401);
  });
});

describe('adminOnly middleware', () => {
  const env = makeMockEnv();

  it('allows a request when userRole is admin', async () => {
    const app = makeProtectedApp();
    const token = await createToken(
      { userId: 'admin-1', email: 'a@b.com', role: 'admin' },
      TEST_JWT_SECRET,
    );
    const res = await app.request('/admin/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    }, env);
    expect(res.status).toBe(200);
  });

  it('forbids non-admin users', async () => {
    const app = makeProtectedApp();
    const token = await createToken(
      { userId: 'client-1', email: 'c@b.com', role: 'client' },
      TEST_JWT_SECRET,
    );
    const res = await app.request('/admin/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    }, env);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe('Admin access required');
  });
});

describe('optionalAuth middleware', () => {
  const env = makeMockEnv();

  it('passes through with no userId when there is no token', async () => {
    const app = makeProtectedApp();
    const res = await app.request('/optional/view', {}, env);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.userId).toBeNull();
  });

  it('attaches userId when a valid Bearer is present', async () => {
    const app = makeProtectedApp();
    const token = await createToken(
      { userId: 'maybe-user', email: 'x@y.com', role: 'client' },
      TEST_JWT_SECRET,
    );
    const res = await app.request('/optional/view', {
      headers: { Authorization: `Bearer ${token}` },
    }, env);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.userId).toBe('maybe-user');
  });

  it('treats invalid tokens as anonymous (no 401)', async () => {
    const app = makeProtectedApp();
    const res = await app.request('/optional/view', {
      headers: { Authorization: 'Bearer nope.nope.nope' },
    }, env);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.userId).toBeNull();
  });
});

describe('JWT cookie semantics (smoke)', () => {
  // Confirms setCookie + getCookie roundtrip the token the same way our
  // setAuthCookie helper does in src/routes/auth.ts.
  const env = makeMockEnv();

  it('round-trips a token through Set-Cookie → Cookie header', async () => {
    const issuer = new Hono<{ Bindings: Env; Variables: Variables }>();
    issuer.get('/issue', async (c) => {
      const token = await createToken(
        { userId: 'rt-user', email: 'rt@coh.com', role: 'client' },
        c.env.JWT_SECRET,
      );
      setCookie(c, 'authToken', token, { httpOnly: true, path: '/', sameSite: 'Strict' });
      return c.json({ token });
    });

    const issueRes = await issuer.request('/issue', {}, env);
    const setCookieHeader = issueRes.headers.get('Set-Cookie');
    expect(setCookieHeader).toContain('authToken=');
    expect(setCookieHeader).toContain('HttpOnly');
    expect(setCookieHeader).toContain('SameSite=Strict');

    // Use that cookie against a protected endpoint
    const protectedApp = makeProtectedApp();
    const cookieValue = setCookieHeader!.split(';')[0]; // "authToken=<jwt>"
    const res = await protectedApp.request('/protected/me', {
      headers: { Cookie: cookieValue },
    }, env);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.userId).toBe('rt-user');
  });
});
