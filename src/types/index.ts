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
  contactMethod: "email" | "phone";
  contactValue: string;
  productionType: "photo" | "video" | "event" | "other";
  otherDescription?: string;
  dates: string;
  message: string;
}

export interface GallerySection {
  /** URL-friendly folder name, e.g. "cuartos-e-interiores" — wait, actually the raw folder name */
  slug: string;
  /** Display title, e.g. "Cuartos e Interiores" */
  title: string;
  /** Images in this section */
  images: ImageFile[];
}
