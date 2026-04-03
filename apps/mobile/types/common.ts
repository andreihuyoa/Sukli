/**
 * Shared primitives for charts and analytics views.
 * Domain money values use minor units (centavos) at boundaries when integrating APIs;
 * UI layers format with Intl.
 */
export interface ChartBarPoint {
  label: string;
  value: number;
}
