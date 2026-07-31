import { getHeroImages, getGallerySections } from "@/lib/images";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HouseDescription from "@/components/HouseDescription";
import Gallery from "@/components/Gallery";
import ContactForm from "@/components/ContactForm";

export default async function HomePage() {
  const [heroImages, gallerySections] = await Promise.all([
    getHeroImages(),
    getGallerySections(),
  ]);

  return (
    <>
      <Header />
      <main>
        <Hero images={heroImages} />
        <HouseDescription />
        <Gallery sections={gallerySections} />
        <ContactForm />
      </main>
    </>
  );
}
