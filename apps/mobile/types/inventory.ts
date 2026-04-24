export type InventoryStockStatus = "optimal" | "low";

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  price: number;
  costPrice: number;
  reorderPoint: number;
  priceDisplay: string;
  available: number;
  unit: string;
  status: InventoryStockStatus;
  imageUrl: string;
}
