import { getImages, getFeaturedImages } from "@/lib/images";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Gallery from "@/components/Gallery";
import ContactForm from "@/components/ContactForm";

/** Filename prefixes for the hero slideshow (6 featured images). */
const HERO_PREFIXES = [
  "IMG_2949",
  "IMG_3836",
  "IMG_9787",
  "IMG_4402",
  "IMG_2727",
  "IMG_4052",
];

export default async function HomePage() {
  const [featuredImages, allImages] = await Promise.all([
    getFeaturedImages(HERO_PREFIXES),
    getImages(),
  ]);

  return (
    <>
      <Header />
      <main>
        <Hero images={featuredImages} />
        <Gallery images={allImages} />
        <ContactForm />
      </main>
    </>
  );
}
