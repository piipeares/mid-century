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

const validBody = {
  name: 'Agencia Creativa SRL',
  contactMethod: 'email',
  contactValue: 'agencia@email.com',
  productionType: 'photo',
  dates: 'Marzo - Mayo 2026',
  message: 'Queremos hacer una producción de fotografía editorial en la locación.',
}

describe('POST /api/contact', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('accepts a valid submission', async () => {
    const res = await POST(makeRequest(validBody))

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.message).toContain('Gracias')
  })

  it('rejects a submission with a too-short name', async () => {
    const res = await POST(
      makeRequest({ ...validBody, name: 'A' })
    )

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.ok).toBe(false)
    expect(body.errors).toContain('El nombre o agencia debe tener al menos 2 caracteres.')
  })

  it('requires a contact value', async () => {
    const res = await POST(
      makeRequest({ ...validBody, contactValue: '' })
    )

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.ok).toBe(false)
    expect(body.errors).toContain('El email o teléfono es obligatorio.')
  })

  it('validates email format when method is email', async () => {
    const res = await POST(
      makeRequest({ ...validBody, contactMethod: 'email', contactValue: 'not-an-email' })
    )

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.ok).toBe(false)
    expect(body.errors).toContain('Ingresá un email válido.')
  })

  it('validates phone format when method is phone', async () => {
    const res = await POST(
      makeRequest({ ...validBody, contactMethod: 'phone', contactValue: 'abc' })
    )

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.ok).toBe(false)
    expect(body.errors).toContain('Ingresá un número de teléfono válido.')
  })

  it('accepts valid phone number', async () => {
    const res = await POST(
      makeRequest({ ...validBody, contactMethod: 'phone', contactValue: '+54 11 1234-5678' })
    )

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
  })

  it('rejects an invalid production type', async () => {
    const res = await POST(
      makeRequest({ ...validBody, productionType: 'film' })
    )

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.ok).toBe(false)
    expect(body.errors).toContain('Tipo de producción inválido.')
  })

  it('rejects a submission with a too-short message', async () => {
    const res = await POST(
      makeRequest({ ...validBody, message: 'Hola' })
    )

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.ok).toBe(false)
    expect(body.errors).toContain('El mensaje debe tener al menos 10 caracteres.')
  })

  it('accepts a submission without optional dates field', async () => {
    const { dates, ...rest } = validBody
    const res = await POST(makeRequest(rest))

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
        contactMethod: 'email',
        contactValue: '',
        productionType: 'photo',
        message: '',
      })
    )

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.errors.length).toBeGreaterThanOrEqual(3)
    expect(body.errors).toContain('El nombre o agencia debe tener al menos 2 caracteres.')
    expect(body.errors).toContain('El email o teléfono es obligatorio.')
    expect(body.errors).toContain('El mensaje debe tener al menos 10 caracteres.')
  })

  it('accepts "other" production type with description', async () => {
    const res = await POST(
      makeRequest({
        ...validBody,
        productionType: 'other',
        otherDescription: 'Podcast y streaming',
      })
    )

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
  })

  it('rejects "other" production type without description', async () => {
    const res = await POST(
      makeRequest({
        ...validBody,
        productionType: 'other',
      })
    )

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.ok).toBe(false)
    expect(body.errors).toContain('Describí brevemente tu tipo de producción.')
  })
})
