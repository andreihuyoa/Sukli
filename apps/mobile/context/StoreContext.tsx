/**
 * StoreContext — provides the active storeId to the component tree.
 *
 * Why a context?
 *  • All repository calls are scoped to a store; rather than threading storeId
 *    through every hook signature we surface it once here.
 *  • Swapping to a different store (multi-store) only requires updating this
 *    context; hooks downstream stay unchanged.
 *
 * Dev placeholder:
 *  The STORE_ID_DEV value is a well-known ULID used during local development.
 *  Replace it with a real store selection flow (e.g. onboarding screen) before
 *  shipping.
 */

import React, { createContext, useContext, useState } from 'react';

/** Stable ULID used in local dev / first-run seeding. */
const STORE_ID_DEV = '01JTZE0000000000000000DEV0';

interface StoreContextValue {
  storeId: string;
  setStoreId: (id: string) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [storeId, setStoreId] = useState<string>(STORE_ID_DEV);
  return (
    <StoreContext.Provider value={{ storeId, setStoreId }}>
      {children}
    </StoreContext.Provider>
  );
}

/**
 * Returns the active store context.  Must be used inside <StoreProvider>.
 */
export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used within <StoreProvider>');
  }
  return ctx;
}
