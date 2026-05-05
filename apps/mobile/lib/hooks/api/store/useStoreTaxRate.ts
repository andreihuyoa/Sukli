import { getDb } from "@/lib/db/client";
import { getCurrentUserId } from "@/lib/db/repositories/setup.repository";
import { storeProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useMemo } from "react";

export interface UseStoreTaxRateResult {
  taxRate: number | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Reads VAT rate from the user's store profile.
 * Fails fast by returning an explicit error when config is missing/invalid.
 */
export function useStoreTaxRate(): UseStoreTaxRateResult {
  const db = getDb();
  const userId = getCurrentUserId();

  const query = useMemo(
    () =>
      db
        .select({ taxRate: storeProfiles.taxRate })
        .from(storeProfiles)
        .where(eq(storeProfiles.userId, userId))
        .limit(1),
    [db, userId]
  );

  const { data, error } = useLiveQuery(query);

  if (error) {
    return {
      taxRate: null,
      isLoading: false,
      error: error.message,
    };
  }

  if (data === undefined) {
    return {
      taxRate: null,
      isLoading: true,
      error: null,
    };
  }

  const taxRate = data?.[0]?.taxRate;
  if (taxRate === undefined) {
    return {
      taxRate: null,
      isLoading: false,
      error: "Missing tax configuration. Please open setup and set a tax rate.",
    };
  }

  if (!Number.isFinite(taxRate) || taxRate < 0) {
    return {
      taxRate: null,
      isLoading: false,
      error: `Invalid tax configuration value: "${taxRate}". Please update setup.`,
    };
  }

  return {
    taxRate,
    isLoading: false,
    error: null,
  };
}
