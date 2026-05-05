export type PosProductStockLevel = "in-stock" | "low";

export interface PosProduct {
  id: string;
  name: string;
  variant: string;
  /** Store selling price in PHP (whole pesos); APIs may send minor units — map in the data layer */
  storePricePhp: number;
  stockLevel: PosProductStockLevel;
  category: string;
  imageUrl: string;
}

export const POS_ALL_CATEGORY = "All Items" as const;
