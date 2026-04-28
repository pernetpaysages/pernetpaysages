import { defineConfig } from "vite";

// BASE_PATH examples:
// - Custom domain: BASE_PATH=/
// - Project GitHub Pages: BASE_PATH=/NOM_DU_REPO/
const base = process.env.BASE_PATH || "/";

export default defineConfig({
  base
});
