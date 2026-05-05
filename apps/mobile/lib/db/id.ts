import { ulid } from "ulid";

export function createLocalId(): string {
  return ulid();
}
