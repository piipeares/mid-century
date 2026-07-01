import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '../route'

// Mock fs so tests don't write to disk
vi.mock('node:fs/promises', () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
}))

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/contact', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('accepts a valid submission', async () => {
    const res = await POST(
      makeRequest({
        name: 'Agencia Creativa SRL',
        productionType: 'photo',
        dates: 'Marzo - Mayo 2026',
        message: 'Queremos hacer una producción de fotografía editorial en la locación.',
      })
    )

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.message).toContain('Gracias')
  })

  it('rejects a submission with a too-short name', async () => {
    const res = await POST(
      makeRequest({
        name: 'A',
        productionType: 'photo',
        message: 'Queremos hacer una producción de fotografía.',
      })
    )

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.ok).toBe(false)
    expect(body.errors).toContain('El nombre o agencia debe tener al menos 2 caracteres.')
  })

  it('rejects a submission with an invalid production type', async () => {
    const res = await POST(
      makeRequest({
        name: 'Agencia X',
        productionType: 'film',
        message: 'Queremos hacer una producción de fotografía editorial.',
      })
    )

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.ok).toBe(false)
    expect(body.errors).toContain('Tipo de producción inválido.')
  })

  it('rejects a submission with a too-short message', async () => {
    const res = await POST(
      makeRequest({
        name: 'Agencia X',
        productionType: 'video',
        message: 'Hola',
      })
    )

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.ok).toBe(false)
    expect(body.errors).toContain('El mensaje debe tener al menos 10 caracteres.')
  })

  it('accepts a submission without optional dates field', async () => {
    const res = await POST(
      makeRequest({
        name: 'Productora Cine',
        productionType: 'event',
        message: 'Estamos organizando un evento corporativo de 3 días.',
      })
    )

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
  })

  it('handles malformed JSON gracefully', async () => {
    const req = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    })

    const res = await POST(req)
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.ok).toBe(false)
  })

  it('rejects all fields empty', async () => {
    const res = await POST(
      makeRequest({
        name: '',
        productionType: 'photo',
        message: '',
      })
    )

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.errors).toHaveLength(2)
    expect(body.errors).toContain('El nombre o agencia debe tener al menos 2 caracteres.')
    expect(body.errors).toContain('El mensaje debe tener al menos 10 caracteres.')
  })

  it('accepts "other" production type with description', async () => {
    const res = await POST(
      makeRequest({
        name: 'Productora X',
        productionType: 'other',
        otherDescription: 'Podcast y streaming',
        message: 'Queremos grabar una serie de podcasts en la locación.',
      })
    )

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
  })

  it('rejects "other" production type without description', async () => {
    const res = await POST(
      makeRequest({
        name: 'Productora X',
        productionType: 'other',
        message: 'Queremos hacer algo diferente en la locación.',
      })
    )

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.ok).toBe(false)
    expect(body.errors).toContain('Describí brevemente tu tipo de producción.')
  })
})
