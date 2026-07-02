'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import type { ImageFile } from '@/types'

interface HeroProps {
  images: ImageFile[]
}

const INTERVAL_MS = 5_000

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.25,
      delayChildren: 0.6,
    },
  },
}

const childVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut' as const },
  },
} as const

export default function Hero({ images }: HeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  /* Auto-rotate slideshow */
  useEffect(() => {
    if (images.length <= 1) return
    const timer = setInterval(nextSlide, INTERVAL_MS)
    return () => clearInterval(timer)
  }, [images.length, nextSlide])

  if (!images.length) {
    return (
      <section className="relative h-dvh flex items-center justify-center bg-background">
        <p className="text-muted">No hay imágenes disponibles</p>
      </section>
    )
  }

  return (
    <section className="relative h-dvh overflow-hidden">
      {/* Background slideshow */}
      <AnimatePresence>
        <motion.div
          key={currentIndex}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        >
          {/* Ken Burns slow zoom */}
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1 }}
            animate={{ scale: 1.08 }}
            transition={{ duration: INTERVAL_MS / 1000, ease: 'linear' }}
          >
            <Image
              src={images[currentIndex].src}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
              priority={currentIndex === 0}
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Dark gradient overlay — stronger for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />

      {/* Centered content */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.span
          variants={childVariants}
          className="text-xs uppercase tracking-[0.3em] text-accent mb-6"
        >
          ARCHITECTURAL LOOKBOOK
        </motion.span>

        <motion.h1
          variants={childVariants}
          className="font-heading text-5xl sm:text-6xl lg:text-8xl font-bold text-white tracking-wide"
        >
          MIDCENTURY
        </motion.h1>

        <motion.p
          variants={childVariants}
          className="mt-4 text-sm sm:text-lg lg:text-xl text-white/90 font-light drop-shadow-lg"
        >
          Una propiedad diseñada para la creatividad
        </motion.p>

        <motion.p
          variants={childVariants}
          className="mt-3 text-sm text-white/70 max-w-md drop-shadow-md"
        >
          Un espacio único donde la arquitectura mid-century se encuentra con el
          arte contemporáneo en el corazón de la naturaleza.
        </motion.p>
      </motion.div>

      {/* Slideshow indicator — thin progress bar */}
      <div className="absolute bottom-0 inset-x-0 flex">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className="flex-1 h-0.5 transition-colors duration-300 relative"
            aria-label={`Ir a imagen ${i + 1}`}
          >
            <span
              className={`absolute inset-0 transition-all duration-500 ${
                i === currentIndex
                  ? 'bg-accent scale-x-100'
                  : i < currentIndex
                  ? 'bg-white/40 scale-x-100'
                  : 'bg-white/20 scale-x-100'
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  )
}
