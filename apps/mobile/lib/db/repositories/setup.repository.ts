import Constants from "expo-constants";
import { eq } from "drizzle-orm";

import type { Db } from "../client";
import { appSetupFlags, userSetupProfiles } from "../schema";
import type { UserSetupProfile } from "../types";

const SETUP_COMPLETE_KEY = "setup_complete";
const LOCAL_USER_ID = "local-device-user";

export type SetupProfile = {
  userId: string;
  storeName: string;
  iconUri: string | null;
  displayName: string;
  setupCompleted: boolean;
  updatedAt: Date;
};

export type SetupProfileInput = {
  storeName: string;
  iconUri: string | null;
  displayName: string;
};

export function getCurrentUserId(): string {
  const constants = Constants as typeof Constants & {
    installationId?: string | null;
  };

  return constants.installationId
    ? `user:${constants.installationId}`
    : LOCAL_USER_ID;
}

export function getSetupProfile(db: Db, userId: string): SetupProfile | null {
  const row = db
    .select()
    .from(userSetupProfiles)
    .where(eq(userSetupProfiles.userId, userId))
    .get();

  return row ? mapSetupProfile(row) : null;
}

export function isSetupComplete(db: Db, userId: string): boolean {
  const profile = getSetupProfile(db, userId);

  return profile?.setupCompleted === true;
}

export function saveSetupProfile(
  db: Db,
  userId: string,
  input: SetupProfileInput
): SetupProfile {
  const value = normalizeSetupProfile(input);
  const now = new Date();

  db.transaction((tx) => {
    tx.insert(userSetupProfiles)
      .values({
        userId,
        storeName: value.storeName,
        iconUri: value.iconUri,
        displayName: value.displayName,
        setupCompleted: true,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: userSetupProfiles.userId,
        set: {
          storeName: value.storeName,
          iconUri: value.iconUri,
          displayName: value.displayName,
          setupCompleted: true,
          updatedAt: now,
        },
      })
      .run();

    tx.insert(appSetupFlags)
      .values({
        userId,
        key: SETUP_COMPLETE_KEY,
        value: "true",
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [appSetupFlags.userId, appSetupFlags.key],
        set: {
          value: "true",
          updatedAt: now,
        },
      })
      .run();
  });

  const profile = getSetupProfile(db, userId);

  if (!profile) {
    throw new Error("Setup profile was not saved.");
  }

  return profile;
}

export function clearUserSetup(db: Db, userId: string): void {
  db.transaction((tx) => {
    tx.delete(appSetupFlags).where(eq(appSetupFlags.userId, userId)).run();
    tx.delete(userSetupProfiles)
      .where(eq(userSetupProfiles.userId, userId))
      .run();
  });
}

function normalizeSetupProfile(input: SetupProfileInput): SetupProfileInput {
  const storeName = input.storeName.trim();
  const displayName = input.displayName.trim();
  const iconUri = input.iconUri?.trim() || null;

  if (!storeName) {
    throw new Error("Store name is required.");
  }

  if (!displayName) {
    throw new Error("Display name is required.");
  }

  return {
    storeName,
    iconUri,
    displayName,
  };
}

function mapSetupProfile(row: UserSetupProfile): SetupProfile {
  return {
    userId: row.userId,
    storeName: row.storeName,
    iconUri: row.iconUri,
    displayName: row.displayName,
    setupCompleted: row.setupCompleted,
    updatedAt: row.updatedAt,
  };
}
