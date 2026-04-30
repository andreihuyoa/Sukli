export interface VendorTag {
  label: string;
  color: string;
  backgroundColor: string;
}

export interface VendorCatalogLine {
  productName: string;
  priceDisplay: string;
}

export interface Supplier {
  id: string;
  name: string;
  role: string;
  roleColor: string;
  imageUrl: string;
  tags: VendorTag[];
  /** Featured lines for collapsed preview; full catalog may come from API */
  catalog: VendorCatalogLine[];
  accent?: boolean;
}

export interface VendorPriceListRow {
  productName: string;
  vendorName: string;
  priceDisplay: string;
  minOrderDisplay: string;
}
