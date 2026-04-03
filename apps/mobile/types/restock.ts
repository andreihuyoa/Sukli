export interface RestockSuggestion {
  id: string;
  name: string;
  /** Secondary line e.g. "4 kg" — optional detail from API */
  detailDisplay: string;
  suggestedQty: number;
  critical: boolean;
  imageUrl: string;
  /** Estimated line total in PHP for selected-qty calculations */
  estimatedLineTotalPhp: number;
}

export interface RestockInsight {
  title: string;
  body: string;
  criticalCount: number;
}
