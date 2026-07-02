'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import SectionSelector from './SectionSelector'
import Lightbox from './Lightbox'
import type { GallerySection } from '@/types'

interface GalleryProps {
  sections: GallerySection[]
}

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

  /* Images currently visible */
  const { displaySections, displayImages } = useMemo(() => {
    if (selectedSection === 'todas') {
      return { displaySections: sections, displayImages: sections.flatMap((s) => s.images) }
    }
    const sec = sections.find((s) => s.slug === selectedSection)
    if (!sec) return { displaySections: [], displayImages: [] }
    return { displaySections: [sec], displayImages: sec.images }
  }, [selectedSection, sections])

  return (
    <section id="gallery" className="relative px-4 lg:px-12 pt-20 sm:pt-24 pb-20 sm:pb-32">
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

              {/* Grid — consistent column count */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
                {section.images.map((image, idx) => {
                  /* Compute display index across all images */
                  const displayIdx = displayImages.indexOf(image)
                  return (
                    <div
                      key={image.src}
                      className="break-inside-avoid overflow-hidden rounded-lg relative group cursor-pointer"
                      style={{ aspectRatio: '4/5' }}
                      onClick={() => setLightboxIndex(displayIdx)}
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

      {/* Lightbox — navigates within current section only */}
      {lightboxIndex !== null && (
        <Lightbox
          images={displayImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </section>
  )
}
