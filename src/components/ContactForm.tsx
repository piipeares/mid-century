'use client'

import { useState, type FormEvent, type ChangeEvent } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle } from 'lucide-react'
import type { ContactFormData } from '@/types'

type ProductionOption = {
  label: string
  value: ContactFormData['productionType']
}

const PRODUCTION_OPTIONS: ProductionOption[] = [
  { label: 'Fotografía', value: 'photo' },
  { label: 'Video', value: 'video' },
  { label: 'Evento', value: 'event' },
  { label: 'Otros', value: 'other' },
]

interface FormErrors {
  name?: string
  contactMethod?: string
  contactValue?: string
  productionType?: string
  otherDescription?: string
  message?: string
}

type SubmitState = 'idle' | 'loading' | 'success' | 'error'

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    contactMethod: 'email',
    contactValue: '',
    productionType: 'photo',
    otherDescription: '',
    dates: '',
    message: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitState, setSubmitState] = useState<SubmitState>('idle')

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    /* Clear error for this field when user starts typing */
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validate = (): boolean => {
    const newErrors: FormErrors = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Este campo es obligatorio'
    }
    if (!formData.contactValue.trim()) {
      newErrors.contactValue = 'Este campo es obligatorio'
    } else if (formData.contactMethod === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactValue)) {
      newErrors.contactValue = 'Ingresá un email válido'
    } else if (formData.contactMethod === 'phone' && !/^[\d\s\-\+\(\)]{7,20}$/.test(formData.contactValue)) {
      newErrors.contactValue = 'Ingresá un número de teléfono válido'
    }
    if (formData.productionType === 'other' && !formData.otherDescription?.trim()) {
      newErrors.otherDescription = 'Describí brevemente tu tipo de producción'
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Este campo es obligatorio'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitState('loading')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error('Network response was not ok')

      setSubmitState('success')
    } catch {
      setSubmitState('error')
    }
  }

  /* Reusable input class */
  const inputClass =
    'w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted focus:border-accent focus:ring-1 focus:ring-accent transition outline-none'

  return (
    <section id="contact" className="min-h-screen px-4 lg:px-12 py-24 bg-accent-soft/30">
      <motion.div
        className="max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        {/* Section header */}
        <div className="mb-12">
          <h2 className="font-heading text-4xl lg:text-5xl text-foreground">
            Contacto
          </h2>
          <p className="mt-3 text-muted">¿Tenés un proyecto en mente?</p>
        </div>

        {/* Success state */}
        {submitState === 'success' ? (
          <motion.div
            className="flex flex-col items-center justify-center py-20 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <CheckCircle size={56} className="text-accent mb-6" />
            <p className="text-lg text-foreground font-medium">
              Gracias por tu interés. Te contactaremos pronto.
            </p>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="text-sm font-medium text-foreground/80 mb-1.5 block"
              >
                Nombre / Agencia
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={inputClass}
                placeholder="Tu nombre o agencia"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Contact method */}
            <div>
              <label className="text-sm font-medium text-foreground/80 mb-2 block">
                Medio de Contacto <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 mb-3">
                {(['email', 'phone'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, contactMethod: method, contactValue: '' }))
                      if (errors.contactValue) setErrors((prev) => ({ ...prev, contactValue: undefined }))
                    }}
                    className={`px-5 py-2 rounded-full text-sm font-medium border transition ${
                      formData.contactMethod === method
                        ? 'bg-accent text-white border-accent'
                        : 'bg-background text-foreground/70 border-border hover:border-accent/50'
                    }`}
                  >
                    {method === 'email' ? 'Email' : 'Teléfono'}
                  </button>
                ))}
              </div>
              <input
                id="contactValue"
                name="contactValue"
                type={formData.contactMethod === 'email' ? 'email' : 'tel'}
                value={formData.contactValue}
                onChange={handleChange}
                className={inputClass}
                placeholder={formData.contactMethod === 'email' ? 'tu@email.com' : '+54 11 1234-5678'}
              />
              {errors.contactValue && (
                <p className="mt-1 text-sm text-red-500">{errors.contactValue}</p>
              )}
            </div>

            {/* Production type */}
            <div>
              <label
                htmlFor="productionType"
                className="text-sm font-medium text-foreground/80 mb-1.5 block"
              >
                Tipo de Producción
              </label>
              <select
                id="productionType"
                name="productionType"
                value={formData.productionType}
                onChange={handleChange}
                className={inputClass}
              >
                {PRODUCTION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Other description (conditional) */}
            {formData.productionType === 'other' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <label
                  htmlFor="otherDescription"
                  className="text-sm font-medium text-foreground/80 mb-1.5 block"
                >
                  ¿Qué tipo de producción?
                </label>
                <input
                  id="otherDescription"
                  name="otherDescription"
                  type="text"
                  value={formData.otherDescription}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Ej: grabación de podcast, streaming, making of..."
                />
                {errors.otherDescription && (
                  <p className="mt-1 text-sm text-red-500">{errors.otherDescription}</p>
                )}
              </motion.div>
            )}

            {/* Dates */}
            <div>
              <label
                htmlFor="dates"
                className="text-sm font-medium text-foreground/80 mb-1.5 block"
              >
                Fechas Estimadas
                <span className="text-muted ml-1 font-normal">(opcional)</span>
              </label>
              <input
                id="dates"
                name="dates"
                type="text"
                value={formData.dates}
                onChange={handleChange}
                className={inputClass}
                placeholder="Ej: marzo - mayo 2026"
              />
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="text-sm font-medium text-foreground/80 mb-1.5 block"
              >
                Mensaje
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                className={`${inputClass} resize-y min-h-[100px]`}
                placeholder="Contanos sobre tu proyecto..."
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-500">{errors.message}</p>
              )}
            </div>

            {/* Error banner */}
            {submitState === 'error' && (
              <motion.p
                className="text-sm text-red-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Ocurrió un error al enviar el formulario. Intentalo de nuevo.
              </motion.p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitState === 'loading'}
              className="inline-flex items-center gap-2 bg-accent text-white px-8 py-3 rounded-full font-medium hover:bg-accent/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitState === 'loading' ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Enviando...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Enviar
                </>
              )}
            </button>
          </motion.form>
        )}
      </motion.div>
    </section>
  )
}
