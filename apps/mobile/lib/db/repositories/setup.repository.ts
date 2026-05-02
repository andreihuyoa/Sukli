import Constants from "expo-constants";
import { and, eq } from "drizzle-orm";

import type { Db } from "../client";
import { appSetupFlags, userSetupProfiles } from "../schema";
import type { UserSetupProfile } from "../types";

const SETUP_COMPLETE_KEY = "setup_complete";
const STORE_TAX_RATE = { key: "store_tax_rate", defaultValue: "0.12" } as const;
const LOCAL_USER_ID = "local-device-user";

export type SetupProfile = {
  userId: string;
  storeName: string;
  iconUri: string | null;
  displayName: string;
  taxRate: number;
  setupCompleted: boolean;
  updatedAt: Date;
};

export type SetupProfileInput = {
  storeName: string;
  iconUri: string | null;
  displayName: string;
  taxRate: number;
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

    // Persist VAT config from setup form.
    tx.insert(appSetupFlags)
      .values({
        userId,
        key: STORE_TAX_RATE.key,
        value: String(value.taxRate),
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [appSetupFlags.userId, appSetupFlags.key],
        set: {
          value: String(value.taxRate),
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
  };
}

function mapSetupProfile(db: Db, row: UserSetupProfile): SetupProfile {
  const taxRateFlag = db
    .select({ value: appSetupFlags.value })
    .from(appSetupFlags)
    .where(
      and(
        eq(appSetupFlags.userId, row.userId),
        eq(appSetupFlags.key, STORE_TAX_RATE.key)
      )
    )
    .get();

  const parsedTaxRate = taxRateFlag ? Number(taxRateFlag.value) : Number.NaN;

  return {
    userId: row.userId,
    storeName: row.storeName,
    iconUri: row.iconUri,
    displayName: row.displayName,
    taxRate:
      Number.isFinite(parsedTaxRate) && parsedTaxRate >= 0
        ? parsedTaxRate
        : Number(STORE_TAX_RATE.defaultValue),
    setupCompleted: row.setupCompleted,
    updatedAt: row.updatedAt,
  };
}
