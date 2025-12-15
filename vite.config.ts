import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@initia/initia.js": fileURLToPath(new URL("./src/services/initia-stub.ts", import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          aptos: ["@aptos-labs/ts-sdk", "@aptos-labs/wallet-adapter-react"],
          react: ["react", "react-dom", "react-router-dom"],
          chakra: ["@chakra-ui/react"],
          reactQuery: ["@tanstack/react-query"],
          supabase: ["@supabase/supabase-js"],
        },
      },
    },
  },
});
