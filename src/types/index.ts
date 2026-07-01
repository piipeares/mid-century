export interface ImageFile {
  /** Public URL path, e.g. /imgs/photo.webp */
  src: string;
  /** Original filename without path */
  filename: string;
  /** Image width in pixels */
  width: number;
  /** Image height in pixels */
  height: number;
  /** Aspect ratio width/height */
  aspectRatio: number;
  /** File format extension */
  format: "avif" | "webp" | "jpg" | "jpeg" | "png" | "svg";
  /** Base64 blur placeholder for smooth loading (tiny WebP) */
  blurDataURL?: string;
}

export interface ContactFormData {
  name: string;
  productionType: "photo" | "video" | "event";
  dates: string;
  message: string;
}

export interface GallerySection {
  title: string;
  images: ImageFile[];
}
