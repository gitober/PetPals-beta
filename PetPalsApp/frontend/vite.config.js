import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// Vite settings for PetPals (replaces Create React App / react-scripts)
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // Where the backend runs during local development. Defaults to a local
  // backend; set VITE_BACKEND_URL in frontend/.env.local to try the frontend
  // against another backend, for example the live demo.
  const backendUrl = (env.VITE_BACKEND_URL || "http://localhost:4000").replace(/\/$/, "");

  // Send API and image requests to the backend, like setupProxy.js did before.
  // The Origin header is set to the backend's own address, so its CORS check
  // also accepts requests that come through this local proxy.
  const toBackend = {
    target: backendUrl,
    changeOrigin: true,
    headers: { origin: backendUrl },
  };
  const proxy = { "/api": toBackend, "/uploads": toBackend };

  return {
    plugins: [react()],
    server: {
      // Same port as before, so the backend's allowed address (FRONTEND_URL) still matches
      port: 3000,
      proxy,
    },
    // `npm run preview` serves the finished build the same way
    preview: {
      port: 3000,
      proxy,
    },
    build: {
      // Same folder name as before: the backend serves frontend/build in production
      outDir: "build",
    },
  };
});
