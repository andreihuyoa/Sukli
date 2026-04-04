import { monotonicFactory } from 'ulidx';

// Monotonic ULID factory — same millisecond generates sequential ULIDs
// which is safer than the default factory for bulk inserts.
const generate = monotonicFactory();

/**
 * Generate a new ULID string.
 *
 * ULIDs are 26-character, URL-safe, time-sortable, and globally unique —
 * making them safe to generate offline on the device without a DB round-trip.
 */
export function ulid(): string {
  return generate();
}
