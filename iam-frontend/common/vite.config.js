import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "common",
      filename: "remoteEntry.js",
      exposes: {
        "./Button": "./src/components/Button.jsx",
      },
      shared: ["react", "react-dom"],
    }),
  ],
  build: {
    target: "esnext",
  },
  server:{
    port:4173,
    cors:true,
  },
});