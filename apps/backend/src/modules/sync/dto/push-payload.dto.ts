import { IsObject, IsOptional, IsString } from 'class-validator';

/**
 * Payload shape for a client push (offline → server).
 * Each key is a table name; value is an array of upserted records.
 * Implementation is intentionally minimal — full conflict resolution
 * strategy is defined in DDD-Architecture.md and will be implemented
 * in a dedicated sprint.
 */
export class PushPayloadDto {
  /** ISO timestamp of the last successful sync (used for pull delta). */
  @IsString()
  lastSyncedAt!: string;

  /** Map of entity type → array of records to upsert. */
  @IsObject()
  @IsOptional()
  changes?: Record<string, unknown[]>;
}
