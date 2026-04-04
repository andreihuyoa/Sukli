import { pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const planEnum = pgEnum('plan', ['free', 'premium']);

// Sync status shared across all syncable tables
export const syncStatusEnum = pgEnum('sync_status', [
  'synced',
  'pending',
  'conflict',
]);

/**
 * IAM Context — Aggregate Root: User
 *
 * We own the domain profile; Supabase auth owns credentials.
 * supabase_auth_id links to auth.users.id (UUID from Supabase).
 * This allows us to keep ULID-based domain IDs while delegating
 * password management entirely to Supabase.
 */
export const users = pgTable('users', {
  id: text('id').primaryKey(), // ULID — generated client-side
  supabaseAuthId: text('supabase_auth_id').unique().notNull(), // auth.users.id
  email: text('email').unique().notNull(),
  fullName: text('full_name').notNull().default(''),
  plan: planEnum('plan').notNull().default('free'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }), // soft delete
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
