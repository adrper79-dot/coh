import { describe, expect, it } from 'vitest';
import { Hono } from 'hono';
import { responseMiddleware, successResponse, errorResponse, formatValidationErrors } from '../../src/middleware/response';

/**
 * Response shape contract: all API responses follow `{ success, data?, error?, meta }`.
 * The middleware adds requestId tracking and helper methods to context.
 */

describe('responseMiddleware', () => {
  it('attaches X-Request-ID and X-API-Version headers to every response', async () => {
    const app = new Hono();
    app.use('*', responseMiddleware());
    app.get('/', (c) => c.json({ ok: true }));

    const res = await app.request('/');
    expect(res.status).toBe(200);
    expect(res.headers.get('X-Request-Id')).toBeTruthy();
    expect(res.headers.get('X-API-Version')).toBe('1.0.0');
  });

  it('assigns a unique requestId per request', async () => {
    const app = new Hono();
    app.use('*', responseMiddleware());
    app.get('/', (c) => c.json({ id: c.get('requestId') }));

    const a = await app.request('/');
    const b = await app.request('/');
    const idA = (await a.json()).id;
    const idB = (await b.json()).id;
    expect(idA).toBeTruthy();
    expect(idB).toBeTruthy();
    expect(idA).not.toBe(idB);
  });
});

describe('successResponse', () => {
  it('wraps data into { success: true, data, meta } shape', async () => {
    const app = new Hono();
    app.use('*', responseMiddleware());
    app.get('/', (c) => successResponse({ value: 42 }, c));

    const res = await app.request('/');
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual({ value: 42 });
    expect(body.meta.requestId).toBeTruthy();
    expect(body.meta.version).toBe('1.0.0');
    expect(body.meta.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('honours custom status codes', async () => {
    const app = new Hono();
    app.use('*', responseMiddleware());
    app.post('/', (c) => successResponse({ created: true }, c, { status: 201 }));

    const res = await app.request('/', { method: 'POST' });
    expect(res.status).toBe(201);
  });
});

describe('errorResponse', () => {
  it('wraps errors into { success: false, error, ... } shape', async () => {
    const app = new Hono();
    app.use('*', responseMiddleware());
    app.get('/fail', (c) => errorResponse(c, {
      code: 'TEST_ERROR',
      message: 'something broke',
      status: 418,
    }));

    const res = await app.request('/fail');
    expect(res.status).toBe(418);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('TEST_ERROR');
    expect(body.error.message).toBe('something broke');
    expect(body.error.requestId).toBeTruthy();
    expect(body.error.timestamp).toMatch(/^\d{4}-/);
  });

  it('omits details key when no details are provided', async () => {
    const app = new Hono();
    app.use('*', responseMiddleware());
    app.get('/', (c) => errorResponse(c, { code: 'X', message: 'm', status: 400 }));

    const res = await app.request('/');
    const body = await res.json();
    expect(body.error.details).toBeUndefined();
  });

  it('includes details when provided', async () => {
    const app = new Hono();
    app.use('*', responseMiddleware());
    app.get('/', (c) => errorResponse(c, {
      code: 'X', message: 'm', status: 422,
      details: { email: 'must be valid' },
    }));

    const res = await app.request('/');
    const body = await res.json();
    expect(body.error.details).toEqual({ email: 'must be valid' });
  });
});

describe('formatValidationErrors', () => {
  it('extracts .message from each field error', () => {
    const errors = {
      email: { message: 'Invalid email' },
      password: { message: 'Too short' },
    };
    expect(formatValidationErrors(errors as any)).toEqual({
      email: 'Invalid email',
      password: 'Too short',
    });
  });

  it('skips fields without a message', () => {
    const errors = {
      email: { message: 'bad' },
      other: { something: 'else' },
    };
    expect(formatValidationErrors(errors as any)).toEqual({
      email: 'bad',
    });
  });

  it('returns an empty object when there are no errors', () => {
    expect(formatValidationErrors({})).toEqual({});
  });
});
