import Constants from "expo-constants";
import { eq } from "drizzle-orm";

import type { Db } from "../client";
import { storeProfiles } from "../schema";
import type { StoreProfile } from "../types";

const DEFAULT_CURRENCY = "PHP";
const LOCAL_USER_ID = "local-device-user";

export type SetupProfile = {
  userId: string;
  storeName: string;
  iconUri: string | null;
  displayName: string;
  currency: string;
  taxRate: number;
  setupCompleted: boolean;
  updatedAt: Date;
};

export type SetupProfileInput = {
  storeName: string;
  iconUri: string | null;
  displayName: string;
  taxRate: number;
  currency?: string;
};

type NormalizedSetupProfileInput = Required<SetupProfileInput>;

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
    .from(storeProfiles)
    .where(eq(storeProfiles.userId, userId))
    .get();

  return row ? mapSetupProfile(db, row) : null;
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
    tx.insert(storeProfiles)
      .values({
        userId,
        storeName: value.storeName,
        iconUri: value.iconUri,
        displayName: value.displayName,
        currency: value.currency,
        taxRate: value.taxRate,
        setupCompleted: true,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: storeProfiles.userId,
        set: {
          storeName: value.storeName,
          iconUri: value.iconUri,
          displayName: value.displayName,
          currency: value.currency,
          taxRate: value.taxRate,
          setupCompleted: true,
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
    tx.delete(storeProfiles).where(eq(storeProfiles.userId, userId)).run();
  });
}

function normalizeSetupProfile(
  input: SetupProfileInput
): NormalizedSetupProfileInput {
  const storeName = input.storeName.trim();
  const displayName = input.displayName.trim();
  const iconUri = input.iconUri?.trim() || null;
  const currency = input.currency?.trim() || DEFAULT_CURRENCY;
  const taxRate = input.taxRate;

  if (!storeName) {
    throw new Error("Store name is required.");
  }

  if (!displayName) {
    throw new Error("Display name is required.");
  }

  if (!Number.isFinite(taxRate) || taxRate < 0) {
    throw new Error("Tax rate must be zero or greater.");
  }

  return {
    storeName,
    iconUri,
    displayName,
    taxRate,
    currency,
  };
}

function mapSetupProfile(_db: Db, row: StoreProfile): SetupProfile {
  return {
    userId: row.userId,
    storeName: row.storeName,
    iconUri: row.iconUri,
    displayName: row.displayName,
    currency: row.currency,
    taxRate: row.taxRate,
    setupCompleted: row.setupCompleted,
    updatedAt: row.updatedAt,
  };
}
