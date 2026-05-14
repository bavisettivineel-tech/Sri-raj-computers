import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/vishal-api': {
        target: 'https://www.vishalperipherals.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/vishal-api/, ''),
      }
    },
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  build: {
    // Rely on Vite's default chunking strategy to avoid circular chunk dependencies
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
