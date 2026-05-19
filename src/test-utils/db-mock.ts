/**
 * Lightweight DB mock factory used by route-level tests that need to vi.mock
 * the `../../src/db` module. Unlike `fake-db.ts` (a full in-memory query
 * recorder), this builds a fluent, programmable stub on demand:
 *
 *   const db = makeDbStub({
 *     select: vi.fn().mockReturnValueOnce(thenable([{ id: 'u1', email: '...' }])),
 *     insert: vi.fn(() => insertChain([{ id: 'new', ...row }])),
 *     update: vi.fn(() => updateChain([{ id: 'u1', ...patch }])),
 *   });
 *
 * The chain helpers (`thenable`, `selectChain`, `insertChain`, `updateChain`)
 * return objects that mimic Drizzle's chained builder for one call.
 */
import { vi } from 'vitest';

type Resolvable<T> = T | Promise<T>;

/** Build a chainable thenable that resolves to `rows`. */
export function selectChain(rows: unknown[]) {
  const builder: any = {
    from: () => builder,
    where: () => builder,
    limit: () => builder,
    offset: () => builder,
    orderBy: () => builder,
    then: (resolve: (r: unknown[]) => unknown, reject?: (e: unknown) => unknown) => {
      try {
        return Promise.resolve(resolve(rows));
      } catch (err) {
        return reject ? Promise.resolve(reject(err)) : Promise.reject(err);
      }
    },
  };
  return builder;
}

export function insertChain(returned: unknown[]) {
  const builder: any = {
    values: () => builder,
    returning: () => Promise.resolve(returned),
    onConflictDoUpdate: () => builder,
    then: (resolve: (r: unknown[]) => unknown) => Promise.resolve(resolve(returned)),
  };
  return builder;
}

export function updateChain(returned: unknown[]) {
  const builder: any = {
    set: () => builder,
    where: () => builder,
    returning: () => Promise.resolve(returned),
    then: (resolve: (r: unknown[]) => unknown) => Promise.resolve(resolve(returned)),
  };
  return builder;
}

export function deleteChain(returned: unknown[]) {
  const builder: any = {
    where: () => builder,
    returning: () => Promise.resolve(returned),
    then: (resolve: (r: unknown[]) => unknown) => Promise.resolve(resolve(returned)),
  };
  return builder;
}

/**
 * Sequenced query stub: each call to `select`/`insert`/`update` returns the
 * next pre-canned chain. Useful when a handler runs multiple queries in
 * order (lookup-then-insert).
 */
export interface DbStub {
  select: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  transaction: ReturnType<typeof vi.fn>;
  execute: ReturnType<typeof vi.fn>;
}

export function makeDbStub(overrides: Partial<DbStub> = {}): DbStub {
  return {
    select: overrides.select ?? vi.fn(() => selectChain([])),
    insert: overrides.insert ?? vi.fn(() => insertChain([])),
    update: overrides.update ?? vi.fn(() => updateChain([])),
    delete: overrides.delete ?? vi.fn(() => deleteChain([])),
    transaction: overrides.transaction ?? vi.fn(async (fn: (tx: DbStub) => Resolvable<unknown>) => fn(makeDbStub())),
    execute: overrides.execute ?? vi.fn(async () => undefined),
  };
}

/**
 * Sequence helper: returns a queue of chain factories. Each call dequeues
 * one. Throws if exhausted (loud failure beats silent empty results).
 */
export function sequence<T>(factories: T[]): () => T {
  let idx = 0;
  return () => {
    if (idx >= factories.length) {
      throw new Error(`Query stub sequence exhausted at index ${idx}`);
    }
    return factories[idx++];
  };
}
