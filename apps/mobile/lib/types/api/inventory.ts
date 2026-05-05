export type InventoryStockStatus = "optimal" | "low";

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  storePrice: number;
  buyPrice: number;
  lowStockThreshold: number;
  storePriceDisplay: string;
  available: number;
  unit: string;
  status: InventoryStockStatus;
  imageUrl: string;
}
