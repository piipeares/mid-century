'use client'

import { useState, useCallback } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Galería', href: '#gallery' },
  { label: 'Contacto', href: '#contact' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { scrollY } = useScroll()
  const bgOpacity = useTransform(scrollY, [0, 80], [0, 0.9])

  const toggleMobile = useCallback(() => setMobileOpen((v) => !v), [])
  const closeMobile = useCallback(() => setMobileOpen(false), [])

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-6 lg:px-12 py-4">
      {/* Scroll-aware background overlay */}
      <motion.div
        className="absolute inset-0 -z-10 bg-background/90 backdrop-blur-md"
        style={{ opacity: bgOpacity }}
      />

      <div className="relative flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={(e) => {
            e.preventDefault()
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className="font-heading text-lg tracking-[0.3em] text-foreground hover:text-accent transition-colors"
        >
          MIDCENTURY
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm uppercase tracking-wider text-foreground/70 hover:text-accent transition-colors duration-300"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-foreground/70 hover:text-accent transition-colors"
          onClick={toggleMobile}
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile slide-down nav */}
      <motion.nav
        className="md:hidden overflow-hidden"
        initial={false}
        animate={mobileOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="flex flex-col gap-4 pt-4 pb-2">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={closeMobile}
              className="text-sm uppercase tracking-wider text-foreground/70 hover:text-accent transition-colors duration-300"
            >
              {link.label}
            </a>
          ))}
        </div>
      </motion.nav>
    </header>
  )
}
