import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Build straight into the repo's public/ dir, which Vercel serves statically.
  // emptyOutDir is off so the loose assets already in public/ survive.
  publicDir: false,
  build: { outDir: "../public", emptyOutDir: false },
  server: {
    proxy: { "/api": "http://localhost:3000" },
  },
});
