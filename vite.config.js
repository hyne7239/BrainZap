import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3444,
    host: true,
    // No proxy needed — app is fully offline, no Ollama or external API
  },
  build: {
    outDir: "dist",
    // Inline small assets for portability
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        // Keep question bank chunks separate so browsers can cache them
        manualChunks: (id) => {
          if (id.includes("src/questions") && id.endsWith(".json")) {
            return "questions";
          }
        },
      },
    },
  },
});
