'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import Lightbox from './Lightbox'
import type { ImageFile } from '@/types'

interface GalleryProps {
  images: ImageFile[]
}

export default function Gallery({ images }: GalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  return (
    <section id="gallery" className="min-h-screen px-4 lg:px-12 py-24">
      {/* Section header */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="font-heading text-4xl lg:text-5xl text-foreground inline-block">
          Galería
          <span className="block mt-2 h-1 w-16 bg-accent rounded-full" />
        </h2>
        <p className="mt-3 text-muted">Explorá el espacio</p>
      </motion.div>

      {/* Masonry columns */}
      <motion.div
        className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-4 [&>*]:mb-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.05 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {images.map((image, index) => (
          <div
            key={image.src}
            className="break-inside-avoid overflow-hidden rounded-lg relative group cursor-pointer"
            style={{ aspectRatio: image.aspectRatio }}
            onClick={() => setLightboxIndex(index)}
          >
            <Image
              src={image.src}
              alt={image.filename}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={index < 6}
              placeholder={image.blurDataURL ? 'blur' : 'empty'}
              blurDataURL={image.blurDataURL}
            />

            {/* Hover overlay with border glow */}
            <div className="absolute inset-0 ring-1 ring-inset ring-transparent group-hover:ring-accent/40 rounded-lg transition-all duration-500" />
          </div>
        ))}
      </motion.div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </section>
  )
}
