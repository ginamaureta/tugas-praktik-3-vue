import path from "node:path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

// Supervisor exports DISABLE_HOT_RELOAD=true when the platform sets ENABLE_RELOAD=false.
const hotReloadDisabled = process.env.DISABLE_HOT_RELOAD === "true";

const emergentOverlayDisabled = process.env.DISABLE_EMERGENT_OVERLAY === "true";

// Branded error overlay (build + runtime errors); fails open — a broken overlay
// package must degrade to "no overlay", never to "no dev server".
async function loadEmergentOverlay() {
  if (emergentOverlayDisabled) return null;
  try {
    const mod = await import("@emergentbase/overlay/vite");
    return mod.emergentOverlay();
  } catch (e) {
    console.warn("[emergent-overlay] plugin failed to load; using Vite's overlay instead:", e instanceof Error ? e.message : e);
    return null;
  }
}

// Pod inotify quota is node-shared and routinely exhausted; polling is the load-bearing default.
if (!hotReloadDisabled) {
  process.env.CHOKIDAR_USEPOLLING = "true";
}

// https://vite.dev/config/
export default defineConfig(async () => {
  const emergentOverlay = await loadEmergentOverlay();
  return {
    plugins: [
      vue(),
      tailwindcss(),
      ...(emergentOverlay ? [emergentOverlay] : []),
    ],
    resolve: {
      alias: [
        { find: "@", replacement: path.resolve(__dirname, "./src") },
        // Full Vue build (runtime compiler) so AppHint can use the `template`
        // property — indikator 8: custom element, Vue Component, Property Template.
        { find: /^vue$/, replacement: "vue/dist/vue.esm-bundler.js" },
      ],
    },
    optimizeDeps: {
      include: ["vue", "vue-router"],
    },
    server: {
      host: true,
      port: 3000,
      allowedHosts: true,
      cors: true,
      hmr: hotReloadDisabled ? false : { overlay: !emergentOverlay },
      watch: hotReloadDisabled ? null : { usePolling: true, interval: 300 },
      // Backend FastAPI tetap hidup di 8001 (tak dipakai aplikasi ini, tetap diproxy).
      proxy: {
        "/api": {
          target: "http://localhost:8001",
          changeOrigin: true,
        },
      },
    },
  };
});
