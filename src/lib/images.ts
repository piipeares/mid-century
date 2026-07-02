import fs from "node:fs";
import path from "node:path";
import type { ImageFile, GallerySection } from "@/types";

const IMGS_SRC = path.join(process.cwd(), "imgs");
const IMGS_PUBLIC = path.join(process.cwd(), "public", "imgs");

/** Source formats that get converted to .webp at build time. */
const CONVERTIBLE_EXT = new Set([".jpg", ".jpeg", ".heic", ".heif", ".png"]);
/** Formats already web-friendly — copied as-is. */
const COPY_EXT = new Set([".webp", ".avif", ".svg", ".gif"]);
/** All supported extensions. */
const SUPPORTED_EXT = new Set([...CONVERTIBLE_EXT, ...COPY_EXT]);

/** Ordered gallery sections: key matches folder name, value is display title. */
const SECTION_ORDER: Record<string, string> = {
  "cuartos e interiores": "Cuartos e Interiores",
  living: "Living",
  exterior: "Exteriores",
  pileta: "Pileta",
  banos: "Baños",
  galeria: "Galería",
};

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

/** Expected public filename after build conversion. */
function publicFilename(sourceName: string): string {
  const ext = path.extname(sourceName).toLowerCase();
  if (CONVERTIBLE_EXT.has(ext)) {
    const dot = sourceName.lastIndexOf(".");
    return (dot > 0 ? sourceName.slice(0, dot) : sourceName) + ".webp";
  }
  return sourceName;
}

async function getImageMeta(filepath: string) {
  try {
    const sharp = (await import("sharp")).default;
    const meta = await sharp(filepath).metadata();

    const blurBuffer = await sharp(filepath)
      .resize(20, undefined, { fit: "inside" })
      .webp({ quality: 30 })
      .toBuffer();
    const blurDataURL = `data:image/webp;base64,${blurBuffer.toString("base64")}`;

    if (meta.width && meta.height) {
      return { width: meta.width, height: meta.height, blurDataURL };
    }
  } catch {
    // sharp may fail for SVGs
  }
  return { width: 800, height: 600 };
}

/**
 * Read images from a specific source subdirectory (relative to imgs/).
 * Returns ImageFile[] with src paths relative to /.
 */
async function readDirImages(subdir: string): Promise<ImageFile[]> {
  const srcDir = path.join(IMGS_SRC, subdir);
  const pubDir = path.join(IMGS_PUBLIC, subdir);

  if (!fs.existsSync(pubDir)) return [];

  const pubFiles = new Set(fs.readdirSync(pubDir));
  let srcEntries: string[];
  try {
    srcEntries = fs.readdirSync(srcDir);
  } catch {
    return [];
  }

  const results: ImageFile[] = [];

  for (const filename of srcEntries) {
    if (filename.startsWith(".")) continue;
    const ext = path.extname(filename).toLowerCase();
    if (!SUPPORTED_EXT.has(ext)) continue;

    const pubName = publicFilename(filename);
    if (!pubFiles.has(pubName)) continue;

    const pubPath = path.join(pubDir, pubName);
    const { width, height, blurDataURL } = await getImageMeta(pubPath);

    results.push({
      src: `/imgs/${subdir}/${pubName}`,
      filename: pubName,
      width,
      height,
      aspectRatio: width / height,
      format: classifyExtension(path.extname(pubName).toLowerCase()),
      blurDataURL,
    });
  }

  results.sort((a, b) => a.filename.localeCompare(b.filename));
  return results;
}

/** Parse numeric prefix from filename for hero sorting. */
function numericSort(a: ImageFile, b: ImageFile): number {
  const aNum = parseInt(a.filename, 10);
  const bNum = parseInt(b.filename, 10);
  if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
  return a.filename.localeCompare(b.filename);
}

// ══════════════════════════════════════════════════
//  Public API
// ══════════════════════════════════════════════════

/**
 * Hero slideshow images from imgs/hero/ — sorted numerically (1, 2, 3…).
 */
export async function getHeroImages(): Promise<ImageFile[]> {
  const images = await readDirImages("hero");
  images.sort(numericSort);
  return images;
}

/**
 * All gallery sections, preserving SECTION_ORDER.
 * Excludes the "hero" folder.
 */
export async function getGallerySections(): Promise<GallerySection[]> {
  if (!fs.existsSync(IMGS_SRC)) return [];

  const folders = fs.readdirSync(IMGS_SRC, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== "hero")
    .map((d) => d.name);

  // Sort by SECTION_ORDER, unknown folders go last
  folders.sort((a, b) => {
    const ai = Object.keys(SECTION_ORDER).indexOf(a);
    const bi = Object.keys(SECTION_ORDER).indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const sections: GallerySection[] = [];

  for (const folder of folders) {
    const images = await readDirImages(folder);
    if (images.length === 0) continue;
    sections.push({
      slug: folder,
      title: SECTION_ORDER[folder] || folder,
      images,
    });
  }

  return sections;
}

/**
 * Flatten all gallery sections into a single ImageFile[] for the "Todas" view.
 */
export async function getAllGalleryImages(): Promise<GallerySection[]> {
  return getGallerySections();
}
