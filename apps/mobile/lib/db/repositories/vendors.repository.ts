/**
 * Vendors Repository
 *
 * Exposes:
 *  - buildVendorsQuery()         — Drizzle query builder for useLiveQuery (Supplier list)
 *  - buildPriceListQuery()       — Drizzle query builder for the price-list view
 *  - mapToSupplier()             — maps a vendor row to the Supplier view model
 *  - mapToVendorPriceListRow()   — maps a PO-item row to VendorPriceListRow
 *
 * Vendor conflicts resolve "client wins" per DDD-Architecture.md, so all
 * local writes default to sync_status = 'pending'.
 */

import type { Supplier, VendorPriceListRow } from "@/types";
import { purchaseOrderItems, purchaseOrders, vendors } from "../schema";
import { desc, eq } from "drizzle-orm";
import type { Db } from "../client";

export function buildVendorsQuery(db: Db, storeId: string) {
  return db
    .select({
      id: vendors.id,
      name: vendors.name,
      contactName: vendors.contactName,
      phone: vendors.phone,
      email: vendors.email,
      isActive: vendors.isActive,
    })
    .from(vendors)
    .where(eq(vendors.storeId, storeId));
}

type VendorRow = Awaited<ReturnType<typeof buildVendorsQuery>>[number];

/**
 * Last-unit-cost per product from the most recent PO items for this store.
 * Used to build the price list view.
 */
export function buildPriceListQuery(db: Db, storeId: string) {
  return db
    .select({
      productName: purchaseOrderItems.productName,
      vendorName: vendors.name,
      unitCost: purchaseOrderItems.unitCost,
    })
    .from(purchaseOrderItems)
    .innerJoin(
      purchaseOrders,
      eq(purchaseOrders.id, purchaseOrderItems.purchaseOrderId)
    )
    .innerJoin(vendors, eq(vendors.id, purchaseOrders.vendorId))
    .where(eq(purchaseOrders.storeId, storeId))
    .orderBy(desc(purchaseOrders.createdAt));
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
    vendorName: row.vendorName ?? "—",
    priceDisplay: `₱${row.unitCost.toFixed(2)}`,
    minOrderDisplay: "—", // TODO: add min_order_qty column in future migration
  };
}
