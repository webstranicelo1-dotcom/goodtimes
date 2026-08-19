import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  server: {
    port: 5300,
    strictPort: true,
    host: true,
  },
  build: {
    outDir: "dist",
    target: "es2020",
    assetsInlineLimit: 2048,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"],
          motion: ["gsap", "gsap/ScrollTrigger", "lenis"],
        },
      },
    },
  },
});
