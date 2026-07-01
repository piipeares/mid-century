/**
 * Build-time HEIC + JPEG to WebP conversion script.
 *
 * Scans ../imgs/ for .HEIC and .JPG/.JPEG files, converts them to .webp
 * using sharp, and copies the rest (AVIF, WebP, PNG, etc.) to
 * ../public/imgs/ so Next.js can serve them statically.
 *
 * JPGs are the main culprit for slow loading — they're 4-5 MB each.
 * Converting to WebP shrinks them to ~200-500 KB with minimal quality loss.
 *
 * Usage: node scripts/convert-heic.mjs
 * Ran automatically before `next build` via the "build" script.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const IMGS_SRC = path.join(ROOT, "imgs");
const IMGS_DST = path.join(ROOT, "public", "imgs");

// Formats that need conversion to WebP
const CONVERT_EXTENSIONS = new Set([".jpg", ".jpeg", ".heic", ".heif"]);
// Formats that can be copied as-is (already web-friendly)
const COPY_EXTENSIONS = new Set([".png", ".webp", ".avif", ".svg", ".gif"]);

/** Convert any image to WebP using sharp */
async function convertToWebp(inputBuffer) {
  const sharp = (await import("sharp")).default;
  return sharp(inputBuffer).webp({ quality: 85 }).toBuffer();
}

/** Convert HEIC/HEIF to WebP via heic-convert + sharp */
async function convertHeicToWebp(inputBuffer) {
  const heicConvert = (await import("heic-convert")).default;
  const sharp = (await import("sharp")).default;

  // Step 1: HEIC → JPEG buffer
  const jpegBuffer = await heicConvert({
    buffer: inputBuffer,
    format: "JPEG",
    quality: 0.92,
  });

  // Step 2: JPEG buffer → WebP
  return sharp(jpegBuffer).webp({ quality: 85 }).toBuffer();
}

/** Determine the destination filename (always .webp for convertible formats) */
function getDstFilename(file) {
  const ext = path.extname(file).toLowerCase();
  if (CONVERT_EXTENSIONS.has(ext)) {
    return path.basename(file, path.extname(file)) + ".webp";
  }
  return file;
}

/** Check if destination needs updating (missing or older than source) */
function needsUpdate(srcPath, dstPath) {
  if (!fs.existsSync(dstPath)) return true;
  const srcStat = fs.statSync(srcPath);
  const dstStat = fs.statSync(dstPath);
  return srcStat.mtimeMs > dstStat.mtimeMs;
}

async function main() {
  if (!fs.existsSync(IMGS_SRC)) {
    console.error(`Source directory not found: ${IMGS_SRC}`);
    process.exit(1);
  }

  fs.mkdirSync(IMGS_DST, { recursive: true });

  const entries = fs.readdirSync(IMGS_SRC, { withFileTypes: true });
  const files = entries.filter((e) => e.isFile()).map((e) => e.name);

  let copied = 0;
  let converted = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    const srcPath = path.join(IMGS_SRC, file);
    const ext = path.extname(file).toLowerCase();
    const dstName = getDstFilename(file);
    const dstPath = path.join(IMGS_DST, dstName);

    try {
      if (!needsUpdate(srcPath, dstPath)) {
        skipped++;
        continue;
      }

      if (ext === ".heic" || ext === ".heif") {
        // HEIC → WebP (requires heic-convert)
        const inputBuffer = fs.readFileSync(srcPath);
        const webpBuffer = await convertHeicToWebp(inputBuffer);
        fs.writeFileSync(dstPath, webpBuffer);
        converted++;
        console.log(`  ✓ ${file} → ${dstName}`);
      } else if (CONVERT_EXTENSIONS.has(ext)) {
        // JPG/JPEG → WebP (direct sharp)
        const inputBuffer = fs.readFileSync(srcPath);
        const webpBuffer = await convertToWebp(inputBuffer);
        fs.writeFileSync(dstPath, webpBuffer);
        converted++;
        console.log(`  ✓ ${file} → ${dstName}`);
      } else if (COPY_EXTENSIONS.has(ext)) {
        // Already web-friendly: copy as-is
        fs.copyFileSync(srcPath, dstPath);
        copied++;
        console.log(`  ✓ ${file} (copied)`);
      } else {
        skipped++;
      }
    } catch (err) {
      errors++;
      console.error(`  ✗ ${file}: ${err.message}`);
    }
  }

  console.log(`\nDone. Copied: ${copied}, Converted: ${converted}, Skipped: ${skipped}, Errors: ${errors}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
