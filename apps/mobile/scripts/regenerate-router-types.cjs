/**
 * Regenerates .expo/types/router.d.ts for expo-router typed routes.
 * expo-router debounces writes; exit after a short delay so the file flushes.
 */
const path = require("path");
const fs = require("fs");

process.env.EXPO_ROUTER_APP_ROOT = path.join(__dirname, "..", "app");

const { regenerateDeclarations } = require("expo-router/build/typed-routes");
const outDir = path.join(__dirname, "..", ".expo", "types");
fs.mkdirSync(outDir, { recursive: true });
regenerateDeclarations(outDir);

setTimeout(() => {
  console.log("Wrote", path.join(outDir, "router.d.ts"));
  process.exit(0);
}, 1500);
