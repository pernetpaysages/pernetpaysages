import { defineConfig } from "vite";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// BASE_PATH examples:
// - Custom domain: BASE_PATH=/
// - Project GitHub Pages: BASE_PATH=/NOM_DU_REPO/
const base = process.env.BASE_PATH || "/";

export default defineConfig({
  base,
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        notFound: resolve(__dirname, "404.html"),
        frHome: resolve(__dirname, "fr/index.html"),
        frServices: resolve(__dirname, "fr/prestations/index.html"),
        frProjects: resolve(__dirname, "fr/realisations/index.html"),
        frAbout: resolve(__dirname, "fr/a-propos/index.html"),
        frContact: resolve(__dirname, "fr/contact/index.html"),
        frPrivacy: resolve(__dirname, "fr/confidentialite/index.html"),
        frLegal: resolve(__dirname, "fr/mentions-legales/index.html"),
        enHome: resolve(__dirname, "en/index.html"),
        enServices: resolve(__dirname, "en/services/index.html"),
        enProjects: resolve(__dirname, "en/projects/index.html"),
        enAbout: resolve(__dirname, "en/about/index.html"),
        enContact: resolve(__dirname, "en/contact/index.html"),
        enPrivacy: resolve(__dirname, "en/privacy/index.html"),
        enLegal: resolve(__dirname, "en/legal/index.html")
      }
    }
  }
});
