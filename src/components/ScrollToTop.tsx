'use client'

import { useEffect } from 'react'

/**
 * Forces scroll to top on initial page load / refresh.
 * Prevents the browser from restoring a previous scroll position
 * and showing the page scrolled past the Hero.
 */
export default function ScrollToTop() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return null
}
