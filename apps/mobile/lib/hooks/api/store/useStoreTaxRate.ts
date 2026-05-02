import { getDb } from "@/lib/db/client";
import { getCurrentUserId } from "@/lib/db/repositories/setup.repository";
import { appSetupFlags } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useMemo } from "react";

const STORE_TAX_RATE_KEY = "store_tax_rate";

export interface UseStoreTaxRateResult {
  taxRate: number | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Reads store VAT rate from app_setup_flags.
 * Fails fast by returning an explicit error when config is missing/invalid.
 */
export function useStoreTaxRate(): UseStoreTaxRateResult {
  const db = getDb();
  const userId = getCurrentUserId();

  const query = useMemo(
    () =>
      db
        .select({ value: appSetupFlags.value })
        .from(appSetupFlags)
        .where(
          and(
            eq(appSetupFlags.userId, userId),
            eq(appSetupFlags.key, STORE_TAX_RATE_KEY)
          )
        )
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

  const raw = data?.[0]?.value;
  if (raw === undefined) {
    return {
      taxRate: null,
      isLoading: false,
      error: "Missing tax configuration. Please open setup and set a tax rate.",
    };
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return {
      taxRate: null,
      isLoading: false,
      error: `Invalid tax configuration value: "${raw}". Please update setup.`,
    };
  }

  return {
    taxRate: parsed,
    isLoading: false,
    error: null,
  };
}
