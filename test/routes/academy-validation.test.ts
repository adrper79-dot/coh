import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { makeMockEnv, TEST_JWT_SECRET } from '../../src/test-utils/mock-env';
import { selectChain, type DbStub } from '../../src/test-utils/db-mock';
import { createToken } from '../../src/utils/auth';
import type { Env, Variables } from '../../src/types/env';

/**
 * Academy route tests — focused on the auth + 404 + DB-shape paths that
 * don't require Stripe integration. The full enroll → checkout → webhook
 * cycle is covered by the Stripe webhook tests; here we cover the gate.
 */

let currentDb: DbStub;

vi.mock('../../src/db', () => ({
  createDb: () => ({
    select: (...args: unknown[]) => currentDb.select(...args),
    insert: (...args: unknown[]) => currentDb.insert(...args),
    update: (...args: unknown[]) => currentDb.update(...args),
    delete: (...args: unknown[]) => currentDb.delete(...args),
    transaction: (...args: unknown[]) => currentDb.transaction(...args),
    execute: (...args: unknown[]) => currentDb.execute(...args),
  }),
}));

async function getAcademyApp() {
  const mod = await import('../../src/routes/academy');
  const app = new Hono<{ Bindings: Env; Variables: Variables }>();
  app.route('/api/academy', mod.default);
  return app;
}

beforeEach(() => {
  currentDb = {
    select: vi.fn(() => selectChain([])),
    insert: vi.fn(() => selectChain([])),
    update: vi.fn(() => selectChain([])),
    delete: vi.fn(() => selectChain([])),
    transaction: vi.fn(),
    execute: vi.fn(),
  };
});

describe('GET /api/academy/courses', () => {
  it('returns an empty data array when there are no published courses', async () => {
    currentDb.select = vi.fn()
      .mockReturnValueOnce(selectChain([{ total: 0 }])) // count
      .mockReturnValueOnce(selectChain([])); // list

    const app = await getAcademyApp();
    const res = await app.request('/api/academy/courses', {}, makeMockEnv());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual([]);
    expect(body.total).toBe(0);
    expect(body.page).toBe(1);
  });

  it('honors page + limit query params', async () => {
    currentDb.select = vi.fn()
      .mockReturnValueOnce(selectChain([{ total: 100 }]))
      .mockReturnValueOnce(selectChain([{ id: 'c1', title: 'Course 1' }]));

    const app = await getAcademyApp();
    const res = await app.request('/api/academy/courses?page=2&limit=10', {}, makeMockEnv());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.page).toBe(2);
    expect(body.limit).toBe(10);
    expect(body.pages).toBe(10);
  });
});

describe('GET /api/academy/courses/:slug', () => {
  it('returns 404 when the course does not exist', async () => {
    currentDb.select = vi.fn().mockReturnValueOnce(selectChain([])); // course lookup

    const app = await getAcademyApp();
    const res = await app.request('/api/academy/courses/missing-course', {}, makeMockEnv());
    expect(res.status).toBe(404);
  });

  it('returns the course + curriculum for an unauthenticated viewer (preview gate)', async () => {
    const course = { id: 'c1', slug: 'self-mastery', title: 'Self-Mastery', isPublished: true };
    const module = { id: 'm1', courseId: 'c1', title: 'Intro', sortOrder: 0 };
    const lessons = [
      { id: 'l-free', moduleId: 'm1', title: 'Free lesson', isFree: true, videoUrl: 'https://cdn/free.mp4', sortOrder: 0 },
      { id: 'l-locked', moduleId: 'm1', title: 'Locked lesson', isFree: false, videoUrl: 'https://cdn/locked.mp4', sortOrder: 1 },
    ];

    currentDb.select = vi.fn()
      .mockReturnValueOnce(selectChain([course]))      // course
      .mockReturnValueOnce(selectChain([module]))       // modules
      .mockReturnValueOnce(selectChain(lessons));       // lessons

    const app = await getAcademyApp();
    const res = await app.request('/api/academy/courses/self-mastery', {}, makeMockEnv());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.course.id).toBe('c1');
    expect(body.curriculum).toHaveLength(1);
    expect(body.curriculum[0].lessons[0].isLocked).toBe(false);
    expect(body.curriculum[0].lessons[0].videoUrl).toBe('https://cdn/free.mp4');
    expect(body.curriculum[0].lessons[1].isLocked).toBe(true);
    expect(body.curriculum[0].lessons[1].videoUrl).toBeNull(); // hidden
  });

  it('reveals locked video URLs for an enrolled user', async () => {
    const course = { id: 'c1', slug: 'self-mastery', isPublished: true };
    const module = { id: 'm1', courseId: 'c1', title: 'Intro', sortOrder: 0 };
    const lessons = [
      { id: 'l-locked', moduleId: 'm1', title: 'Locked', isFree: false, videoUrl: 'https://cdn/x.mp4', sortOrder: 0 },
    ];
    const enrollment = { id: 'e1', userId: 'u-enrolled', courseId: 'c1', status: 'active' };

    currentDb.select = vi.fn()
      .mockReturnValueOnce(selectChain([course]))
      .mockReturnValueOnce(selectChain([module]))
      .mockReturnValueOnce(selectChain(lessons))
      .mockReturnValueOnce(selectChain([enrollment])); // enrollment lookup

    const token = await createToken(
      { userId: 'u-enrolled', email: 'e@coh.com', role: 'client' },
      TEST_JWT_SECRET,
    );

    const app = await getAcademyApp();
    const res = await app.request('/api/academy/courses/self-mastery', {
      headers: { Authorization: `Bearer ${token}` },
    }, makeMockEnv());

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.enrollment).not.toBeNull();
    expect(body.curriculum[0].lessons[0].isLocked).toBe(false);
    expect(body.curriculum[0].lessons[0].videoUrl).toBe('https://cdn/x.mp4');
  });
});

describe('Academy auth gate', () => {
  it('POST /enrollments rejects unauthenticated request with 401', async () => {
    const app = await getAcademyApp();
    const res = await app.request('/api/academy/enrollments', {
      method: 'GET',
    }, makeMockEnv());
    expect(res.status).toBe(401);
  });

  it('POST /lessons/:lessonId/complete rejects unauthenticated request', async () => {
    const app = await getAcademyApp();
    const res = await app.request('/api/academy/lessons/some-lesson/complete', {
      method: 'POST',
    }, makeMockEnv());
    expect(res.status).toBe(401);
  });

  it('POST /courses/:slug/enroll rejects unauthenticated request', async () => {
    const app = await getAcademyApp();
    const res = await app.request('/api/academy/courses/x/enroll', {
      method: 'POST',
    }, makeMockEnv());
    expect(res.status).toBe(401);
  });
});
