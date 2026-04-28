import * as Updates from "expo-updates";
import { DevSettings } from "react-native";

import type { Db } from "./client";
import { clearUserSetup } from "./repositories/setup.repository";

export async function rerunUserSetup(db: Db, userId: string): Promise<void> {
  clearUserSetup(db, userId);
  await reloadApp();
}

export async function resetUserLocalData(
  db: Db,
  _userId: string
): Promise<void> {
  db.$client.execSync("PRAGMA foreign_keys = OFF;");

  try {
    const tables = db.$client.getAllSync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'"
    );

    for (const table of tables) {
      db.$client.execSync(`DROP TABLE IF EXISTS \`${table.name}\`;`);
    }
  } finally {
    db.$client.execSync("PRAGMA foreign_keys = ON;");
  }

  await reloadApp();
}

async function reloadApp(): Promise<void> {
  if (__DEV__) {
    DevSettings.reload();
    return;
  }

  if (Updates.isEnabled) {
    await Updates.reloadAsync();
    return;
  }

  DevSettings.reload();
}
