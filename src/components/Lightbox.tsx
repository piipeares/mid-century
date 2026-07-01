'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { ImageFile } from '@/types'

interface LightboxProps {
  images: ImageFile[]
  initialIndex: number
  onClose: () => void
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 400 : -400,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction < 0 ? 400 : -400,
    opacity: 0,
  }),
}

export default function Lightbox({
  images,
  initialIndex,
  onClose,
}: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [direction, setDirection] = useState(0)

  const goNext = useCallback(() => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const goPrev = useCallback(() => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  /* Keyboard event listeners */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          goPrev()
          break
        case 'ArrowRight':
          goNext()
          break
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, goPrev, goNext])

  /* Prevent body scroll while open */
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  if (!images.length) return null

  return (
    <motion.div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/95"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Close button */}
      <button
        className="absolute top-6 right-6 z-10 text-white/70 hover:text-white transition-colors rounded-full p-2 hover:bg-white/10"
        onClick={onClose}
        aria-label="Cerrar"
      >
        <X size={28} />
      </button>

      {/* Previous button */}
      {images.length > 1 && (
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white/70 hover:text-white transition-colors rounded-full p-3 hover:bg-white/10"
          onClick={(e) => {
            e.stopPropagation()
            goPrev()
          }}
          aria-label="Imagen anterior"
        >
          <ChevronLeft size={32} />
        </button>
      )}

      {/* Next button */}
      {images.length > 1 && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white/70 hover:text-white transition-colors rounded-full p-3 hover:bg-white/10"
          onClick={(e) => {
            e.stopPropagation()
            goNext()
          }}
          aria-label="Siguiente imagen"
        >
          <ChevronRight size={32} />
        </button>
      )}

      {/* Image */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentIndex}
          className="relative w-full h-full max-w-[90vw] max-h-[90vh]"
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={images[currentIndex].src}
            alt={images[currentIndex].filename}
            fill
            className="object-contain rounded"
            sizes="90vw"
            priority
          />
        </motion.div>
      </AnimatePresence>

      {/* Image counter */}
      {images.length > 1 && (
        <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-white/60 font-medium tracking-wide">
          {currentIndex + 1} / {images.length}
        </span>
      )}
    </motion.div>
  )
}
