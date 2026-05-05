import type { Db } from "./client";
import { baseSchemaSql } from "./migrations";

export function ensureDatabaseCompatibility(db: Db): void {
  db.$client.execSync(baseSchemaSql);
}
