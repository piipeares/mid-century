/**
 * Build-time image conversion script — recursive subdirectory support.
 *
 * Scans ../imgs/ subdirectories recursively (hero/, living/, etc.),
 * converts HEIC/JPG/JPEG to .webp using sharp, copies the rest
 * (AVIF, WebP, PNG) preserving the directory structure under
 * ../public/imgs/ so Next.js can serve them statically.
 *
 * Usage: node scripts/convert-heic.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const IMGS_SRC = path.join(ROOT, "imgs");
const IMGS_DST = path.join(ROOT, "public", "imgs");

const CONVERT_EXTENSIONS = new Set([".jpg", ".jpeg", ".heic", ".heif"]);
const COPY_EXTENSIONS = new Set([".png", ".webp", ".avif", ".svg", ".gif"]);

async function convertToWebp(inputBuffer) {
  const sharp = (await import("sharp")).default;
  return sharp(inputBuffer).webp({ quality: 85 }).toBuffer();
}

async function convertHeicToWebp(inputBuffer) {
  const heicConvert = (await import("heic-convert")).default;
  const sharp = (await import("sharp")).default;
  const jpegBuffer = await heicConvert({
    buffer: inputBuffer,
    format: "JPEG",
    quality: 0.92,
  });
  return sharp(jpegBuffer).webp({ quality: 85 }).toBuffer();
}

function getDstName(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (CONVERT_EXTENSIONS.has(ext)) {
    return path.basename(filename, path.extname(filename)) + ".webp";
  }
  return filename;
}

function needsUpdate(srcPath, dstPath) {
  if (!fs.existsSync(dstPath)) return true;
  return fs.statSync(srcPath).mtimeMs > fs.statSync(dstPath).mtimeMs;
}

/** Recursively process a directory, preserving relative path. */
async function processDir(srcDir, dstDir) {
  if (!fs.existsSync(dstDir)) fs.mkdirSync(dstDir, { recursive: true });

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  let result = { copied: 0, converted: 0, skipped: 0, errors: 0 };

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);

    if (entry.isDirectory()) {
      const sub = await processDir(
        srcPath,
        path.join(dstDir, entry.name)
      );
      result.copied += sub.copied;
      result.converted += sub.converted;
      result.skipped += sub.skipped;
      result.errors += sub.errors;
      continue;
    }

    if (!entry.isFile()) continue;

    const ext = path.extname(entry.name).toLowerCase();
    const dstName = getDstName(entry.name);
    const dstPath = path.join(dstDir, dstName);
    const rel = path.relative(IMGS_SRC, srcPath);

    try {
      if (!needsUpdate(srcPath, dstPath)) {
        result.skipped++;
        continue;
      }

      if (ext === ".heic" || ext === ".heif") {
        const buf = fs.readFileSync(srcPath);
        fs.writeFileSync(dstPath, await convertHeicToWebp(buf));
        result.converted++;
        console.log(`  ✓ ${rel} → ${path.relative(IMGS_SRC, dstPath)}`);
      } else if (CONVERT_EXTENSIONS.has(ext)) {
        const buf = fs.readFileSync(srcPath);
        fs.writeFileSync(dstPath, await convertToWebp(buf));
        result.converted++;
        console.log(`  ✓ ${rel} → ${path.relative(IMGS_SRC, dstPath)}`);
      } else if (COPY_EXTENSIONS.has(ext)) {
        fs.copyFileSync(srcPath, dstPath);
        result.copied++;
        console.log(`  ✓ ${rel} (copied)`);
      } else {
        result.skipped++;
      }
    } catch (err) {
      result.errors++;
      console.error(`  ✗ ${rel}: ${err.message}`);
    }
  }

  return result;
}

async function main() {
  if (!fs.existsSync(IMGS_SRC)) {
    console.error(`Source directory not found: ${IMGS_SRC}`);
    process.exit(1);
  }

  // Clean old flat structure
  if (fs.existsSync(IMGS_DST)) {
    const old = fs.readdirSync(IMGS_DST);
    for (const f of old) {
      const fp = path.join(IMGS_DST, f);
      if (fs.statSync(fp).isFile()) {
        fs.unlinkSync(fp);
      }
    }
  }

  const result = await processDir(IMGS_SRC, IMGS_DST);
  console.log(`\nDone. Copied: ${result.copied}, Converted: ${result.converted}, Skipped: ${result.skipped}, Errors: ${result.errors}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
