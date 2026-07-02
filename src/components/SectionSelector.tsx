'use client'

import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface SectionOption {
  slug: string | 'todas'
  title: string
}

interface SectionSelectorProps {
  sections: SectionOption[]
  active: string
  onChange: (slug: string) => void
}

export default function SectionSelector({
  sections,
  active,
  onChange,
}: SectionSelectorProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  /* Auto-scroll active pill into view */
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const activeBtn = el.querySelector<HTMLButtonElement>('[data-active="true"]')
    activeBtn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [active])

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {sections.map((s) => {
        const isActive = s.slug === active
        return (
          <button
            key={s.slug}
            data-active={isActive}
            onClick={() => onChange(s.slug)}
            className="relative snap-start shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
          >
            {isActive && (
              <motion.span
                layoutId="section-pill"
                className="absolute inset-0 bg-accent rounded-full"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className={`relative z-10 ${isActive ? 'text-white' : 'text-foreground/70 hover:text-foreground'}`}>
              {s.title}
            </span>
          </button>
        )
      })}
    </div>
  )
}
