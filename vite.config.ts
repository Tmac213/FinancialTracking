import { defineConfig, PluginOption } from "vite";
import { enterDevPlugin, enterProdPlugin } from 'vite-plugin-enter-dev';
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const plugins = [
    ...enterProdPlugin(),
  ];
  if (mode === 'development') {
    plugins.push(...enterDevPlugin());
  }
  return {
    server: {
      host: "::",
      port: 5173,
      hmr: { overlay: false },
      watch: {
        usePolling: true,
        interval: 1000,
        ignored: ["**/node_modules/**"],
      },
    },
    plugins: plugins.filter(Boolean) as PluginOption[],
    optimizeDeps: {
      include: ["next-themes", "i18next-http-backend", "i18next-browser-languagedetector"],
      maxParallelFileOps: 1,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
"next-themes": path.resolve(__dirname, "node_modules/.pnpm/next-themes@0.4.6_react-dom_a288a1fc9931e954998cef14ba42fc02/node_modules/next-themes/dist/index.js"),
      },
    },
    base: '/',
    build: {
      outDir: 'dist',
    }
  };
});