/**
 * Re-exports of test utilities. Importing from `src/test-utils` keeps test
 * files stable when individual helpers move.
 */
export { makeMockEnv, TEST_JWT_SECRET } from './mock-env';
export {
  selectChain,
  insertChain,
  updateChain,
  deleteChain,
  makeDbStub,
  sequence,
  type DbStub,
} from './db-mock';
export {
  canTransitionAppointment,
  appointmentTransition,
  canTransitionOrder,
  mapStripeSubscriptionStatus,
  validateCoupon,
  isEventAtCapacity,
  isOverlapping,
  findCollision,
  type AppointmentStatus,
  type OrderStatus,
  type CouponLike,
  type CouponValidationResult,
} from './state-machines';
export { createMockKV } from '../../test/helpers/mock-kv';
