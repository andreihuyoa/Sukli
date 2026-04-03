export type PosProductStockLevel = "in-stock" | "low";

export interface PosProduct {
  id: string;
  name: string;
  variant: string;
  /** Unit price in PHP (whole pesos); APIs may send minor units — map in the data layer */
  unitPricePhp: number;
  stockLevel: PosProductStockLevel;
  category: string;
  imageUrl: string;
}

export interface PosCartLine {
  product: PosProduct;
  qty: number;
}

export const POS_ALL_CATEGORY = "All Items" as const;
