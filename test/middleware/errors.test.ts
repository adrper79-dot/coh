import { describe, expect, it, vi } from 'vitest';
import { Hono } from 'hono';
import {
  ApiError,
  ApiErrors,
  ErrorCodes,
  createErrorHandler,
  asyncHandler,
} from '../../src/middleware/errors';
import { responseMiddleware } from '../../src/middleware/response';

/**
 * The error handler is the safety net for the whole API: it logs to Sentry
 * (only for 5xx) and converts thrown errors into the canonical response
 * shape from src/middleware/response.ts.
 */

function makeAppWithError(thrower: () => Promise<unknown>) {
  const app = new Hono();
  app.use('*', responseMiddleware());
  app.get('/boom', asyncHandler(async () => thrower()));
  app.onError((err, c) => createErrorHandler(false)(err, c));
  return app;
}

describe('ApiError + ApiErrors factories', () => {
  it('builds a badRequest with status 400', () => {
    const err = ApiErrors.badRequest('Nope');
    expect(err.status).toBe(400);
    expect(err.code).toBe(ErrorCodes.BAD_REQUEST);
    expect(err.message).toBe('Nope');
  });

  it('builds an unauthorized with status 401', () => {
    expect(ApiErrors.unauthorized().status).toBe(401);
  });

  it('builds a forbidden with status 403', () => {
    expect(ApiErrors.forbidden().status).toBe(403);
  });

  it('builds a notFound with status 404 and a resource-name message', () => {
    const err = ApiErrors.notFound('Course');
    expect(err.status).toBe(404);
    expect(err.message).toBe('Course not found');
  });

  it('builds a conflict with status 409', () => {
    expect(ApiErrors.conflict('Already taken').status).toBe(409);
  });

  it('builds a validationError with status 422 + details', () => {
    const err = ApiErrors.validationError({ email: 'bad' });
    expect(err.status).toBe(422);
    expect(err.details).toEqual({ email: 'bad' });
  });

  it('builds a rateLimited with status 429', () => {
    expect(ApiErrors.rateLimited().status).toBe(429);
  });

  it('builds an internalError with status 500', () => {
    expect(ApiErrors.internalError().status).toBe(500);
  });

  it('builds an externalServiceError with status 503', () => {
    expect(ApiErrors.externalServiceError('stripe').status).toBe(503);
  });
});

describe('createErrorHandler', () => {
  it('passes through ApiError status + code + message', async () => {
    const app = makeAppWithError(async () => {
      throw ApiErrors.notFound('Course');
    });

    const res = await app.request('/boom');
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe(ErrorCodes.NOT_FOUND);
    expect(body.error.message).toBe('Course not found');
  });

  it('returns 422 for Zod-shaped error messages', async () => {
    const app = makeAppWithError(async () => {
      const err = new Error('something something Zod something');
      throw err;
    });
    const res = await app.request('/boom');
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
  });

  it('returns 500 with a generic message for unknown errors (no leak in prod)', async () => {
    const app = makeAppWithError(async () => {
      throw new Error('SECRET DB password leak!');
    });

    const res = await app.request('/boom');
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error.code).toBe(ErrorCodes.INTERNAL_ERROR);
    expect(body.error.message).not.toContain('SECRET');
  });

  it('returns the raw error message when isDev=true', async () => {
    const app = new Hono();
    app.use('*', responseMiddleware());
    app.get('/boom', asyncHandler(async () => {
      throw new Error('detailed dev message');
    }));
    app.onError((err, c) => createErrorHandler(true)(err, c));

    const res = await app.request('/boom');
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error.message).toBe('detailed dev message');
  });
});

describe('asyncHandler', () => {
  it('returns the handler result on success', async () => {
    const app = new Hono();
    app.use('*', responseMiddleware());
    app.get('/', asyncHandler(async (c) => c.json({ ok: true })));

    const res = await app.request('/');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it('catches ApiError and converts it to errorResponse', async () => {
    const app = new Hono();
    app.use('*', responseMiddleware());
    app.get('/', asyncHandler(async () => {
      throw ApiErrors.conflict('dup');
    }));

    const res = await app.request('/');
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error.code).toBe(ErrorCodes.CONFLICT);
  });

  it('re-throws non-ApiError so Hono onError can catch it', async () => {
    const app = new Hono();
    app.use('*', responseMiddleware());
    app.get('/', asyncHandler(async () => {
      throw new Error('not-api-error');
    }));
    let caught: Error | null = null;
    app.onError((err) => {
      caught = err;
      return new Response('handled by onError', { status: 500 });
    });

    const res = await app.request('/');
    expect(res.status).toBe(500);
    expect(caught?.message).toBe('not-api-error');
  });
});
