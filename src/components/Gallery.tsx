'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import SectionSelector from './SectionSelector'
import Lightbox from './Lightbox'
import type { ImageFile, GallerySection } from '@/types'

interface GalleryProps {
  sections: GallerySection[]
}

const SECTION_OPTIONS: { slug: string; title: string }[] = [
  { slug: 'todas', title: 'Todas' },
]

export default function Gallery({ sections }: GalleryProps) {
  const [selectedSection, setSelectedSection] = useState('todas')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  /* Build section options from data */
  const sectionOptions = useMemo(() => {
    const opts = [{ slug: 'todas', title: 'Todas' }]
    for (const s of sections) {
      opts.push({ slug: s.slug, title: s.title })
    }
    return opts
  }, [sections])

  /* Flattened images for lightbox navigation */
  const allImages = useMemo(() => {
    return sections.flatMap((s) => s.images)
  }, [sections])

  /* Images currently visible + section metadata */
  const { displaySections, displayImages, imageOffset } = useMemo(() => {
    if (selectedSection === 'todas') {
      // Group by section with section headers
      return {
        displaySections: sections,
        displayImages: sections.flatMap((s) => s.images),
        imageOffset: 0,
      }
    }
    const sec = sections.find((s) => s.slug === selectedSection)
    if (!sec) return { displaySections: [], displayImages: [], imageOffset: 0 }
    // Find offset in allImages for lightbox index mapping
    const offset = allImages.indexOf(sec.images[0])
    return {
      displaySections: [sec],
      displayImages: sec.images,
      imageOffset: offset >= 0 ? offset : 0,
    }
  }, [selectedSection, sections, allImages])

  /* Lightbox click: map from display index to allImages index */
  const openLightbox = (displayIdx: number) => {
    setLightboxIndex(imageOffset + displayIdx)
  }

  return (
    <section id="gallery" className="relative px-4 lg:px-12 pt-24 pb-32">
      {/* Section header */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="font-heading text-4xl lg:text-5xl text-foreground inline-block">
          Galería
          <span className="block mt-2 h-1 w-16 bg-accent rounded-full" />
        </h2>
      </motion.div>

      {/* Section selector */}
      <motion.div
        className="mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <SectionSelector
          sections={sectionOptions}
          active={selectedSection}
          onChange={setSelectedSection}
        />
      </motion.div>

      {/* Gallery content with animated transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedSection}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        >
          {displaySections.map((section) => (
            <div key={section.slug} className="mb-12">
              {/* Section heading (only shown in "Todas" view) */}
              {selectedSection === 'todas' && (
                <h3 className="font-heading text-xl text-foreground/80 mb-6 tracking-wide">
                  {section.title}
                </h3>
              )}

              {/* Masonry columns for this section */}
              <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 [&>*]:mb-4">
                {section.images.map((image, idx) => {
                  /* Compute display index across all images */
                  const displayIdx = displayImages.indexOf(image)
                  return (
                    <div
                      key={image.src}
                      className="break-inside-avoid overflow-hidden rounded-lg relative group cursor-pointer"
                      style={{ aspectRatio: image.aspectRatio }}
                      onClick={() => openLightbox(displayIdx)}
                    >
                      <Image
                        src={image.src}
                        alt={image.filename}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        priority={displayIdx < 6}
                        placeholder={image.blurDataURL ? 'blur' : 'empty'}
                        blurDataURL={image.blurDataURL}
                      />
                      <div className="absolute inset-0 ring-1 ring-inset ring-transparent group-hover:ring-accent/40 rounded-lg transition-all duration-500" />
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={allImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </section>
  )
}
