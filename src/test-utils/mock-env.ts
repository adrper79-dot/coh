/**
 * Test helpers for constructing a Worker `Env` shape that satisfies the
 * minimum surface area route handlers touch in unit tests.
 *
 * These are deliberately minimal — handlers that reach further (e.g. R2,
 * Telnyx) can be tested with the full @cloudflare/vitest-pool-workers
 * runtime in a follow-up sprint.
 */
import { createMockKV } from '../../test/helpers/mock-kv';
import type { Env } from '../types/env';

export const TEST_JWT_SECRET = 'test-secret-must-be-at-least-32-chars-long!!';

export function makeMockEnv(overrides: Partial<Env> = {}): Env {
  return {
    HYPERDRIVE: { connectionString: 'postgres://test:test@localhost:5432/test' } as Hyperdrive,
    SESSIONS: createMockKV(),
    MEDIA: {} as R2Bucket,

    STRIPE_SECRET_KEY: 'sk_test_dummy',
    STRIPE_WEBHOOK_SECRET: 'whsec_test_dummy',
    JWT_SECRET: TEST_JWT_SECRET,
    RESEND_API_KEY: '',

    TELNYX_API_KEY: '',
    TELNYX_CONNECTION_ID: '',
    TELNYX_PUBLIC_KEY: '',
    TELNYX_PHONE_NUMBER: '',

    ELEVENLABS_API_KEY: '',
    ELEVEN_LABS_VOICE_ID: '',

    CLOUDFLARE_API: '',
    CLOUDFLARE_ACCOUNT_ID: '',

    DATABASE_URL: 'postgres://test:test@localhost:5432/test',

    ENVIRONMENT: 'test',
    CORS_ORIGIN: 'https://test.cypherofhealing.com',
    APP_NAME: 'coh-test',

    ...overrides,
  };
}
