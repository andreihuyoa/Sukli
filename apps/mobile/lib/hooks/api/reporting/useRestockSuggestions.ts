import type {
  RestockInsight,
  RestockSuggestion,
} from "@/lib/types/api/reporting";

export interface UseRestockSuggestionsResult {
  items: RestockSuggestion[];
  insight: RestockInsight | null;
  isLoading: boolean;
  error: Error | null;
}

export function useRestockSuggestions(): UseRestockSuggestionsResult {
  return { items: [], insight: null, isLoading: false, error: null };
}
