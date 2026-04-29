import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { basename, extname, join, relative } from "node:path";

const root = process.cwd();
const optimizedRoot = join(root, "public", "media", "optimized");
const widths = [480, 760, 1100, 1600, 2200];
const logoSource = join(root, "public", "media", "logo-pernet-paysages-wordmark.png");
const logoWidths = [220, 420, 560];
const imageExtensions = new Set([".jpg", ".jpeg"]);

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function isResponsiveVariant(path) {
  return /-\d+\.(jpe?g|webp|avif)$/i.test(path);
}

function identifyWidth(path) {
  return Number(execFileSync("magick", ["identify", "-format", "%w", path], { encoding: "utf8" }));
}

function outputFor(path, width, ext) {
  return path.replace(/\.(jpe?g|png|webp|avif)$/i, `-${width}.${ext}`);
}

function avifQualityFor(source, width) {
  const isHero = /^hero\./i.test(basename(source));
  if (isHero && width <= 760) return "34";
  if (isHero) return "46";
  return "40";
}

function convert(source, output, width, ext) {
  const common = [source, "-auto-orient", "-resize", `${width}x>`, "-strip"];
  const formatArgs = ext === "avif"
    ? ["-quality", avifQualityFor(source, width)]
    : ext === "webp"
      ? ["-quality", "82", "-define", "webp:method=6"]
      : ["-sampling-factor", "4:2:0", "-interlace", "Plane", "-quality", "82"];

  execFileSync("magick", [...common, ...formatArgs, output], { stdio: "inherit" });
}

function convertLogo(width, ext) {
  const output = join(optimizedRoot, `logo-pernet-paysages-wordmark-${width}.${ext}`);
  const formatArgs = ext === "avif"
    ? ["-quality", "46"]
    : ["-quality", "82", "-define", "webp:method=6"];

  execFileSync("magick", [
    logoSource,
    "-auto-orient",
    "-resize",
    `${width}x>`,
    "-strip",
    ...formatArgs,
    output
  ], { stdio: "inherit" });
  console.log(`generated ${relative(root, output)}`);
}

if (!existsSync(optimizedRoot)) {
  throw new Error(`Missing optimized image directory: ${optimizedRoot}`);
}

const sources = walk(optimizedRoot)
  .filter((file) => imageExtensions.has(extname(file).toLowerCase()))
  .filter((file) => !isResponsiveVariant(file))
  .filter((file) => !basename(file).startsWith("logo-pernet-paysages-wordmark-"));

for (const source of sources) {
  const sourceWidth = identifyWidth(source);
  for (const width of widths) {
    if (width > sourceWidth) continue;

    for (const ext of ["jpg", "webp", "avif"]) {
      const output = outputFor(source, width, ext);
      convert(source, output, width, ext);
      console.log(`generated ${relative(root, output)}`);
    }
  }
}

if (existsSync(logoSource)) {
  for (const width of logoWidths) {
    for (const ext of ["webp", "avif"]) {
      convertLogo(width, ext);
    }
  }
}
