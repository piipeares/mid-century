/**
 * Build-time HEIC to WebP conversion script.
 *
 * Scans ../imgs/ for .HEIC files, converts them to .webp using
 * heic-convert + sharp, and copies ALL images to ../public/imgs/
 * so Next.js can serve them statically.
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

// Supported extensions that will be copied as-is
const COPY_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".svg", ".gif"]);
const HEIC_EXTENSIONS = new Set([".heic", ".heif"]);

/** Detect if this file is a HEIC image requiring conversion */
function isHeic(filename) {
  return HEIC_EXTENSIONS.has(path.extname(filename).toLowerCase());
}

/** Detect if this file can be copied directly */
function isCopyable(filename) {
  return COPY_EXTENSIONS.has(path.extname(filename).toLowerCase());
}

/** Convert a single HEIC buffer to WebP via heic-convert + sharp */
async function convertHeicToWebp(inputBuffer) {
  const heicConvert = (await import("heic-convert")).default;
  const sharp = (await import("sharp")).default;

  // Step 1: HEIC → JPEG buffer
  const jpegBuffer = await heicConvert({
    buffer: inputBuffer,
    format: "JPEG",
    quality: 0.92,
  });

  // Step 2: JPEG buffer → WebP file
  const webpBuffer = await sharp(jpegBuffer).webp({ quality: 85 }).toBuffer();

  return webpBuffer;
}

async function main() {
  // Ensure source exists
  if (!fs.existsSync(IMGS_SRC)) {
    console.error(`Source directory not found: ${IMGS_SRC}`);
    process.exit(1);
  }

  // Ensure destination exists
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

    try {
      if (isHeic(file)) {
        // Convert HEIC → WebP
        const webpName = path.basename(file, path.extname(file)) + ".webp";
        const dstPath = path.join(IMGS_DST, webpName);

        // Skip if already exists and source hasn't changed
        if (fs.existsSync(dstPath)) {
          const srcStat = fs.statSync(srcPath);
          const dstStat = fs.statSync(dstPath);
          if (srcStat.mtimeMs <= dstStat.mtimeMs) {
            skipped++;
            continue;
          }
        }

        const inputBuffer = fs.readFileSync(srcPath);
        const webpBuffer = await convertHeicToWebp(inputBuffer);
        fs.writeFileSync(dstPath, webpBuffer);
        converted++;
        console.log(`  ✓ ${file} → ${webpName}`);
      } else if (isCopyable(file)) {
        // Copy directly
        const dstPath = path.join(IMGS_DST, file);

        if (fs.existsSync(dstPath)) {
          const srcStat = fs.statSync(srcPath);
          const dstStat = fs.statSync(dstPath);
          if (srcStat.mtimeMs <= dstStat.mtimeMs) {
            skipped++;
            continue;
          }
        }

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
