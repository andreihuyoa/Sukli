/**
 * Vendors Repository
 *
 * Exposes:
 *  - buildVendorsQuery()         — Drizzle query builder for useLiveQuery (Supplier list)
 *  - buildPriceListQuery()       — Drizzle query builder for the price-list view
 *  - mapToSupplier()             — maps a vendor row to the Supplier view model
 *  - mapToVendorPriceListRow()   — maps a PO-item row to VendorPriceListRow
 *
 * Vendor conflicts resolve "client wins" per DDD-Architecture.md.
 */

import type { Supplier, VendorPriceListRow } from "@/lib/types/api/procurement";
import { vendorCatalogItems, vendors } from "../schema";
import { desc, eq } from "drizzle-orm";
import type { Db } from "../client";

export function buildVendorsQuery(db: Db) {
  return db
    .select({
      id: vendors.id,
      name: vendors.name,
      contactName: vendors.contactName,
      phone: vendors.phone,
      email: vendors.email,
      isActive: vendors.isActive,
    })
    .from(vendors);
}

type VendorRow = Awaited<ReturnType<typeof buildVendorsQuery>>[number];

/**
 * Vendor buy-price catalog rows.
 * Used to build the price list view.
 */
export function buildPriceListQuery(db: Db) {
  return db
    .select({
      productName: vendorCatalogItems.productName,
      vendorName: vendors.name,
      buyPrice: vendorCatalogItems.buyPrice,
      minOrderQuantity: vendorCatalogItems.minOrderQuantity,
    })
    .from(vendorCatalogItems)
    .innerJoin(vendors, eq(vendors.id, vendorCatalogItems.vendorId))
    .orderBy(desc(vendorCatalogItems.updatedAt));
}

type PriceListRow = Awaited<ReturnType<typeof buildPriceListQuery>>[number];

export function mapToSupplier(row: VendorRow): Supplier {
  return {
    id: row.id,
    name: row.name,
    role: "Vendor",
    roleColor: "#6B7280",
    imageUrl: "",
    tags: [],
    catalog: [],
    accent: false,
  };
}

export function mapToVendorPriceListRow(row: PriceListRow): VendorPriceListRow {
  return {
    productName: row.productName,
    vendorName: requireString(row.vendorName, "vendors.name"),
    priceDisplay: `₱${row.buyPrice.toFixed(2)}`,
    minOrderDisplay: row.minOrderQuantity
      ? row.minOrderQuantity.toLocaleString("en-PH")
      : "—",
  };
}

function requireString(value: string | null, fieldName: string): string {
  if (!value) {
    throw new Error(`Missing required database value: ${fieldName}.`);
  }

  return value;
}
