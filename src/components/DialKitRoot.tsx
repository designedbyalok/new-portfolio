import { DialRoot } from "dialkit";
import { useEffect } from "react";

// Local wrapper so the island entry is a source file: Astro then resolves
// `dialkit` through Vite exactly like every useDialKit caller, keeping the
// panel and the hooks on one shared module instance. Mounting DialRoot
// straight from node_modules gives the island the raw dist file while hooks
// get the optimized dep — two stores, and the panel never sees any dials.
//
// The stylesheet is loaded at runtime behind a DEV guard, NOT statically
// imported: Layout.astro references this island on every page, and Astro
// propagates any statically reachable CSS into every page's <head> even
// though the island only renders in dev. The guard is compiled to `false`
// in production builds, so the import (and stylesheet) drops out entirely.
export default function DialKitRoot() {
  useEffect(() => {
    if (import.meta.env.DEV) {
      import("dialkit/styles.css");
    }
  }, []);

  return <DialRoot />;
}
