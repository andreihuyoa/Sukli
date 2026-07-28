import { factory } from "ulid";

const createUlid = factory(Math.random);

export function createLocalId(): string {
  return createUlid();
}
