"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useMemo } from "react";

/** Provides one realtime Convex client to the client component tree. */
export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const client = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    return url ? new ConvexReactClient(url) : null;
  }, []);

  // Rendering without a provider keeps the first-run setup screen usable. Data
  // operations surface a clear configuration error until the URL is supplied.
  return client ? <ConvexProvider client={client}>{children}</ConvexProvider> : <>{children}</>;
}
