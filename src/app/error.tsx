'use client'

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Page error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="font-heading text-6xl text-foreground mb-4">Ups</h1>
      <p className="text-muted max-w-md mb-8">
        Algo salió mal. No te preocupes, probablemente es temporal.
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 bg-accent text-white px-8 py-3 rounded-full font-medium hover:bg-accent/90 transition"
      >
        Intentar de nuevo
      </button>
    </div>
  )
}
