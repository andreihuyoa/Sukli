export type InventoryStockStatus = "optimal" | "low";

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  /** Display-ready price, e.g. from API formatted field */
  priceDisplay: string;
  available: number;
  unit: string;
  status: InventoryStockStatus;
  imageUrl: string;
}
