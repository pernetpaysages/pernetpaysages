import { existsSync, readdirSync, readFileSync } from "node:fs";
import { extname, join, normalize } from "node:path";

const root = process.cwd();
const htmlRoots = ["index.html", "404.html", "fr", "en"];
const publicRoots = ["public"];
const failures = [];

const visiblePlaceholderPatterns = [
  /\[A completer/i,
  /\[À compléter/i,
  /\[To be completed/i,
  /G-XXXXXXXXXX/,
  /WEB3FORMS_ACCESS_KEY/,
  /Ajoutez votre titre/i,
  /Lorem ipsum/i
];

const frenchInEnglishPatterns = [
  /Voir toutes les prestations/i,
  /En savoir plus/i,
  /Parlons de votre projet/i,
  /Création, rénovation ou entretien/i,
  /Conception paysag/i,
  /Un atelier indépendant/i,
  /Comprendre vos attentes/i
];

function walk(path) {
  const full = join(root, path);
  if (!existsSync(full)) return [];
  const stat = readdirSync(full, { withFileTypes: true });
  return stat.flatMap((entry) => {
    const child = join(path, entry.name);
    if (entry.isDirectory()) return walk(child);
    return child;
  });
}

function listHtmlFiles() {
  return htmlRoots.flatMap((entry) => {
    const full = join(root, entry);
    if (!existsSync(full)) return [];
    if (extname(entry) === ".html") return [entry];
    return walk(entry).filter((file) => extname(file) === ".html");
  });
}

function publicFileExists(urlPath) {
  const clean = urlPath.split("#")[0].split("?")[0];
  if (!clean || clean.startsWith("http") || clean.startsWith("mailto:") || clean.startsWith("tel:")) {
    return true;
  }

  const normalized = clean.endsWith("/") ? `${clean}index.html` : clean;
  const candidates = [];

  if (normalized.startsWith("/media/")) {
    candidates.push(join(root, "public", normalized.slice(1)));
  } else if (normalized.startsWith("/")) {
    candidates.push(join(root, normalized.slice(1)));
    candidates.push(join(root, "public", normalized.slice(1)));
  } else {
    candidates.push(join(root, normalized));
  }

  return candidates.some((candidate) => existsSync(candidate));
}

for (const file of listHtmlFiles()) {
  const html = readFileSync(join(root, file), "utf8");

  for (const pattern of visiblePlaceholderPatterns) {
    if (pattern.test(html)) failures.push(`${file}: visible placeholder '${pattern}'`);
  }

  if (normalize(file).startsWith(`en${normalize("/")}`) || normalize(file) === normalize("en/index.html")) {
    for (const pattern of frenchInEnglishPatterns) {
      if (pattern.test(html)) failures.push(`${file}: French copy appears in English page '${pattern}'`);
    }
  }

  const links = [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
  for (const href of links) {
    if (!publicFileExists(href)) failures.push(`${file}: broken internal reference '${href}'`);
  }
}

for (const required of [
  "public/CNAME",
  "public/robots.txt",
  "public/sitemap.xml",
  ".github/workflows/deploy.yml"
]) {
  if (!existsSync(join(root, required))) failures.push(`missing required file '${required}'`);
}

if (failures.length) {
  console.error(`Site check failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Site check passed.");
