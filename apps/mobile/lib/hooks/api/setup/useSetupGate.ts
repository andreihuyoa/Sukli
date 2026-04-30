import { useEffect, useState } from "react";

import { getDb } from "@/lib/db/client";
import {
  getCurrentUserId,
  isSetupComplete,
} from "@/lib/db/repositories/setup.repository";

type SetupGateState = "loading" | "ready" | "blocked";

export function useSetupGate(): SetupGateState {
  const [state, setState] = useState<SetupGateState>("loading");

  useEffect(() => {
    const db = getDb();
    const userId = getCurrentUserId();
    setState(isSetupComplete(db, userId) ? "ready" : "blocked");
  }, []);

  return state;
}
