import fs from "node:fs";
import path from "node:path";
import type { ImageFile } from "@/types";

const IMGS_SOURCE_DIR = path.join(process.cwd(), "imgs");
const IMGS_PUBLIC_DIR = path.join(process.cwd(), "public", "imgs");

/** Image extensions supported by the gallery (lowercase). */
const SUPPORTED_EXTENSIONS = new Set([
  ".jpg", ".jpeg", ".png", ".webp", ".avif", ".svg", ".gif",
  ".heic", ".heif",
]);

/** Source formats that get converted to .webp at build time. */
const CONVERTIBLE_EXTENSIONS = new Set([".heic", ".heif", ".jpg", ".jpeg"]);

/**
 * Maps a file extension to our normalized format string.
 */
function classifyExtension(ext: string): ImageFile["format"] {
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "jpg";
    case ".png":
      return "png";
    case ".webp":
      return "webp";
    case ".avif":
      return "avif";
    case ".svg":
      return "svg";
    default:
      return "jpg";
  }
}

/**
 * Safely extract image dimensions + blur placeholder from a file using sharp.
 * Falls back to a reasonable default if sharp fails or file is missing.
 */
async function getImageMetadata(
  filepath: string
): Promise<{ width: number; height: number; blurDataURL?: string }> {
  try {
    const sharp = (await import("sharp")).default;
    const meta = await sharp(filepath).metadata();

    /* Generate a tiny 20px-wide WebP as blur placeholder */
    const blurBuffer = await sharp(filepath)
      .resize(20, undefined, { fit: "inside" })
      .webp({ quality: 30 })
      .toBuffer();
    const blurDataURL = `data:image/webp;base64,${blurBuffer.toString("base64")}`;

    if (meta.width && meta.height) {
      return { width: meta.width, height: meta.height, blurDataURL };
    }
  } catch {
    // sharp may fail for SVGs or other edge cases
  }
  return { width: 800, height: 600 };
}

/**
 * Read all images from the source `imgs/` directory,
 * extract dimensions, and return an array of `ImageFile` metadata.
 *
 * Scans both the source `imgs/` folder (for listing) and the
 * `public/imgs/` folder (for actually serving images, since
 * Next.js only serves files from `public/`).
 *
 * Files without a corresponding public copy (HEIC originals not
 * yet converted) are excluded.
 */
export async function getImages(): Promise<ImageFile[]> {
  // Ensure public/imgs exists
  if (!fs.existsSync(IMGS_PUBLIC_DIR)) {
    fs.mkdirSync(IMGS_PUBLIC_DIR, { recursive: true });
  }

  // Build set of available public images
  let publicFiles: string[];
  try {
    publicFiles = fs.readdirSync(IMGS_PUBLIC_DIR);
  } catch {
    return [];
  }
  const publicSet = new Set(publicFiles);

  // Read the source directory
  let sourceEntries: string[];
  try {
    sourceEntries = fs.readdirSync(IMGS_SOURCE_DIR);
  } catch {
    return [];
  }

  const results: ImageFile[] = [];

  for (const filename of sourceEntries) {
    const ext = path.extname(filename).toLowerCase();

    // Skip non-images and hidden files
    if (filename.startsWith(".")) continue;
    if (!SUPPORTED_EXTENSIONS.has(ext)) continue;

    // For convertible source formats (HEIC, JPG), look for the .webp version in public
    let publicFilename: string;
    if (CONVERTIBLE_EXTENSIONS.has(ext)) {
      const dot = filename.lastIndexOf(".");
      publicFilename = (dot > 0 ? filename.slice(0, dot) : filename) + ".webp";
    } else {
      publicFilename = filename;
    }

    // Skip if no public copy exists (not converted yet)
    if (!publicSet.has(publicFilename)) continue;

    const publicPath = path.join(IMGS_PUBLIC_DIR, publicFilename);
    const { width, height, blurDataURL } = await getImageMetadata(publicPath);

    results.push({
      src: `/imgs/${publicFilename}`,
      filename: publicFilename,
      width,
      height,
      aspectRatio: width / height,
      format: classifyExtension(path.extname(publicFilename).toLowerCase()),
      blurDataURL,
    });
  }

  // Sort by filename for consistent ordering
  results.sort((a, b) => a.filename.localeCompare(b.filename));

  return results;
}

/**
 * Get only images whose filename starts with one of the given prefixes.
 * Used to select featured images for the hero slideshow.
 */
export async function getFeaturedImages(
  prefixes: string[]
): Promise<ImageFile[]> {
  const all = await getImages();

  // Prefer "clean" filenames (no parentheses, no " - Copy") for featured
  const sorted = [...all].sort((a, b) => {
    const aClean = !/[(\-]/.test(a.filename) ? 0 : 1;
    const bClean = !/[(\-]/.test(b.filename) ? 0 : 1;
    return aClean - bClean || a.filename.localeCompare(b.filename);
  });

  const used = new Set<string>();
  const result: ImageFile[] = [];

  for (const img of sorted) {
    const match = prefixes.find((p) => img.filename.startsWith(p));
    if (match && !used.has(match)) {
      used.add(match);
      result.push(img);
    }
    if (used.size === prefixes.length) break;
  }

  return result;
}

/**
 * HEIC conversion check — returns true if there are unconverted HEIC files.
 */
export function hasUnconvertedHeic(): boolean {
  if (!fs.existsSync(IMGS_SOURCE_DIR)) return false;
  const files = fs.readdirSync(IMGS_SOURCE_DIR);
  return files.some((f) => /\.heic$/i.test(f));
}
